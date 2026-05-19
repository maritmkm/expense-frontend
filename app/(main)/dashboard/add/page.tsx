"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ChevronLeft, Check, Loader2, Camera, X, Plus, Search, ChevronDown, Trash2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const defaultCategories = [
  { label: "Food", icon: "🍔", color: "bg-orange-100 text-orange-600", isDefault: true },
  { label: "Tea", icon: "☕", color: "bg-amber-100 text-amber-600", isDefault: true },
  { label: "Snack", icon: "🍿", color: "bg-yellow-100 text-yellow-600", isDefault: true },
  { label: "Transport", icon: "🚗", color: "bg-blue-100 text-blue-600", isDefault: true },
  { label: "Travel", icon: "✈️", color: "bg-sky-100 text-sky-600", isDefault: true },
  { label: "Shopping", icon: "🛍️", color: "bg-pink-100 text-pink-600", isDefault: true },
  { label: "Dress", icon: "👗", color: "bg-rose-100 text-rose-600", isDefault: true },
  { label: "Office", icon: "🏢", color: "bg-slate-100 text-slate-600", isDefault: true },
  { label: "Rent", icon: "🏠", color: "bg-indigo-100 text-indigo-600", isDefault: true },
  { label: "Entertainment", icon: "🎬", color: "bg-purple-100 text-purple-600", isDefault: true },
  { label: "Health", icon: "🏥", color: "bg-red-100 text-red-600", isDefault: true },
  { label: "Utilities", icon: "💡", color: "bg-yellow-100 text-yellow-600", isDefault: true },
  { label: "Salary", icon: "💰", color: "bg-emerald-100 text-emerald-600", isDefault: true },
  { label: "Other", icon: "📦", color: "bg-gray-100 text-gray-600", isDefault: true },
];

const schema = z.object({
  amount: z.string().min(1, "Required").regex(/^[0-9]+$/, "Must be a whole number"),
  note: z.string().min(1, "Note is required"),
  type: z.enum(["income", "expense"]),
});

type FormData = z.infer<typeof schema>;

