import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PDFDocument from 'pdfkit';
import { SubsidyData } from '../types/subsidy';
import { Consumption } from '../entities/consumption.entity';

@Injectable()
export class PdfService {
  constructor(
    @InjectRepository(Consumption)
    private readonly consumptionRepository: Repository<Consumption>,
  ) {}

  async generateSubsidyPdf(data: SubsidyData): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'LETTER',
        margin: 50
      });

      const chunks: Buffer[] = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Title
      doc.fontSize(16)
         .text('REPORTE DE SUBSIDIOS Y CONTRIBUCIONES', { align: 'center' })
         .moveDown();

      // Basic Data Table
      doc.fontSize(12)
         .text('Datos Básicos', { underline: true })
         .moveDown(0.5);

      this.createTable(doc, [
        ['Estrato', 'Total Usuarios', 'Cargo Fijo', 'Consumo Básico', 'Consumo Complementario', 'Consumo Suntuario'],
        ...data.basicData.map(row => [
          row.estrato,
          row.total_usuarios,
          row.cargo_fijo,
          row.consumo_basico,
          row.consumo_complementario,
          row.consumo_suntuario
        ])
      ]);

      doc.moveDown(2);

      // Detailed Data Table
      doc.fontSize(12)
         .text('Datos Detallados', { underline: true })
         .moveDown(0.5);

      this.createTable(doc, [
        ['Estrato', 'Total Usuarios', 'Cargo Fijo', 'Consumo Básico', 'Consumo Complementario', 'Consumo Suntuario', 'Por Cargo Fijo', 'Por Consumo'],
        ...data.detailedData.map(row => [
          row.estrato,
          row.total_usuarios,
          row.cargo_fijo,
          row.consumo_basico,
          row.consumo_complementario,
          row.consumo_suntuario,
          row.por_cargo_fijo,
          row.por_consumo
        ])
      ]);

      doc.moveDown(2);

      // Totals Table
      doc.fontSize(12)
         .text('Totales', { underline: true })
         .moveDown(0.5);

      this.createTable(doc, [
        ['Estrato', 'Cargo Fijo', 'Total Consumo Básico', 'Total Consumo Complementario', 'Total Consumo Suntuario', 'Total Valor Subsidio'],
        ...data.totals.map(row => [
          row.estrato,
          row.cargo_fijo,
          row.total_consumo_basico,
          row.total_consumo_complementario,
          row.total_consumo_suntuario,
          row.total_valor_subsidio
        ])
      ]);

      doc.moveDown(2);

      // Summary
      doc.fontSize(12)
         .text('Resumen', { underline: true })
         .moveDown(0.5);

      const formatCurrency = (value: number) => 
        new Intl.NumberFormat('es-CO', { 
          style: 'currency', 
          currency: 'COP' 
        }).format(value);

      doc.text(`Valor Subsidios: ${formatCurrency(data.summary.valor_subsidios)}`)
         .text(`Valor Contribución: ${formatCurrency(data.summary.valor_contribucion)}`)
         .text(`Total Contribuciones: ${formatCurrency(data.summary.tot_contribuciones)}`);

      doc.end();
    });
  }

  private createTable(doc: PDFKit.PDFDocument, data: (string | number)[][]): void {
    const cellPadding = 5;
    const cellWidth = (doc.page.width - 100) / data[0].length;
    const cellHeight = 20;
    let startX = 50;
    let startY = doc.y;

    // Draw headers
    doc.font('Helvetica-Bold');
    data[0].forEach((header, i) => {
      doc.text(
        header.toString(),
        startX + (i * cellWidth),
        startY,
        {
          width: cellWidth,
          align: 'center'
        }
      );
    });

    // Draw rows
    doc.font('Helvetica');
    startY += cellHeight;

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Draw cell backgrounds alternating
      if (i % 2 === 0) {
        doc.rect(startX, startY, doc.page.width - 100, cellHeight)
           .fill('#f5f5f5');
      }

      row.forEach((cell, j) => {
        doc.text(
          cell.toString(),
          startX + (j * cellWidth),
          startY + cellPadding,
          {
            width: cellWidth,
            align: 'center'
          }
        );
      });

      startY += cellHeight;

      // Add new page if needed
      if (startY > doc.page.height - 100) {
        doc.addPage();
        startY = 50;
      }
    }

    doc.y = startY + cellHeight;
  }

  async getSubsidyData(mes: number, year: number): Promise<SubsidyData> {
    try {
      // Get basic data
      const basicData = await this.consumptionRepository.query(
        'SELECT * FROM func_reporte_subsidios($1, $2)',
        [mes, year]
      );

      // Get detailed data
      const detailedData = await this.consumptionRepository.query(
        'SELECT * FROM func_reporte_subsidios($1, $2)',
        [mes, year]
      );

      // Get totals
      const totals = await this.consumptionRepository.query(
        'SELECT * FROM func_reporte_subsidios_totales($1, $2)',
        [mes, year]
      );

      // Get summary values
      const subsidios = await this.consumptionRepository.query(
        'SELECT * FROM func_valor_total_subsidio($1, $2)',
        [mes, year]
      );

      const contribucion = await this.consumptionRepository.query(
        'SELECT * FROM func_valor_total_contribucion($1, $2)',
        [mes, year]
      );

      const summary = {
        valor_subsidios: subsidios[0]?.valor_subsidios || 0,
        valor_contribucion: contribucion[0]?.valor_contribucion || 0,
        tot_contribuciones: (subsidios[0]?.valor_subsidios || 0) + (contribucion[0]?.valor_contribucion || 0)
      };

      return {
        basicData: basicData || [],
        detailedData: detailedData || [],
        totals: totals || [],
        summary
      };
    } catch (error) {
      console.error('Error getting subsidy data:', error);
      throw new Error(error.message || 'Error getting subsidy data');
    }
  }
}