import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Farmer } from './farmer.entity';
import { CreateFarmerDto } from './dto/create-farmer.dto';
import { UpdateFarmerDto } from './dto/update-farmer.dto';

@Injectable()
export class FarmersService {
  constructor(
    @InjectRepository(Farmer)
    private readonly farmerRepository: Repository<Farmer>,
  ) {}

  async create(createFarmerDto: CreateFarmerDto): Promise<Farmer> {
    const farmer = this.farmerRepository.create(createFarmerDto);
    return this.farmerRepository.save(farmer);
  }

  async findAll(): Promise<Farmer[]> {
    return this.farmerRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Farmer> {
    const farmer = await this.farmerRepository.findOne({ where: { id } });
    if (!farmer) {
      throw new NotFoundException(`Farmer with ID ${id} not found`);
    }
    return farmer;
  }

  async update(id: string, updateFarmerDto: UpdateFarmerDto): Promise<Farmer> {
    const farmer = await this.findOne(id);
    Object.assign(farmer, updateFarmerDto);
    farmer.updatedAt = new Date();
    return this.farmerRepository.save(farmer);
  }

  async remove(id: string): Promise<void> {
    const farmer = await this.findOne(id);
    await this.farmerRepository.remove(farmer);
  }
}