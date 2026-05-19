"use client";

import { useFinanceStore } from "@/store/useFinanceStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Legend
} from "recharts";
import { ArrowUpRight, TrendingDown, Target } from "lucide-react";

export default function AnalyticsPage() {
  const { transactions, user } = useFinanceStore();

  const expenseTransactions = transactions.filter(t => t.type === "expense");
  
  // Data for Pie Chart
  const categoryData = expenseTransactions.reduce((acc, t) => {
    const existing = acc.find(item => item.name === t.category);
    if (existing) {
      existing.value += t.amount;
    } else {
      acc.push({ name: t.category, value: t.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = [
    "hsl(158, 64%, 52%)", 
    "hsl(173, 58%, 39%)", 
    "hsl(197, 37%, 24%)", 
    "hsl(43, 74%, 66%)", 
    "hsl(27, 87%, 67%)",
    "hsl(0, 84.2%, 60.2%)",
    "hsl(224, 71.4%, 4.1%)",
  ];

  // Dummy weekly data
  const weeklyData = [
    { day: "Mon", amount: 45 },
    { day: "Tue", amount: 52 },
    { day: "Wed", amount: 38 },
    { day: "Thu", amount: 65 },
    { day: "Fri", amount: 48 },
    { day: "Sat", amount: 85 },
    { day: "Sun", amount: 25 },
  ];

  return (
    <div className="space-y-6 pb-24">
      <h1 className="text-2xl font-bold">Spending Insights</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900">
          <ArrowUpRight className="text-emerald-500 w-5 h-5 mb-2" />
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Top Category</p>
          <p className="text-lg font-bold">
            {categoryData.sort((a, b) => b.value - a.value)[0]?.name || "N/A"}
          </p>
        </Card>
        <Card className="p-4 bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900">
          <TrendingDown className="text-orange-500 w-5 h-5 mb-2" />
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Daily Avg</p>
          <p className="text-lg font-bold">{formatCurrency(45.50, user.currency)}</p>
        </Card>
      </div>

      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No expense data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: "hsl(var(--secondary))" }}
                contentStyle={{ borderRadius: "12px", border: "none" }}
              />
              <Bar 
                dataKey="amount" 
                fill="hsl(var(--primary))" 
                radius={[6, 6, 0, 0]} 
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insight Card */}
      <Card className="bg-primary/10 border-primary/20">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
            <Target className="text-primary-foreground w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold">Smart Tip</h4>
            <p className="text-sm text-muted-foreground mt-1">
              You spent 15% more on <span className="text-primary font-medium">Food</span> this week compared to last week. Consider setting a budget.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
