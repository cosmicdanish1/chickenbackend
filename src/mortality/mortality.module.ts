import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MortalityService } from './mortality.service';
import { MortalityController } from './mortality.controller';
import { MortalityRecord } from './mortality.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MortalityRecord])],
  controllers: [MortalityController],
  providers: [MortalityService],
  exports: [MortalityService],
})
export class MortalityModule {}
