import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConsumoModule } from './consumo/consumo.module';
import { InstalacionesModule } from './instalaciones/instalaciones.module';
import { DatabaseModule } from './database/database.module';
import { PdfModule } from './pdf/pdf.module';
import { GenericCaptureModule } from './generic-capture/generic-capture.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ConsumoModule,
    InstalacionesModule,
    PdfModule,
    GenericCaptureModule,
  ],
})
export class AppModule {}