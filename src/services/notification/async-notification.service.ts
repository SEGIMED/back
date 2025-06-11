import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationQueueService } from '../../queues/notification-queue.service';
import {
  PatientNotificationData,
  MedicalOrderData,
  MedicalOrderTypeData,
} from './notification.service';
import { MedicationItemInterface } from '../../medical-scheduling/modules/prescription/prescription.service';

@Injectable()
export class AsyncNotificationService {
  private readonly logger = new Logger(AsyncNotificationService.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationQueueService: NotificationQueueService,
  ) {}

  /**
   * Send medical order notification synchronously (immediate processing)
   * Use for critical notifications that must be sent immediately
   */
  async sendMedicalOrderNotificationSync(
    patient: PatientNotificationData,
    order: MedicalOrderData,
    orderType: MedicalOrderTypeData,
    physicianName?: string,
    medications?: MedicationItemInterface[],
  ): Promise<void> {
    this.logger.log(
      `Sending medical order notification synchronously for patient ${patient.id}`,
    );

    return this.notificationService.sendMedicalOrderNotification(
      patient,
      order,
      orderType,
      physicianName,
      medications,
    );
  }

  /**
   * Send medical order notification asynchronously (queued processing)
   * Recommended for most use cases to avoid blocking the main thread
   */
  async sendMedicalOrderNotificationAsync(
    patient: PatientNotificationData,
    order: MedicalOrderData,
    orderType: MedicalOrderTypeData,
    physicianName?: string,
    medications?: MedicationItemInterface[],
    options?: {
      priority?: number; // Higher numbers = higher priority
      delay?: number; // Delay in milliseconds
    },
  ): Promise<void> {
    this.logger.log(
      `Queuing medical order notification for patient ${patient.id}`,
    );

    try {
      await this.notificationQueueService.enqueueMedicalOrderNotification(
        patient,
        order,
        orderType,
        physicianName,
        medications,
        options?.priority,
        options?.delay,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue medical order notification for patient ${patient.id}:`,
        error,
      );
      // Fallback to synchronous processing if queue fails
      this.logger.warn(
        `Falling back to synchronous processing for patient ${patient.id}`,
      );
      await this.sendMedicalOrderNotificationSync(
        patient,
        order,
        orderType,
        physicianName,
        medications,
      );
    }
  }

  /**
   * Send medication update notification synchronously
   */
  async sendMedicationUpdateNotificationSync(
    patient: PatientNotificationData,
    medications: MedicationItemInterface[],
    physicianName?: string,
    fileUrl?: string,
  ): Promise<void> {
    this.logger.log(
      `Sending medication update notification synchronously for patient ${patient.id}`,
    );

    return this.notificationService.sendMedicationUpdateNotification(
      patient,
      medications,
      physicianName,
      fileUrl,
    );
  }

  /**
   * Send medication update notification asynchronously (queued processing)
   * Recommended for most use cases to avoid blocking the main thread
   */
  async sendMedicationUpdateNotificationAsync(
    patient: PatientNotificationData,
    medications: MedicationItemInterface[],
    physicianName?: string,
    fileUrl?: string,
    options?: {
      priority?: number;
      delay?: number;
    },
  ): Promise<void> {
    this.logger.log(
      `Queuing medication update notification for patient ${patient.id}`,
    );

    try {
      await this.notificationQueueService.enqueueMedicationUpdateNotification(
        patient,
        medications,
        physicianName,
        fileUrl,
        options?.priority,
        options?.delay,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue medication update notification for patient ${patient.id}:`,
        error,
      );
      // Fallback to synchronous processing if queue fails
      this.logger.warn(
        `Falling back to synchronous processing for patient ${patient.id}`,
      );
      await this.sendMedicationUpdateNotificationSync(
        patient,
        medications,
        physicianName,
        fileUrl,
      );
    }
  }

  /**
   * Convenience method that defaults to async processing
   * This can be used as a drop-in replacement for the original methods
   */
  async sendMedicalOrderNotification(
    patient: PatientNotificationData,
    order: MedicalOrderData,
    orderType: MedicalOrderTypeData,
    physicianName?: string,
    medications?: MedicationItemInterface[],
  ): Promise<void> {
    return this.sendMedicalOrderNotificationAsync(
      patient,
      order,
      orderType,
      physicianName,
      medications,
    );
  }

  /**
   * Convenience method that defaults to async processing
   */
  async sendMedicationUpdateNotification(
    patient: PatientNotificationData,
    medications: MedicationItemInterface[],
    physicianName?: string,
    fileUrl?: string,
  ): Promise<void> {
    return this.sendMedicationUpdateNotificationAsync(
      patient,
      medications,
      physicianName,
      fileUrl,
    );
  }

  /**
   * Get notification queue statistics
   */
  async getQueueStats() {
    return this.notificationQueueService.getQueueStats();
  }

  /**
   * Admin methods for queue management
   */
  async pauseNotificationQueue(): Promise<void> {
    await this.notificationQueueService.pauseQueue();
  }

  async resumeNotificationQueue(): Promise<void> {
    await this.notificationQueueService.resumeQueue();
  }

  async cleanOldNotificationJobs(): Promise<void> {
    await this.notificationQueueService.cleanOldJobs();
  }
}
