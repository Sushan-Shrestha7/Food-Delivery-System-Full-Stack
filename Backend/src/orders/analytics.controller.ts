import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, PaymentMethod } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorators';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('api/admin/analytics')
export class AnalyticsController {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepo: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) {}

  @Get()
  async getAnalytics() {
    const [orders, products] = await Promise.all([
      this.ordersRepo.find({ relations: { items: true } }),
      this.productsRepo.find(),
    ]);

    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(o => o.status !== OrderStatus.CANCELLED)
      .reduce((sum, o) => sum + Number(o.totalAmount), 0);

    const activeOrders = orders.filter(o =>
      [OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.OUT_FOR_DELIVERY].includes(o.status)
    ).length;

    const deliveredOrders = orders.filter(o => o.status === OrderStatus.DELIVERED).length;
    const cancelledOrders = orders.filter(o => o.status === OrderStatus.CANCELLED).length;

    // Orders by status
    const ordersByStatus = {
      placed: orders.filter(o => o.status === OrderStatus.PLACED).length,
      confirmed: orders.filter(o => o.status === OrderStatus.CONFIRMED).length,
      out_for_delivery: orders.filter(o => o.status === OrderStatus.OUT_FOR_DELIVERY).length,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
    };

    // Orders by payment method
    const ordersByPayment = {
      cod: orders.filter(o => o.paymentMethod === PaymentMethod.COD).length,
      esewa: orders.filter(o => o.paymentMethod === PaymentMethod.ESEWA).length,
      card: orders.filter(o => o.paymentMethod === PaymentMethod.CARD).length,
      wallet: orders.filter(o => o.paymentMethod === PaymentMethod.WALLET).length,
    };

    // Revenue by day (last 7 days)
    const now = new Date();
    const revenueByDay: { date: string; revenue: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const dateStr = day.toISOString().split('T')[0];
      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.placedAt).toISOString().split('T')[0];
        return orderDate === dateStr && o.status !== OrderStatus.CANCELLED;
      });
      revenueByDay.push({
        date: dateStr,
        revenue: dayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
        orders: dayOrders.length,
      });
    }

    // Top selling items (by quantity ordered)
    const itemSalesMap: Record<string, { name: string; quantity: number; revenue: number; category: string }> = {};
    for (const order of orders) {
      if (order.status === OrderStatus.CANCELLED) continue;
      for (const item of order.items || []) {
        if (!itemSalesMap[item.name]) {
          const product = products.find(p => p.id === item.productId);
          itemSalesMap[item.name] = {
            name: item.name,
            quantity: 0,
            revenue: 0,
            category: product?.category || 'General',
          };
        }
        itemSalesMap[item.name].quantity += item.quantity;
        itemSalesMap[item.name].revenue += Number(item.price) * item.quantity;
      }
    }
    const topItems = Object.values(itemSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);

    // Revenue by category
    const categoryMap: Record<string, number> = {};
    for (const entry of Object.values(itemSalesMap)) {
      categoryMap[entry.category] = (categoryMap[entry.category] || 0) + entry.revenue;
    }
    const revenueByCategory = Object.entries(categoryMap)
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    // Revenue by month (last 6 months)
    const revenueByMonth: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      const monthOrders = orders.filter(o => {
        const od = new Date(o.placedAt);
        return od.getFullYear() === d.getFullYear() &&
               od.getMonth() === d.getMonth() &&
               o.status !== OrderStatus.CANCELLED;
      });
      revenueByMonth.push({
        month: monthStr,
        revenue: monthOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
      });
    }

    return {
      summary: {
        totalOrders,
        totalRevenue,
        activeOrders,
        deliveredOrders,
        cancelledOrders,
        totalProducts: products.length,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      },
      ordersByStatus,
      ordersByPayment,
      revenueByDay,
      revenueByMonth,
      topItems,
      revenueByCategory,
    };
  }
}
