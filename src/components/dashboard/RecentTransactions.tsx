"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MdTrendingUp, MdTrendingDown } from "react-icons/md";
import { format } from "date-fns";

interface Transaction {
  _id: string;
  type: 'IN' | 'OUT';
  quantity: number;
  product: {
    name: string;
    sku: string;
  };
  createdAt: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No recent transactions</p>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-full ${
                      transaction.type === "IN"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {transaction.type === "IN" ? (
                      <MdTrendingUp className="w-5 h-5" />
                    ) : (
                      <MdTrendingDown className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {transaction.product?.name || "Unknown Product"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {transaction.product?.sku}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-sm font-bold ${
                      transaction.type === "IN"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "IN" ? "+" : "-"}
                    {transaction.quantity}
                  </span>
                  <span className="text-xs text-gray-400">
                    {format(new Date(transaction.createdAt), "MMM d, h:mm a")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
