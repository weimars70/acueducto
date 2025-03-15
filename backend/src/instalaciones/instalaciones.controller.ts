import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { InstalacionesService } from './instalaciones.service';
import { GetInstalacionDto } from './dto/get-instalacion.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('instalaciones')
@Controller('instalaciones')
export class InstalacionesController {
  constructor(private readonly instalacionesService: InstalacionesService) {}

  @Get()
  @ApiOperation({ summary: 'Get installation by code' })
  @ApiResponse({ status: 200, description: 'Installation found successfully' })
  @ApiResponse({ status: 404, description: 'Installation not found' })
  async getInstalacion(@Query() query: any) {
    try {
      return await this.instalacionesService.findOne(query.codigo);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error consultando installation: ${error.message}`);
    }
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all installations' })
  @ApiResponse({
    status: 200,
    description: 'Installations retrieved successfully',
  })
  async getAllInstalaciones() {
    try {
      return await this.instalacionesService.findAll();
    } catch (error) {
      throw new Error(`Error retrieving installations: ${error.message}`);
    }
  }
}
