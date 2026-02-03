"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MdPictureAsPdf, MdGridOn } from "react-icons/md";
import { reportService } from "@/services/reportService";
import { Badge } from "@/components/ui/Badge";

interface Product {
  _id: string;
  name: string;
  sku: string;
  catalog: { name: string };
  stockQuantity: number;
  unitPrice: number;
  costPrice: number;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const data = await reportService.getInventoryReport();
        setProducts(data.products);
      } catch (error) {
        console.error("Error fetching report data", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchReportData();
    }
  }, [user]);

  const handleExportExcel = async () => {
    try {
      const blob = await reportService.exportInventoryExcel();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventory_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting Excel", error);
    }
  };

  const handleExportPDF = async () => {
    try {
      const blob = await reportService.exportInventoryPDF();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventory_report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting PDF", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Reports</h1>
            <p className="text-sm text-gray-500">Overview of stock</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white flex items-center gap-2"
          >
            <MdGridOn className="w-5 h-5" />
            Export Excel
          </Button>
          <Button
            onClick={handleExportPDF}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white flex items-center gap-2"
          >
            <MdPictureAsPdf className="w-5 h-5" />
            Export PDF
          </Button>
        </div>
      </div>

      <Card noPadding>
        <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Stock List</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catalog</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">Loading data...</td>
                </tr>
                ) : products.length === 0 ? (
                <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">No data found</td>
                </tr>
                ) : (
                products.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.catalog?.name || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {p.stockQuantity < 10 ? (
                            <Badge variant="warning">{p.stockQuantity}</Badge>
                        ) : (
                            p.stockQuantity
                        )}
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
      </Card>
    </div>
  );
}
