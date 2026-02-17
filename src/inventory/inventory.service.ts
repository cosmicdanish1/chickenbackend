import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, Between } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
  ) {}

  async create(createInventoryItemDto: CreateInventoryItemDto): Promise<InventoryItem> {
    const item = this.inventoryRepository.create({
      ...createInventoryItemDto,
      lastUpdated: new Date(),
    });
    return await this.inventoryRepository.save(item);
  }

  async findAll(startDate?: string, endDate?: string): Promise<InventoryItem[]> {
    const query = this.inventoryRepository.createQueryBuilder('item');

    if (startDate && endDate) {
      query.where('item.lastUpdated BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return await query.orderBy('item.itemName', 'ASC').getMany();
  }

  async findOne(id: string): Promise<InventoryItem> {
    const item = await this.inventoryRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }
    return item;
  }

  async update(id: string, updateInventoryItemDto: UpdateInventoryItemDto): Promise<InventoryItem> {
    const item = await this.findOne(id);
    
    Object.assign(item, {
      ...updateInventoryItemDto,
      lastUpdated: new Date(),
    });

    return await this.inventoryRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.inventoryRepository.remove(item);
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return await this.inventoryRepository
      .createQueryBuilder('item')
      .where('item.currentStockLevel <= item.minimumStockLevel')
      .orderBy('item.itemName', 'ASC')
      .getMany();
  }

  async getTotalInventoryValue(): Promise<number> {
    const result = await this.inventoryRepository
      .createQueryBuilder('item')
      .select('SUM(item.currentStockLevel)', 'total')
      .getRawOne();
    
    return parseFloat(result?.total || '0');
  }

  async getInventoryByType(): Promise<Array<{ itemType: string; count: number; totalQuantity: number }>> {
    const result = await this.inventoryRepository
      .createQueryBuilder('item')
      .select('item.itemType', 'itemType')
      .addSelect('COUNT(item.id)', 'count')
      .addSelect('SUM(item.currentStockLevel)', 'totalQuantity')
      .groupBy('item.itemType')
      .getRawMany();

    return result.map(r => ({
      itemType: r.itemType,
      count: parseInt(r.count),
      totalQuantity: parseFloat(r.totalQuantity || '0'),
    }));
  }
}
