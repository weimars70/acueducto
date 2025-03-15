import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Param,
  Put,
  Sse,
  Header,
} from '@nestjs/common';
import { ConsumoService } from './consumo.service';
import { CreateConsumoDto } from './dto/create-consumo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Controller('consumo')
export class ConsumoController {
  constructor(private readonly consumoService: ConsumoService) {}

  @Get('previous-reading/:instalacion/:codigo')
  async getPreviousReading(
    @Param('instalacion') instalacion: string,
    @Param('codigo') codigo: string,
  ) {
    return this.consumoService.getPreviousReading(
      parseInt(instalacion, 10),
      parseInt(codigo, 10),
    );
  }

  @Get('basic/:id')
  async getBasicInfo(@Param('id') id: string) {
    return this.consumoService.getBasicInfo(parseInt(id, 10));
  }

  @Get('view')
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query() filters: Record<string, any>,
  ) {
    delete filters.page;
    delete filters.limit;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    return this.consumoService.findAll(pageNumber, pageSize, filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.consumoService.findOne(parseInt(id, 10));
  }

  @Get('last-readings')
  async getLastReadings(
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const yearNum = year ? parseInt(year, 10) : new Date().getFullYear();
    const monthNum = month ? parseInt(month, 10) : new Date().getMonth() + 1;
    return this.consumoService.getLastReadings(yearNum, monthNum);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createConsumoDto: any) {
    console.log('createConsumoDtocontr:::', createConsumoDto);
    return this.consumoService.create(createConsumoDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateConsumoDto: CreateConsumoDto,
  ) {
    return this.consumoService.update(parseInt(id, 10), updateConsumoDto);
  }

  @Sse('events')
  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  events(): Observable<MessageEvent> {
    return this.consumoService.getConsumptionEvents().pipe(
      map(event => {
        const messageEvent = new MessageEvent('consumo_update', {
          data: JSON.stringify(event),
          lastEventId: String(Date.now())
        });
        return messageEvent;
      })
    );
  }
}