import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('estratos')
export class Estrato {
  @PrimaryColumn()
  codigo: string;

  @Column()
  nombre: string;

  @Column()
  abreviado: string;
}