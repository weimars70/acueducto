import { PartialType } from '@nestjs/swagger';
import { CreateConsumoDto } from './create-consumo.dto';

export class UpdateConsumoDto extends PartialType(CreateConsumoDto) {}