"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import BarcodeModal from "@/components/BarcodeModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { MdAdd, MdEdit, MdDelete, MdQrCode, MdSearch, MdFilterList, MdShoppingBag } from "react-icons/md";
import { toast } from "react-hot-toast";
import { productService } from "@/services/productService";
import { catalogService } from "@/services/catalogService";
import ConfirmationModal from "@/components/ConfirmationModal";
import { Select } from "@/components/ui/Select";
import { Table, Column } from "@/components/ui/Table";

interface Product {
  _id: string;
  name: string;
  sku: string;
  catalog: { _id: string; name: string };
  stockQuantity: number;
  unitPrice: number;
}

interface Catalog {
  _id: string;
  name: string;
}

export default function ProductsPage() {
  const { user, hasPermission } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCatalog, setSelectedCatalog] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Confirmation Modal State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Barcode
  const [selectedProductSku, setSelectedProductSku] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page,
        limit: 10,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCatalog) params.catalog = selectedCatalog;

      const data = await productService.getProducts(params);
      setProducts(data.products || []);
      setTotalPages(data.pages || 1);
      setTotalItems(data.total || 0);
    } catch (error) {
      console.error("Error fetching products", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCatalogs = async () => {
    try {
      const data = await catalogService.getCatalogs({ limit: 1000 });
      setCatalogs(data.catalogs || []);
    } catch (error) {
      console.error("Error fetching catalogs", error);
    }
  };

  useEffect(() => {
    if (user && hasPermission('view_products')) {
      fetchCatalogs();
    }
  }, [user?._id]);

  useEffect(() => {
    if (user && hasPermission('view_products')) {
      fetchProducts();
    } else {
        setIsLoading(false);
    }
  }, [user?._id, page, debouncedSearch, selectedCatalog]);

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmation({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.id) return;
    
    setIsDeleting(true);
    try {
      await productService.deleteProduct(deleteConfirmation.id);
      toast.success("Product deleted successfully");
      fetchProducts();
      setDeleteConfirmation({ isOpen: false, id: null });
    } catch (error: any) {
      console.error("Error deleting product", error);
      const errorMessage = error.response?.data?.message || "Error deleting product";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity <= 5) return 'danger';
    if (quantity <= 20) return 'warning';
    return 'success';
  };

  const columns: Column<Product>[] = [
    {
      header: "Catalog",
      render: (product) => (
        <span className="text-sm text-gray-600">
          {product.catalog?.name || "Uncategorized"}
        </span>
      ),
    },
    {
      header: "Product Name",
      render: (product) => (
        <span className="text-sm font-medium text-gray-900">{product.name}</span>
      ),
    },
    {
      header: "SKU",
      render: (product) => (
        <span className="text-xs text-gray-500">{product.sku}</span>
      ),
    },
    {
      header: "Stock",
      render: (product) => (
        <Badge variant={getStockStatus(product.stockQuantity)}>
          {product.stockQuantity} in stock
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (product) => (
        <div className="flex justify-end gap-2">
          {hasPermission('edit_product') && (
            <Link href={`/dashboard/products/edit/${product._id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
              >
                <MdEdit className="w-4 h-4" />
              </Button>
            </Link>
          )}
          {hasPermission('delete_product') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(product._id)}
              className="text-red-600 hover:text-red-900 hover:bg-red-50"
            >
              <MdDelete className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (!hasPermission('view_products')) {
      return (
        <div className="p-8 flex items-center justify-center h-full">
            <Card className="w-full max-w-md text-center p-8">
                <MdShoppingBag className="w-16 h-16 mx-auto text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-gray-600">You do not have permission to view products.</p>
            </Card>
        </div>
      );
  }

  return (
    <>
      <main className=" space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Product Management</h2>
            <p className="text-gray-500 mt-1">Manage your inventory items</p>
          </div>
          {hasPermission('create_product') && (
            <Link href="/dashboard/products/add">
                <Button className="flex items-center gap-2">
                <MdAdd className="w-5 h-5" />
                Add Product
                </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <Input
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative min-w-[200px]">
            <MdFilterList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <Select
              value={selectedCatalog}
              onChange={(val) => {
                  setSelectedCatalog(String(val));
                  setPage(1); // Reset page on filter change
              }}
              options={[
                { value: "", label: "All Catalogs" },
                ...catalogs.map((c) => ({ value: c._id, label: c.name }))
              ]}
              className="pl-10"
              placeholder="All Catalogs"
            />
          </div>
        </div>

        {/* Products Table */}
        <Table
          data={products}
          columns={columns}
          isLoading={isLoading}
          pagination={{
            currentPage: page,
            totalPages,
            totalItems,
            onPageChange: setPage
          }}
          emptyMessage="No products found matching your filters."
        />
      </main>

      {/* Barcode Modal */}
      {selectedProductSku && (
        <BarcodeModal
          sku={selectedProductSku}
          productName={selectedProductName || undefined}
          onClose={() => {
            selectedProductSku && setSelectedProductSku(null);
            selectedProductName && setSelectedProductName(null);
          }}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </>
  );
}
