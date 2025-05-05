// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Kích hoạt class-transformer để chuyển đổi dữ liệu
      whitelist: true, // Loại bỏ các thuộc tính không được định nghĩa trong DTO
    }),
  );
  await app.listen(3000);
}
bootstrap();
