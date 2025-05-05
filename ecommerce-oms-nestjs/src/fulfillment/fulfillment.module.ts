// src/fulfillment/fulfillment.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { FulfillmentService } from './fulfillment.service';
import { OrdersModule } from '../orders/orders.module';
import { ShippingModule } from '../shipping/shipping.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    forwardRef(() => OrdersModule), // Sử dụng forwardRef
    forwardRef(() => ShippingModule), // Sử dụng forwardRef
  ],
  providers: [FulfillmentService, PrismaService],
  exports: [FulfillmentService],
})
export class FulfillmentModule {}
