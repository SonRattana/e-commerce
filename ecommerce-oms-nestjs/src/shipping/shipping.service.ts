// src/shipping/shipping.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(private readonly ordersService: OrdersService) {}

  async createShipment(orderId: number): Promise<string> {
    this.logger.log(`Creating shipment for order ${orderId}`);

    try {
      // Giả lập tạo mã vận đơn (tracking number)
      const trackingNumber = `TRACK-${orderId}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      this.logger.log(
        `Tracking number for order ${orderId}: ${trackingNumber}`,
      );

      // Cập nhật tracking number vào đơn hàng
      const updatedOrder = await this.ordersService.update(orderId, {
        trackingNumber, // Đã sửa type trong OrdersService nên không còn lỗi
      });

      return updatedOrder.trackingNumber!;
    } catch (error) {
      const err = error as Error; // Ép kiểu error thành Error
      this.logger.error(
        `Failed to create shipment for order ${orderId}: ${err.message}`,
        err.stack,
      );
      throw new Error(`Failed to create shipment: ${err.message}`);
    }
  }
}
