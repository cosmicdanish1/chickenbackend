import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Post()
  async create(@Body() body: CreateUserDto): Promise<User> {
    return this.usersService.create(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateUserDto): Promise<User> {
    return this.usersService.update(id, body);
  }

  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string): Promise<User> {
    return this.usersService.deactivate(id);
  }

  @Patch(':id/activate')
  async activate(@Param('id') id: string): Promise<User> {
    return this.usersService.activate(id);
  }

  @Get('statistics/summary')
  async getStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    adminUsers: number;
    managerUsers: number;
    staffUsers: number;
  }> {
    return this.usersService.getUserStatistics();
  }
}

