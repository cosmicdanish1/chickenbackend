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
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get()
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('customer') customer?: string,
    @Query('productType') productType?: string,
    @Query('paymentStatus') paymentStatus?: string,
  ) {
    return this.salesService.findAll(startDate, endDate, customer, productType, paymentStatus);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(id, updateSaleDto);
  }

  @Patch(':id/payment')
  updatePaymentStatus(
    @Param('id') id: string,
    @Body('paymentStatus') paymentStatus: 'paid' | 'pending' | 'partial',
    @Body('amountReceived') amountReceived?: number,
  ) {
    return this.salesService.updatePaymentStatus(id, paymentStatus, amountReceived);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesService.remove(id);
  }
}