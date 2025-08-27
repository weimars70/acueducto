import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin 'origin' (ej: desde apps móviles nativas con Capacitor)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'https://bolt.new',
        'http://localhost:5173',
        'http://localhost',
        'http://localhost:3306',
        'http://localhost:8443',
        'http://108.181.193.178:5173',
        'http://108.181.193.178:443',
        'http://108.181.193.178',
        'http://108.181.193.178:3006',
        'capacitor://localhost',
        'capacitor://108.181.193.178',
        'capacitor://',   // 👈 agregar este
        null ,             // 👈 permitir requests sin origin
        'https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3--5173--4d9fd228.local-credentialless.webcontainer-api.io/',
      ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS bloqueado para origen: ${origin}`));
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Cache-Control',
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  });
   const config = new DocumentBuilder()
    .setTitle('API de Facturación')
    .setDescription('Documentación de la API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 🖥️ Puerto dinámico
  const port = process.env.PORT || 3006;
  await app.listen(port);
  console.log(`🚀 API corriendo en http://localhost:${port}`);
}
bootstrap();

