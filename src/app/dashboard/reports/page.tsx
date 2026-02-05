"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MdPictureAsPdf, MdGridOn, MdSearch } from "react-icons/md";
import { reportService } from "@/services/reportService";
import { Badge } from "@/components/ui/Badge";
import { Table, Column } from "@/components/ui/Table";

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

  // Pagination and Search state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        const data = await reportService.getInventoryReport(page, 10, debouncedSearch);
        setProducts(data.products);
        setTotalPages(data.pages);
        setTotalItems(data.total);
      } catch (error) {
        console.error("Error fetching report data", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchReportData();
    }
  }, [user, page, debouncedSearch]);

  const handleExportExcel = async () => {
    try {
      const blob = await reportService.exportInventoryExcel(debouncedSearch);
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
      const blob = await reportService.exportInventoryPDF(debouncedSearch);
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

  const columns: Column<Product>[] = [
    {
      header: "Catalog",
      render: (p) => <span className="text-sm text-gray-500">{p.catalog?.name || "-"}</span>,
    },
    {
      header: "Product Name",
      render: (p) => <span className="text-sm font-medium text-gray-900">{p.name}</span>,
    },
    {
      header: "SKU",
      render: (p) => <span className="text-sm text-gray-500">{p.sku}</span>,
    },
    {
      header: "Stock",
      render: (p) => (
        <span className="text-sm text-gray-500">
          {p.stockQuantity < 10 ? (
            <Badge variant="warning">{p.stockQuantity}</Badge>
          ) : (
            p.stockQuantity
          )}
        </span>
      ),
    },
  ];

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

      <Table
        headerContent={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Stock List</h3>
            <div className="relative max-w-sm w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        }
        data={products}
        columns={columns}
        isLoading={isLoading}
        pagination={{
          currentPage: page,
          totalPages,
          totalItems,
          onPageChange: setPage
        }}
        emptyMessage="No data found"
      />
    </div>
  );
}
