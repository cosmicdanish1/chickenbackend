import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  create(@Body() createPurchaseOrderDto: CreatePurchaseOrderDto) {
    return this.purchasesService.create(createPurchaseOrderDto);
  }

  @Get()
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('supplier') supplier?: string,
    @Query('status') status?: string,
  ) {
    return this.purchasesService.findAll(startDate, endDate, supplier, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchasesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto) {
    return this.purchasesService.update(id, updatePurchaseOrderDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'pending' | 'received' | 'cancelled',
  ) {
    return this.purchasesService.updateStatus(id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchasesService.remove(id);
  }
}