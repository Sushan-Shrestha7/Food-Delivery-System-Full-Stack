import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { PlaceOrderDto } from "./dto/place-order.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { User } from "../users/entities/user.entity";
import { ApiBearerAuth } from "@nestjs/swagger";
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("api/orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post("place")
  placeOrder(@CurrentUser() user: User, @Body() dto: PlaceOrderDto) {
    return this.ordersService.placeOrder(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.ordersService.findAllForUser(user.id);
  }

  @Get(":id")
  findOne(@CurrentUser() user: User, @Param("id") id: string) {
    return this.ordersService.findOneForUser(user.id, id);
  }

  @Patch(":id/cancel")
  cancel(
    @CurrentUser() user: User,
    @Param("id") id: string,
    @Body() body: { reason: string },
  ) {
    return this.ordersService.cancelOrder(user.id, id, body.reason);
  }
}
