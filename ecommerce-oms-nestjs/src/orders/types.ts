import {
  IsInt,
  IsArray,
  Min,
  IsOptional,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Prisma } from '@prisma/client';

export class ItemDto {
  @IsInt()
  @Min(1)
  productId!: number;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @IsInt()
  userId!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items!: ItemDto[];
}

export class UpdateOrderDto {
  @IsInt()
  @IsOptional()
  userId?: number;

  @IsOptional()
  total?: number;
}

export class UpdateStatusDto {
  @IsEnum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
  status!: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
}

export type Order = {
  id: number;
  userId: number;
  total: Prisma.Decimal; // Sửa từ number thành Prisma.Decimal
  status: string;
  createdAt: Date;
  trackingNumber: string | null; // Sửa từ string | undefined thành string | null
  items: Array<{
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
  }>;
  steps: Array<{
    id: number;
    orderId: number;
    step: string;
    details: string | null; // Sửa từ string | undefined thành string | null
    createdAt: Date;
  }>;
};
