"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { MdCloudUpload, MdDelete, MdAutorenew, MdSave, MdArrowBack } from "react-icons/md";
import { Card } from "@/components/ui/Card";

interface Category {
  _id: string;
  name: string;
}

interface ProductFormData {
  name: string;
  sku: string;
  category: string;
  description: string;
  images: string[];
  unitPrice: number;
  costPrice: number;
  stockQuantity: number;
}

interface ProductFormProps {
  initialData?: ProductFormData & { _id?: string };
  isEdit?: boolean;
}

export default function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    sku: "",
    category: "",
    description: "",
    images: [],
    unitPrice: 0,
    costPrice: 0,
    stockQuantity: 0,
  });

  const [imageInput, setImageInput] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        sku: initialData.sku || "",
        category: initialData.category || "",
        description: initialData.description || "",
        images: initialData.images || [],
        unitPrice: initialData.unitPrice || 0,
        costPrice: initialData.costPrice || 0,
        stockQuantity: initialData.stockQuantity || 0,
      });
    }
  }, [initialData]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/categories", {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };

    if (user) {
      fetchCategories();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "unitPrice" || name === "costPrice" || name === "stockQuantity" ? Number(value) : value,
    }));
  };

  const generateSku = () => {
    const prefix = formData.name ? formData.name.substring(0, 3).toUpperCase() : "PROD";
    const random = Math.floor(1000 + Math.random() * 9000);
    const sku = `${prefix}-${random}`;
    setFormData(prev => ({ ...prev, sku }));
  };

  const handleAddImage = () => {
    if (imageInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageInput.trim()],
      }));
      setImageInput("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const config = {
        headers: { Authorization: `Bearer ${user?.token}` },
      };

      if (isEdit && initialData?._id) {
        await axios.put(
          `http://localhost:5000/api/products/${initialData._id}`,
          formData,
          config
        );
      } else {
        await axios.post("http://localhost:5000/api/products", formData, config);
      }

      router.push("/dashboard/products");
    } catch (error) {
      console.error("Error saving product", error);
      alert("Error saving product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <Input
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. Summer Dress"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    label="SKU (Stock Keeping Unit)"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                    placeholder="e.g. SUM-1234"
                  />
                  <button
                    type="button"
                    onClick={generateSku}
                    className="absolute right-2 top-[30px] text-gray-400 hover:text-indigo-600 p-1"
                    title="Auto-generate SKU"
                  >
                    <MdAutorenew className="w-5 h-5" />
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Textarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Product description..."
              />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Inventory</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Unit Price ($)"
                name="unitPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.unitPrice}
                onChange={handleChange}
                required
              />
              <Input
                label="Cost Price ($)"
                name="costPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.costPrice}
                onChange={handleChange}
                required
              />
              <Input
                label="Initial Stock"
                name="stockQuantity"
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={handleChange}
                required
              />
            </div>
          </Card>
        </div>

        {/* Right Column - Images & Actions */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  placeholder="Image URL"
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddImage} variant="secondary">
                  <MdCloudUpload className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={img}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/150")}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MdDelete className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {formData.images.length === 0 && (
                  <div className="col-span-2 flex items-center justify-center h-32 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <span className="text-sm">No images added</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              size="lg"
              className="w-full flex justify-center items-center gap-2"
              isLoading={isSubmitting}
            >
              <MdSave className="w-5 h-5" />
              {isEdit ? "Update Product" : "Create Product"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
