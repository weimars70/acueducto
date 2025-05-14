import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /*const httpsOptions = {
    key: fs.readFileSync('./certs/laragon.key'),
    cert: fs.readFileSync('./certs/laragon.crt'),
  };

  const app = await NestFactory.create(AppModule, { httpsOptions });*/

  // Enable CORS with credentials

  app.enableCors({
    origin: [
      'https://bolt.new',
      'http://localhost:5173',
      'http://localhost:8443',
      'http://108.181.193.178:5173', // <-- Agrega esta línea
      'http://108.181.193.178:443',
      'https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3--5173--4d9fd228.local-credentialless.webcontainer-api.io/',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,Accept,Cache-Control',
    exposedHeaders: 'Content-Type',
    credentials: false,
  });
  
  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Facturación')
    .setDescription('Documentación de la API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3006);
}
bootstrap();

