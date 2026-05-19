"use client";

import { useFinanceStore } from "@/store/useFinanceStore";
import { formatCurrency, cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Edit2, AlertTriangle, IndianRupee, Tag, Trash2 } from "lucide-react";
import { Category } from "@/types";
import { useState, useMemo, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";

const defaultCategories = [
  "Food", "Tea", "Snack", "Transport", "Travel", "Shopping", "Dress", 
  "Office", "Rent", "Entertainment", "Health", "Utilities", "Salary", "Other"
];

export default function BudgetPage() {
  const { budgets, transactions, user, categories, setBudgets, addBudget, updateBudget, deleteBudget } = useFinanceStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newLimit, setNewLimit] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("Food");
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const response = await apiFetch("/budgets");
        setBudgets(response.data || response);
      } catch (error) {
        console.error("Failed to fetch budgets:", error);
      }
    };
    fetchBudgets();
  }, [setBudgets]);

  const allCategoryNames = useMemo(() => {
    const custom = (categories || []).map(c => c.name);
    return Array.from(new Set([...defaultCategories, ...custom]));
  }, [categories]);

  // Calculate spent per category
  const getSpent = (cat: string) => {
    return transactions
      .filter(t => t.category === cat && t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const handleAddBudget = async () => {
    if (!newLimit) return;
    try {
      const payload = { category: selectedCat, limit: parseFloat(newLimit) };
      if (editingBudgetId) {
        const response = await apiFetch(`/budgets/${editingBudgetId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        updateBudget(response.data || response);
      } else {
        const response = await apiFetch("/budgets", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        addBudget(response.data || response);
      }
      setNewLimit("");
      setIsAdding(false);
      setEditingBudgetId(null);
    } catch (error) {
      console.error("Failed to save budget:", error);
    }
  };

  const handleEdit = (id: string | undefined, category: string, currentLimit: number) => {
    setEditingBudgetId(id || category);
    setSelectedCat(category);
    setNewLimit(currentLimit.toString());
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string | undefined, category: string) => {
    if (window.confirm(`Are you sure you want to delete the budget for ${category}?`)) {
      try {
        if (id) {
          await apiFetch(`/budgets/${id}`, { method: "DELETE" });
        }
        deleteBudget(id || category);
      } catch (error) {
        console.error("Failed to delete budget:", error);
      }
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
        <Button 
          size="icon" 
          className="h-10 w-10 rounded-full shrink-0 shadow-lg shadow-primary/20" 
          onClick={() => {
            setEditingBudgetId(null);
            setIsAdding(!isAdding);
          }}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {isAdding && (
        <Card className="p-5 border-primary/20 bg-primary/5 shadow-sm rounded-[2rem]">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase text-primary ml-1">Set New Budget</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Category</label>
                <select 
                  className="w-full h-11 bg-background border-2 rounded-xl px-3 text-sm font-bold"
                  value={selectedCat}
                  onChange={(e) => setSelectedCat(e.target.value)}
                >
                  {allCategoryNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Monthly Limit (₹)</label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  className="h-11 border-2 rounded-xl text-lg font-bold"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1 h-11 rounded-xl font-bold" onClick={() => { setIsAdding(false); setEditingBudgetId(null); }}>Cancel</Button>
              <Button className="flex-1 h-11 rounded-xl font-bold" onClick={handleAddBudget}>Set Budget</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {budgets.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground bg-secondary/30 rounded-[2.5rem] border-2 border-dashed border-muted-foreground/10">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium text-sm">No budgets set yet</p>
          </div>
        ) : (
          budgets.map((budget) => {
            const spent = getSpent(budget.category as string);
            const percentage = Math.min((spent / budget.limit) * 100, 100);
            const isOver = spent > budget.limit;

            return (
              <Card key={budget.category as string} className="p-5 shadow-sm border-none bg-secondary/40 rounded-[2rem]">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border shadow-sm">
                        <IndianRupee className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-bold text-base">{budget.category as string}</h3>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleEdit(budget._id, budget.category as string, budget.limit)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-80 hover:opacity-100" onClick={() => handleDelete(budget._id, budget.category as string)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="space-y-0.5">
                        <p className="text-[10px] uppercase font-black text-muted-foreground opacity-50">Spent</p>
                        <p className={cn("text-lg font-black", isOver ? "text-destructive" : "text-foreground")}>
                          {formatCurrency(spent, user.currency)}
                        </p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <p className="text-[10px] uppercase font-black text-muted-foreground opacity-50">Budget</p>
                        <p className="text-sm font-bold text-muted-foreground">
                          {formatCurrency(budget.limit, user.currency)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="h-2.5 w-full bg-background rounded-full overflow-hidden border">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            isOver ? "bg-destructive" : "bg-primary"
                          )}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground opacity-60">
                        <span>{Math.round(percentage)}% Used</span>
                        <span>{isOver ? "Over Budget" : `${formatCurrency(budget.limit - spent, user.currency)} left`}</span>
                      </div>
                    </div>
                  </div>

                  {isOver && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-[11px] font-bold text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20"
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Warning: Limit exceeded by {formatCurrency(spent - budget.limit, user.currency)}</span>
                    </motion.div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
