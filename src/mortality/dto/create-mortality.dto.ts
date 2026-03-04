import { IsString, IsOptional, IsDateString, IsNumber, MaxLength } from 'class-validator';

export class CreateMortalityDto {
  @IsString()
  @MaxLength(50)
  recordNumber!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  purchaseInvoiceNo?: string;

  @IsOptional()
  @IsString()
  purchaseOrderId?: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsDateString()
  mortalityDate!: string;

  @IsNumber()
  numberOfBirdsDied!: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
