"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="max-w-md mx-auto px-4 pt-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
