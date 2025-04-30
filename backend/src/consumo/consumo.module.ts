import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsumoService } from './consumo.service';
import { ConsumoController } from './consumo.controller';
import { Consumption } from '../entities/consumption.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Consumption])],
  controllers: [ConsumoController],
  providers: [ConsumoService],
  exports: [ConsumoService],
})
export class ConsumoModule {}
