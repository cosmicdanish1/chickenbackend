import { IsString, IsOptional, IsDateString, IsEnum, MaxLength } from 'class-validator';
import { SaleProductType, PaymentStatusType } from '../sale.entity';

export class CreateSaleDto {
  @IsString()
  @MaxLength(50)
  invoiceNumber!: string;

  @IsString()
  @MaxLength(150)
  customerName!: string;

  @IsDateString()
  saleDate!: string;

  @IsEnum(['eggs', 'meat', 'chicks', 'other'])
  productType!: SaleProductType;

  @IsString()
  quantity!: string; // Using string to handle decimal input

  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @IsString()
  unitPrice!: string; // Using string to handle decimal input

  @IsOptional()
  @IsEnum(['paid', 'pending', 'partial'])
  paymentStatus?: PaymentStatusType;

  @IsOptional()
  @IsString()
  amountReceived?: string; // Using string to handle decimal input

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  retailerId?: string;
}