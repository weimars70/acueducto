import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tarifas')
export class Tarifa {
  @PrimaryColumn()
  codigo: string;

  @Column()
  nombre: string;

  @Column()
  abreviado: string;
}