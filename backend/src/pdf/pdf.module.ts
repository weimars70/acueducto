import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PdfController } from '../controllers/pdf.controller';
import { PdfService } from '../services/pdf.service';
import { Consumption } from '../entities/consumption.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Consumption])],
  controllers: [PdfController],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}