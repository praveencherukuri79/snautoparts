/**
 * Mock data generators for Reports
 */

export interface MockSalesReportData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  itemsSold: number;
  revenueChange: number;
  ordersChange: number;
  aovChange: number;
  itemsChange: number;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  ordersByStatus: Record<string, number>;
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  dailyBreakdown: Array<{
    date: string;
    orders: number;
    revenue: number;
    avgOrderValue: number;
    topCategory: string;
    status: 'completed' | 'pending';
  }>;
}

export interface MockOrderStatisticsData {
  totalOrders: number;
  ordersChange: number;
  avgOrderValue: number;
  aovChange: number;
  conversionRate: number;
  conversionChange: number;
  repeatCustomerRate: number;
  repeatChange: number;
  ordersOverTime: Array<{ date: string; orders: number }>;
  ordersByStatus: Array<{ status: string; count: number; percentage: number; color: string }>;
  customerTypes: { new: number; returning: number };
}

export interface MockInventoryReportData {
  totalCostValue: number;
  totalRetailValue: number;
  totalProducts: number;
  lowStockAlerts: number;
  avgValuePerItem: number;
  costChange: number;
  retailChange: number;
  valueByCategory: Array<{ category: string; value: number; percentage: number }>;
  items: Array<{
    id: string;
    name: string;
    brand: string;
    sku: string;
    category: string;
    categoryColor: string;
    stock: number;
    costPrice: number;
    retailPrice: number;
    totalCost: number;
    totalRetail: number;
    isLowStock: boolean;
  }>;
}

function generateRevenueByDay(days: number = 30): Array<{ date: string; revenue: number; orders: number }> {
  const data = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    data.push({
      date: date.toISOString().split('T')[0],
      revenue: 500 + Math.random() * 2500,
      orders: Math.floor(3 + Math.random() * 15),
    });
  }
  return data;
}

export function generateSalesReport(days: number = 30): MockSalesReportData {
  const revenueByDay = generateRevenueByDay(days);
  const totalRevenue = revenueByDay.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = revenueByDay.reduce((sum, d) => sum + d.orders, 0);

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalOrders,
    averageOrderValue: Math.round((totalRevenue / totalOrders) * 100) / 100,
    itemsSold: Math.floor(totalOrders * 2.7),
    revenueChange: 12.5,
    ordersChange: 4.2,
    aovChange: -1.8,
    itemsChange: 8.4,
    topProducts: [
      { name: 'Brake Pads Set', quantity: 45, revenue: 3250 },
      { name: 'Oil Filter Premium', quantity: 62, revenue: 2480 },
      { name: 'Spark Plugs (4-Pack)', quantity: 38, revenue: 1900 },
      { name: 'Air Filter Universal', quantity: 51, revenue: 1785 },
      { name: 'Transmission Fluid', quantity: 33, revenue: 1650 },
    ],
    ordersByStatus: {
      'Completed': 98,
      'Processing': 24,
      'Shipped': 15,
      'Pending': 5,
    },
    revenueByDay,
    dailyBreakdown: revenueByDay.slice(-5).map((d, i) => ({
      date: d.date,
      orders: d.orders,
      revenue: Math.round(d.revenue * 100) / 100,
      avgOrderValue: Math.round((d.revenue / d.orders) * 100) / 100,
      topCategory: ['Brake Systems', 'Engine Parts', 'Accessories', 'Suspension', 'Filters'][i % 5],
      status: i < 3 ? 'completed' : 'pending' as const,
    })),
  };
}

export function generateOrderStatistics(): MockOrderStatisticsData {
  const ordersOverTime = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 30);

  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    ordersOverTime.push({
      date: date.toISOString().split('T')[0],
      orders: Math.floor(10 + Math.random() * 40),
    });
  }

  return {
    totalOrders: 1247,
    ordersChange: 12.5,
    avgOrderValue: 156.42,
    aovChange: 3.2,
    conversionRate: 3.8,
    conversionChange: 0.5,
    repeatCustomerRate: 42,
    repeatChange: 2.1,
    ordersOverTime,
    ordersByStatus: [
      { status: 'Completed', count: 876, percentage: 70, color: '#10b981' },
      { status: 'Processing', count: 187, percentage: 15, color: '#3b82f6' },
      { status: 'Shipped', count: 125, percentage: 10, color: '#8b5cf6' },
      { status: 'Pending', count: 37, percentage: 3, color: '#f59e0b' },
      { status: 'Cancelled', count: 22, percentage: 2, color: '#ef4444' },
    ],
    customerTypes: {
      new: 58,
      returning: 42,
    },
  };
}

export function generateInventoryReport(): MockInventoryReportData {
  return {
    totalCostValue: 845000,
    totalRetailValue: 1200000,
    totalProducts: 450,
    lowStockAlerts: 12,
    avgValuePerItem: 1877.77,
    costChange: 2.4,
    retailChange: 1.8,
    valueByCategory: [
      { category: 'Engine', value: 350000, percentage: 100 },
      { category: 'Suspension', value: 280000, percentage: 80 },
      { category: 'Brakes', value: 120000, percentage: 35 },
      { category: 'Transmission', value: 80000, percentage: 25 },
      { category: 'Electrical', value: 45000, percentage: 15 },
    ],
    items: [
      { id: '1', name: 'Performance Brake Pads', brand: 'Brembo', sku: 'BRM-8821', category: 'Brakes', categoryColor: 'blue', stock: 142, costPrice: 45.00, retailPrice: 89.99, totalCost: 6390.00, totalRetail: 12778.58, isLowStock: false },
      { id: '2', name: 'Alternator 12V 120A', brand: 'Bosch', sku: 'ALT-120-B', category: 'Electrical', categoryColor: 'purple', stock: 24, costPrice: 120.00, retailPrice: 249.99, totalCost: 2880.00, totalRetail: 5999.76, isLowStock: false },
      { id: '3', name: 'Coil Spring Kit (Rear)', brand: 'Bilstein', sku: 'SUS-BIL-99', category: 'Suspension', categoryColor: 'orange', stock: 5, costPrice: 85.50, retailPrice: 155.00, totalCost: 427.50, totalRetail: 775.00, isLowStock: true },
      { id: '4', name: 'V6 Engine Block Assembly', brand: 'OEM Ford', sku: 'ENG-V6-FORD', category: 'Engine', categoryColor: 'green', stock: 3, costPrice: 1200.00, retailPrice: 2400.00, totalCost: 3600.00, totalRetail: 7200.00, isLowStock: false },
      { id: '5', name: 'Spark Plug Iridium', brand: 'NGK', sku: 'NGK-IR-7', category: 'Engine', categoryColor: 'green', stock: 2500, costPrice: 4.20, retailPrice: 9.99, totalCost: 10500.00, totalRetail: 24975.00, isLowStock: false },
    ],
  };
}

export function generateGMVReport() {
  return {
    totalGMV: 2450000,
    gmvChange: 15.3,
    netRevenue: 2205000,
    refunds: 45000,
    avgTransactionValue: 178.50,
    transactionCount: 13725,
    gmvByMonth: [
      { month: 'Jan', gmv: 180000 },
      { month: 'Feb', gmv: 195000 },
      { month: 'Mar', gmv: 210000 },
      { month: 'Apr', gmv: 198000 },
      { month: 'May', gmv: 225000 },
      { month: 'Jun', gmv: 240000 },
    ],
  };
}

