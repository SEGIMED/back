import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { config } from 'dotenv';
import { IoAdapter } from '@nestjs/platform-socket.io';

config({ path: '.env' });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure CORS with WebSocket support
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['content-type', 'authorization'],
  });

  // Configure WebSocket adapter
  app.useWebSocketAdapter(new IoAdapter(app));

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
        console.log('Errores de validación detallados:', cleanErrors);
        return new BadRequestException({
          alert: 'Se han detectado los siguientes errores en la petición: ',
          errors: cleanErrors,
        });
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SEGIMED')
    .setDescription(
      'Manage your organization with SEGIMED, your medical partner.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
