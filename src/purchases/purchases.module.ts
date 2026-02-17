import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseOrder, PurchaseOrderItem])],
  controllers: [PurchasesController],
  providers: [PurchasesService],
  exports: [PurchasesService],
})
export class PurchasesModule {}