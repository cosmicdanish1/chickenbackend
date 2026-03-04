import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MortalityRecord } from './mortality.entity';
import { CreateMortalityDto } from './dto/create-mortality.dto';
import { UpdateMortalityDto } from './dto/update-mortality.dto';

@Injectable()
export class MortalityService {
  constructor(
    @InjectRepository(MortalityRecord)
    private readonly mortalityRepository: Repository<MortalityRecord>,
  ) {}

  async create(createMortalityDto: CreateMortalityDto): Promise<MortalityRecord> {
    // Check if record number already exists
    const existingRecord = await this.mortalityRepository.findOne({
      where: { recordNumber: createMortalityDto.recordNumber },
    });
    if (existingRecord) {
      throw new BadRequestException(`Mortality record with number ${createMortalityDto.recordNumber} already exists`);
    }

    const mortality = this.mortalityRepository.create(createMortalityDto);
    return this.mortalityRepository.save(mortality);
  }

  async findAll(
    startDate?: string,
    endDate?: string,
    vehicleId?: string,
    purchaseOrderId?: string,
  ): Promise<MortalityRecord[]> {
    const query = this.mortalityRepository.createQueryBuilder('mortality')
      .leftJoinAndSelect('mortality.purchaseOrder', 'purchaseOrder')
      .leftJoinAndSelect('mortality.vehicle', 'vehicle')
      .orderBy('mortality.mortalityDate', 'DESC');

    if (startDate && endDate) {
      query.andWhere('mortality.mortalityDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (vehicleId) {
      query.andWhere('mortality.vehicleId = :vehicleId', { vehicleId });
    }

    if (purchaseOrderId) {
      query.andWhere('mortality.purchaseOrderId = :purchaseOrderId', { purchaseOrderId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<MortalityRecord> {
    const mortality = await this.mortalityRepository.findOne({
      where: { id },
      relations: ['purchaseOrder', 'vehicle'],
    });
    if (!mortality) {
      throw new NotFoundException(`Mortality record with ID ${id} not found`);
    }
    return mortality;
  }

  async update(id: string, updateMortalityDto: UpdateMortalityDto): Promise<MortalityRecord> {
    const mortality = await this.findOne(id);

    // If record number is being updated, check for duplicates
    if (updateMortalityDto.recordNumber && updateMortalityDto.recordNumber !== mortality.recordNumber) {
      const existingRecord = await this.mortalityRepository.findOne({
        where: { recordNumber: updateMortalityDto.recordNumber },
      });
      if (existingRecord) {
        throw new BadRequestException(`Mortality record with number ${updateMortalityDto.recordNumber} already exists`);
      }
    }

    Object.assign(mortality, updateMortalityDto);
    mortality.updatedAt = new Date();
    return this.mortalityRepository.save(mortality);
  }

  async remove(id: string): Promise<void> {
    const mortality = await this.findOne(id);
    await this.mortalityRepository.remove(mortality);
  }

  async getStats(startDate?: string, endDate?: string): Promise<{
    totalRecords: number;
    totalBirdsDied: number;
    averagePerRecord: number;
  }> {
    const query = this.mortalityRepository.createQueryBuilder('mortality');

    if (startDate && endDate) {
      query.where('mortality.mortalityDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const records = await query.getMany();
    const totalBirdsDied = records.reduce((sum, record) => sum + record.numberOfBirdsDied, 0);

    return {
      totalRecords: records.length,
      totalBirdsDied,
      averagePerRecord: records.length > 0 ? totalBirdsDied / records.length : 0,
    };
  }
}
