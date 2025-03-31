import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class TwilioService {
  private twilioClient: Twilio;

  constructor(private configService: ConfigService) {
    this.twilioClient = new Twilio(
      this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      this.configService.get<string>('TWILIO_AUTH_TOKEN'),
    );
  }

  async sendOtp(phoneNumber: string, otp: string): Promise<void> {
    const message = `Tu código de verificación es: ${otp}`;

    await this.twilioClient.messages.create({
      body: message,
      from: `whatsapp:${this.configService.get<string>('TWILIO_WHATSAPP_FROM')}`,
      to: `whatsapp:${phoneNumber}`,
    });
  }

  /**
   * Envía un mensaje de WhatsApp con un archivo adjunto
   * @param phoneNumber Número de teléfono del destinatario
   * @param message Mensaje a enviar
   * @param mediaUrl URL pública del archivo a adjuntar
   */
  async sendWhatsAppWithMedia(
    phoneNumber: string,
    message: string,
    mediaUrl: string,
  ): Promise<void> {
    try {
      await this.twilioClient.messages.create({
        body: message,
        from: `whatsapp:${this.configService.get<string>('TWILIO_WHATSAPP_FROM')}`,
        to: `whatsapp:${phoneNumber}`,
        mediaUrl: [mediaUrl], // Twilio acepta un array de URLs
      });
    } catch (error) {
      console.error('Error al enviar mensaje de WhatsApp con archivo:', error);
      throw new Error('Error al enviar mensaje de WhatsApp con archivo');
    }
  }

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
