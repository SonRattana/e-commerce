// src/inventory/inventory.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [PrismaModule, forwardRef(() => OrdersModule)],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
