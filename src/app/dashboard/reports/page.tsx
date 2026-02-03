"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MdPictureAsPdf, MdGridOn, MdSearch, MdChevronLeft, MdChevronRight } from "react-icons/md";
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
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Stock List</h3>
            
            {/* Search Input */}
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
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">Loading data...</td>
                </tr>
                ) : products.length === 0 ? (
                <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No data found</td>
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

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
                <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium"
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    disabled={page === totalPages || totalPages === 0}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium"
                >
                    Next
                </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                        {totalItems > 0 && <span className="ml-1">({totalItems} results)</span>}
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <Button
                            variant="outline"
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="rounded-l-md rounded-r-none px-2 py-2"
                        >
                            <span className="sr-only">Previous</span>
                            <MdChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </Button>
                        <Button
                            variant="outline"
                            disabled={page === totalPages || totalPages === 0}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="rounded-r-md rounded-l-none px-2 py-2"
                        >
                            <span className="sr-only">Next</span>
                            <MdChevronRight className="h-5 w-5" aria-hidden="true" />
                        </Button>
                    </nav>
                </div>
            </div>
        </div>
      </Card>
    </div>
  );
}
