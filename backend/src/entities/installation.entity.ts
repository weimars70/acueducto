import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('instalaciones')
export class Installation {
  @PrimaryGeneratedColumn()
  codigo: number;

  @Column({ name: 'codigo_medidor' })
  codigoMedidor: string;

  @Column()
  nombre: string;

  @Column()
  sector: string;

  @Column()
  direccion: string;
}