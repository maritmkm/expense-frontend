"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

export default function OTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col p-6 bg-background">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => router.back()}
        className="rounded-full self-start mb-12"
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Verify Email</h1>
          <p className="text-muted-foreground">
            We sent a 4-digit code to your email. Enter it below.
          </p>
        </div>

        <div className="flex justify-between gap-4">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="number"
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-full h-16 text-center text-3xl font-bold rounded-2xl border-2 border-input bg-background focus:border-primary focus:ring-0 transition-all"
            />
          ))}
        </div>

        <div className="space-y-4">
          <Button size="lg" className="w-full" onClick={handleVerify}>
            Verify
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Didn&apos;t receive a code?{" "}
            <button className="text-primary font-bold">Resend</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
