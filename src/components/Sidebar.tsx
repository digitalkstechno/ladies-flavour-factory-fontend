"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  MdDashboard, 
  MdCategory, 
  MdShoppingBag, 
  MdInventory, 
  MdPeople, 
  MdAssessment, 
  MdQrCode,
  MdLogout,
  MdSecurity
} from "react-icons/md";
import { clsx } from "clsx";

export default function Sidebar() {
  const { user, logout, hasPermission } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => {
    // Exact match for dashboard home, prefix match for others
    if (path === "/dashboard" && pathname !== "/dashboard") return false;
    return pathname.startsWith(path);
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: MdDashboard, permission: "view_dashboard" },
    { name: "Categories", href: "/dashboard/categories", icon: MdCategory, permission: "view_categories" },
    { name: "Products", href: "/dashboard/products", icon: MdShoppingBag, permission: "view_products" },
    { name: "Stock", href: "/dashboard/stock", icon: MdInventory, permission: "manage_stock" },
    { name: "Barcodes", href: "/dashboard/barcodes", icon: MdQrCode, permission: "view_barcodes" },
    { name: "Reports", href: "/dashboard/reports", icon: MdAssessment, permission: "view_reports" },
    { name: "Users", href: "/dashboard/users", icon: MdPeople, permission: "manage_users" },
    { name: "Roles", href: "/dashboard/roles", icon: MdSecurity, permission: "manage_roles" },
  ];

  return (
    <aside className="w-64 bg-white shadow-xl hidden md:flex flex-col h-screen sticky top-0 z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-center border-b border-gray-100 bg-indigo-600">
        <h1 className="text-xl font-bold text-white tracking-wide">
          LFF Admin
        </h1>
      </div>

      {/* User Profile Summary */}
      <div className="p-6 border-b border-gray-50 bg-gray-50/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate capitalize">
              {user?.role?.name || "Role"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          if (item.permission && !hasPermission(item.permission)) return null;
          
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group",
                active
                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={clsx(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  active ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-500"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <MdLogout className="mr-3 h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
