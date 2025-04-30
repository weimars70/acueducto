import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('sectores')
export class Sector {
  @PrimaryColumn()
  codigo: string;

  @Column()
  nombre: string;

  @Column()
  abreviado: string;
}