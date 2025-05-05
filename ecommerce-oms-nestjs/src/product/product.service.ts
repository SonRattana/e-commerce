// src/product/product.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(data: { name: string; stock: number; price: number }) {
    try {
      const product = await this.prisma.product.create({
        data: {
          name: data.name,
          stock: data.stock,
          price: data.price,
        },
      });
      return product;
    } catch {
      throw new BadRequestException('Không thể tạo sản phẩm');
    }
  }

  async findAll() {
    return this.prisma.product.findMany();
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`Sản phẩm với id ${id} không tồn tại`);
    }
    return product;
  }

  async update(
    id: number,
    data: { name?: string; stock?: number; price?: number },
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`Sản phẩm với id ${id} không tồn tại`);
    }
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`Sản phẩm với id ${id} không tồn tại`);
    }
    await this.prisma.product.delete({
      where: { id },
    });
    return { message: 'Sản phẩm đã được xóa thành công' };
  }

  async getStock(productId: number): Promise<number> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true },
    });

    if (!product) {
      throw new NotFoundException(`Sản phẩm ${productId} không tồn tại`);
    }

    return product.stock;
  }
}
