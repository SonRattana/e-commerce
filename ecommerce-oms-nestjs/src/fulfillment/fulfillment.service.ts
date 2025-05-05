// src/fulfillment/fulfillment.service.ts
import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { ShippingService } from '../shipping/shipping.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FulfillmentService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly shippingService: ShippingService,
    private readonly prisma: PrismaService,
  ) {}

  async startFulfillment(orderId: number) {
    const order = await this.ordersService.findOne(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Bước 1: Picking
    console.log(`Đơn hàng ${orderId}: Đang chọn hàng...`);
    await this.prisma.fulfillmentStep.create({
      data: {
        orderId,
        step: 'picking',
        details: 'Nhân viên A bắt đầu chọn hàng',
      },
    });
    await this.ordersService.updateStatus(orderId, 'processing');

    // Bước 2: Packing
    console.log(`Đơn hàng ${orderId}: Đang đóng gói và vận chuyển...`);
    await this.prisma.fulfillmentStep.create({
      data: {
        orderId,
        step: 'packing',
        details: 'Nhân viên B đóng gói xong',
      },
    });

    // Bước 3: Shipping
    await this.shippingService.createShipment(orderId); // Chỉ truyền orderId
    await this.ordersService.updateStatus(orderId, 'shipped');
    await this.prisma.fulfillmentStep.create({
      data: {
        orderId,
        step: 'shipping',
        details: 'Đơn vị vận chuyển C đã giao hàng',
      },
    });

    // Bước 4: Delivered
    await this.ordersService.updateStatus(orderId, 'delivered');
    console.log(`Đơn hàng ${orderId}: Đã giao hàng thành công!`);
  }
}
