"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface ChartData {
  name: string;
  in: number;
  out: number;
}

interface OverviewChartProps {
  data: ChartData[];
}

export default function OverviewChart({ data }: OverviewChartProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Weekly Stock Overview</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                    dataKey="name" 
                    stroke="#64748B" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                />
                <YAxis 
                    stroke="#64748B" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`} 
                />
                <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ 
                        backgroundColor: '#fff', 
                        borderRadius: '8px', 
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                />
                <Legend />
                <Bar 
                    dataKey="in" 
                    name="Stock In" 
                    fill="#10B981" 
                    radius={[4, 4, 0, 0]} 
                    barSize={20}
                />
                <Bar 
                    dataKey="out" 
                    name="Stock Out" 
                    fill="#EF4444" 
                    radius={[4, 4, 0, 0]} 
                    barSize={20}
                />
            </BarChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
