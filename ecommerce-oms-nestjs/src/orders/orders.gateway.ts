// src/orders/orders.gateway.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Order } from './types';

@WebSocketGateway()
export class OrdersGateway {
  @WebSocketServer()
  server!: Server;

  notifyOrderCreated(order: Order) {
    this.server.emit('orderCreated', { order, message: 'Order created' });
    this.server.emit('status', { orderId: order.id, status: order.status });
  }

  notifyOrderUpdated(order: Order) {
    this.server.emit('orderUpdated', { order, message: 'Order updated' });
    if (order.trackingNumber) {
      this.server.emit('trackingNumber', {
        orderId: order.id,
        trackingNumber: order.trackingNumber,
      });
    }
    this.server.emit('status', { orderId: order.id, status: order.status });
  }

  notifyOrderDeleted(orderId: number) {
    this.server.emit('orderDeleted', { orderId, message: 'Order deleted' });
  }

  notifyStockChange(data: { productId: number; stock: number }) {
    this.server.emit('stockChanged', {
      productId: data.productId,
      stock: data.stock,
      message: `Stock changed for product ${data.productId}`,
    });
  }

  notifyLowStock(data: { productId: number; stock: number }) {
    this.server.emit('lowStock', {
      productId: data.productId,
      stock: data.stock,
      message: `Low stock alert for product ${data.productId}: ${data.stock} remaining`,
    });
  }
}
