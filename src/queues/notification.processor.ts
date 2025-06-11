import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NOTIFICATION_QUEUE } from './notification-queue.module';
import {
  NotificationJobData,
  NotificationJobType,
  MedicalOrderNotificationJobData,
  MedicationUpdateNotificationJobData,
} from './notification-queue.service';
import { EmailService } from '../services/email/email.service';
import { TwilioService } from '../services/twilio/twilio.service';
import { medicalOrderHtml } from '../services/email/templates/medicalOrderHtml';
import { medicationHtml } from '../services/email/templates/medicationHtml';

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly twilioService: TwilioService,
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<void> {
    this.logger.log(
      `Processing notification job: ${job.id}, type: ${job.data.type}`,
    );

    try {
      switch (job.data.type) {
        case NotificationJobType.MEDICAL_ORDER:
          await this.processMedicalOrderNotification(job.data);
          break;
        case NotificationJobType.MEDICATION_UPDATE:
          await this.processMedicationUpdateNotification(job.data);
          break;
        default:
          throw new Error(
            `Unknown notification job type: ${(job.data as any).type}`,
          );
      }

      this.logger.log(`Notification job ${job.id} completed successfully`);
    } catch (error) {
      this.logger.error(`Notification job ${job.id} failed:`, error);
      throw error; // This will mark the job as failed and trigger retry
    }
  }

  private async processMedicalOrderNotification(
    data: MedicalOrderNotificationJobData,
  ): Promise<void> {
    const { patient, order, orderType, physicianName, medications } = data;

    try {
      // Determine email content and subject based on order type
      let emailContent: string;
      let emailSubject: string;

      if (
        orderType.name === 'medication' ||
        orderType.name === 'medication-authorization'
      ) {
        emailContent = medicationHtml(
          patient.name,
          patient.last_name || '',
          medications || [],
          physicianName || 'su médico',
        );
        emailSubject = `Nuevas medicaciones prescritas`;
      } else {
        emailContent = medicalOrderHtml(
          patient.name,
          patient.last_name || '',
          orderType.description,
          new Date(order.request_date).toLocaleDateString(),
          physicianName || 'No especificado',
          order.description_type,
          order.url,
        );
        emailSubject = `Nueva orden médica: ${orderType.description}`;
      }

      // Prepare attachments if there's a document URL
      let attachments = [];
      if (order.url) {
        try {
          const attachment = await this.emailService.getAttachmentFromUrl(
            order.url,
          );
          attachments = [attachment];
        } catch (attachmentError) {
          this.logger.warn(
            `Error preparing attachment for job ${order.id}:`,
            attachmentError,
          );
          // Continue without attachment if there's an error
        }
      }

      // Send email notification
      if (patient.email) {
        try {
          await this.emailService.sendMail(
            patient.email,
            emailSubject,
            emailContent,
            attachments.length > 0 ? attachments : undefined,
          );
          this.logger.log(`Email sent successfully to ${patient.email}`);
        } catch (emailError) {
          this.logger.error(
            `Error sending email to ${patient.email}:`,
            emailError,
          );
          // Don't throw error here, continue with other notifications
        }
      }

      // Send WhatsApp notification if available
      if (patient.phone && patient.is_phone_verified) {
        try {
          let whatsappMessage: string;

          if (
            orderType.name === 'medication' ||
            orderType.name === 'medication-authorization'
          ) {
            const medicationListText = (medications || [])
              .map(
                (med) =>
                  `• ${med.monodrug}: ${med.dose} ${med.dose_units}, ${med.frecuency}, por ${med.duration} ${med.duration_units}` +
                  (med.observations
                    ? `\n  _Observaciones: ${med.observations}_`
                    : ''),
              )
              .join('\n');

            whatsappMessage = `Hola ${patient.name},

Durante su consulta, el Dr./Dra. ${physicianName || 'su médico'} ha prescrito las siguientes medicaciones:

${medicationListText}

Por favor, siga las indicaciones de su médico y tome sus medicamentos según lo prescrito.

SEGIMED - Sistema de Gestión Médica`;
          } else {
            whatsappMessage = `Hola ${patient.name},
Se ha generado una nueva orden médica de tipo *${orderType.description}* para usted.

*Detalles de la orden:*
• Fecha: ${new Date(order.request_date).toLocaleDateString()}
• Médico: ${physicianName || 'No especificado'}
${order.description_type ? `• Descripción: ${order.description_type}` : ''}

Si tiene alguna pregunta, contacte a su médico.

SEGIMED - Sistema de Gestión Médica`;
          }

          // Send WhatsApp with or without media attachment
          if (order.url) {
            await this.twilioService.sendWhatsAppWithMedia(
              patient.phone,
              whatsappMessage,
              order.url,
            );
          } else {
            await this.twilioService.sendOtp(patient.phone, whatsappMessage);
          }

          this.logger.log(`WhatsApp sent successfully to ${patient.phone}`);
        } catch (whatsappError) {
          this.logger.error(
            `Error sending WhatsApp to ${patient.phone}:`,
            whatsappError,
          );
          // Don't throw error here, continue with processing
        }
      }
    } catch (error) {
      this.logger.error(`Error processing medical order notification:`, error);
      throw error;
    }
  }

  private async processMedicationUpdateNotification(
    data: MedicationUpdateNotificationJobData,
  ): Promise<void> {
    const { patient, medications, physicianName, fileUrl } = data;

    try {
      // Prepare attachments if there's a file URL
      let attachments = [];
      if (fileUrl) {
        try {
          const attachment =
            await this.emailService.getAttachmentFromUrl(fileUrl);
          attachments = [attachment];
        } catch (attachmentError) {
          this.logger.warn(
            `Error preparing attachment for medication update:`,
            attachmentError,
          );
          // Continue without attachment if there's an error
        }
      }

      // Send email notification
      if (patient.email) {
        try {
          const emailContent = medicationHtml(
            patient.name,
            patient.last_name || '',
            medications,
            physicianName || 'su médico',
          );
          await this.emailService.sendMail(
            patient.email,
            `Nuevas medicaciones prescritas`,
            emailContent,
            attachments.length > 0 ? attachments : undefined,
          );
          this.logger.log(`Medication update email sent to ${patient.email}`);
        } catch (emailError) {
          this.logger.error(
            `Error sending medication update email to ${patient.email}:`,
            emailError,
          );
          // Don't throw error here, continue with other notifications
        }
      }

      // Send WhatsApp notification if available
      if (patient.phone && patient.is_phone_verified) {
        try {
          const medicationListText = medications
            .map(
              (med) =>
                `• ${med.monodrug}: ${med.dose} ${med.dose_units}, ${med.frecuency}, por ${med.duration} ${med.duration_units}` +
                (med.observations
                  ? `\n  _Observaciones: ${med.observations}_`
                  : ''),
            )
            .join('\n');

          const whatsappMessage = `Hola ${patient.name},

Durante su consulta, el Dr./Dra. ${physicianName || 'su médico'} ha prescrito las siguientes medicaciones:

${medicationListText}

Por favor, siga las indicaciones de su médico y tome sus medicamentos según lo prescrito.

SEGIMED - Sistema de Gestión Médica`;

          // Send WhatsApp with or without media attachment
          if (fileUrl) {
            await this.twilioService.sendWhatsAppWithMedia(
              patient.phone,
              whatsappMessage,
              fileUrl,
            );
          } else {
            await this.twilioService.sendOtp(patient.phone, whatsappMessage);
          }

          this.logger.log(
            `Medication update WhatsApp sent to ${patient.phone}`,
          );
        } catch (whatsappError) {
          this.logger.error(
            `Error sending medication update WhatsApp to ${patient.phone}:`,
            whatsappError,
          );
          // Don't throw error here, continue with processing
        }
      }
    } catch (error) {
      this.logger.error(
        `Error processing medication update notification:`,
        error,
      );
      throw error;
    }
  }
}
