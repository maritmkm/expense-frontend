"use client";

import { useFinanceStore } from "@/store/useFinanceStore";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, ArrowUpRight, ArrowDownRight, IndianRupee, Bell } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { apiFetch, BASE_URL } from "@/lib/api";
import { useEffect, useMemo } from "react";
import Link from "next/link";

const chartData = [
  { name: "Mon", amount: 400 },
  { name: "Tue", amount: 300 },
  { name: "Wed", amount: 600 },
  { name: "Thu", amount: 800 },
  { name: "Fri", amount: 500 },
  { name: "Sat", amount: 900 },
  { name: "Sun", amount: 700 },
];

const defaultCategories = [
  { name: "Food", icon: "🍔" },
  { name: "Tea", icon: "☕" },
  { name: "Snack", icon: "🍿" },
  { name: "Transport", icon: "🚗" },
  { name: "Travel", icon: "✈️" },
  { name: "Shopping", icon: "🛍️" },
  { name: "Dress", icon: "👗" },
  { name: "Office", icon: "🏢" },
  { name: "Rent", icon: "🏠" },
  { name: "Entertainment", icon: "🎬" },
  { name: "Health", icon: "🏥" },
  { name: "Utilities", icon: "💡" },
  { name: "Salary", icon: "💰" },
  { name: "Other", icon: "📦" },
];

export default function DashboardPage() {
  const { user, transactions, setTransactions, categories } = useFinanceStore();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await apiFetch("/expenses");
        setTransactions(response.data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      }
    };
    fetchTransactions();
  }, [setTransactions]);
  
  const allCategories = useMemo(() => {
    const custom = (categories || []).map(c => ({ name: c.name, icon: c.icon }));
    return [...defaultCategories, ...custom];
  }, [categories]);

  const getCategoryIcon = (name: string) => {
    return allCategories.find(c => c.name === name)?.icon || "🏷️";
  };

  const totalBalance = transactions.reduce((acc, t) => 
    t.type === "income" ? acc + t.amount : acc - t.amount, 0
  );

  const monthlyIncome = transactions
    .filter(t => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const monthlyExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center w-full">
        <div>
          <p className="text-muted-foreground text-sm font-medium">Welcome back,</p>
          <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
        </div>
        <Button variant="outline" size="icon" className="h-10 w-10 rounded-full relative bg-background/50 backdrop-blur-sm border-muted-foreground/10 hover:bg-background/80 transition-all shrink-0 active:scale-95 shadow-sm">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive border-2 border-background rounded-full" />
        </Button>
      </div>

      {/* Balance Card */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <Card className="bg-primary text-primary-foreground border-none shadow-xl overflow-hidden relative rounded-[2.5rem]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <CardContent className="p-8">
            <div className="flex items-center gap-2 opacity-80 mb-2">
              <IndianRupee className="w-4 h-4" />
              <span className="text-sm font-medium">Total Balance</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-8">
              {formatCurrency(totalBalance, user.currency)}
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md">
                <div className="flex items-center gap-1 text-[10px] uppercase font-black opacity-80 mb-1">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>Income</span>
                </div>
                <p className="font-bold text-lg">{formatCurrency(monthlyIncome, user.currency)}</p>
              </div>
              <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md">
                <div className="flex items-center gap-1 text-[10px] uppercase font-black opacity-80 mb-1">
                  <ArrowDownRight className="w-3 h-3" />
                  <span>Expenses</span>
                </div>
                <p className="font-bold text-lg">{formatCurrency(monthlyExpense, user.currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold">Recent Transactions</h3>
          <Link href="/history" className="text-primary text-sm font-bold">View all</Link>
        </div>
        <div className="space-y-2">
          {transactions.length === 0 ? (
            <div className="text-center py-10 bg-secondary/30 rounded-[2rem] border-2 border-dashed">
              <p className="text-sm text-muted-foreground italic">No transactions yet</p>
            </div>
          ) : (
            transactions.slice(0, 5).map((t) => (
              <Card key={t.id || t._id} className="p-3 border-none bg-secondary/40 rounded-2xl hover:bg-secondary/60 transition-all">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center overflow-hidden border shadow-sm">
                      {t.attachment ? (
                        <img src={`${BASE_URL}${t.attachment}`} alt="Receipt" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">{getCategoryIcon(t.category as string)}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-tight mb-0.5">{t.category as string}</p>
                      <p className="text-xs text-muted-foreground font-medium line-clamp-1">{t.note}</p>
                    </div>
                  </div>
                  <p className={cn(
                    "font-bold text-base",
                    t.type === "income" ? "text-emerald-500" : "text-destructive"
                  )}>
                    {t.type === "income" ? "+" : "-"} {formatCurrency(t.amount, user.currency)}
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <Link href="/dashboard/add">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center z-50 shadow-primary/40"
        >
          <Plus className="w-7 h-7" />
        </motion.button>
      </Link>
    </div>
  );
}
