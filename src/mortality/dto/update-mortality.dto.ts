import { PartialType } from '@nestjs/mapped-types';
import { CreateMortalityDto } from './create-mortality.dto';

export class UpdateMortalityDto extends PartialType(CreateMortalityDto) {}
