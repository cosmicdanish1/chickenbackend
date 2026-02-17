import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length, MinLength } from 'class-validator';
import { UserRole, UserStatus } from '../user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsEnum(['admin', 'manager', 'staff'] as const)
  role?: UserRole;

  @IsOptional()
  @IsEnum(['active', 'inactive'] as const)
  status?: UserStatus;
}

