import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "../api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  TrendingUp,
  AlertTriangle,
  Wallet,
  MessageSquare,
  ArrowUpRight,
  CheckCircle,
  Clock,
  ShieldAlert,
  Activity,
} from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import QuickActionCard from "@/components/admin/QuickActionCard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: sellers = [] } = useQuery({
    queryKey: ["sellers"],
    queryFn: () => base44.entities.Seller.list(),
  });

  const { data: listings = [] } = useQuery({
    queryKey: ["listings"],
    queryFn: () => base44.entities.Listing.list(),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: () => base44.entities.Order.list(),
  });

  const { data: disputes = [] } = useQuery({
    queryKey: ["disputes"],
    queryFn: () => base44.entities.Dispute.list(),
  });

  const { data: payouts = [] } = useQuery({
    queryKey: ["payouts"],
    queryFn: () => base44.entities.Payout.list(),
  });

  const { data: fraudAlerts = [] } = useQuery({
    queryKey: ["fraudAlerts"],
    queryFn: () => base44.entities.FraudAlert.list(),
  });

  // Calculate stats
  const totalUsers = users.length;
  const totalSellers = sellers.length;
  const verifiedSellers = sellers.filter(
    (s) => s.verification_status === "approved"
  ).length;
  const activeListings = listings.filter((l) => l.status === "approved").length;
  const pendingListings = listings.filter((l) => l.status === "pending").length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingPayouts = payouts
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const openDisputes = disputes.filter(
    (d) => d.status === "open" || d.status === "under_review"
  ).length;
  const newFraudAlerts = fraudAlerts.filter((f) => f.status === "new").length;

  // Mock chart data
  const revenueData = [
    { name: "Mon", revenue: 4500, orders: 23 },
    { name: "Tue", revenue: 5200, orders: 31 },
    { name: "Wed", revenue: 4800, orders: 28 },
    { name: "Thu", revenue: 6100, orders: 35 },
    { name: "Fri", revenue: 7200, orders: 42 },
    { name: "Sat", revenue: 8500, orders: 48 },
    { name: "Sun", revenue: 6800, orders: 38 },
  ];

  const categoryData = [
    { name: "Pokemon", value: 45, color: "#3b82f6" },
    { name: "MTG", value: 28, color: "#10b981" },
    { name: "Yu-Gi-Oh", value: 18, color: "#f59e0b" },
    { name: "Other", value: 9, color: "#6366f1" },
  ];

  const recentOrders = orders.slice(0, 5);
  const recentDisputes = disputes
    .filter((d) => d.status !== "closed")
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard Overview
        </h1>
        <p className="text-slate-500 mt-1">
          Welcome back! Here's what's happening with your marketplace.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={totalUsers.toLocaleString()}
          icon={Users}
          color="blue"
          trend="up"
          trendValue="+12%"
          subtitle={`${totalSellers} sellers, ${verifiedSellers} verified`}
        />
        <StatCard
          title="Active Listings"
          value={activeListings.toLocaleString()}
          icon={ShoppingBag}
          color="green"
          trend="up"
          trendValue="+8%"
          subtitle={`${pendingListings} pending review`}
        />
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="purple"
          trend="up"
          trendValue="+15%"
        />
        <StatCard
          title="Total Orders"
          value={orders.length.toLocaleString()}
          icon={Package}
          color="orange"
          trend="up"
          trendValue="+10%"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Payouts"
          value={`$${pendingPayouts.toLocaleString()}`}
          icon={Wallet}
          color="cyan"
        />
        <StatCard
          title="Open Disputes"
          value={openDisputes}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Fraud Alerts"
          value={newFraudAlerts}
          icon={ShieldAlert}
          color="pink"
        />
        <StatCard
          title="Platform Health"
          value="99.9%"
          icon={Activity}
          color="green"
          subtitle="All systems operational"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              Weekly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value) => [
                      `$${value.toLocaleString()}`,
                      "Revenue",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              Sales by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Share"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm text-slate-600">{cat.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to={createPageUrl("ListingManagement")}>
            <QuickActionCard
              title="Pending Listings"
              description="Review and approve new listings"
              icon={Clock}
              count={pendingListings}
              color="orange"
            />
          </Link>
          <Link to={createPageUrl("SellerVerification")}>
            <QuickActionCard
              title="KYC Pending"
              description="Verify seller documents"
              icon={CheckCircle}
              count={
                sellers.filter((s) => s.verification_status === "pending")
                  .length
              }
              color="blue"
            />
          </Link>
          <Link to={createPageUrl("DisputeManagement")}>
            <QuickActionCard
              title="Open Disputes"
              description="Resolve buyer vs seller cases"
              icon={AlertTriangle}
              count={openDisputes}
              color="red"
            />
          </Link>
          <Link to={createPageUrl("PayoutManagement")}>
            <QuickActionCard
              title="Pending Payouts"
              description="Release seller payouts"
              icon={Wallet}
              count={payouts.filter((p) => p.status === "pending").length}
              color="green"
            />
          </Link>
          <Link to={createPageUrl("FraudMonitoring")}>
            <QuickActionCard
              title="Fraud Alerts"
              description="Investigate suspicious activity"
              icon={ShieldAlert}
              count={newFraudAlerts}
              color="purple"
            />
          </Link>
          <Link to={createPageUrl("SupportTickets")}>
            <QuickActionCard
              title="Support Tickets"
              description="Respond to user inquiries"
              icon={MessageSquare}
              count={5}
              color="cyan"
            />
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">
              Recent Orders
            </CardTitle>
            <Link
              to={createPageUrl("OrderManagement")}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No orders yet</p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {order.order_number || `#${order.id.slice(0, 8)}`}
                      </p>
                      <p className="text-sm text-slate-500">
                        {order.card_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        ${order.total?.toFixed(2)}
                      </p>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Disputes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">
              Active Disputes
            </CardTitle>
            <Link
              to={createPageUrl("DisputeManagement")}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDisputes.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  No active disputes
                </p>
              ) : (
                recentDisputes.map((dispute) => (
                  <div
                    key={dispute.id}
                    className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {dispute.type?.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm text-slate-500 truncate max-w-[200px]">
                        {dispute.description}
                      </p>
                    </div>
                    <StatusBadge status={dispute.status} />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
