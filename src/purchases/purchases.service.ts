import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private readonly purchaseOrderItemRepository: Repository<PurchaseOrderItem>,
  ) {}

  async create(createPurchaseOrderDto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    // Check if order number already exists
    const existingOrder = await this.purchaseOrderRepository.findOne({
      where: { orderNumber: createPurchaseOrderDto.orderNumber },
    });
    if (existingOrder) {
      throw new BadRequestException(`Purchase order with number ${createPurchaseOrderDto.orderNumber} already exists`);
    }

    // Calculate total amount from items
    const totalAmount = createPurchaseOrderDto.items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) * parseFloat(item.unitCost));
    }, 0);

    // Calculate charges
    const transportCharges = parseFloat(createPurchaseOrderDto.transportCharges || '0');
    const loadingCharges = parseFloat(createPurchaseOrderDto.loadingCharges || '0');
    const commission = parseFloat(createPurchaseOrderDto.commission || '0');
    const otherCharges = parseFloat(createPurchaseOrderDto.otherCharges || '0');

    // Calculate deductions
    const weightShortage = parseFloat(createPurchaseOrderDto.weightShortage || '0');
    const mortalityDeduction = parseFloat(createPurchaseOrderDto.mortalityDeduction || '0');
    const otherDeduction = parseFloat(createPurchaseOrderDto.otherDeduction || '0');

    // Calculate gross and net amounts
    const grossAmount = totalAmount + transportCharges + loadingCharges + commission + otherCharges;
    const netAmount = grossAmount - weightShortage - mortalityDeduction - otherDeduction;

    const purchaseOrder = this.purchaseOrderRepository.create({
      orderNumber: createPurchaseOrderDto.orderNumber,
      supplierName: createPurchaseOrderDto.supplierName,
      orderDate: createPurchaseOrderDto.orderDate,
      dueDate: createPurchaseOrderDto.dueDate,
      status: createPurchaseOrderDto.status || 'pending',
      notes: createPurchaseOrderDto.notes,
      totalAmount,
      transportCharges,
      loadingCharges,
      commission,
      otherCharges,
      weightShortage,
      mortalityDeduction,
      otherDeduction,
      grossAmount,
      netAmount,
    });

    const savedOrder = await this.purchaseOrderRepository.save(purchaseOrder);

    // Create items
    const items = createPurchaseOrderDto.items.map(item => 
      this.purchaseOrderItemRepository.create({
        description: item.description,
        quantity: parseFloat(item.quantity),
        unit: item.unit,
        unitCost: parseFloat(item.unitCost),
        lineTotal: parseFloat(item.quantity) * parseFloat(item.unitCost),
        purchaseOrderId: savedOrder.id,
      })
    );

    await this.purchaseOrderItemRepository.save(items);

    return this.findOne(savedOrder.id);
  }

  async findAll(
    startDate?: string,
    endDate?: string,
    supplier?: string,
    status?: string,
  ): Promise<PurchaseOrder[]> {
    const query = this.purchaseOrderRepository.createQueryBuilder('po')
      .leftJoinAndSelect('po.items', 'items')
      .orderBy('po.orderDate', 'DESC');

    if (startDate && endDate) {
      query.andWhere('po.orderDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (supplier) {
      query.andWhere('po.supplierName ILIKE :supplier', {
        supplier: `%${supplier}%`,
      });
    }

    if (status) {
      query.andWhere('po.status = :status', { status });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!purchaseOrder) {
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    }
    return purchaseOrder;
  }

  async update(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);

    // If order number is being updated, check for duplicates
    if (updatePurchaseOrderDto.orderNumber && updatePurchaseOrderDto.orderNumber !== purchaseOrder.orderNumber) {
      const existingOrder = await this.purchaseOrderRepository.findOne({
        where: { orderNumber: updatePurchaseOrderDto.orderNumber },
      });
      if (existingOrder) {
        throw new BadRequestException(`Purchase order with number ${updatePurchaseOrderDto.orderNumber} already exists`);
      }
    }

    // If items are being updated, recalculate total
    let totalAmount = purchaseOrder.totalAmount;
    if (updatePurchaseOrderDto.items) {
      totalAmount = updatePurchaseOrderDto.items.reduce((sum, item) => {
        return sum + (parseFloat(item.quantity) * parseFloat(item.unitCost));
      }, 0);

      // Delete existing items
      await this.purchaseOrderItemRepository.delete({ purchaseOrderId: id });

      // Create new items
      const items = updatePurchaseOrderDto.items.map(item => 
        this.purchaseOrderItemRepository.create({
          description: item.description,
          quantity: parseFloat(item.quantity),
          unit: item.unit,
          unitCost: parseFloat(item.unitCost),
          lineTotal: parseFloat(item.quantity) * parseFloat(item.unitCost),
          purchaseOrderId: id,
        })
      );

      await this.purchaseOrderItemRepository.save(items);
    }

    // Calculate charges
    const transportCharges = updatePurchaseOrderDto.transportCharges 
      ? parseFloat(updatePurchaseOrderDto.transportCharges) 
      : purchaseOrder.transportCharges;
    const loadingCharges = updatePurchaseOrderDto.loadingCharges 
      ? parseFloat(updatePurchaseOrderDto.loadingCharges) 
      : purchaseOrder.loadingCharges;
    const commission = updatePurchaseOrderDto.commission 
      ? parseFloat(updatePurchaseOrderDto.commission) 
      : purchaseOrder.commission;
    const otherCharges = updatePurchaseOrderDto.otherCharges 
      ? parseFloat(updatePurchaseOrderDto.otherCharges) 
      : purchaseOrder.otherCharges;

    // Calculate deductions
    const weightShortage = updatePurchaseOrderDto.weightShortage 
      ? parseFloat(updatePurchaseOrderDto.weightShortage) 
      : purchaseOrder.weightShortage;
    const mortalityDeduction = updatePurchaseOrderDto.mortalityDeduction 
      ? parseFloat(updatePurchaseOrderDto.mortalityDeduction) 
      : purchaseOrder.mortalityDeduction;
    const otherDeduction = updatePurchaseOrderDto.otherDeduction 
      ? parseFloat(updatePurchaseOrderDto.otherDeduction) 
      : purchaseOrder.otherDeduction;

    // Calculate gross and net amounts
    const grossAmount = totalAmount + transportCharges + loadingCharges + commission + otherCharges;
    const netAmount = grossAmount - weightShortage - mortalityDeduction - otherDeduction;

    Object.assign(purchaseOrder, {
      ...updatePurchaseOrderDto,
      totalAmount,
      transportCharges,
      loadingCharges,
      commission,
      otherCharges,
      weightShortage,
      mortalityDeduction,
      otherDeduction,
      grossAmount,
      netAmount,
      updatedAt: new Date(),
    });

    await this.purchaseOrderRepository.save(purchaseOrder);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const purchaseOrder = await this.findOne(id);
    await this.purchaseOrderRepository.remove(purchaseOrder);
  }

  async updateStatus(id: string, status: 'pending' | 'received' | 'cancelled'): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);
    purchaseOrder.status = status;
    purchaseOrder.updatedAt = new Date();
    await this.purchaseOrderRepository.save(purchaseOrder);
    return purchaseOrder;
  }

  async getInvoiceList(): Promise<Array<{ id: string; orderNumber: string; orderDate: string; supplierName: string }>> {
    const orders = await this.purchaseOrderRepository
      .createQueryBuilder('po')
      .select(['po.id', 'po.orderNumber', 'po.orderDate', 'po.supplierName'])
      .orderBy('po.orderDate', 'DESC')
      .getMany();

    return orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      orderDate: order.orderDate,
      supplierName: order.supplierName,
    }));
  }

}