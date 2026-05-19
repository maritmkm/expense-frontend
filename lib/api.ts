import { useFinanceStore } from "@/store/useFinanceStore";

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "https://expenseapi.serveflow.in" : "http://localhost:3001");

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = useFinanceStore.getState().accessToken;

  const isFormData = options.body instanceof FormData;

  const headers: any = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "API request failed");
  }

  return response.json();
}
