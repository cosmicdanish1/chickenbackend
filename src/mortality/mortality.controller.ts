import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { MortalityService } from './mortality.service';
import { CreateMortalityDto } from './dto/create-mortality.dto';
import { UpdateMortalityDto } from './dto/update-mortality.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('mortality')
@UseGuards(JwtAuthGuard)
export class MortalityController {
  constructor(private readonly mortalityService: MortalityService) {}

  @Post()
  create(@Body() createMortalityDto: CreateMortalityDto) {
    return this.mortalityService.create(createMortalityDto);
  }

  @Get()
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('vehicleId') vehicleId?: string,
    @Query('purchaseOrderId') purchaseOrderId?: string,
  ) {
    return this.mortalityService.findAll(startDate, endDate, vehicleId, purchaseOrderId);
  }

  @Get('stats')
  getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.mortalityService.getStats(startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mortalityService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMortalityDto: UpdateMortalityDto) {
    return this.mortalityService.update(id, updateMortalityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mortalityService.remove(id);
  }
}
