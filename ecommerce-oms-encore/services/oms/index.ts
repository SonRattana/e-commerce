import { api } from "encore.dev/api";
import axios from "axios";

const NESTJS_API_URL = "http://localhost:3000";

export const getOrders = api(
  { expose: true, method: "GET", path: "/orders" },
  async () => {
    try {
      const response = await axios.get(`${NESTJS_API_URL}/orders`);
      return { orders: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to fetch orders: ${error.message}, status: ${
            error.response?.status
          }, data: ${JSON.stringify(error.response?.data)}`
        );
      }
      throw new Error(`Failed to fetch orders: ${error}`);
    }
  }
);

export const getOrderById = api(
  { expose: true, method: "GET", path: "/orders/:id" },
  async ({ id }: { id: number }) => {
    try {
      const response = await axios.get(`${NESTJS_API_URL}/orders/${id}`);
      return { order: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to fetch order: ${error.message}, status: ${
            error.response?.status
          }, data: ${JSON.stringify(error.response?.data)}`
        );
      }
      throw new Error(`Failed to fetch order: ${error}`);
    }
  }
);

export const createOrder = api(
  { expose: true, method: "POST", path: "/orders" },
  async ({ userId, total }: { userId: number; total: number }) => {
    try {
      const response = await axios.post(`${NESTJS_API_URL}/orders`, {
        userId,
        total,
      });
      return { order: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to create order: ${error.message}, status: ${
            error.response?.status
          }, data: ${JSON.stringify(error.response?.data)}`
        );
      }
      throw new Error(`Failed to create order: ${error}`);
    }
  }
);

export const updateOrder = api(
  { expose: true, method: "PUT", path: "/orders/:id" },
  async ({
    id,
    userId,
    total,
  }: {
    id: number;
    userId?: number;
    total?: number;
  }) => {
    try {
      const response = await axios.put(`${NESTJS_API_URL}/orders/${id}`, {
        userId,
        total,
      });
      return { order: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to update order: ${error.message}, status: ${
            error.response?.status
          }, data: ${JSON.stringify(error.response?.data)}`
        );
      }
      throw new Error(`Failed to update order: ${error}`);
    }
  }
);

export const deleteOrder = api(
  { expose: true, method: "DELETE", path: "/orders/:id" },
  async ({ id }: { id: number }) => {
    try {
      await axios.delete(`${NESTJS_API_URL}/orders/${id}`);
      return { message: `Order ${id} deleted successfully` };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to delete order: ${error.message}, status: ${
            error.response?.status
          }, data: ${JSON.stringify(error.response?.data)}`
        );
      }
      throw new Error(`Failed to delete order: ${error}`);
    }
  }
);
