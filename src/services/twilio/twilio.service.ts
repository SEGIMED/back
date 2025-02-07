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

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
