"use client";

import Link from "next/link";
import { MdArrowBack } from "react-icons/md";
import { Button } from "@/components/ui/Button";
import ProductForm from "@/components/ProductForm";
import { useAuth } from "@/context/AuthContext";

export default function AddProductPage() {
  const { user } = useAuth();

  return (
    <main className=" mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard/products">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <MdArrowBack className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-sm text-gray-500">Create a new product in your inventory</p>
        </div>
      </div>
      <ProductForm />
    </main>
  );
}
