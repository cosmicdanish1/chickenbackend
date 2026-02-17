import { IsString, IsOptional, IsDateString, IsArray, ValidateNested, MaxLength, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PurchaseStatus } from '../entities/purchase-order.entity';

export class CreatePurchaseOrderItemDto {
  @IsString()
  description!: string;

  @IsString()
  quantity!: string; // Using string to handle decimal input

  @IsString()
  @MaxLength(20)
  unit!: string;

  @IsString()
  unitCost!: string; // Using string to handle decimal input
}

export class CreatePurchaseOrderDto {
  @IsString()
  @MaxLength(50)
  orderNumber!: string;

  @IsString()
  @MaxLength(150)
  supplierName!: string;

  @IsDateString()
  orderDate!: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(['pending', 'received', 'cancelled'])
  status?: PurchaseStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items!: CreatePurchaseOrderItemDto[];
}