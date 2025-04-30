import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetInstalacionDto {
  @ApiProperty()
  @IsNumber()
  codigo: string;
}
