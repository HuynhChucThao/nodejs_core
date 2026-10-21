import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OccupationsService } from './occupations.service';
import { CreateOccupationDto, UpdateOccupationDto } from './dto/occupations.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '@myriasec/core-api';
import { Role } from '@prisma/client';

@Controller('occupations')
export class OccupationsController {
  constructor(private readonly occupationsService: OccupationsService) { }

  @Get()
  findAll(
    @Query('keyword') keyword?: string,
    @Query('riasecCode') riasecCode?: string,
    @Query('mainCode') mainCode?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.occupationsService.findAll({
      keyword,
      riasecCode,
      mainCode,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId?: string,
  ) {
    return this.occupationsService.findOne(id, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateOccupationDto) {
    return this.occupationsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateOccupationDto) {
    return this.occupationsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.occupationsService.remove(id);
  }
}
