// src/ws-client.ts
import { io, Socket } from 'socket.io-client';

interface Item {
  productId: number;
  quantity: number;
}

interface Order {
  id: number;
  userId: number;
  total: number;
  status: string;
  createdAt: string;
  items: Item[];
}

interface OrderEvent {
  order: Order;
  message: string;
}

interface StatusEvent {
  orderId: number;
  status: string;
}

interface DeleteData {
  id: number;
}

const socket: Socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('orderCreated', (data: OrderEvent) => {
  console.log('Order created:', data);
});

socket.on('orderUpdated', (data: OrderEvent) => {
  console.log('Order updated:', data);
  // Bỏ phần in Status ở đây
});

socket.on('status', (data: StatusEvent) => {
  console.log('Status:', data.status); // Chỉ in Status ở đây
});

socket.on('orderDeleted', (data: DeleteData) => {
  console.log('Order deleted:', data);
});
