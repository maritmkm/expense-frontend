"use client";

import { useFinanceStore } from "@/store/useFinanceStore";
import { formatCurrency, cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Search, Filter, Trash2, IndianRupee, X, Calendar, Loader2, Check, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useMemo } from "react";
import { apiFetch, BASE_URL } from "@/lib/api";
import { Category } from "@/types";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { toast } from "sonner";
import Link from "next/link";

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

export default function HistoryPage() {
  const { user, deleteTransaction: deleteFromStore, categories, setCategories } = useFinanceStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [tempCategory, setTempCategory] = useState<string>("all");
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  
  const [appliedCategory, setAppliedCategory] = useState<string>("all");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (appliedCategory !== "all") params.append("category", appliedCategory);
      if (appliedStartDate) params.append("startDate", appliedStartDate);
      if (appliedEndDate) params.append("endDate", appliedEndDate);
      params.append("limit", "100");

      const response = await apiFetch(`/expenses?${params.toString()}`);
      setTransactions(response.data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsLoading(false);
    }
  }, [search, appliedCategory, appliedStartDate, appliedEndDate]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await apiFetch("/categories");
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories");
      }
    };
    fetchCats();

    const timer = setTimeout(() => {
      fetchTransactions();
    }, 400);
    return () => clearTimeout(timer);
  }, [search, appliedCategory, appliedStartDate, appliedEndDate, fetchTransactions, setCategories]);

  const allCategories = useMemo(() => {
    const custom = (categories || []).map(c => ({ name: c.name, icon: c.icon }));
    return [...defaultCategories, ...custom];
  }, [categories]);

  const getCategoryIcon = (name: string) => {
    return allCategories.find(c => c.name === name)?.icon || "🏷️";
  };

  const applyFilters = () => {
    setAppliedCategory(tempCategory);
    setAppliedStartDate(tempStartDate);
    setAppliedEndDate(tempEndDate);
    setIsModalOpen(false);
  };

  const resetFilters = () => {
    setTempCategory("all");
    setTempStartDate("");
    setTempEndDate("");
    setAppliedCategory("all");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setIsModalOpen(false);
  };

  const grouped = transactions.reduce((acc, t) => {
    const date = new Date(t.date).toLocaleDateString("en-IN", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(t);
    return acc;
  }, {} as Record<string, any[]>);

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/expenses/${id}`, { method: "DELETE" });
      setTransactions(prev => prev.filter(t => (t._id || t.id) !== id));
      deleteFromStore(id);
      toast.success("Transaction deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-4 pb-24 relative min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">History</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setIsModalOpen(true)}
            className={cn(
              "rounded-full h-10 w-10 relative border-2 transition-all active:scale-95",
              (appliedCategory !== "all" || appliedStartDate || appliedEndDate) && "border-primary bg-primary/5 text-primary shadow-sm"
            )}
          >
            <Filter className="w-4 h-4" />
            {(appliedCategory !== "all" || appliedStartDate || appliedEndDate) && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-background" />
            )}
          </Button>
          <Link href="/dashboard/add">
            <Button size="icon" className="rounded-full h-10 w-10 shadow-lg shadow-primary/20 active:scale-95 transition-all">
              <Plus className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input 
          placeholder="Search notes..." 
          className="pl-9 h-10 rounded-xl border-2 bg-secondary/30 border-transparent focus:border-primary focus:bg-background transition-all text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-1.5">
        {appliedCategory !== "all" && (
          <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-bold flex items-center gap-1">
            {appliedCategory} <X className="w-3 h-3 cursor-pointer" onClick={() => { setAppliedCategory("all"); setTempCategory("all"); }} />
          </span>
        )}
        {(appliedStartDate || appliedEndDate) && (
          <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-bold flex items-center gap-1">
            Date Range <X className="w-3 h-3 cursor-pointer" onClick={() => { setAppliedStartDate(""); setAppliedEndDate(""); setTempStartDate(""); setTempEndDate(""); }} />
          </span>
        )}
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-background border-t rounded-t-[2rem] p-6 pb-8 z-50 shadow-2xl">
              <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-6" />
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold">Filter Transactions</h2>
                  <button onClick={resetFilters} className="text-xs font-bold text-destructive">Reset</button>
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold ml-1">Category</Label>
                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-0.5">
                      <button
                        onClick={() => setTempCategory("all")}
                        className={cn(
                          "px-1 py-2 rounded-lg text-[10px] font-bold border-2 transition-all",
                          tempCategory === "all" ? "bg-primary border-primary text-white" : "border-secondary bg-secondary/30"
                        )}
                      >
                        All
                      </button>
                      {allCategories.map(cat => (
                        <button
                          key={cat.name}
                          onClick={() => setTempCategory(cat.name)}
                          className={cn(
                            "px-1 py-2 rounded-lg text-[10px] font-bold border-2 transition-all",
                            tempCategory === cat.name ? "bg-primary border-primary text-white" : "border-secondary bg-secondary/30"
                          )}
                        >
                          {cat.icon} {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold ml-1">Date Range</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input type="date" value={tempStartDate} onChange={(e) => setTempStartDate(e.target.value)} className="h-10 rounded-lg text-xs" />
                      <Input type="date" value={tempEndDate} onChange={(e) => setTempEndDate(e.target.value)} className="h-10 rounded-lg text-xs" />
                    </div>
                  </div>
                </div>
                <Button size="lg" className="w-full h-12 rounded-xl text-sm font-bold" onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Results */}
      <div className="space-y-6">
        {Object.keys(grouped).length === 0 && !isLoading ? (
          <div className="text-center py-16 opacity-50">
            <Search className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm font-medium">No transactions found</p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, items]: [string, any]) => (
            <div key={date} className="space-y-2.5">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-70">{date}</h3>
              <div className="space-y-2">
                {items.map((t: any) => (
                  <Card key={t.id || t._id} className="p-3 border-none bg-secondary/40 hover:bg-secondary/60 transition-all rounded-2xl">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center overflow-hidden border shadow-sm shrink-0">
                          {t.attachment ? (
                            <img src={`${BASE_URL}${t.attachment}`} alt="Receipt" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl">{getCategoryIcon(t.category as string)}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm leading-tight mb-0.5">{t.category as string}</p>
                          <p className="text-xs text-muted-foreground font-medium break-words">
                            {t.note}
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-muted-foreground/60">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(t.date).toLocaleString("en-IN", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <p className={cn(
                          "font-bold text-base",
                          t.type === "income" ? "text-emerald-500" : "text-destructive"
                        )}>
                          {t.type === "income" ? "+" : "-"} {formatCurrency(t.amount, user.currency)}
                        </p>
                        <button 
                          onClick={() => handleDelete(t.id || t._id)}
                          className="p-1.5 text-muted-foreground/50 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
