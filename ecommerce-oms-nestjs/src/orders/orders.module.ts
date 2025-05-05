// src/orders/orders.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersGateway } from './orders.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { InventoryModule } from '../inventory/inventory.module';
import { FulfillmentModule } from '../fulfillment/fulfillment.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => InventoryModule),
    forwardRef(() => FulfillmentModule),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersGateway],
  exports: [OrdersService, OrdersGateway], // Thêm OrdersGateway vào exports
})
export class OrdersModule {}
