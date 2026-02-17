import { IsString, IsNumber, IsOptional, Min, MaxLength } from 'class-validator';

export class CreateInventoryItemDto {
  @IsString()
  @MaxLength(50)
  itemType: string;

  @IsString()
  @MaxLength(255)
  itemName: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  @MaxLength(20)
  unit: string;

  @IsNumber()
  @Min(0)
  minimumStockLevel: number;

  @IsNumber()
  @Min(0)
  currentStockLevel: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
