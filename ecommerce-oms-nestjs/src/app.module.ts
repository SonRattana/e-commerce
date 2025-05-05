// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from './orders/orders.module';
import { InventoryModule } from './inventory/inventory.module';
import { FulfillmentModule } from './fulfillment/fulfillment.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { ShippingModule } from './shipping/shipping.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    InventoryModule,
    OrdersModule,
    FulfillmentModule,
    ProductModule,
    ShippingModule, // Đảm bảo ShippingModule được import
  ],
})
export class AppModule {}
