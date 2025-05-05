import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersGateway } from '../orders/orders.gateway';
@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  async getStock(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, stock: true },
    });

    if (!product) {
      throw new NotFoundException(`Sản phẩm với id ${productId} không tồn tại`);
    }

    return { productId: product.id, name: product.name, stock: product.stock };
  }

  async adjustStock(productId: number, quantity: number): Promise<void> {
    await this.prisma.$transaction(async prisma => {
      // Khóa hàng sản phẩm để tránh race condition
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, stock: true },
      });

      if (!product) {
        throw new NotFoundException(
          `Sản phẩm với id ${productId} không tồn tại`,
        );
      }

      if (product.stock < quantity) {
        throw new NotFoundException(
          `Sản phẩm với id ${productId} không đủ hàng trong kho`,
        );
      }

      await prisma.product.update({
        where: { id: productId },
        data: { stock: product.stock - quantity },
      });
    });
  }

  async restoreStock(productId: number, quantity: number): Promise<void> {
    await this.prisma.$transaction(async prisma => {
      // Khóa hàng sản phẩm để tránh race condition
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, stock: true },
      });

      if (!product) {
        throw new NotFoundException(
          `Sản phẩm với id ${productId} không tồn tại`,
        );
      }

      await prisma.product.update({
        where: { id: productId },
        data: { stock: product.stock + quantity },
      });
    });
  }
}
