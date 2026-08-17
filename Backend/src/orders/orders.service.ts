import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Order, OrderStatus } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { Cart } from "../cart/entities/cart.entity";
import { CartItem } from "../cart/entities/cart-item.entity";
import { Product } from "../products/entities/product.entity";
import { PlaceOrderDto } from "./dto/place-order.dto";

const FLAT_DELIVERY_FEE = 50;

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  async placeOrder(userId: string, dto: PlaceOrderDto) {
    return this.dataSource.transaction(async (manager) => {
      const cart = await manager.findOne(Cart, {
        where: { userId },
        relations: { items: { product: true } },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException("Cart is empty, nothing to order");
      }

      const orderItems: OrderItem[] = [];
      let itemsTotal = 0;

      for (const cartItem of cart.items) {
        const product = await manager.findOne(Product, {
          where: { id: cartItem.productId },
          lock: { mode: "pessimistic_write" },
        });

        if (!product) {
          throw new BadRequestException(
            `Product ${cartItem.productId} no longer exists`,
          );
        }
        if (product.stock < cartItem.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${product.name}`,
          );
        }

        const orderItem = manager.create(OrderItem, {
          product,
          productId: product.id,
          name: product.name,
          quantity: cartItem.quantity,
          price: cartItem.priceAtAdd,
        });
        orderItems.push(orderItem);

        itemsTotal += Number(cartItem.priceAtAdd) * cartItem.quantity;

        product.stock -= cartItem.quantity;
        await manager.save(Product, product);
      }

      const totalAmount = itemsTotal + FLAT_DELIVERY_FEE;

      const order = manager.create(Order, {
        userId,
        items: orderItems,
        deliveryAddress: dto.deliveryAddress,
        itemsTotal,
        deliveryFee: FLAT_DELIVERY_FEE,
        totalAmount,
        paymentMethod: dto.paymentMethod,
        status: OrderStatus.PLACED,
      });
      const savedOrder = await manager.save(Order, order);

      await manager.remove(CartItem, cart.items);

      return { message: "Order placed successfully", order: savedOrder };
    });
  }

  findAllForUser(userId: string) {
    return this.ordersRepository.find({
      where: { userId },
      order: { placedAt: "DESC" },
    });
  }

  async findOneForUser(userId: string, id: string) {
    const order = await this.ordersRepository.findOne({
      where: { id, userId },
    });
    if (!order) {
      throw new NotFoundException("Order not found");
    }
    return order;
  }

  async cancelOrder(userId: string, id: string) {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id, userId },
        relations: { items: true },
      });
      if (!order) {
        throw new NotFoundException("Order not found");
      }
      if (
        [
          OrderStatus.DELIVERED,
          OrderStatus.CANCELLED,
          OrderStatus.OUT_FOR_DELIVERY,
        ].includes(order.status)
      ) {
        throw new BadRequestException(
          `Order cannot be cancelled once ${order.status}`,
        );
      }

      order.status = OrderStatus.CANCELLED;
      await manager.save(Order, order);

      for (const item of order.items) {
        if (item.productId) {
          await manager.increment(
            Product,
            { id: item.productId },
            "stock",
            item.quantity,
          );
        }
      }

      return { message: "Order cancelled", order };
    });
  }
}
