"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/Card";
import { MdShoppingBag, MdWarning, MdInventory, MdTrendingUp } from "react-icons/md";
import { clsx } from "clsx";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  color: "indigo" | "red" | "green" | "yellow";
}

function StatCard({ title, value, icon: Icon, trend, trendUp, color }: StatCardProps) {
  const colorStyles = {
    indigo: "bg-indigo-50 text-indigo-600",
    red: "bg-red-50 text-red-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
  };

  return (
    <Card className="border-none shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
          <div className={clsx("p-3 rounded-full", colorStyles[color])}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            <span
              className={clsx(
                "font-medium",
                trendUp ? "text-green-600" : "text-red-600"
              )}
            >
              {trend}
            </span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Dashboard Overview
        </h2>
        <p className="text-gray-500 mt-1">
          Welcome back, {user?.name}! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value="124"
          icon={MdShoppingBag}
          color="indigo"
          trend="+12%"
          trendUp={true}
        />
        <StatCard
          title="Low Stock Items"
          value="3"
          icon={MdWarning}
          color="red"
          trend="-2"
          trendUp={true} // Less low stock is good
        />
        <StatCard
          title="Total Categories"
          value="12"
          icon={MdInventory}
          color="yellow"
        />
        <StatCard
          title="Total Sales"
          value="$12,450"
          icon={MdTrendingUp}
          color="green"
          trend="+8%"
          trendUp={true}
        />
      </div>

      {/* Recent Activity or Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="min-h-[300px]">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6 text-center text-gray-500 py-20">
            Activity chart placeholder
          </div>
        </Card>
        
        <Card className="min-h-[300px]">
           <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
             {/* Quick action buttons can go here */}
             <div className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 cursor-pointer transition-colors">
                <p className="font-medium text-gray-900">Add Product</p>
             </div>
             <div className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 cursor-pointer transition-colors">
                <p className="font-medium text-gray-900">Check Stock</p>
             </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
