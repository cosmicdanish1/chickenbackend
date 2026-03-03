import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FarmersService } from './farmers.service';
import { CreateFarmerDto } from './dto/create-farmer.dto';
import { UpdateFarmerDto } from './dto/update-farmer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('farmers')
@UseGuards(JwtAuthGuard)
export class FarmersController {
  constructor(private readonly farmersService: FarmersService) {}

  @Post()
  create(@Body() createFarmerDto: CreateFarmerDto) {
    return this.farmersService.create(createFarmerDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.farmersService.findAll(pageNum, limitNum, search, status);
  }

  @Get('active/list')
  findActive() {
    return this.farmersService.findActive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.farmersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFarmerDto: UpdateFarmerDto) {
    return this.farmersService.update(id, updateFarmerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.farmersService.remove(id);
  }
}