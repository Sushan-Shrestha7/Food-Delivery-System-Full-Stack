import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from "typeorm";
import { Order } from "./order.entity";
import { Product } from "../../products/entities/product.entity";

@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
  order: Order;

  @ManyToOne(() => Product, {
    eager: true,
    onDelete: "SET NULL",
    nullable: true,
  })
  @JoinColumn({ name: "productId" })
  product: Product | null;

  @Column({ nullable: true })
  productId: number | null;

  @Column()
  name: string;

  @Column({ type: "int" })
  quantity: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;
}
