import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GodownController } from './godown.controller';
import { GodownService } from './godown.service';
import { GodownInwardEntry } from './godown-inward.entity';
import { GodownSale } from './godown-sale.entity';
import { GodownMortality } from './godown-mortality.entity';
import { GodownExpense } from './godown-expense.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GodownInwardEntry,
      GodownSale,
      GodownMortality,
      GodownExpense,
    ]),
  ],
  controllers: [GodownController],
  providers: [GodownService],
  exports: [GodownService],
})
export class GodownModule {}
