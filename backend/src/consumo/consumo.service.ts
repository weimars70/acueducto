import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { Consumption } from '../entities/consumption.entity';
import { CreateConsumoDto } from './dto/create-consumo.dto';
import { Observable, fromEvent } from 'rxjs';
import { EventEmitter } from 'events';

@Injectable()
export class ConsumoService implements OnModuleInit {
  private eventEmitter: EventEmitter;

  constructor(
    @InjectRepository(Consumption)
    private readonly consumoRepository: Repository<Consumption>,
    private connection: Connection,
  ) {
    this.eventEmitter = new EventEmitter();
  }

  async onModuleInit() {
    try {
      const queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();

      await queryRunner.query('LISTEN consumo_channel');

      const client = queryRunner.stream as any;
      if (client && client.connection) {
        client.connection.on(
          'notification',
          (msg: { channel: string; payload?: string }) => {
            if (msg.channel === 'consumo_channel') {
              this.eventEmitter.emit('consumption_update', {
                type: 'consumo_update',
                data: msg.payload ? JSON.parse(msg.payload) : {},
              });
            }
          },
        );
      }
    } catch (error) {
      console.error('Error setting up PostgreSQL notifications:', error);
    }
  }

  async findOne(id: number) {
    try {
      // Validar que el ID sea un número válido
      if (isNaN(id) || !Number.isInteger(id)) {
        throw new Error('El ID debe ser un número entero válido');
      }

      const consumption = await this.consumoRepository
        .createQueryBuilder('consumo')
        .where('consumo.codigo = :id', { id })
        .getOne();

      if (!consumption) {
        throw new Error(`Consumo con ID ${id} no encontrado`);
      }

      return consumption;
    } catch (error) {
      throw new Error(`Error al obtener consumo: ${error.message}`);
    }
  }

  async getPreviousReading(instalacion: number, codigo: number) {
    try {
      const result = await this.consumoRepository.query(
        `
        SELECT * FROM get_previous_reading($1, $2)
      `,
        [instalacion, codigo],
      );

      if (!result || result.length === 0) {
        return {
          lectura_anterior: 0,
          promedio: 0,
        };
      }

      return result[0];
    } catch (error) {
      throw new Error(`Error al obtener lectura anterior: ${error.message}`);
    }
  }

  async getBasicInfo(id: number) {
    try {
      const result = await this.consumoRepository
        .createQueryBuilder('consumo')
        .select([
          'consumo.mes_codigo',
          'consumo.year',
          'consumo.instalacion',
          'consumo.nombre as cliente',
          'consumo.sector as sector',
          'consumo.direccion',
          'consumo.lectura as lectura_actual',
        ])
        .where('consumo.codigo = :id', { id })
        .getRawOne();

      if (!result) {
        throw new Error(`Consumo con ID ${id} no encontrado`);
      }

      return result;
    } catch (error) {
      throw new Error(`Error al obtener información básica: ${error.message}`);
    }
  }

  async findAll(page: number, limit: number, filters: Record<string, any>) {
    try {
      const query = this.consumoRepository.createQueryBuilder('consumo');

      if (filters.nombre) {
        query.andWhere('consumo.nombre ILIKE :nombre', {
          nombre: `%${filters.nombre}%`,
        });
      }
      if (filters.year) {
        query.andWhere('consumo.year = :year', { year: filters.year });
      }
      if (filters.mes_codigo) {
        query.andWhere('consumo.mes = :mes', { mes: filters.mes_codigo });
      }
      if (filters.instalacion) {
        query.andWhere('consumo.instalacion = :instalacion', {
          instalacion: filters.instalacion,
        });
      }

      const [data, total] = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new Error(`Error al obtener consumos: ${error.message}`);
    }
  }

  async getLastReadings(year: number, month: number) {
    try {
      const result = await this.consumoRepository
        .createQueryBuilder('consumo')
        .where('consumo.year = :year', { year })
        .andWhere('consumo.mes = :month', { month })
        .orderBy('consumo.fecha', 'DESC')
        .addOrderBy('consumo.codigo', 'DESC')
        .getMany();

      const latestReadings = new Map();
      result.forEach((reading) => {
        if (!latestReadings.has(reading.instalacion)) {
          latestReadings.set(reading.instalacion, reading);
        }
      });

      return Array.from(latestReadings.values()).sort(
        (a, b) => a.instalacion - b.instalacion,
      );
    } catch (error) {
      throw new Error(`Error al obtener últimas lecturas: ${error.message}`);
    }
  }

  async create(createConsumoDto: any) {
    console.log('createConsumoDto:::', createConsumoDto);
    try {
      const consumptionData = {
        instalacion: createConsumoDto.instalacion,
        lectura: createConsumoDto.lectura,
        fecha: createConsumoDto.fecha,
        consumo: createConsumoDto.consumo,
        mes: createConsumoDto.mes,
        year: createConsumoDto.year,
        medidor: createConsumoDto.medidor,
        otrosCobros: createConsumoDto.otrosCobros,
        reconexion: createConsumoDto.reconexion,
        usuario: createConsumoDto.usuario,
      };

      const consumption = this.consumoRepository.create(consumptionData);
      return await this.consumoRepository.save(consumption);
    } catch (error) {
      throw new Error(`Error al crear consumo: ${error.message}`);
    }
  }

  async update(id: number, updateConsumoDto: CreateConsumoDto) {
    try {
      const consumption = await this.consumoRepository.findOne({
        where: { codigo: id },
      });

      if (!consumption) {
        throw new Error(`Consumo con ID ${id} no encontrado`);
      }

      const consumptionData = {
        instalacion: updateConsumoDto.instalacion,
        lectura: updateConsumoDto.lectura,
        fecha: updateConsumoDto.fecha,
        consumo: updateConsumoDto.consumo,
        mes: updateConsumoDto.mes,
        year: updateConsumoDto.year,
        medidor: updateConsumoDto.medidor,
        otrosCobros: updateConsumoDto.otrosCobros,
        reconexion: updateConsumoDto.reconexion,
        usuario: updateConsumoDto.usuario,
      };

      Object.assign(consumption, consumptionData);
      return await this.consumoRepository.save(consumption);
    } catch (error) {
      throw new Error(`Error al actualizar consumo: ${error.message}`);
    }
  }

  getConsumptionEvents(): Observable<any> {
    return fromEvent(this.eventEmitter, 'consumption_update');
  }
}