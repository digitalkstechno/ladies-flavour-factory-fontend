import React from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { Button } from './Button';
import { Card } from './Card';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
  emptyMessage?: string;
  headerContent?: React.ReactNode;
}

export function Table<T>({
  columns,
  data,
  isLoading,
  pagination,
  emptyMessage = "No data available",
  headerContent,
}: TableProps<T>) {
  return (
    <Card noPadding className="overflow-hidden">
      {headerContent && (
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          {headerContent}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className={`px-6 py-3 whitespace-nowrap text-sm text-gray-700 ${column.className || ''}`}>
                      {column.render
                        ? column.render(item)
                        : column.accessorKey
                        ? (item[column.accessorKey] as React.ReactNode)
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && !isLoading && data.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="text-sm text-gray-700">
            Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
            <span className="font-medium">{pagination.totalPages}</span>
            {pagination.totalItems > 0 && (
              <span className="ml-1">({pagination.totalItems} results)</span>
            )}
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <Button
                variant="outline"
                disabled={pagination.currentPage === 1}
                onClick={() => pagination.onPageChange(Math.max(1, pagination.currentPage - 1))}
                className="rounded-l-md rounded-r-none px-2 py-2"
              >
                <span className="sr-only">Previous</span>
                <MdChevronLeft className="h-5 w-5" aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0}
                onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                className="rounded-r-md rounded-l-none px-2 py-2"
              >
                <span className="sr-only">Next</span>
                <MdChevronRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </nav>
          </div>
        </div>
      )}
    </Card>
  );
}
