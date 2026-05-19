"use client";

import { useFinanceStore } from "@/store/useFinanceStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { 
  User as UserIcon, 
  Settings, 
  Bell, 
  Moon, 
  Sun, 
  Download, 
  LogOut, 
  ChevronRight,
  Shield,
  CreditCard,
  Trash2,
  Plus
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const { user, categories, setCategories, deleteCategory, resetData, setToken } = useFinanceStore();
  const [isDarkMode, setIsDarkMode] = useState(false);

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

    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, [setCategories]);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleExport = () => {
    const data = useFinanceStore.getState();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "finance-data.json";
    a.click();
  };

  const handleLogout = () => {
    resetData();
    setToken(null);
    router.push("/login");
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await apiFetch(`/categories/${id}`, {
        method: "DELETE"
      });
      deleteCategory(id);
      toast.success("Category deleted");
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* User Card */}
      <Card className="p-6 bg-primary text-primary-foreground border-none shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm opacity-80">{user.email || "No email provided"}</p>
          </div>
        </div>
      </Card>

      {/* Custom Categories Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase text-muted-foreground ml-1">My Custom Categories</h3>
        <div className="grid grid-cols-1 gap-2">
          {categories && categories.length > 0 ? (
            categories.map((cat) => (
              <Card key={cat._id} className="flex items-center justify-between p-3 shadow-sm border-2 border-transparent hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-xl">
                    {cat.icon}
                  </div>
                  <span className="font-bold text-sm">{cat.name}</span>
                </div>
                <button 
                  onClick={() => handleDeleteCategory(cat._id)}
                  className="p-2 text-muted-foreground/50 hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Card>
            ))
          ) : (
            <p className="text-sm text-muted-foreground ml-1 italic opacity-60">No custom categories yet.</p>
          )}
          <Button 
            variant="outline" 
            className="w-full mt-2 border-dashed border-2 gap-2 h-12 rounded-xl text-xs font-bold uppercase"
            onClick={() => router.push("/dashboard/add")}
          >
            <Plus className="w-4 h-4" /> Add via New Transaction
          </Button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase text-muted-foreground ml-1">General</h3>
        <Card className="divide-y overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-lg">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium text-sm">Notifications</span>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-lg">
                {isDarkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
              </div>
              <span className="font-medium text-sm">Dark Mode</span>
            </div>
            <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
          </div>
        </Card>

        <Button 
          variant="destructive" 
          className="w-full h-12 rounded-2xl gap-2 mt-4 shadow-lg shadow-destructive/20 text-sm font-bold"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" /> Logout
        </Button>
      </div>
    </div>
  );
}
