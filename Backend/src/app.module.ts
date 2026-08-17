import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./users/entities/user.entity";
import { Product } from "./products/entities/product.entity";
import { Cart } from "./cart/entities/cart.entity";
import { CartItem } from "./cart/entities/cart-item.entity";
import { Order } from "./orders/entities/order.entity";
import { OrderItem } from "./orders/entities/order-item.entity";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ProductsModule } from "./products/products.module";
import { CartModule } from "./cart/cart.module";
import { OrdersModule } from "./orders/orders.module";
import { AssistantModule } from "./assistant/assistant.module";
import { Otp } from "./auth/otp.entity";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get<string>("DB_HOST"),
        port: config.get<number>("DB_PORT"),
        username: config.get<string>("DB_USERNAME"),
        password: config.get<string>("DB_PASSWORD"),
        database: config.get<string>("DB_NAME"),
        entities: [User, Product, Cart, CartItem, Order, OrderItem,Otp],
        synchronize: true,
      }),
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    AssistantModule,
    UsersModule,
  ],
})
export class AppModule {}
