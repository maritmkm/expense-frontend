import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Transaction, Budget, User, Category } from "../types";

interface CustomCategory {
  _id: string;
  name: string;
  icon: string;
  color: string;
}

interface FinanceState {
  user: User;
  accessToken: string | null;
  transactions: Transaction[];
  budgets: Budget[];
  categories: CustomCategory[];
  
  // Actions
  setUser: (user: Partial<User>) => void;
  setToken: (token: string | null) => void;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  setCategories: (categories: CustomCategory[]) => void;
  addCategory: (category: CustomCategory) => void;
  deleteCategory: (id: string) => void;
  setBudgets: (budgets: Budget[]) => void;
  addBudget: (budget: Budget) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  resetData: () => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      user: {
        name: "Guest",
        email: "",
        currency: "INR",
        onboarded: false,
      },
      accessToken: null,
      transactions: [],
      budgets: [],
      categories: [],

      setUser: (userData) => 
        set((state) => ({ user: { ...state.user, ...userData } })),

      setToken: (token) => set({ accessToken: token }),

      setTransactions: (transactions) => set({ transactions }),

      addTransaction: (transaction) =>
        set((state) => ({ 
          transactions: [transaction, ...state.transactions] 
        })),

      updateTransaction: (transaction) =>
        set((state) => ({
          transactions: state.transactions.map((t) => 
            t.id === transaction.id ? transaction : t
          ),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => (t.id || t._id) !== id),
        })),

      setCategories: (categories) => set({ categories }),

      addCategory: (category) =>
        set((state) => ({ categories: [...state.categories, category] })),

      deleteCategory: (id) =>
        set((state) => ({ categories: state.categories.filter((c) => c._id !== id) })),

      setBudgets: (budgets) => set({ budgets }),

      addBudget: (budget) =>
        set((state) => ({ budgets: [...state.budgets, budget] })),

      updateBudget: (budget) =>
        set((state) => ({
          budgets: state.budgets.map((b) => 
            (b._id === budget._id || b.category === budget.category) ? budget : b
          ),
        })),

      deleteBudget: (id) =>
        set((state) => ({
          budgets: state.budgets.filter((b) => b._id !== id && b.category !== id),
        })),

      resetData: () => set({ transactions: [], budgets: [], categories: [] }),
    }),
    {
      name: "finance-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
