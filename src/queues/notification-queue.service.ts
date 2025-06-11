import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { NOTIFICATION_QUEUE } from './notification-queue.module';
import {
  PatientNotificationData,
  MedicalOrderData,
  MedicalOrderTypeData,
} from '../services/notification/notification.service';
import { MedicationItemInterface } from '../medical-scheduling/modules/prescription/prescription.service';

export enum NotificationJobType {
  MEDICAL_ORDER = 'medical-order',
  MEDICATION_UPDATE = 'medication-update',
}

export interface MedicalOrderNotificationJobData {
  type: NotificationJobType.MEDICAL_ORDER;
  patient: PatientNotificationData;
  order: MedicalOrderData;
  orderType: MedicalOrderTypeData;
  physicianName?: string;
  medications?: MedicationItemInterface[];
}

export interface MedicationUpdateNotificationJobData {
  type: NotificationJobType.MEDICATION_UPDATE;
  patient: PatientNotificationData;
  medications: MedicationItemInterface[];
  physicianName?: string;
  fileUrl?: string;
}

export type NotificationJobData =
  | MedicalOrderNotificationJobData
  | MedicationUpdateNotificationJobData;

@Injectable()
export class NotificationQueueService {
  private readonly logger = new Logger(NotificationQueueService.name);

  constructor(
    @InjectQueue(NOTIFICATION_QUEUE) private notificationQueue: Queue,
  ) {}

  /**
   * Enqueue a medical order notification
   */
  async enqueueMedicalOrderNotification(
    patient: PatientNotificationData,
    order: MedicalOrderData,
    orderType: MedicalOrderTypeData,
    physicianName?: string,
    medications?: MedicationItemInterface[],
    priority: number = 0,
    delay?: number,
  ): Promise<void> {
    try {
      const jobData: MedicalOrderNotificationJobData = {
        type: NotificationJobType.MEDICAL_ORDER,
        patient,
        order,
        orderType,
        physicianName,
        medications,
      };

      const job = await this.notificationQueue.add(
        NotificationJobType.MEDICAL_ORDER,
        jobData,
        {
          priority,
          delay,
          // Add unique job ID to prevent duplicates
          jobId: `medical-order-${order.id}-${patient.id}-${Date.now()}`,
        },
      );

      this.logger.log(
        `Medical order notification job enqueued: ${job.id} for patient ${patient.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to enqueue medical order notification for patient ${patient.id}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Enqueue a medication update notification
   */
  async enqueueMedicationUpdateNotification(
    patient: PatientNotificationData,
    medications: MedicationItemInterface[],
    physicianName?: string,
    fileUrl?: string,
    priority: number = 0,
    delay?: number,
  ): Promise<void> {
    try {
      const jobData: MedicationUpdateNotificationJobData = {
        type: NotificationJobType.MEDICATION_UPDATE,
        patient,
        medications,
        physicianName,
        fileUrl,
      };

      const job = await this.notificationQueue.add(
        NotificationJobType.MEDICATION_UPDATE,
        jobData,
        {
          priority,
          delay,
          // Add unique job ID to prevent duplicates
          jobId: `medication-update-${patient.id}-${Date.now()}`,
        },
      );

      this.logger.log(
        `Medication update notification job enqueued: ${job.id} for patient ${patient.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to enqueue medication update notification for patient ${patient.id}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const waiting = await this.notificationQueue.getWaiting();
    const active = await this.notificationQueue.getActive();
    const completed = await this.notificationQueue.getCompleted();
    const failed = await this.notificationQueue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }

  /**
   * Clean old jobs from the queue
   */
  async cleanOldJobs() {
    try {
      await this.notificationQueue.clean(24 * 60 * 60 * 1000, 100, 'completed'); // Remove completed jobs older than 24h
      await this.notificationQueue.clean(7 * 24 * 60 * 60 * 1000, 50, 'failed'); // Remove failed jobs older than 7 days
      this.logger.log('Old notification jobs cleaned successfully');
    } catch (error) {
      this.logger.error('Failed to clean old notification jobs:', error);
    }
  }

  /**
   * Pause the queue
   */
  async pauseQueue(): Promise<void> {
    await this.notificationQueue.pause();
    this.logger.warn('Notification queue paused');
  }

  /**
   * Resume the queue
   */
  async resumeQueue(): Promise<void> {
    await this.notificationQueue.resume();
    this.logger.log('Notification queue resumed');
  }
}
