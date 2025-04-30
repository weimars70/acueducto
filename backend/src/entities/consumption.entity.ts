import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('consumo')
export class Consumption {
  @PrimaryGeneratedColumn()
  codigo: number;

  @Column()
  instalacion: number;

  @Column()
  lectura: number;

  @Column()
  fecha: Date;

  @Column()
  consumo: number;

  @Column()
  mes: number;

  @Column()
  year: number;

  @Column()
  medidor: string;

  @Column({ name: 'otros_cobros', default: 0 })
  otrosCobros: number;

  @Column({ default: 0 })
  reconexion: number;

  @Column()
  usuario: string;
}