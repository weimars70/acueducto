import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenericCaptureDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  codigo: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  abreviado?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  tabla: string;
}