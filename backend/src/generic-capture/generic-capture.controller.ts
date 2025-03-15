import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { GenericCaptureService } from './generic-capture.service';
import { GenericCaptureDto } from './dto/generic-capture.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('generic-capture')
@Controller('generic-capture')
@UseGuards(JwtAuthGuard)
export class GenericCaptureController {
  constructor(private readonly genericCaptureService: GenericCaptureService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new record' })
  @ApiResponse({ status: 201, description: 'Record created successfully' })
  async create(@Body() data: GenericCaptureDto) {
    return await this.genericCaptureService.create(data);
  }

  @Put()
  @ApiOperation({ summary: 'Update an existing record' })
  @ApiResponse({ status: 200, description: 'Record updated successfully' })
  async update(@Body() data: GenericCaptureDto) {
    return await this.genericCaptureService.update(data);
  }

  @Delete(':tabla/:codigo')
  @ApiOperation({ summary: 'Delete a record' })
  @ApiResponse({ status: 200, description: 'Record deleted successfully' })
  async delete(@Param('tabla') tabla: string, @Param('codigo') codigo: string) {
    return await this.genericCaptureService.delete(tabla, codigo);
  }

  @Get(':tabla')
  @ApiOperation({ summary: 'Get all records from a table' })
  @ApiResponse({ status: 200, description: 'Records retrieved successfully' })
  async findAll(@Param('tabla') tabla: string) {
    return await this.genericCaptureService.findAll(tabla);
  }

  @Get(':tabla/:codigo')
  @ApiOperation({ summary: 'Get a specific record' })
  @ApiResponse({ status: 200, description: 'Record retrieved successfully' })
  async findOne(@Param('tabla') tabla: string, @Param('codigo') codigo: string) {
    return await this.genericCaptureService.findOne(tabla, codigo);
  }
}