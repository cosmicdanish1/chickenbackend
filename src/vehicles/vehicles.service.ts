import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehiclesRepository: Repository<Vehicle>,
  ) {}

  async findAll(): Promise<Vehicle[]> {
    return this.vehiclesRepository.find({ order: { driverName: 'ASC' } });
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findOne({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id ${id} not found`);
    }
    return vehicle;
  }

  async create(data: CreateVehicleDto): Promise<Vehicle> {
    const entity = this.vehiclesRepository.create({
      vehicleNumber: data.vehicleNumber,
      vehicleType: data.vehicleType,
      driverName: data.driverName,
      phone: data.phone,
      ownerName: data.ownerName,
      address: data.address,
      totalCapacity: data.totalCapacity ? Number(data.totalCapacity) : null,
      petrolTankCapacity: data.petrolTankCapacity ?? null,
      mileage: data.mileage ?? null,
      joinDate: data.joinDate,
      status: data.status ?? 'active',
      note: data.note,
    });
    return this.vehiclesRepository.save(entity);
  }

  async update(id: string, data: UpdateVehicleDto): Promise<Vehicle> {
    const existing = await this.findOne(id);

    if (data.totalCapacity !== undefined) {
      (existing as any).totalCapacity = data.totalCapacity ? Number(data.totalCapacity) : null;
    }

    Object.assign(existing, {
      ...data,
      totalCapacity: data.totalCapacity !== undefined ? Number(data.totalCapacity) : existing.totalCapacity,
    });

    return this.vehiclesRepository.save(existing);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.findOne(id);
    await this.vehiclesRepository.remove(existing);
  }
}

