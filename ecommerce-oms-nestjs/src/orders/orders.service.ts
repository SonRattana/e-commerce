// src/orders/orders.service.ts
import {
  Injectable,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersGateway } from './orders.gateway';
import { InventoryService } from '../inventory/inventory.service';
import { CreateOrderDto, Order } from './types';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersGateway: OrdersGateway,
    private readonly inventoryService: InventoryService,
  ) {}

  async findAll(): Promise<Order[]> {
    this.logger.log('Fetching all orders');
    return this.prisma.order.findMany({
      include: {
        items: true,
        steps: true,
      },
    });
  }

  async findOne(id: number): Promise<Order | null> {
    this.logger.log(`Fetching order with id: ${id}`);
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        steps: true,
      },
    });
  }

  async create(data: CreateOrderDto): Promise<Order> {
    const { userId, items } = data;

    this.logger.log(`Creating order for userId: ${userId}`);
    if (!items || items.length === 0) {
      this.logger.error('Order items list cannot be empty');
      throw new BadRequestException('Danh sách mặt hàng không được rỗng');
    }

    let calculatedTotal = new Prisma.Decimal(0);

    try {
      const order = await this.prisma.$transaction(async prisma => {
        for (const item of items) {
          this.logger.log(`Checking product ${item.productId}`);
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            this.logger.error(`Product ${item.productId} not found`);
            throw new BadRequestException(
              `Sản phẩm ${item.productId} không tồn tại`,
            );
          }

          this.logger.log(
            `Product ${item.productId} stock: ${product.stock}, requested: ${item.quantity}`,
          );
          if (product.stock < item.quantity) {
            this.logger.error(
              `Insufficient stock for product ${item.productId}: available ${product.stock}, requested ${item.quantity}`,
            );
            throw new BadRequestException(
              `Sản phẩm ${item.productId} không đủ tồn kho (còn ${product.stock}, yêu cầu ${item.quantity})`,
            );
          }

          this.logger.log(`Product ${item.productId} price: ${product.price}`);
          const price = new Prisma.Decimal(product.price ?? 0);
          this.logger.log(
            `Calculated price for quantity ${item.quantity}: ${price.mul(item.quantity).toString()}`,
          );
          calculatedTotal = calculatedTotal.add(price.mul(item.quantity));
          this.logger.log(`Current total: ${calculatedTotal.toString()}`);

          this.logger.log(`Adjusting stock for product ${item.productId}`);
          await this.inventoryService.adjustStock(
            item.productId,
            item.quantity,
          );
        }

        this.logger.log(
          `Creating new order with total: ${calculatedTotal.toString()}`,
        );
        const newOrder = await prisma.order.create({
          data: {
            userId,
            total: calculatedTotal,
            status: 'pending',
            items: {
              create: items.map(item => ({
                productId: item.productId,
                quantity: Math.floor(item.quantity),
              })),
            },
          },
          include: {
            items: true,
            steps: true,
          },
        });

        this.logger.log(`Order created successfully with id: ${newOrder.id}`);
        return newOrder;
      });

      this.ordersGateway.notifyOrderCreated(order);
      return order;
    } catch (error) {
      this.logger.error(
        `Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        `Không thể tạo đơn hàng: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async update(
    id: number,
    data: { userId?: number; total?: Prisma.Decimal; trackingNumber?: string }, // Thêm trackingNumber vào type
  ): Promise<Order> {
    this.logger.log(`Updating order with id: ${id}`);
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      this.logger.error(`Order ${id} not found`);
      throw new BadRequestException('Đơn hàng không tồn tại');
    }

    if (order.status === 'delivered') {
      this.logger.error(`Cannot update delivered order ${id}`);
      throw new BadRequestException('Không thể cập nhật đơn hàng đã giao');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data,
      include: {
        items: true,
        steps: true,
      },
    });
    this.logger.log(`Order ${id} updated successfully`);
    this.ordersGateway.notifyOrderUpdated(updatedOrder);
    return updatedOrder;
  }

  async updateStatus(id: number, status: string): Promise<Order> {
    this.logger.log(`Updating status of order ${id} to ${status}`);
    const validStatuses = [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];
    if (!validStatuses.includes(status)) {
      this.logger.error(`Invalid status: ${status}`);
      throw new BadRequestException('Trạng thái không hợp lệ');
    }

    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      this.logger.error(`Order ${id} not found`);
      throw new BadRequestException('Đơn hàng không tồn tại');
    }

    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);
    const newIndex = statusOrder.indexOf(status);
    if (newIndex < currentIndex && status !== 'cancelled') {
      this.logger.error(
        `Cannot revert status from ${order.status} to ${status} for order ${id}`,
      );
      throw new BadRequestException(
        `Không thể chuyển trạng thái từ ${order.status} về ${status}`,
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
        steps: true,
      },
    });
    this.logger.log(`Order ${id} status updated to ${status}`);
    this.ordersGateway.notifyOrderUpdated(updatedOrder);
    return updatedOrder;
  }

  async delete(id: number): Promise<void> {
    this.logger.log(`Deleting order with id: ${id}`);
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      this.logger.error(`Order ${id} not found`);
      throw new BadRequestException('Đơn hàng không tồn tại');
    }

    if (order.status === 'delivered') {
      this.logger.error(`Cannot delete delivered order ${id}`);
      throw new BadRequestException('Không thể xóa đơn hàng đã giao');
    }

    await this.prisma.$transaction(async prisma => {
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          await this.inventoryService.restoreStock(
            item.productId,
            item.quantity,
          );
        }
      }

      await prisma.order.delete({
        where: { id },
      });
    });

    this.logger.log(`Order ${id} deleted successfully`);
    this.ordersGateway.notifyOrderDeleted(id);
  }
}
