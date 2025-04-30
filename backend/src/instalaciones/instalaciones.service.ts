import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Installation } from '../entities/installation.entity';

@Injectable()
export class InstalacionesService {
  constructor(
    @InjectRepository(Installation)
    private readonly installationRepository: Repository<Installation>,
  ) {}

  async findOne(codigo: number) {
    try {
      const sql = `SELECT codigo, codigo_medidor,nombre, sector as sector_nombre, direccion FROM view_instalaciones WHERE view_instalaciones.codigo= ${codigo} `;

      const installation = await this.installationRepository.query(sql);

      if (!installation) {
        throw new Error(`Instalación con código ${codigo} no encontrada`);
      }
      // Obtener lectura anterior y promedio
      const result = await this.installationRepository.query(
        ` SELECT lectura_anterior, promedio FROM get_previous_reading($1)`,
        [codigo],
      );
     
      return {
        ...installation,
        lectura_anterior: result[0]?.lectura_anterior || 0,
        promedio: result[0]?.promedio || 0,
      };
    } catch (error) {
      console.log('Error::.', error);
      throw new Error(`Error al obtener instalación: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const sql = `SELECT  * from view_instalaciones order by codigo `;
      const installations = await this.installationRepository.query(sql);

      // Obtener lecturas anteriores y promedios para todas las instalaciones
      const readings = await Promise.all(
        installations.map(async (installation) => {
          const result = await this.installationRepository.query(
            `
            SELECT lectura_anterior, promedio 
            FROM get_previous_reading($1)
          `,
            [installation.codigo],
          );
         
          return {
            ...installation,
            lectura_anterior: result[0]?.lectura_anterior || 0,
            promedio: result[0]?.promedio || 0,
          };
        }),
      );

      return readings;
    } catch (error) {
      throw new Error(`Error al obtener instalaciones: ${error.message}`);
    }
  }
}
