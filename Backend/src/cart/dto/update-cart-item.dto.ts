import { IsInt, IsNotEmpty, Min } from "class-validator";

export class UpdateCartItemDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}
