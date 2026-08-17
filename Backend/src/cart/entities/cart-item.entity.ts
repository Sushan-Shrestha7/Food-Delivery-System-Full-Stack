import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Cart } from "./cart.entity";
import { Product } from "../../products/entities/product.entity";

@Entity("cart_items")
export class CartItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: "CASCADE" })
  cart: Cart;

  @ManyToOne(() => Product, { eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "productId" })
  product: Product;

  @Column()
  productId: number;

  @Column({ type: "int", default: 1 })
  quantity: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  priceAtAdd: number;
}
