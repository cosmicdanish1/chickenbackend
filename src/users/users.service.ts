import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepository.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash,
      role: dto.role ?? 'manager',
      status: dto.status ?? 'active',
    });

    return this.usersRepository.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.email !== undefined) user.email = dto.email.toLowerCase();
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.status !== undefined) user.status = dto.status;

    return this.usersRepository.save(user);
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.status = 'inactive';
    return this.usersRepository.save(user);
  }

  async activate(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.status = 'active';
    return this.usersRepository.save(user);
  }

  async getUserStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    adminUsers: number;
    managerUsers: number;
    staffUsers: number;
  }> {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      managerUsers,
      staffUsers,
    ] = await Promise.all([
      this.usersRepository.count(),
      this.usersRepository.count({ where: { status: 'active' } }),
      this.usersRepository.count({ where: { status: 'inactive' } }),
      this.usersRepository.count({ where: { role: 'admin' } }),
      this.usersRepository.count({ where: { role: 'manager' } }),
      this.usersRepository.count({ where: { role: 'staff' } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      managerUsers,
      staffUsers,
    };
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { lastLogin: new Date() });
  }
}

