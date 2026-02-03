"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { MdAdd, MdInventory } from "react-icons/md";
import { toast } from "react-hot-toast";
import { stockService } from "@/services/stockService";
import { productService } from "@/services/productService";

interface StockTransaction {
  _id: string;
  product: { 
    name: string; 
    sku: string;
    catalog?: { name: string };
  };
  user: { name: string };
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  reason: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  sku: string;
}

export default function StockPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'IN' | 'OUT'>('IN');

  // Form State
  const [productId, setProductId] = useState("");
  const [type, setType] = useState("IN");
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTransactions = async () => {
    try {
      const data = await stockService.getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data.products);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchProducts();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await stockService.createTransaction({
        productId,
        type,
        quantity,
        reason,
      });
      toast.success("Stock transaction added successfully");

      setIsModalOpen(false);
      resetForm();
      fetchTransactions();
    } catch (error: any) {
      console.error("Error adding stock entry", error);
      const errorMessage = error.response?.data?.message || "Error adding stock entry";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setProductId("");
    setType("IN");
    setQuantity(0);
    setReason("");
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'IN': return 'success';
      case 'OUT': return 'danger';
      case 'ADJUSTMENT': return 'warning';
      default: return 'default';
    }
  };

  const filteredTransactions = transactions.filter(tx => tx.type === activeTab);

  return (
    <main className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <MdInventory className="text-indigo-600" />
            Stock Management
          </h1>
          <p className="text-gray-500 mt-1">Track inventory movements and adjustments.</p>
        </div>
        {/* <Button onClick={() => setIsModalOpen(true)}>
          <MdAdd className="w-5 h-5 mr-2" />
          New Stock Entry
        </Button> */}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('IN')}
            className={`${
              activeTab === 'IN'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            In Stock
          </button>
          <button
            onClick={() => setActiveTab('OUT')}
            className={`${
              activeTab === 'OUT'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Out Stock
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catalog</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading transactions...</td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No transactions found</td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.product?.catalog?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tx.product?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.product?.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getTypeColor(tx.type)}>
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tx.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.user?.name}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="secondary" disabled>
          Previous
        </Button>
        <Button variant="secondary" disabled>
          Next
        </Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Stock Entry"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              required
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            >
              <option value="IN">Stock IN (Add)</option>
              <option value="OUT">Stock OUT (Remove)</option>
              <option value="ADJUSTMENT">Adjustment (Correction)</option>
            </select>
          </div>

          <Input
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
            min={1}
            placeholder="Enter quantity"
          />

          <Textarea
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for this transaction (optional)"
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
            >
              Save Transaction
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
