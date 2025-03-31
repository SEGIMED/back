import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import * as path from 'path';
import * as nodeFetch from 'node-fetch';

interface Attachment {
  filename: string;
  content: string; // Base64 encoded content
  mimeType: string;
}

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

  async sendMail(
    destination: string,
    mailSubject: string,
    mailBody: string,
    attachments?: Attachment[],
  ) {
    const encodedSubject = this.encodeMIMEHeader(mailSubject);
    const boundary = 'boundary_' + Date.now().toString();

    let message = [
      `To: ${destination}`,
      `From: ${this.configService.get('SENDER_MAIL_ADDRESS')}`,
      `Subject: ${encodedSubject}`,
      'MIME-Version: 1.0',
    ];

    if (attachments && attachments.length > 0) {
      // Mensaje con adjuntos
      message = [
        ...message,
        `Content-Type: multipart/mixed; boundary=${boundary}`,
        '',
        `--${boundary}`,
        'Content-Type: text/html; charset=utf-8',
        'Content-Transfer-Encoding: base64',
        '',
        Buffer.from(mailBody).toString('base64'),
      ];

      // Agregar cada adjunto
      for (const attachment of attachments) {
        message = [
          ...message,
          `--${boundary}`,
          `Content-Type: ${attachment.mimeType}`,
          'Content-Transfer-Encoding: base64',
          `Content-Disposition: attachment; filename="${attachment.filename}"`,
          '',
          attachment.content,
        ];
      }

      // Cerrar el boundary
      message = [...message, `--${boundary}--`];
    } else {
      // Mensaje sin adjuntos
      message = [
        ...message,
        'Content-Type: text/html; charset=utf-8',
        '',
        mailBody,
      ];
    }

    const encodedMessage = this.encodeBase64URL(message.join('\n'));

    try {
      const response = await this.gmail.users.messages.send({
        userId: 'me',
        resource: {
          raw: encodedMessage,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      throw new Error('Error al enviar el correo');
    }
  }

  /**
   * Descarga un archivo desde una URL y lo convierte a base64
   * @param url URL del archivo a descargar
   * @returns Objeto con el contenido en base64, nombre de archivo y tipo MIME
   */
  async getAttachmentFromUrl(url: string): Promise<Attachment> {
    try {
      const response = await nodeFetch(url);

      if (!response.ok) {
        throw new Error(
          `Error al descargar el archivo: ${response.statusText}`,
        );
      }

      const buffer = await response.buffer();
      const contentType =
        response.headers.get('content-type') || 'application/octet-stream';
      const filename = path.basename(url).split('?')[0]; // Obtener el nombre del archivo de la URL

      return {
        filename,
        content: buffer.toString('base64'),
        mimeType: contentType,
      };
    } catch (error) {
      console.error('Error al obtener el archivo adjunto:', error);
      throw new Error('Error al obtener el archivo adjunto');
    }
  }
}
