import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from '../services/pdf.service';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('subsidios')
  async generateSubsidyReport(
    @Query('mes') mes: number,
    @Query('year') year: number,
    @Res() res: Response
  ): Promise<void> {
    try {
      const data = await this.pdfService.getSubsidyData(mes, year);
      const pdfBuffer = await this.pdfService.generateSubsidyPdf(data);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=subsidios-${year}-${mes}.pdf`,
        'Content-Length': pdfBuffer.length,
      });

      res.end(pdfBuffer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Error generating PDF' 
      });
    }
  }
}