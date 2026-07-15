import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Plus,
  Eye,
  Tag,
  AlertTriangle,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

function AnimatedCounter({ value, prefix = "" }: { value: number; prefix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-3xl font-bold"
    >
      {prefix}
      {value.toLocaleString()}
    </motion.span>
  );
}

function generateRevenueData() {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: Math.floor(Math.random() * 5000) + 1000,
      orders: Math.floor(Math.random() * 50) + 10,
    });
  }
  return data;
}

export default function AdminDashboard() {
  const [period] = useState("30d");

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const totalRevenue = orders.reduce(
    (sum: number, order: any) => sum + (order.total_amount || 0),
    0
  );
  const totalOrders = orders.length;
  const totalCustomers = profiles.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const stats = [
    {
      title: "Total Revenue",
      value: totalRevenue,
      prefix: "$",
      change: "+12.5%",
      up: true,
      icon: DollarSign,
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "Total Orders",
      value: totalOrders,
      prefix: "",
      change: "+8.2%",
      up: true,
      icon: ShoppingCart,
      color: "from-blue-500 to-indigo-500",
    },
    {
      title: "Total Customers",
      value: totalCustomers,
      prefix: "",
      change: "+23.1%",
      up: true,
      icon: Users,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Avg Order Value",
      value: avgOrderValue,
      prefix: "$",
      change: "-2.4%",
      up: false,
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
    },
  ];

  const revenueData = generateRevenueData();

  const ordersByStatus = [
    { status: "pending", count: orders.filter((o: any) => o.status === "pending").length || 12 },
    { status: "processing", count: orders.filter((o: any) => o.status === "processing").length || 8 },
    { status: "shipped", count: orders.filter((o: any) => o.status === "shipped").length || 15 },
    { status: "delivered", count: orders.filter((o: any) => o.status === "delivered").length || 25 },
    { status: "cancelled", count: orders.filter((o: any) => o.status === "cancelled").length || 3 },
  ];

  const recentOrders = orders.slice(0, 5);
  const topProducts = products.slice(0, 5);
  const lowStockProducts = products.filter((p: any) => p.stock < 10).slice(0, 5);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <motion.div
      className="p-6 space-y-6 max-w-7xl mx-auto"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={fadeInUp}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back. Here&apos;s what&apos;s happening with your store.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.title}
            variants={fadeInUp}
            className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <AnimatedCounter value={stat.value} prefix={stat.prefix} />
                <div className="flex items-center mt-1 text-sm">
                  {stat.up ? (
                    <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={stat.up ? "text-emerald-500" : "text-red-500"}>
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground ml-1">vs last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          variants={fadeInUp}
          className="lg:col-span-2 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#ec4899"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ordersByStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="status"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          variants={fadeInUp}
          className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No orders yet</p>
            ) : (
              recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                >
                  <div>
                    <p className="font-medium text-sm">
                      Order #{order.id?.slice(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">
                      ${(order.total_amount || 0).toFixed(2)}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        statusColors[order.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Top Products</h2>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                No products yet
              </p>
            ) : (
              topProducts.map((product: any, i: number) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
                >
                  <span className="text-sm font-bold text-muted-foreground w-6">
                    #{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ${(product.price || 0).toFixed(2)}
                    </p>
                  </div>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          variants={fadeInUp}
          className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/20 hover:border-pink-500/40 transition-all">
              <Plus className="h-6 w-6 text-pink-500" />
              <span className="text-xs font-medium">Add Product</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <Eye className="h-6 w-6 text-blue-500" />
              <span className="text-xs font-medium">View Orders</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
              <Tag className="h-6 w-6 text-emerald-500" />
              <span className="text-xs font-medium">Manage Coupons</span>
            </button>
          </div>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Low Stock Alerts
          </h2>
          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                All products are well-stocked
              </p>
            ) : (
              lowStockProducts.map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
                >
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.stock} units remaining
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                    Low Stock
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
