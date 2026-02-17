import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateSettingDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  key!: string;

  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
