import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable()
export class EmailService {
  private oauth2Client;
  private gmail;
  constructor(private configService: ConfigService) {
    const MAIL_CLIENT_ID = this.configService.get<string>('MAIL_CLIENT_ID');
    const MAIL_CLIENT_SECRET =
      this.configService.get<string>('MAIL_CLIENT_SECRET');
    const MAIL_REFRESH_TOKEN =
      this.configService.get<string>('MAIL_REFRESH_TOKEN');

    this.oauth2Client = new google.auth.OAuth2(
      MAIL_CLIENT_ID,
      MAIL_CLIENT_SECRET,
    );

    this.oauth2Client.setCredentials({
      refresh_token: MAIL_REFRESH_TOKEN,
    });

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  private encodeBase64URL(str: string) {
    return Buffer.from(str, 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  private encodeMIMEHeader(text: string) {
    return `=?UTF-8?B?${Buffer.from(text, 'utf8').toString('base64')}?=`;
  }

  async sendMail(destination: string, mailBody: string, mailSubject: string) {
    const encodedSubject = this.encodeMIMEHeader(mailSubject);

    const message = [
      `To: ${destination}`,
      `From: ${this.configService.get('SENDER_MAIL_ADDRESS')}`,
      'Content-Type: text/html; charset=utf-8',
      `Subject: ${encodedSubject}`,
      '',
      mailBody,
    ].join('\n');

    const encodedMessage = this.encodeBase64URL(message);

    try {
      const response = await this.gmail.users.messages.send({
        userId: 'me',
        resource: {
          raw: encodedMessage,
        },
      });

      return response.data;
    } catch {
      throw new Error('Error al enviar el correo');
    }
  }
}
