import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ProductType, ProductStatus } from '../product.entity';

export class CreateProductDto {
  @IsString()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @IsOptional()
  @IsEnum(['eggs', 'meat', 'chicks', 'feed', 'medicine', 'equipment', 'other'])
  productType?: ProductType;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @IsOptional()
  @IsString()
  price?: string; // Using string to handle decimal input

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: ProductStatus;
}
