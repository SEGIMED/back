import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { config } from 'dotenv';
config({ path: '.env' });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // URL del frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
    credentials: true, // Si estás usando cookies o autenticación basada en sesión
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    exceptionFactory: (errors) => {
      const cleanErrors = errors.map(err => {
        return {property: err.property, constraints: err.constraints}
      });
      return new BadRequestException({
        alert: 'Se han detectado los siguientes errores en la petición: ',
        errors: cleanErrors
      })
    }
  }))
  
  const swaggerConfig = new DocumentBuilder()
  .setTitle('SEGIMED')
  .setDescription('Manage your organization with SEGIMED, your medical partner.')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

  
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api', app, document);
  
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
