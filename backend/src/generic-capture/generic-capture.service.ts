import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GenericCaptureDto } from './dto/generic-capture.dto';
import { Sector } from '../entities/sector.entity';
import { Tarifa } from '../entities/tarifa.entity';
import { Estrato } from '../entities/estrato.entity';

@Injectable()
export class GenericCaptureService {
  private repositories: { [key: string]: Repository<any> };

  constructor(
    @InjectRepository(Sector)
    private readonly sectoresRepository: Repository<Sector>,
    @InjectRepository(Tarifa)
    private readonly tarifasRepository: Repository<Tarifa>,
    @InjectRepository(Estrato)
    private readonly estratosRepository: Repository<Estrato>
  ) {
    this.repositories = {
      sectores: sectoresRepository,
      tarifas: tarifasRepository,
      estratos: estratosRepository
    };
  }

  private getRepository(tabla: string): Repository<any> {
    const repository = this.repositories[tabla];
    if (!repository) {
      throw new Error(`Tabla ${tabla} no soportada`);
    }
    return repository;
  }

  async create(data: GenericCaptureDto) {
    try {
      const repository = this.getRepository(data.tabla);
      const entity = repository.create({
        codigo: data.codigo,
        nombre: data.nombre,
        abreviado: data.abreviado
      });
      return await repository.save(entity);
    } catch (error) {
      throw new Error(`Error en captura genérica: ${error.message}`);
    }
  }

  async update(data: GenericCaptureDto) {
    try {
      const repository = this.getRepository(data.tabla);
      const entity = await repository.findOne({
        where: { codigo: data.codigo }
      });

      if (!entity) {
        throw new Error(`Registro no encontrado en ${data.tabla}`);
      }

      Object.assign(entity, {
        nombre: data.nombre,
        abreviado: data.abreviado
      });

      return await repository.save(entity);
    } catch (error) {
      throw new Error(`Error en actualización genérica: ${error.message}`);
    }
  }

  async delete(tabla: string, codigo: string) {
    try {
      const repository = this.getRepository(tabla);
      const result = await repository.delete(codigo);
      
      if (result.affected === 0) {
        throw new Error(`Registro no encontrado en ${tabla}`);
      }

      return { success: true, message: 'Registro eliminado exitosamente' };
    } catch (error) {
      throw new Error(`Error en eliminación genérica: ${error.message}`);
    }
  }

  async findAll(tabla: string) {
    try {
      const repository = this.getRepository(tabla);
      return await repository.find({
        order: { codigo: 'ASC' }
      });
    } catch (error) {
      throw new Error(`Error en consulta genérica: ${error.message}`);
    }
  }

  async findOne(tabla: string, codigo: string) {
    try {
      const repository = this.getRepository(tabla);
      const entity = await repository.findOne({
        where: { codigo }
      });

      if (!entity) {
        throw new Error(`Registro no encontrado en ${tabla}`);
      }

      return entity;
    } catch (error) {
      throw new Error(`Error en consulta genérica: ${error.message}`);
    }
  }
}