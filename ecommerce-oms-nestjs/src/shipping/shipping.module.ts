// src/shipping/shipping.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [forwardRef(() => OrdersModule)], // Sử dụng forwardRef để tránh circular dependency
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
