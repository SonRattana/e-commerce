// src/product/product.dto.ts
import { IsInt, IsString, Min, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(0)
  stock!: number;

  @IsInt()
  @Min(0)
  price!: number;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  price?: number;
}
