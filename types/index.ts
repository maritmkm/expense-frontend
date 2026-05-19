export type Category = 
  | "Food" 
  | "Transport" 
  | "Shopping" 
  | "Entertainment" 
  | "Health" 
  | "Utilities" 
  | "Housing" 
  | "Salary" 
  | "Investment" 
  | "Tea"
  | "Snack"
  | "Office"
  | "Travel"
  | "Dress"
  | "Rent"
  | "Other"
  | (string & {});

export interface Transaction {
  id: string;
  _id?: string;
  amount: number;
  type: "income" | "expense";
  category: Category;
  date: string;
  note: string;
  paymentMethod: string;
  attachment?: string;
}

export interface Budget {
  _id?: string;
  category: Category;
  limit: number;
  spent: number;
}

export interface User {
  name: string;
  email: string;
  currency: string;
  onboarded: boolean;
  avatar?: string;
  customCategories?: { name: string; icon: string; color: string }[];
}
