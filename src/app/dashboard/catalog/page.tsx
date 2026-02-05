"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { MdAdd, MdEdit, MdDelete, MdSearch, MdCategory } from "react-icons/md";
import { toast } from "react-hot-toast";
import { catalogService } from "@/services/catalogService";
import ConfirmationModal from "@/components/ConfirmationModal";
import { Table, Column } from "@/components/ui/Table";


interface Catalog {
  _id: string;
  name: string;
  code: string;
}

export default function CatalogPage() {
  const { user, hasPermission } = useAuth();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<Catalog | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmation Modal State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const columns: Column<Catalog>[] = [
    {
      header: "Name",
      render: (catalog) => <span className="text-sm font-medium text-gray-900">{catalog.name}</span>,
    },
    {
      header: "Code",
      render: (catalog) => <span className="text-sm text-gray-500 font-mono">{catalog.code}</span>,
    },
    {
      header: "Actions",
      className: "text-right",
      render: (catalog) => (
        hasPermission('manage_catalog') ? (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => openEditModal(catalog)}
              className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
              title="Edit"
            >
              <MdEdit className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDeleteClick(catalog._id)}
              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete"
            >
              <MdDelete className="w-5 h-5" />
            </button>
          </div>
        ) : null
      ),
    },
  ];

  const fetchCatalogs = async () => {
    setIsLoading(true);
    try {
      const data = await catalogService.getCatalogs({
        page,
        limit: 10,
        search: debouncedSearch
      });
      setCatalogs(data.catalogs || []);
      setTotalPages(data.pages || 1);
      setTotalItems(data.total || 0);
    } catch (error) {
      console.error("Error fetching catalogs", error);
      toast.error("Failed to fetch catalogs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (user && hasPermission('view_catalog')) {
      fetchCatalogs();
    } else {
        setIsLoading(false);
    }
  }, [user?._id, page, debouncedSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        code,
      };

      if (editingCatalog) {
        await catalogService.updateCatalog(editingCatalog._id, payload);
        toast.success("Catalog updated successfully");
      } else {
        await catalogService.createCatalog(payload);
        toast.success("Catalog created successfully");
      }

      setIsModalOpen(false);
      resetForm();
      fetchCatalogs();
    } catch (error: any) {
      console.error("Error saving catalog", error);
      const errorMessage = error.response?.data?.message || "Error saving catalog";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmation({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.id) return;
    
    setIsDeleting(true);
    try {
      await catalogService.deleteCatalog(deleteConfirmation.id);
      toast.success("Catalog deleted successfully");
      fetchCatalogs();
      setDeleteConfirmation({ isOpen: false, id: null });
    } catch (error: any) {
      console.error("Error deleting catalog", error);
      const errorMessage = error.response?.data?.message || "Error deleting catalog";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (catalog: Catalog) => {
    setEditingCatalog(catalog);
    setName(catalog.name);
    setCode(catalog.code);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingCatalog(null);
    setName("");
    setCode("");
  };

  if (!hasPermission('view_catalog')) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
          <Card className="w-full max-w-md text-center p-8">
              <MdCategory className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">You do not have permission to view catalogs.</p>
          </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Catalog Master</h2>
          <p className="text-gray-500 mt-1">Manage your product catalogs</p>
        </div>
        {hasPermission('manage_catalog') && (
            <Button
            onClick={() => {
                resetForm();
                setIsModalOpen(true);
            }}
            className="flex items-center gap-2"
            >
            <MdAdd className="w-5 h-5" />
            Add Catalog
            </Button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1 max-w-md">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search catalogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Data Table */}
      <Table
        data={catalogs}
        columns={columns}
        isLoading={isLoading}
        pagination={{
          currentPage: page,
          totalPages,
          totalItems,
          onPageChange: setPage
        }}
        emptyMessage="No catalogs found"
      />

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Catalog"
        message="Are you sure you want to delete this catalog? This action cannot be undone."
        isLoading={isDeleting}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCatalog ? "Edit Catalog" : "Add New Catalog"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Spices"
          />
          <Input
            label="Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            placeholder="e.g. CAT001"
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
            >
              {editingCatalog ? "Update Catalog" : "Create Catalog"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
