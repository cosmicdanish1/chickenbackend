import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './sale.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
  ) {}

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    // Check if invoice number already exists
    const existingSale = await this.saleRepository.findOne({
      where: { invoiceNumber: createSaleDto.invoiceNumber },
    });
    if (existingSale) {
      throw new BadRequestException(`Sale with invoice number ${createSaleDto.invoiceNumber} already exists`);
    }

    const sale = this.saleRepository.create({
      invoiceNumber: createSaleDto.invoiceNumber,
      customerName: createSaleDto.customerName,
      saleDate: createSaleDto.saleDate,
      productType: createSaleDto.productType,
      quantity: parseFloat(createSaleDto.quantity),
      unit: createSaleDto.unit,
      unitPrice: parseFloat(createSaleDto.unitPrice),
      totalAmount: parseFloat(createSaleDto.quantity) * parseFloat(createSaleDto.unitPrice),
      paymentStatus: createSaleDto.paymentStatus || 'pending',
      amountReceived: createSaleDto.amountReceived ? parseFloat(createSaleDto.amountReceived) : 0,
      notes: createSaleDto.notes,
      retailerId: createSaleDto.retailerId,
    });

    return this.saleRepository.save(sale);
  }

  async findAll(
    startDate?: string,
    endDate?: string,
    customer?: string,
    productType?: string,
    paymentStatus?: string,
  ): Promise<Sale[]> {
    const query = this.saleRepository.createQueryBuilder('sale')
      .leftJoinAndSelect('sale.retailer', 'retailer')
      .orderBy('sale.saleDate', 'DESC');

    if (startDate && endDate) {
      query.andWhere('sale.saleDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (customer) {
      query.andWhere('sale.customerName ILIKE :customer', {
        customer: `%${customer}%`,
      });
    }

    if (productType) {
      query.andWhere('sale.productType = :productType', { productType });
    }

    if (paymentStatus) {
      query.andWhere('sale.paymentStatus = :paymentStatus', { paymentStatus });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: ['retailer'],
    });
    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }
    return sale;
  }

  async update(id: string, updateSaleDto: UpdateSaleDto): Promise<Sale> {
    const sale = await this.findOne(id);

    // If invoice number is being updated, check for duplicates
    if (updateSaleDto.invoiceNumber && updateSaleDto.invoiceNumber !== sale.invoiceNumber) {
      const existingSale = await this.saleRepository.findOne({
        where: { invoiceNumber: updateSaleDto.invoiceNumber },
      });
      if (existingSale) {
        throw new BadRequestException(`Sale with invoice number ${updateSaleDto.invoiceNumber} already exists`);
      }
    }

    const updateData: any = {
      invoiceNumber: updateSaleDto.invoiceNumber || sale.invoiceNumber,
      customerName: updateSaleDto.customerName || sale.customerName,
      saleDate: updateSaleDto.saleDate || sale.saleDate,
      productType: updateSaleDto.productType || sale.productType,
      quantity: updateSaleDto.quantity ? parseFloat(updateSaleDto.quantity) : sale.quantity,
      unit: updateSaleDto.unit || sale.unit,
      unitPrice: updateSaleDto.unitPrice ? parseFloat(updateSaleDto.unitPrice) : sale.unitPrice,
      paymentStatus: updateSaleDto.paymentStatus || sale.paymentStatus,
      amountReceived: updateSaleDto.amountReceived ? parseFloat(updateSaleDto.amountReceived) : sale.amountReceived,
      notes: updateSaleDto.notes || sale.notes,
      retailerId: updateSaleDto.retailerId || sale.retailerId,
    };

    // Recalculate total amount
    const quantity = updateData.quantity;
    const unitPrice = updateData.unitPrice;
    updateData.totalAmount = quantity * unitPrice;

    Object.assign(sale, updateData);
    sale.updatedAt = new Date();
    return this.saleRepository.save(sale);
  }

  async remove(id: string): Promise<void> {
    const sale = await this.findOne(id);
    await this.saleRepository.remove(sale);
  }

  async updatePaymentStatus(id: string, paymentStatus: 'paid' | 'pending' | 'partial', amountReceived?: number): Promise<Sale> {
    const sale = await this.findOne(id);
    sale.paymentStatus = paymentStatus;
    if (amountReceived !== undefined) {
      sale.amountReceived = amountReceived;
    }
    sale.updatedAt = new Date();
    return this.saleRepository.save(sale);
  }
}