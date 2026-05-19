"use client";

import { useFinanceStore } from "@/store/useFinanceStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Trash2, Plus, X, Loader2, Check, Search, Tag } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

const defaultCategories = [
  { name: "Food", icon: "🍔", isDefault: true },
  { name: "Tea", icon: "☕", isDefault: true },
  { name: "Snack", icon: "🍿", isDefault: true },
  { name: "Transport", icon: "🚗", isDefault: true },
  { name: "Travel", icon: "✈️", isDefault: true },
  { name: "Shopping", icon: "🛍️", isDefault: true },
  { name: "Dress", icon: "👗", isDefault: true },
  { name: "Office", icon: "🏢", isDefault: true },
  { name: "Rent", icon: "🏠", isDefault: true },
  { name: "Entertainment", icon: "🎬", isDefault: true },
  { name: "Health", icon: "🏥", isDefault: true },
  { name: "Utilities", icon: "💡", isDefault: true },
  { name: "Salary", icon: "💰", isDefault: true },
  { name: "Other", icon: "📦", isDefault: true },
];

export default function CategoriesPage() {
  const { categories, setCategories, addCategory, deleteCategory } = useFinanceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  // New Category State
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🏷️");
  const [isSaving, setIsSaving] = useState(false);

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
  }, [setCategories]);

  const filteredCategories = useMemo(() => {
    const custom = (categories || []).map(c => ({ ...c, isDefault: false }));
    const all = [...defaultCategories, ...custom] as Array<{ _id?: string, name: string, icon: string, isDefault: boolean }>;
    return all.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [categories, search]);

  const handleAddCategory = async () => {
    if (!name) return;
    setIsSaving(true);
    try {
      const response = await apiFetch("/categories", {
        method: "POST",
        body: JSON.stringify({ name, icon, color: "bg-primary/10" }),
        headers: { "Content-Type": "application/json" }
      });
      addCategory(response);
      setIsModalOpen(false);
      setName("");
      toast.success("Category added!");
    } catch (error) {
      toast.error("Failed to add category");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/categories/${id}`, { method: "DELETE" });
      deleteCategory(id);
      toast.success("Category removed");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-xs text-muted-foreground font-medium">Manage your spending labels</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="icon" className="rounded-full h-10 w-10 shadow-lg">
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input 
          placeholder="Search categories..." 
          className="pl-9 h-11 rounded-xl border-2 bg-secondary/30 border-transparent focus:border-primary focus:bg-background transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredCategories.map((cat, idx) => (
          <motion.div
            key={cat._id || `default-${idx}`}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-4 border-none bg-secondary/40 hover:bg-secondary/60 transition-all group relative overflow-hidden">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center text-2xl shadow-sm border">
                  {cat.icon}
                </div>
                <span className="font-bold text-sm truncate w-full px-1">{cat.name}</span>
                {cat.isDefault ? (
                  <span className="text-[9px] uppercase font-bold text-muted-foreground/50 tracking-tighter">System</span>
                ) : (
                  <button 
                    onClick={() => handleDelete(cat._id!)}
                    className="absolute top-2 right-2 p-1.5 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 rounded-full transition-all md:opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-background border-t rounded-t-[2.5rem] p-8 pb-10 z-50 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-8" />
              <div className="space-y-6">
                <h2 className="text-xl font-bold">New Category</h2>
                <div className="space-y-4">
                  <div className="space-y-2 text-center">
                    <Label className="text-xs font-bold text-muted-foreground uppercase">Pick an Icon</Label>
                    <Input 
                      value={icon} 
                      onChange={(e) => setIcon(e.target.value)} 
                      className="w-20 h-20 mx-auto text-4xl text-center p-0 rounded-3xl border-2 bg-secondary/30" 
                      maxLength={2} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase">Category Name</Label>
                    <Input 
                      placeholder="e.g., Subscription, Gym" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="h-12 rounded-xl border-2 font-bold"
                    />
                  </div>
                </div>
                <Button size="lg" className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/20" disabled={isSaving} onClick={handleAddCategory}>
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Category"}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
