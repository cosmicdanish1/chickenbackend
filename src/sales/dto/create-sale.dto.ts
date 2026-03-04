import { IsString, IsOptional, IsDateString, IsEnum, MaxLength, IsNumber } from 'class-validator';
import { SaleProductType, PaymentStatusType, SaleModeType } from '../sale.entity';

export class CreateSaleDto {
  @IsString()
  @MaxLength(50)
  invoiceNumber!: string;

  @IsString()
  @MaxLength(150)
  customerName!: string;

  @IsDateString()
  saleDate!: string;

  @IsEnum(['from_vehicle', 'from_godown'])
  saleMode!: SaleModeType;

  @IsOptional()
  @IsEnum(['eggs', 'meat', 'chicks', 'other'])
  productType?: SaleProductType;

  @IsOptional()
  @IsString()
  quantity?: string; // Using string to handle decimal input

  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @IsOptional()
  @IsString()
  unitPrice?: string; // Using string to handle decimal input

  @IsOptional()
  @IsEnum(['paid', 'pending', 'partial'])
  paymentStatus?: PaymentStatusType;

  @IsOptional()
  @IsString()
  amountReceived?: string; // Using string to handle decimal input

  @IsOptional()
  @IsNumber()
  transportCharges?: number;

  @IsOptional()
  @IsNumber()
  loadingCharges?: number;

  @IsOptional()
  @IsNumber()
  commission?: number;

  @IsOptional()
  @IsNumber()
  otherCharges?: number;

  @IsOptional()
  @IsNumber()
  deductions?: number;

  @IsOptional()
  @IsNumber()
  weightShortage?: number;

  @IsOptional()
  @IsNumber()
  mortalityDeduction?: number;

  @IsOptional()
  @IsNumber()
  otherDeduction?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  retailerId?: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  birdType?: string;

  @IsOptional()
  @IsNumber()
  numberOfCages?: number;

  @IsOptional()
  @IsNumber()
  numberOfBirds?: number;

  @IsOptional()
  @IsNumber()
  ratePerKg?: number;

  @IsOptional()
  @IsNumber()
  averageWeight?: number;

  @IsOptional()
  @IsNumber()
  totalWeight?: number;

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @IsNumber()
  advancePaid?: number;

  @IsOptional()
  @IsNumber()
  creditBalance?: number;

  @IsOptional()
  @IsString()
  paymentMode?: string;

  @IsOptional()
  @IsNumber()
  totalPaymentReceived?: number;

  @IsOptional()
  @IsNumber()
  balanceAmount?: number;
}