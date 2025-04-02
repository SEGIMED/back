import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  CreateExceptionDto,
  GetSlotsDto,
  BulkCreateScheduleDto,
  BulkUpdateScheduleDto,
} from './dto';
import * as moment from 'moment';

@Injectable()
export class PhysicianScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper method to convert HH:MM to minutes since midnight
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Helper method to validate time range
  private validateTimeRange(startTime: string, endTime: string): boolean {
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);
    return startMinutes < endMinutes;
  }

  // Helper method to get physician by user_id
  private async getPhysicianByUserId(userId: string) {
    const tenant_id = global.tenant_id;

    const physician = await this.prisma.physician.findFirst({
      where: {
        user_id: userId,
        tenant_id,
        deleted: false,
      },
    });

    if (!physician) {
      throw new NotFoundException(`Physician with user_id ${userId} not found`);
    }

    return physician;
  }

  // Get all schedule entries for a physician
  async getSchedule(userId: string) {
    const tenant_id = global.tenant_id;

    const physician = await this.getPhysicianByUserId(userId);

    return this.prisma.physician_schedule.findMany({
      where: {
        physician_id: physician.id,
        tenant_id,
        deleted: false,
      },
      orderBy: {
        day_of_week: 'asc',
      },
    });
  }

  // Get a specific schedule entry
  async getScheduleEntry(id: string) {
    const tenant_id = global.tenant_id;

    const schedule = await this.prisma.physician_schedule.findFirst({
      where: {
        id,
        tenant_id,
        deleted: false,
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule entry not found');
    }

    return schedule;
  }

  // Create a new schedule entry
  async createSchedule(userId: string, createScheduleDto: CreateScheduleDto) {
    const tenant_id = global.tenant_id;

    // Validate the physician exists
    const physician = await this.getPhysicianByUserId(userId);

    // Validate time range
    if (
      !this.validateTimeRange(
        createScheduleDto.start_time,
        createScheduleDto.end_time,
      )
    ) {
      throw new BadRequestException('End time must be after start time');
    }

    // Validate rest time if provided
    if (createScheduleDto.rest_start && createScheduleDto.rest_end) {
      if (
        !this.validateTimeRange(
          createScheduleDto.rest_start,
          createScheduleDto.rest_end,
        )
      ) {
        throw new BadRequestException(
          'Rest end time must be after rest start time',
        );
      }

      // Validate rest times are within work hours
      const startMinutes = this.timeToMinutes(createScheduleDto.start_time);
      const endMinutes = this.timeToMinutes(createScheduleDto.end_time);
      const restStartMinutes = this.timeToMinutes(createScheduleDto.rest_start);
      const restEndMinutes = this.timeToMinutes(createScheduleDto.rest_end);

      if (restStartMinutes < startMinutes || restEndMinutes > endMinutes) {
        throw new BadRequestException(
          'Rest period must be within working hours',
        );
      }
    }

    // Check for overlapping schedules for the same day
    const existingSchedule = await this.prisma.physician_schedule.findFirst({
      where: {
        physician_id: physician.id,
        day_of_week: createScheduleDto.day_of_week,
        tenant_id,
        deleted: false,
      },
    });

    if (existingSchedule) {
      throw new BadRequestException(
        `Schedule for day ${createScheduleDto.day_of_week} already exists`,
      );
    }

    return this.prisma.physician_schedule.create({
      data: {
        ...createScheduleDto,
        physician_id: physician.id,
        tenant_id,
      },
    });
  }

  // Bulk create schedule entries
  async bulkCreateSchedule(
    userId: string,
    bulkCreateDto: BulkCreateScheduleDto,
  ) {
    const tenant_id = global.tenant_id;

    // Get the physician
    const physician = await this.getPhysicianByUserId(userId);

    // First, validate all entries
    const existingSchedules = await this.prisma.physician_schedule.findMany({
      where: {
        physician_id: physician.id,
        tenant_id,
        deleted: false,
      },
      select: {
        day_of_week: true,
      },
    });

    const existingDays = new Set(existingSchedules.map((s) => s.day_of_week));
    const daysInPayload = new Set<number>();

    // Check for duplicates within the payload
    for (const schedule of bulkCreateDto.schedules) {
      if (daysInPayload.has(schedule.day_of_week)) {
        throw new BadRequestException(
          `Duplicate day of week ${schedule.day_of_week} in request`,
        );
      }
      daysInPayload.add(schedule.day_of_week);

      // Check if entry already exists in database
      if (existingDays.has(schedule.day_of_week)) {
        throw new BadRequestException(
          `Schedule for day ${schedule.day_of_week} already exists`,
        );
      }

      // Validate time range
      if (!this.validateTimeRange(schedule.start_time, schedule.end_time)) {
        throw new BadRequestException(
          `For day ${schedule.day_of_week}: End time must be after start time`,
        );
      }

      // Validate rest time if provided
      if (schedule.rest_start && schedule.rest_end) {
        if (!this.validateTimeRange(schedule.rest_start, schedule.rest_end)) {
          throw new BadRequestException(
            `For day ${schedule.day_of_week}: Rest end time must be after rest start time`,
          );
        }

        const startMinutes = this.timeToMinutes(schedule.start_time);
        const endMinutes = this.timeToMinutes(schedule.end_time);
        const restStartMinutes = this.timeToMinutes(schedule.rest_start);
        const restEndMinutes = this.timeToMinutes(schedule.rest_end);

        if (restStartMinutes < startMinutes || restEndMinutes > endMinutes) {
          throw new BadRequestException(
            `For day ${schedule.day_of_week}: Rest period must be within working hours`,
          );
        }
      }
    }

    // All validations passed, create entries
    const createdSchedules = await Promise.all(
      bulkCreateDto.schedules.map((schedule) =>
        this.prisma.physician_schedule.create({
          data: {
            ...schedule,
            physician_id: physician.id,
            tenant_id,
          },
        }),
      ),
    );

    return createdSchedules;
  }

  // Update a schedule entry
  async updateSchedule(id: string, updateScheduleDto: UpdateScheduleDto) {
    const tenant_id = global.tenant_id;

    // Verify the schedule entry exists
    const existingSchedule = await this.prisma.physician_schedule.findFirst({
      where: {
        id,
        tenant_id,
        deleted: false,
      },
    });

    if (!existingSchedule) {
      throw new NotFoundException('Schedule entry not found');
    }

    // Validate time range if both times are provided
    if (updateScheduleDto.start_time && updateScheduleDto.end_time) {
      if (
        !this.validateTimeRange(
          updateScheduleDto.start_time,
          updateScheduleDto.end_time,
        )
      ) {
        throw new BadRequestException('End time must be after start time');
      }
    } else if (updateScheduleDto.start_time && !updateScheduleDto.end_time) {
      // If only start_time is provided, check against existing end_time
      if (
        !this.validateTimeRange(
          updateScheduleDto.start_time,
          existingSchedule.end_time,
        )
      ) {
        throw new BadRequestException('End time must be after start time');
      }
    } else if (!updateScheduleDto.start_time && updateScheduleDto.end_time) {
      // If only end_time is provided, check against existing start_time
      if (
        !this.validateTimeRange(
          existingSchedule.start_time,
          updateScheduleDto.end_time,
        )
      ) {
        throw new BadRequestException('End time must be after start time');
      }
    }

    // Validate rest time if both are provided
    if (updateScheduleDto.rest_start && updateScheduleDto.rest_end) {
      if (
        !this.validateTimeRange(
          updateScheduleDto.rest_start,
          updateScheduleDto.rest_end,
        )
      ) {
        throw new BadRequestException(
          'Rest end time must be after rest start time',
        );
      }

      const startTime =
        updateScheduleDto.start_time || existingSchedule.start_time;
      const endTime = updateScheduleDto.end_time || existingSchedule.end_time;

      // Validate rest times are within work hours
      const startMinutes = this.timeToMinutes(startTime);
      const endMinutes = this.timeToMinutes(endTime);
      const restStartMinutes = this.timeToMinutes(updateScheduleDto.rest_start);
      const restEndMinutes = this.timeToMinutes(updateScheduleDto.rest_end);

      if (restStartMinutes < startMinutes || restEndMinutes > endMinutes) {
        throw new BadRequestException(
          'Rest period must be within working hours',
        );
      }
    }

    // If day_of_week is being updated, check for conflicts
    if (
      updateScheduleDto.day_of_week !== undefined &&
      updateScheduleDto.day_of_week !== existingSchedule.day_of_week
    ) {
      const conflictingSchedule =
        await this.prisma.physician_schedule.findFirst({
          where: {
            physician_id: existingSchedule.physician_id,
            day_of_week: updateScheduleDto.day_of_week,
            tenant_id,
            deleted: false,
            id: { not: id }, // Exclude current record
          },
        });

      if (conflictingSchedule) {
        throw new BadRequestException(
          `Schedule for day ${updateScheduleDto.day_of_week} already exists`,
        );
      }
    }

    return this.prisma.physician_schedule.update({
      where: { id },
      data: updateScheduleDto,
    });
  }

  // Bulk update schedule entries
  async bulkUpdateSchedule(bulkUpdateDto: BulkUpdateScheduleDto) {
    const tenant_id = global.tenant_id;

    // Get all schedule IDs to update
    const scheduleIds = bulkUpdateDto.schedules.map((item) => item.id);

    // Fetch all existing schedules in one query for efficiency
    const existingSchedules = await this.prisma.physician_schedule.findMany({
      where: {
        id: { in: scheduleIds },
        tenant_id,
        deleted: false,
      },
    });

    // Create a map for quick access
    const scheduleMap = new Map(existingSchedules.map((s) => [s.id, s]));

    // Validate all entries first
    for (const item of bulkUpdateDto.schedules) {
      const existingSchedule = scheduleMap.get(item.id);

      if (!existingSchedule) {
        throw new NotFoundException(
          `Schedule entry with ID ${item.id} not found`,
        );
      }

      // Validate time range if both times are provided
      if (item.data.start_time && item.data.end_time) {
        if (!this.validateTimeRange(item.data.start_time, item.data.end_time)) {
          throw new BadRequestException(
            `For schedule ${item.id}: End time must be after start time`,
          );
        }
      } else if (item.data.start_time && !item.data.end_time) {
        // If only start_time is provided, check against existing end_time
        if (
          !this.validateTimeRange(
            item.data.start_time,
            existingSchedule.end_time,
          )
        ) {
          throw new BadRequestException(
            `For schedule ${item.id}: End time must be after start time`,
          );
        }
      } else if (!item.data.start_time && item.data.end_time) {
        // If only end_time is provided, check against existing start_time
        if (
          !this.validateTimeRange(
            existingSchedule.start_time,
            item.data.end_time,
          )
        ) {
          throw new BadRequestException(
            `For schedule ${item.id}: End time must be after start time`,
          );
        }
      }

      // Validate rest time if both are provided
      if (item.data.rest_start && item.data.rest_end) {
        if (!this.validateTimeRange(item.data.rest_start, item.data.rest_end)) {
          throw new BadRequestException(
            `For schedule ${item.id}: Rest end time must be after rest start time`,
          );
        }

        const startTime = item.data.start_time || existingSchedule.start_time;
        const endTime = item.data.end_time || existingSchedule.end_time;

        // Validate rest times are within work hours
        const startMinutes = this.timeToMinutes(startTime);
        const endMinutes = this.timeToMinutes(endTime);
        const restStartMinutes = this.timeToMinutes(item.data.rest_start);
        const restEndMinutes = this.timeToMinutes(item.data.rest_end);

        if (restStartMinutes < startMinutes || restEndMinutes > endMinutes) {
          throw new BadRequestException(
            `For schedule ${item.id}: Rest period must be within working hours`,
          );
        }
      }

      // If day_of_week is being updated, check for conflicts
      if (
        item.data.day_of_week !== undefined &&
        item.data.day_of_week !== existingSchedule.day_of_week
      ) {
        // Check for conflicts with other existing schedules
        const conflictingSchedule = existingSchedules.find(
          (s) =>
            s.physician_id === existingSchedule.physician_id &&
            s.day_of_week === item.data.day_of_week &&
            s.id !== item.id,
        );

        if (conflictingSchedule) {
          throw new BadRequestException(
            `For schedule ${item.id}: Schedule for day ${item.data.day_of_week} already exists`,
          );
        }

        // Also check for conflicts with other schedules in the update payload
        const conflictInPayload = bulkUpdateDto.schedules.find(
          (other) =>
            other.id !== item.id &&
            scheduleMap.get(other.id)?.physician_id ===
              existingSchedule.physician_id &&
            other.data.day_of_week === item.data.day_of_week,
        );

        if (conflictInPayload) {
          throw new BadRequestException(
            `For schedule ${item.id}: Conflict with another update in the request for day ${item.data.day_of_week}`,
          );
        }
      }
    }

    // Perform all updates in a transaction
    const updatedSchedules = await this.prisma.$transaction(
      bulkUpdateDto.schedules.map((item) =>
        this.prisma.physician_schedule.update({
          where: { id: item.id },
          data: item.data,
        }),
      ),
    );

    return updatedSchedules;
  }

  // Delete a schedule entry (soft delete)
  async deleteSchedule(id: string) {
    const tenant_id = global.tenant_id;

    // Verify the schedule entry exists
    const existingSchedule = await this.prisma.physician_schedule.findFirst({
      where: {
        id,
        tenant_id,
        deleted: false,
      },
    });

    if (!existingSchedule) {
      throw new NotFoundException('Schedule entry not found');
    }

    return this.prisma.physician_schedule.update({
      where: { id },
      data: {
        deleted: true,
        deleted_at: new Date(),
      },
    });
  }

  // Delete all schedule entries for a physician (soft delete)
  async deleteAllSchedules(userId: string) {
    const tenant_id = global.tenant_id;

    // Get the physician
    const physician = await this.getPhysicianByUserId(userId);

    // Soft delete all schedules
    await this.prisma.physician_schedule.updateMany({
      where: {
        physician_id: physician.id,
        tenant_id,
        deleted: false,
      },
      data: {
        deleted: true,
        deleted_at: new Date(),
      },
    });

    return {
      message: `All schedules for physician with user_id ${userId} have been deleted`,
    };
  }

  // Get all schedule exceptions for a physician
  async getExceptions(userId: string) {
    const tenant_id = global.tenant_id;

    // Get the physician
    const physician = await this.getPhysicianByUserId(userId);

    return this.prisma.physician_schedule_exception.findMany({
      where: {
        physician_id: physician.id,
        tenant_id,
        deleted: false,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  // Create a new schedule exception
  async createException(
    userId: string,
    createExceptionDto: CreateExceptionDto,
  ) {
    const tenant_id = global.tenant_id;

    // Get the physician
    const physician = await this.getPhysicianByUserId(userId);

    // Check if there's already an exception for this date
    const existingException =
      await this.prisma.physician_schedule_exception.findFirst({
        where: {
          physician_id: physician.id,
          date: new Date(createExceptionDto.date),
          tenant_id,
          deleted: false,
        },
      });

    if (existingException) {
      throw new BadRequestException(`Exception for this date already exists`);
    }

    return this.prisma.physician_schedule_exception.create({
      data: {
        physician_id: physician.id,
        date: new Date(createExceptionDto.date),
        is_available: createExceptionDto.is_available,
        reason: createExceptionDto.reason,
        tenant_id,
      },
    });
  }

  // Delete a schedule exception
  async deleteException(id: string) {
    const tenant_id = global.tenant_id;

    // Verify the exception exists
    const existingException =
      await this.prisma.physician_schedule_exception.findFirst({
        where: {
          id,
          tenant_id,
          deleted: false,
        },
      });

    if (!existingException) {
      throw new NotFoundException('Schedule exception not found');
    }

    return this.prisma.physician_schedule_exception.update({
      where: { id },
      data: {
        deleted: true,
        deleted_at: new Date(),
      },
    });
  }

  // Get available time slots for a physician on a given date
  async getAvailableSlots(userId: string, getSlotsDto: GetSlotsDto) {
    const tenant_id = global.tenant_id;

    // Get the physician
    const physician = await this.getPhysicianByUserId(userId);

    // Include user information
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const requestedDate = moment(getSlotsDto.date).startOf('day');
    const dayOfWeek = requestedDate.day(); // 0 = Sunday, 1 = Monday, etc.

    // Check if there's an exception for this date
    const exception = await this.prisma.physician_schedule_exception.findFirst({
      where: {
        physician_id: physician.id,
        date: {
          gte: requestedDate.toDate(),
          lt: requestedDate.clone().add(1, 'day').toDate(),
        },
        tenant_id,
        deleted: false,
      },
    });
    // If there's an exception and the physician is not available, return empty array
    if (exception && !exception.is_available) {
      return {
        slots: [],
        physicianName: `${user.name} ${user.last_name || ''}`,
        date: requestedDate.format('YYYY-MM-DD'),
      };
    }
    // Get the schedule for this day of the week
    const schedule = await this.prisma.physician_schedule.findFirst({
      where: {
        physician_id: physician.id,
        day_of_week: dayOfWeek,
        tenant_id,
        deleted: false,
      },
    });
    // If there's no schedule for this day or it's marked as not a working day
    if (!schedule || !schedule.is_working_day) {
      return {
        slots: [],
        physicianName: `${user.name} ${user.last_name || ''}`,
        date: requestedDate.format('YYYY-MM-DD'),
      };
    }

    // Calculate available time slots
    const startTime = this.timeToMinutes(schedule.start_time);
    const endTime = this.timeToMinutes(schedule.end_time);
    const appointmentLength = schedule.appointment_length;
    const simultaneousSlots = schedule.simultaneous_slots;
    const breakBetween = schedule.break_between || 0;

    // If rest period is defined, account for that
    let restStartMinutes = null;
    let restEndMinutes = null;
    if (schedule.rest_start && schedule.rest_end) {
      restStartMinutes = this.timeToMinutes(schedule.rest_start);
      restEndMinutes = this.timeToMinutes(schedule.rest_end);
    }

    // Get existing appointments for this day
    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        physician_id: userId,
        tenant_id,
        deleted: false,
        start: {
          gte: requestedDate.toDate(),
          lt: requestedDate.clone().add(1, 'day').toDate(),
        },
        status: {
          not: 'cancelada',
        },
      },
      select: {
        start: true,
        end: true,
      },
    });

    // Convert existing appointments to blocked time slots
    const blockedSlots = existingAppointments.map((appointment) => {
      const apptStart = moment(appointment.start);
      const apptEnd = moment(appointment.end);
      return {
        start: apptStart.hours() * 60 + apptStart.minutes(),
        end: apptEnd.hours() * 60 + apptEnd.minutes(),
      };
    });

    // Generate all possible time slots
    const allSlots = [];
    for (
      let time = startTime;
      time <= endTime - appointmentLength;
      time += appointmentLength + breakBetween
    ) {
      // Skip slots during rest period
      if (
        restStartMinutes !== null &&
        time >= restStartMinutes &&
        time < restEndMinutes
      ) {
        continue;
      }

      // Skip slots that would end during or after rest period but start before it
      if (
        restStartMinutes !== null &&
        time < restStartMinutes &&
        time + appointmentLength > restStartMinutes
      ) {
        continue;
      }

      const slotStart = moment(requestedDate)
        .add(Math.floor(time / 60), 'hours')
        .add(time % 60, 'minutes');
      const slotEnd = moment(slotStart).add(appointmentLength, 'minutes');

      // Skip if this slot is in the past
      if (slotStart.isBefore(moment())) {
        continue;
      }

      // Count how many appointments overlap with this slot
      let overlappingAppointments = 0;
      for (const blocked of blockedSlots) {
        // Check if the slot overlaps with a blocked slot
        if (time < blocked.end && time + appointmentLength > blocked.start) {
          overlappingAppointments++;
        }
      }

      // Add the slot if there's capacity available
      if (overlappingAppointments < simultaneousSlots) {
        allSlots.push({
          start: slotStart.format('YYYY-MM-DDTHH:mm:ss'),
          end: slotEnd.format('YYYY-MM-DDTHH:mm:ss'),
          available: true,
        });
      }
    }

    return {
      slots: allSlots,
      physicianName: `${user.name} ${user.last_name || ''}`,
      date: requestedDate.format('YYYY-MM-DD'),
      modality: schedule.modality,
    };
  }

  // Upsert schedules in bulk (create new ones, update existing ones, and delete ones not in the payload)
  async upsertSchedules(userId: string, bulkCreateDto: BulkCreateScheduleDto) {
    const tenant_id = global.tenant_id;

    // Get the physician
    const physician = await this.getPhysicianByUserId(userId);

    // First, validate all entries
    const daysInPayload = new Set<number>();

    // Check for duplicates within the payload
    for (const schedule of bulkCreateDto.schedules) {
      if (daysInPayload.has(schedule.day_of_week)) {
        throw new BadRequestException(
          `Duplicate day of week ${schedule.day_of_week} in request`,
        );
      }
      daysInPayload.add(schedule.day_of_week);

      // Validate time range
      if (!this.validateTimeRange(schedule.start_time, schedule.end_time)) {
        throw new BadRequestException(
          `For day ${schedule.day_of_week}: End time must be after start time`,
        );
      }

      // Validate rest time if provided
      if (schedule.rest_start && schedule.rest_end) {
        if (!this.validateTimeRange(schedule.rest_start, schedule.rest_end)) {
          throw new BadRequestException(
            `For day ${schedule.day_of_week}: Rest end time must be after rest start time`,
          );
        }

        const startMinutes = this.timeToMinutes(schedule.start_time);
        const endMinutes = this.timeToMinutes(schedule.end_time);
        const restStartMinutes = this.timeToMinutes(schedule.rest_start);
        const restEndMinutes = this.timeToMinutes(schedule.rest_end);

        if (restStartMinutes < startMinutes || restEndMinutes > endMinutes) {
          throw new BadRequestException(
            `For day ${schedule.day_of_week}: Rest period must be within working hours`,
          );
        }
      }
    }

    // Get existing schedules for this physician
    const existingSchedules = await this.prisma.physician_schedule.findMany({
      where: {
        physician_id: physician.id,
        tenant_id,
        deleted: false,
      },
    });

    // Create a map of day_of_week -> schedule for existing schedules
    const existingScheduleMap = new Map();
    for (const schedule of existingSchedules) {
      existingScheduleMap.set(schedule.day_of_week, schedule);
    }

    // Prepare transactions for upsert operations
    const upsertTransactions = [];
    const processedDays = new Set<number>();

    // Process each schedule in the payload
    for (const schedule of bulkCreateDto.schedules) {
      const existingSchedule = existingScheduleMap.get(schedule.day_of_week);
      processedDays.add(schedule.day_of_week);

      if (existingSchedule) {
        // Update existing schedule
        upsertTransactions.push(
          this.prisma.physician_schedule.update({
            where: { id: existingSchedule.id },
            data: {
              ...schedule,
              physician_id: physician.id,
              tenant_id,
            },
          }),
        );
      } else {
        // Create new schedule
        upsertTransactions.push(
          this.prisma.physician_schedule.create({
            data: {
              ...schedule,
              physician_id: physician.id,
              tenant_id,
            },
          }),
        );
      }
    }

    // Soft delete schedules that are not in the payload
    for (const [day, schedule] of existingScheduleMap.entries()) {
      if (!processedDays.has(day)) {
        upsertTransactions.push(
          this.prisma.physician_schedule.update({
            where: { id: schedule.id },
            data: {
              deleted: true,
              deleted_at: new Date(),
            },
          }),
        );
      }
    }

    // Execute all transactions
    const results = await this.prisma.$transaction(upsertTransactions);

    // Filter out deleted schedules from the response
    return results.filter((schedule) => !schedule.deleted);
  }
}
