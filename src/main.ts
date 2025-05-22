import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { config } from 'dotenv';
import * as express from 'express';

config({ path: '.env' });

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.enableCors({
    origin: '*', // URL del frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
    credentials: true, // Si estás usando cookies o autenticación basada en sesión
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const cleanErrors = errors.map((err) => {
          return {
            property: err.property,
            constraints: err.constraints,
            children: err.children?.map((child) => ({
              property: child.property,
              constraints: child.constraints,
            })),
          };
        });
        console.log('Errores de validación detallados:', cleanErrors); // 👈 Depuración
        return new BadRequestException({
          alert: 'Se han detectado los siguientes errores en la petición: ',
          errors: cleanErrors,
        });
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SEGIMED API')
    .setDescription(
      'API documentation for SEGIMED platform - a comprehensive medical management system.',
    )
    .setVersion('1.0')
    .addServer('http://localhost:3000', 'Local Development Server', {
      db_env: {
        default: 'local',
        description: 'Select database environment',
        enum: ['local', 'deployed'],
      },
    })
    .addServer('http://localhost:3000', 'Local Server - Deployed DB', {
      db_env: {
        default: 'deployed',
        description: 'Select database environment (API runs locally)',
        enum: ['local', 'deployed'],
      },
    })
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .addTag('Auth', 'Authentication operations')
    .addTag('Users', 'User management operations')
    .addTag('Patients', 'Patient management operations')
    .addTag('Appointments', 'Appointment scheduling operations')
    .addTag('Medical Events', 'Medical events management')
    .addTag('Medicine', 'Medicine management operations')
    .addTag('Background', 'Background management operations')
    .addTag('Vital Signs', 'Vital signs management operations')
    .addTag('Studies', 'Patient studies and results')
    .addTag('Prescriptions', 'Prescription management')
    .addTag('Physical Exploration', 'Physical exploration data management') // Added this line
    .addTag('Mood', 'Patient mood tracking')
    .setContact('SEGIMED Support', 'https://segimed.com', 'support@segimed.com')
    .setLicense('Private', '')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    deepScanRoutes: true,
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      defaultModelsExpandDepth: -1,
      displayRequestDuration: true,
      tryItOutEnabled: true,
      withCredentials: true,
      requestInterceptor: (req) => {
        // Asegurarse de que todas las peticiones incluyan el token de autorización si existe
        const token = localStorage.getItem('access_token');
        if (token) {
          req.headers.Authorization = `Bearer ${token}`;
        }
        return req;
      },
    },
    customSiteTitle: 'SEGIMED API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerUrl: '/api-json',
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
