import { IsInt, IsNotEmpty, Min } from "class-validator";

export class AddToCartDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number = 1;
}
