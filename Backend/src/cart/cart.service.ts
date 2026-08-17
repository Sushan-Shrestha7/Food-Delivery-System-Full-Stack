import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cart } from "./entities/cart.entity";
import { CartItem } from "./entities/cart-item.entity";
import { Product } from "../products/entities/product.entity";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: { items: { product: true } },
    });
    if (!cart) {
      cart = this.cartRepository.create({ userId, items: [] });
      cart = await this.cartRepository.save(cart);
    }
    return cart;
  }

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    const total = cart.items.reduce(
      (sum, item) => sum + Number(item.priceAtAdd) * item.quantity,
      0,
    );
    return { cart, total };
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException("Product not found");
    }
    if (product.stock < dto.quantity) {
      throw new BadRequestException("Not enough stock available");
    }

    const cart = await this.getOrCreateCart(userId);
    const existingItem = cart.items.find(
      (item) => item.productId === dto.productId,
    );

    if (existingItem) {
      existingItem.quantity += dto.quantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        cart,
        productId: product.id,
        product,
        quantity: dto.quantity,
        priceAtAdd: product.price,
      });
      await this.cartItemRepository.save(newItem);
    }

    return this.getCart(userId);
  }

  async updateItem(userId: string, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((i) => i.productId === dto.productId);
    if (!item) {
      throw new NotFoundException("Item not found in cart");
    }

    item.quantity = dto.quantity;
    await this.cartItemRepository.save(item);
    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: number) {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((i) => i.productId === productId);
    if (!item) {
      throw new NotFoundException("Item not found in cart");
    }
    await this.cartItemRepository.remove(item);
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    if (cart.items.length > 0) {
      await this.cartItemRepository.remove(cart.items);
    }
    return this.getCart(userId);
  }
}
