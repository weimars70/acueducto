import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tipos_estrato')
export class TiposEstrato {
  @PrimaryGeneratedColumn()
  codigo: number;

  @Column()
  nombre: string;
}