"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/Card";
import { MdShoppingBag, MdInventory, MdTrendingUp } from "react-icons/md";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { productService } from "@/services/productService";
import { catalogService } from "@/services/catalogService";
import { stockService } from "@/services/stockService";

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
      <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300">
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
  const { user } = useAuth();
  const [productCount, setProductCount] = useState(0);
  const [catalogCount, setCatalogCount] = useState(0);
  const [todayInCount, setTodayInCount] = useState(0);
  const [todayOutCount, setTodayOutCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [prodRes, catRes, inRes, outRes] = await Promise.all([
          productService.getProducts({ page: 1, limit: 1 }),
          catalogService.getCatalogs({ page: 1, limit: 1 }),
          stockService.getTransactions({ page: 1, limit: 1, type: 'IN', date: 'today' }),
          stockService.getTransactions({ page: 1, limit: 1, type: 'OUT', date: 'today' }),
        ]);
        setProductCount(prodRes?.total || 0);
        setCatalogCount(catRes?.total || 0);
        setTodayInCount(inRes?.total || 0);
        setTodayOutCount(outRes?.total || 0);
      } catch (error) {
        // Silent fail to avoid breaking dashboard; values remain 0
        console.error("Error fetching dashboard counts", error);
      }
    };
    fetchCounts();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h2>
          <p className="text-gray-500 mt-1">
            Hi, {user?.name}!
          </p>
        </motion.div>
      </div>

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
          icon={MdInventory}
          color="yellow"
        />
        <StatCard
          index={2}
          title="Today IN"
          value={todayInCount}
          icon={MdTrendingUp}
          color="green"
        />
        <StatCard
          index={3}
          title="Today OUT"
          value={todayOutCount}
          icon={MdTrendingUp}
          color="red"
        />
      </div>
    </div>
  );
}
