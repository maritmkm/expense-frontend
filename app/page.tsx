"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFinanceStore } from "@/store/useFinanceStore";

export default function RootPage() {
  const router = useRouter();
  const onboarded = useFinanceStore((state) => state.user.onboarded);

  useEffect(() => {
    if (onboarded) {
      router.push("/dashboard");
    } else {
      router.push("/onboarding");
    }
  }, [onboarded, router]);

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
