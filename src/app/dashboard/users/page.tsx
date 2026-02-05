"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MdAdd, MdEdit, MdDelete, MdPerson, MdEmail, MdSearch } from "react-icons/md";
import { toast } from "react-hot-toast";
import { userService } from "@/services/userService";
import { roleService } from "@/services/roleService";
import ConfirmationModal from "@/components/ConfirmationModal";
import { Select } from "@/components/ui/Select";
import { Table, Column } from "@/components/ui/Table";

interface Role {
    _id: string;
    name: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
}

export default function UsersPage() {
  const { user, hasPermission } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmation Modal State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const columns: Column<User>[] = [
    {
      header: "Name",
      render: (u) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
              <MdPerson className="w-4 h-4" />
          </div>
          <div className="text-sm font-medium text-gray-900">{u.name}</div>
        </div>
      )
    },
    {
      header: "Email",
      render: (u) => (
        <div className="flex items-center text-sm text-gray-500">
            <MdEmail className="w-4 h-4 mr-2 text-gray-400" />
            {u.email}
        </div>
      )
    },
    {
      header: "Role",
      render: (u) => (
        <Badge variant={u.role?.name === 'Admin' ? 'danger' : 'success'}>
            {u.role?.name || 'No Role'}
        </Badge>
      )
    },
    {
      header: "Actions",
      className: "text-right",
      render: (u) => (
        <div className="flex justify-end gap-2">
          {hasPermission('edit_user') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEditModal(u)}
              className="text-indigo-600 hover:text-indigo-900"
            >
              <MdEdit className="w-4 h-4" />
            </Button>
          )}
          {hasPermission('delete_user') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(u._id)}
              className="text-red-600 hover:text-red-900"
            >
              <MdDelete className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      const [usersData, rolesData] = await Promise.all([
        userService.getUsers({ page, limit: 10, search: debouncedSearch }),
        roleService.getRoles({ limit: 1000 })
      ]);

      setUsers(usersData.users || []);
      setTotalPages(usersData.pages || 1);
      setTotalItems(usersData.total || 0);
      setRoles(rolesData.roles || []);
    } catch (error) {
      console.error("Error fetching data", error);
      toast.error("Failed to fetch data");
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
    if (user && hasPermission('view_users')) {
      fetchData();
    } else {
        setIsLoading(false);
    }
  }, [user?._id, page, debouncedSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = {
        name,
        email,
        role: roleId,
      };

      if (password) {
        payload.password = password;
      }

      if (editingUser) {
        await userService.updateUser(editingUser._id, payload);
        toast.success("User updated successfully");
      } else {
        await userService.createUser(payload);
        toast.success("User created successfully");
      }

      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error("Error saving user", error);
      const errorMessage = error.response?.data?.message || "Error saving user";
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
      await userService.deleteUser(deleteConfirmation.id);
      toast.success("User deleted successfully");
      fetchData();
      setDeleteConfirmation({ isOpen: false, id: null });
    } catch (error: any) {
      console.error("Error deleting user", error);
      const errorMessage = error.response?.data?.message || "Error deleting user";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setName(userToEdit.name);
    setEmail(userToEdit.email);
    setRoleId(userToEdit.role?._id || "");
    setPassword(""); // Don't show password
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setRoleId(roles.length > 0 ? roles[0]._id : "");
  };

  if (!hasPermission('view_users')) {
      return (
        <div className="p-8 flex items-center justify-center h-full">
            <Card className="w-full max-w-md text-center p-8">
                <MdPerson className="w-16 h-16 mx-auto text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-gray-600">You do not have permission to view users.</p>
            </Card>
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500">Manage system users and assign roles</p>
        </div>
        {hasPermission('create_user') && (
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <MdAdd className="w-5 h-5" />
            Add User
          </Button>
        )}
      </div>

      <Table
        headerContent={
          <div className="relative max-w-md">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        }
        data={users}
        columns={columns}
        isLoading={isLoading}
        pagination={{
          currentPage: page,
          totalPages,
          totalItems,
          onPageChange: setPage
        }}
        emptyMessage="No users found matching your search."
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        isLoading={isDeleting}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Edit User" : "Add User"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={editingUser ? "Leave blank to keep current" : "Password"}
              required={!editingUser}
            />
          </div>
          <div>
            <Select
              label="Role"
              value={roleId}
              onChange={(val) => setRoleId(String(val))}
              options={[
                { value: "", label: "Select a role" },
                ...roles.map(r => ({ value: r._id, label: r.name }))
              ]}
              placeholder="Select a role"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
            >
                Cancel
            </Button>
            <Button
                type="submit"
                isLoading={isSubmitting}
            >
                {editingUser ? "Update User" : "Create User"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