export default function AddTransactionPage() {
  const router = useRouter();
  const { categories, setCategories, addCategory, deleteCategory, addTransaction } = useFinanceStore();
  const [selectedCategory, setSelectedCategory] = useState<{ _id?: string, label: string, icon: string, color: string, isDefault: boolean }>(defaultCategories[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [isNewCatModalOpen, setIsNewCatModalOpen] = useState(false);
  
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("🏷️");
  const [isCreatingCat, setIsCreatingCat] = useState(false);

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

  const allCategories = useMemo(() => {
    const custom = (categories || []).map(c => ({
      _id: c._id,
      label: c.name,
      icon: c.icon,
      color: "bg-primary/10 text-primary",
      isDefault: false
    }));
    return [...defaultCategories, ...custom] as Array<{ _id?: string, label: string, icon: string, color: string, isDefault: boolean }>;
  }, [categories]);

  const filteredCategories = useMemo(() => {
    return allCategories.filter(cat => 
      cat.label.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [allCategories, categorySearch]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "expense" }
  });

  const transactionType = watch("type");

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", data.note);
      formData.append("amount", data.amount);
      formData.append("type", data.type);
      formData.append("category", selectedCategory.label);
      formData.append("date", new Date().toISOString());
      formData.append("note", data.note);
      formData.append("paymentMethod", "Cash");
      if (file) formData.append("file", file);

      const savedTransaction = await apiFetch("/expenses", {
        method: "POST",
        body: formData,
      });

      addTransaction(savedTransaction);
      toast.success("Saved!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName) return;
    setIsCreatingCat(true);
    try {
      const newCatData = { name: newCatName, icon: newCatIcon, color: "bg-primary/10 text-primary" };
      const response = await apiFetch("/categories", {
        method: "POST",
        body: JSON.stringify(newCatData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      addCategory(response);
      const created = { _id: response._id, label: response.name, icon: response.icon, color: response.color, isDefault: false };
      setSelectedCategory(created);
      setIsNewCatModalOpen(false);
      setNewCatName("");
      toast.success("Category added!");
    } catch (error: any) {
      toast.error("Failed to add category");
    } finally {
      setIsCreatingCat(false);
    }
  };

  const handleDeleteCategory = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Don't select the category when deleting
    try {
      await apiFetch(`/categories/${id}`, { method: "DELETE" });
      deleteCategory(id);
      if (selectedCategory._id === id) {
        setSelectedCategory(defaultCategories[0]);
      }
      toast.success("Category deleted");
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-8 w-8">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold">New Transaction</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex p-0.5 bg-secondary rounded-xl">
          <button type="button" onClick={() => setValue("type", "expense")} className={cn("flex-1 py-2 rounded-lg text-xs font-bold transition-all", transactionType === "expense" ? "bg-background shadow-sm text-primary" : "text-muted-foreground")}>Expense</button>
          <button type="button" onClick={() => setValue("type", "income")} className={cn("flex-1 py-2 rounded-lg text-xs font-bold transition-all", transactionType === "income" ? "bg-background shadow-sm text-emerald-600" : "text-muted-foreground")}>Income</button>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Amount (₹)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold opacity-40">₹</span>
            <Input type="number" placeholder="0" className="text-lg font-bold h-11 pl-7 border-2 rounded-xl focus-visible:ring-primary/20 bg-background" {...register("amount")} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Note</Label>
          <Input placeholder="What was this for?" className="h-11 rounded-xl border-2 text-sm" {...register("note")} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Category</Label>
          <button
            type="button"
            onClick={() => setIsCategoryPickerOpen(true)}
            className="w-full h-11 px-4 rounded-xl border-2 bg-background flex items-center justify-between group active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{selectedCategory.icon}</span>
              <span className="font-bold text-sm">{selectedCategory.label}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Attachment</Label>
          {!image ? (
            <div onClick={() => document.getElementById('image-upload')?.click()} className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-3 flex items-center justify-center gap-2 bg-secondary/30 active:bg-secondary/50 transition-all cursor-pointer">
              <Camera className="w-4 h-4 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Add Photo</p>
              <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  const reader = new FileReader();
                  reader.onloadend = () => setImage(reader.result as string);
                  reader.readAsDataURL(selectedFile);
                }
              }} />
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden group border-2 border-primary/20 shadow-sm h-20">
              <img src={image} alt="Attachment" className="w-full h-full object-cover" />
              <button type="button" onClick={() => { setImage(null); setFile(null); }} className="absolute top-1.5 right-1.5 p-1 bg-background/80 backdrop-blur-md rounded-full shadow-lg">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <Button size="lg" type="submit" className="w-full h-12 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 mt-4" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Check className="mr-2 w-5 h-5" /> Save Transaction</>}
        </Button>
      </form>

      {/* Category Picker Modal */}
      <AnimatePresence>
        {isCategoryPickerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCategoryPickerOpen(false)} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-background border-t rounded-t-[2.5rem] p-6 pb-10 z-[70] shadow-2xl h-[80vh] flex flex-col">
              <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-6 shrink-0" />
              
              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center shrink-0">
                  <h2 className="text-lg font-bold">Select Category</h2>
                  <div className="flex items-center gap-4">
                    <Link href="/categories" className="text-xs font-bold text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors">
                      <Settings className="w-3 h-3" /> Manage
                    </Link>
                    <button onClick={() => setIsNewCatModalOpen(true)} className="text-xs font-bold text-primary flex items-center gap-1">
                      <Plus className="w-3 h-3" /> New
                    </button>
                  </div>
                </div>

                <div className="relative shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input placeholder="Search categories..." className="pl-9 h-11 rounded-xl border-2 bg-secondary/30 border-transparent focus:border-primary focus:bg-background transition-all" value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} />
                </div>

                <div className="flex-1 overflow-y-auto pr-1 py-2 custom-scrollbar">
                  <div className="grid grid-cols-3 gap-3">
                    {filteredCategories.map((cat) => (
                      <button
                        key={cat._id || cat.label}
                        type="button"
                        onClick={() => { setSelectedCategory(cat as any); setIsCategoryPickerOpen(false); }}
                        className={cn(
                          "relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1.5 group",
                          selectedCategory.label === cat.label ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-secondary/30 border-transparent hover:border-primary/30"
                        )}
                      >
                        {!cat.isDefault && (
                          <div 
                            onClick={(e) => handleDeleteCategory(e, cat._id!)}
                            className="absolute -top-2 -right-2 p-1.5 bg-background border rounded-full text-muted-foreground hover:text-destructive shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </div>
                        )}
                        <span className="text-2xl">{cat.icon}</span>
                        <span className="text-[10px] font-bold text-center line-clamp-1">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* New Category Modal */}
      <AnimatePresence>
        {isNewCatModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsNewCatModalOpen(false)} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[80]" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-background border rounded-[2rem] p-8 z-[90] shadow-2xl">
              <div className="space-y-6">
                <h2 className="text-lg font-bold">Create Category</h2>
                <div className="space-y-4">
                  <div className="space-y-1.5 text-center">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Icon</Label>
                    <Input value={newCatIcon} onChange={(e) => setNewCatIcon(e.target.value)} className="w-16 h-16 mx-auto text-3xl text-center p-0 rounded-2xl border-2" maxLength={2} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Name</Label>
                    <Input placeholder="e.g., Gym, Subscription" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="h-11 rounded-xl border-2 font-medium text-sm" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" className="flex-1" onClick={() => setIsNewCatModalOpen(false)}>Cancel</Button>
                  <Button className="flex-1" disabled={isCreatingCat} onClick={handleCreateCategory}>
                    {isCreatingCat ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
