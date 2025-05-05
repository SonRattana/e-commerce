// src/orders/orders.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, Order } from './types';
import { FulfillmentService } from '../fulfillment/fulfillment.service';
import { Prisma } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly fulfillmentService: FulfillmentService,
  ) {}

  @Get()
  async findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Order | null> {
    return this.ordersService.findOne(+id);
  }

  @Get(':id/steps')
  async getFulfillmentSteps(@Param('id') id: string) {
    const order = await this.ordersService.findOne(+id);
    if (!order) {
      throw new BadRequestException('Đơn hàng không tồn tại');
    }
    return order.steps;
  }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    const order = await this.ordersService.create(createOrderDto);
    setTimeout(() => {
      this.fulfillmentService.startFulfillment(order.id).catch(err => {
        console.error(`Fulfillment failed for order ${order.id}: ${err}`);
      });
    }, 0);
    return order;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: { userId?: number; total?: number }, // Giữ total là number vì dữ liệu từ body là number
  ): Promise<Order> {
    // Chuyển đổi total thành Prisma.Decimal nếu có
    const transformedData = {
      userId: data.userId,
      total:
        data.total !== undefined ? new Prisma.Decimal(data.total) : undefined,
    };
    return this.ordersService.update(+id, transformedData);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<Order> {
    return this.ordersService.updateStatus(+id, status);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.ordersService.delete(+id);
  }
}
