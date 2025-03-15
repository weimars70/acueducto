import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenericCaptureController } from './generic-capture.controller';
import { GenericCaptureService } from './generic-capture.service';
import { Sector } from '../entities/sector.entity';
import { Tarifa } from '../entities/tarifa.entity';
import { Estrato } from '../entities/estrato.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sector,
      Tarifa,
      Estrato
    ])
  ],
  controllers: [GenericCaptureController],
  providers: [GenericCaptureService],
  exports: [GenericCaptureService],
})
export class GenericCaptureModule {}