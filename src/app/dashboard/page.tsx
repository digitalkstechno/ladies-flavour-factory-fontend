"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MdShoppingBag, MdInventory, MdTrendingUp, MdQrCode, MdAdd, MdCategory } from "react-icons/md";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { productService } from "@/services/productService";
import { catalogService } from "@/services/catalogService";
import { stockService } from "@/services/stockService";
import OverviewChart from "@/components/dashboard/OverviewChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import Link from "next/link";
import ScanModal from "@/components/ScanModal";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: "indigo" | "red" | "green" | "yellow";
  index: number;
}

function StatCard({ title, value, icon: Icon, color, index }: StatCardProps) {
  const colorStyles = {
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    red: "bg-red-50 text-red-600 ring-red-100",
    green: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    yellow: "bg-amber-50 text-amber-600 ring-amber-100",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">{value}</p>
            </div>
            <div className={clsx("p-3 rounded-2xl ring-1", colorStyles[color])}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user, hasPermission } = useAuth();
  const [productCount, setProductCount] = useState(0);
  const [catalogCount, setCatalogCount] = useState(0);
  const [todayInCount, setTodayInCount] = useState(0);
  const [todayOutCount, setTodayOutCount] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

  const fetchCounts = async () => {
    if (!user) return;
    
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 6); // Last 7 days

      // Run independent requests in parallel
      const promises = [
         hasPermission('view_products') ? productService.getProducts({ page: 1, limit: 1 }) : Promise.resolve({ total: 0 }),
         hasPermission('view_catalog') ? catalogService.getCatalogs({ page: 1, limit: 1 }) : Promise.resolve({ total: 0 }),
         hasPermission('manage_stock') ? stockService.getTransactions({ page: 1, limit: 1, type: 'IN', date: 'today' }) : Promise.resolve({ total: 0 }),
         hasPermission('manage_stock') ? stockService.getTransactions({ page: 1, limit: 1, type: 'OUT', date: 'today' }) : Promise.resolve({ total: 0 }),
         hasPermission('manage_stock') ? stockService.getTransactions({ limit: 5 }) : Promise.resolve({ transactions: [] }),
         hasPermission('manage_stock') ? stockService.getTransactions({ startDate: startDate.toISOString(), endDate: endDate.toISOString(), limit: 1000 }) : Promise.resolve({ transactions: [] })
      ];

      const [prodRes, catRes, inRes, outRes, recentRes, chartRes] = await Promise.all(promises);

      setProductCount(prodRes?.total || 0);
      setCatalogCount(catRes?.total || 0);
      setTodayInCount(inRes?.total || 0);
      setTodayOutCount(outRes?.total || 0);
      setRecentTransactions(recentRes?.transactions || []);

      // Process chart data
      if (chartRes?.transactions) {
          const chartMap = new Map();
          // Initialize map with last 7 days
          for (let i = 0; i < 7; i++) {
              const d = new Date();
              d.setDate(endDate.getDate() - i);
              const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
              chartMap.set(dateStr, { name: dateStr, in: 0, out: 0 });
          }

          chartRes.transactions.forEach((tx: any) => {
              const dateStr = new Date(tx.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
              // We use includes or similar logic if locale format varies slightly, but here we forced format
              // However, Map keys are exact. Let's make sure we match correctly.
              // Re-calculate dateStr for the transaction to match the key format
              if (chartMap.has(dateStr)) {
                  const data = chartMap.get(dateStr);
                  if (tx.type === 'IN') data.in += tx.quantity;
                  else if (tx.type === 'OUT') data.out += tx.quantity;
              }
          });
          
          // Convert to array and reverse to show oldest to newest (left to right)
          setChartData(Array.from(chartMap.values()).reverse());
      }

    } catch (error) {
      console.error("Error fetching dashboard data", error);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [user]);

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h2>
          <p className="text-gray-500 mt-1">
            Welcome back, <span className="font-semibold text-indigo-600">{user?.name}</span>! Here's what's happening today.
          </p>
        </motion.div>

        {/* Quick Actions */}
        {/* <div className="flex gap-3">
            <Button 
                onClick={() => setIsBarcodeModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
            >
                <MdQrCode className="w-5 h-5 mr-2" />
                Scan Item
            </Button>
            {hasPermission('create_product') && (
                <Link href="/dashboard/products/add">
                    <Button variant="outline" className="bg-white hover:bg-gray-50">
                        <MdAdd className="w-5 h-5 mr-2" />
                        New Product
                    </Button>
                </Link>
            )}
        </div> */}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          index={0}
          title="Total Products"
          value={productCount}
          icon={MdShoppingBag}
          color="indigo"
        />
        <StatCard
          index={1}
          title="Total Catalogs"
          value={catalogCount}
          icon={MdCategory}
          color="yellow"
        />
        <StatCard
          index={2}
          title="Today's In"
          value={todayInCount}
          icon={MdInventory}
          color="green"
        />
        <StatCard
          index={3}
          title="Today's Out"
          value={todayOutCount}
          icon={MdTrendingUp}
          color="red"
        />
      </div>

      {/* Charts & Recent Activity */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <OverviewChart data={chartData} />
        <RecentTransactions transactions={recentTransactions} />
      </div> */}

      {/* Scan Modal */}
      {/* <ScanModal 
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        onSuccess={() => {
            fetchCounts();
        }}
      /> */}
    </div>
  );
}
