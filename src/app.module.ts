import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesModule } from './vehicles/vehicles.module';
import { Vehicle } from './vehicles/vehicle.entity';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { AuthModule } from './auth/auth.module';
import { FarmersModule } from './farmers/farmers.module';
import { Farmer } from './farmers/farmer.entity';
import { RetailersModule } from './retailers/retailers.module';
import { Retailer } from './retailers/retailer.entity';
import { PurchasesModule } from './purchases/purchases.module';
import { PurchaseOrder } from './purchases/entities/purchase-order.entity';
import { PurchaseOrderItem } from './purchases/entities/purchase-order-item.entity';
import { SalesModule } from './sales/sales.module';
import { Sale } from './sales/sale.entity';
import { ExpensesModule } from './expenses/expenses.module';
import { Expense } from './expenses/expense.entity';
import { DashboardModule } from './dashboard/dashboard.module';
import { InventoryModule } from './inventory/inventory.module';
import { InventoryItem } from './inventory/entities/inventory-item.entity';
import { SettingsModule } from './settings/settings.module';
import { Settings } from './settings/settings.entity';
import { AuditModule } from './audit/audit.module';
import { AuditLog } from './audit/audit-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: config.get<'postgres'>('DB_TYPE', 'postgres'),
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'poultry'),
        entities: [User, Vehicle, Farmer, Retailer, PurchaseOrder, PurchaseOrderItem, Sale, Expense, InventoryItem, Settings, AuditLog],
        synchronize: config.get<boolean>('DB_SYNCHRONIZE', false),
        logging: config.get<boolean>('DB_LOGGING', false),
      }),
    }),
    VehiclesModule,
    HealthModule,
    UsersModule,
    AuthModule,
    FarmersModule,
    RetailersModule,
    PurchasesModule,
    SalesModule,
    ExpensesModule,
    DashboardModule,
    InventoryModule,
    SettingsModule,
    AuditModule,
  ],
})
export class AppModule {}

