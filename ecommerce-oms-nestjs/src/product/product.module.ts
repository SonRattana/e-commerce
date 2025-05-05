// src/product/product.module.ts
import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller'; // Thêm import
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductController], // Thêm ProductController vào controllers
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
