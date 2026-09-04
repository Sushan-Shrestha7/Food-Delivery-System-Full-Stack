import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { CartService } from "./cart.service";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { User } from "../users/entities/user.entity";
import { ApiBearerAuth } from "@nestjs/swagger";

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("api/cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: User) {
    return this.cartService.getCart(user.id);
  }

  @Post("add")
  addToCart(@CurrentUser() user: User, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(user.id, dto);
  }

  @Put("update")
  updateItem(@CurrentUser() user: User, @Body() dto: UpdateCartItemDto) {
    return this.cartService.updateItem(user.id, dto);
  }



  @Delete("remove/:productId")
  removeItem(
    @CurrentUser() user: User,
    @Param("productId", ParseIntPipe) productId: number,
  ) {
    return this.cartService.removeItem(user.id, productId);
  }

  @Delete("clear")
  clearCart(@CurrentUser() user: User) {
    return this.cartService.clearCart(user.id);
  }}
