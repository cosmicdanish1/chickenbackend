import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GodownService } from './godown.service';

@Controller('godown')
export class GodownController {
  constructor(private readonly godownService: GodownService) {}

  // Inward Entries
  @Post('inward')
  createInward(@Body() data: any) {
    // Transform frontend field names to match database schema
    const transformed = {
      entryDate: data.entryDate,
      supplierName: data.farmerName,
      vehicleId: data.vehicleNumber,
      numberOfBirds: data.quantity,
      ratePerKg: data.rate,
      totalAmount: data.totalAmount,
      notes: data.notes,
    };
    return this.godownService.createInward(transformed);
  }

  @Get('inward')
  async findAllInward() {
    const entries = await this.godownService.findAllInward();
    // Transform database field names to match frontend expectations
    return entries.map(entry => ({
      id: entry.id,
      entryDate: entry.entryDate,
      farmerName: entry.supplierName,
      vehicleNumber: entry.vehicleId,
      quantity: entry.numberOfBirds,
      unit: 'birds',
      rate: entry.ratePerKg,
      totalAmount: entry.totalAmount,
      notes: entry.notes,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    }));
  }

  @Get('inward/:id')
  async findOneInward(@Param('id') id: string) {
    const entry = await this.godownService.findOneInward(id);
    if (!entry) return null;
    // Transform database field names to match frontend expectations
    return {
      id: entry.id,
      entryDate: entry.entryDate,
      farmerName: entry.supplierName,
      vehicleNumber: entry.vehicleId,
      quantity: entry.numberOfBirds,
      unit: 'birds',
      rate: entry.ratePerKg,
      totalAmount: entry.totalAmount,
      notes: entry.notes,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }

  @Patch('inward/:id')
  updateInward(@Param('id') id: string, @Body() data: any) {
    // Transform frontend field names to match database schema
    const transformed = {
      entryDate: data.entryDate,
      supplierName: data.farmerName,
      vehicleId: data.vehicleNumber,
      numberOfBirds: data.quantity,
      ratePerKg: data.rate,
      totalAmount: data.totalAmount,
      notes: data.notes,
    };
    return this.godownService.updateInward(id, transformed);
  }

  @Delete('inward/:id')
  removeInward(@Param('id') id: string) {
    return this.godownService.removeInward(id);
  }

  // Sales
  @Post('sales')
  createSale(@Body() data: any) {
    return this.godownService.createSale(data);
  }

  @Get('sales')
  findAllSales() {
    return this.godownService.findAllSales();
  }

  @Get('sales/:id')
  findOneSale(@Param('id') id: string) {
    return this.godownService.findOneSale(id);
  }

  @Patch('sales/:id')
  updateSale(@Param('id') id: string, @Body() data: any) {
    return this.godownService.updateSale(id, data);
  }

  @Delete('sales/:id')
  removeSale(@Param('id') id: string) {
    return this.godownService.removeSale(id);
  }

  // Mortality
  @Post('mortality')
  createMortality(@Body() data: any) {
    return this.godownService.createMortality(data);
  }

  @Get('mortality')
  findAllMortality() {
    return this.godownService.findAllMortality();
  }

  @Get('mortality/:id')
  findOneMortality(@Param('id') id: string) {
    return this.godownService.findOneMortality(id);
  }

  @Patch('mortality/:id')
  updateMortality(@Param('id') id: string, @Body() data: any) {
    return this.godownService.updateMortality(id, data);
  }

  @Delete('mortality/:id')
  removeMortality(@Param('id') id: string) {
    return this.godownService.removeMortality(id);
  }

  // Expenses
  @Post('expenses')
  createExpense(@Body() data: any) {
    return this.godownService.createExpense(data);
  }

  @Get('expenses')
  findAllExpenses() {
    return this.godownService.findAllExpenses();
  }

  @Get('expenses/:id')
  findOneExpense(@Param('id') id: string) {
    return this.godownService.findOneExpense(id);
  }

  @Patch('expenses/:id')
  updateExpense(@Param('id') id: string, @Body() data: any) {
    return this.godownService.updateExpense(id, data);
  }

  @Delete('expenses/:id')
  removeExpense(@Param('id') id: string) {
    return this.godownService.removeExpense(id);
  }

  // Summary
  @Get('summary')
  getSummary() {
    return this.godownService.getSummary();
  }
}
