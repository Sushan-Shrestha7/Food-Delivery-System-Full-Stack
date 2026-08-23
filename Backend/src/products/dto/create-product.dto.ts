import { IsIn, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number) // multipart/form-data sends everything as strings — convert before validating
  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string; // set server-side from the uploaded file, not sent by the client anymore

  @IsOptional()
  @IsString()
  category?: string;
}
