import { Injectable } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { TwilioService } from '../twilio/twilio.service';
import { medicalOrderHtml } from '../email/templates/medicalOrderHtml';
import { medicationHtml } from '../email/templates/medicationHtml';
import { MedicationItemInterface } from '../../medical-scheduling/modules/prescription/prescription.service';

export interface PatientNotificationData {
  id: string;
  name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  is_phone_verified?: boolean;
}

export interface MedicalOrderData {
  id: string;
  url?: string;
  request_date: Date;
  description_type?: string;
}

export interface MedicalOrderTypeData {
  name: string;
  description: string;
}

@Injectable()
export class NotificationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly twilioService: TwilioService,
  ) {}

  /**
   * Envía notificaciones para órdenes médicas
   */
  async sendMedicalOrderNotification(
    patient: PatientNotificationData,
    order: MedicalOrderData,
    orderType: MedicalOrderTypeData,
    physicianName?: string,
    medications?: MedicationItemInterface[],
  ): Promise<void> {
    try {
      // Determinar qué plantilla usar según el tipo de orden
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

      // Preparar adjuntos si hay una URL del documento
      let attachments = [];
      if (order.url) {
        try {
          const attachment = await this.emailService.getAttachmentFromUrl(
            order.url,
          );
          attachments = [attachment];
        } catch (attachmentError) {
          console.error(
            'Error al preparar el archivo adjunto:',
            attachmentError,
          );
          // Continuar sin adjunto si hay error
        }
      }

      // Enviar email
      if (patient.email) {
        try {
          await this.emailService.sendMail(
            patient.email,
            emailSubject,
            emailContent,
            attachments.length > 0 ? attachments : undefined,
          );
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
          // No lanzar error, seguir con el flujo
        }
      }

      // Enviar WhatsApp si está disponible
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

          // Si hay URL del documento, enviar con archivo adjunto
          if (order.url) {
            await this.twilioService.sendWhatsAppWithMedia(
              patient.phone,
              whatsappMessage,
              order.url,
            );
          } else {
            await this.twilioService.sendOtp(patient.phone, whatsappMessage);
          }
        } catch (whatsappError) {
          console.error('Error sending WhatsApp notification:', whatsappError);
          // No lanzar error, seguir con el flujo
        }
      }
    } catch (error) {
      console.error('Error en notificaciones de orden médica:', error);
      // Continuamos con el flujo normal aunque fallen las notificaciones
    }
  }

  /**
   * Envía notificaciones específicas para actualizaciones de medicación
   */
  async sendMedicationUpdateNotification(
    patient: PatientNotificationData,
    medications: MedicationItemInterface[],
    physicianName?: string,
    fileUrl?: string,
  ): Promise<void> {
    try {
      // Preparar adjuntos si hay una URL del documento
      let attachments = [];
      if (fileUrl) {
        try {
          const attachment =
            await this.emailService.getAttachmentFromUrl(fileUrl);
          attachments = [attachment];
        } catch (attachmentError) {
          console.error(
            'Error al preparar el archivo adjunto:',
            attachmentError,
          );
          // Continuar sin adjunto si hay error
        }
      }

      // Enviar email
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
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
          // No lanzar error, seguir con el flujo
        }
      }

      // Enviar WhatsApp si está disponible
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

          // Si hay URL del documento, enviar con archivo adjunto
          if (fileUrl) {
            await this.twilioService.sendWhatsAppWithMedia(
              patient.phone,
              whatsappMessage,
              fileUrl,
            );
          } else {
            await this.twilioService.sendOtp(patient.phone, whatsappMessage);
          }
        } catch (whatsappError) {
          console.error('Error sending WhatsApp notification:', whatsappError);
          // No lanzar error, seguir con el flujo
        }
      }
    } catch (error) {
      console.error('Error en notificaciones de medicación:', error);
      // Continuamos con el flujo normal aunque fallen las notificaciones
    }
  }
}
