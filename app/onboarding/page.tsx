"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { Wallet, PieChart, ShieldCheck, ArrowRight } from "lucide-react";

const slides = [
  {
    title: "Track Your Spending",
    description: "Keep an eye on every penny you spend and see where your money goes with intuitive tracking.",
    icon: Wallet,
    color: "bg-emerald-500",
  },
  {
    title: "Smart Analytics",
    description: "Get deep insights into your spending habits with beautiful, interactive charts.",
    icon: PieChart,
    color: "bg-blue-500",
  },
  {
    title: "Secure & Private",
    description: "Your financial data stays local on your device. We prioritize your privacy above all.",
    icon: ShieldCheck,
    color: "bg-purple-500",
  }
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser } = useFinanceStore();
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    });
  }, [emblaApi]);

  const handleComplete = () => {
    setUser({ onboarded: true });
    router.push("/login");
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <div className="flex-1 relative" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => {
            const Icon = slide.icon;
            return (
              <div key={index} className="flex-[0_0_100%] h-full flex flex-col items-center justify-center p-10 text-center space-y-8">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={selectedIndex === index ? { scale: 1, opacity: 1 } : {}}
                  transition={{ type: "spring", duration: 0.8 }}
                  className={`w-32 h-32 rounded-[2.5rem] ${slide.color} flex items-center justify-center text-white shadow-2xl shadow-primary/20`}
                >
                  <Icon className="w-16 h-16" />
                </motion.div>
                
                <div className="space-y-4">
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={selectedIndex === index ? { y: 0, opacity: 1 } : {}}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold tracking-tight"
                  >
                    {slide.title}
                  </motion.h2>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={selectedIndex === index ? { y: 0, opacity: 1 } : {}}
                    transition={{ delay: 0.3 }}
                    className="text-muted-foreground leading-relaxed"
                  >
                    {slide.description}
                  </motion.p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-10 space-y-8">
        {/* Pagination Dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                selectedIndex === i ? "w-8 bg-primary" : "w-2 bg-secondary"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-4">
          {selectedIndex < slides.length - 1 ? (
            <Button 
              size="lg" 
              className="w-full" 
              onClick={() => emblaApi?.scrollNext()}
            >
              Next <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          ) : (
            <Button 
              size="lg" 
              className="w-full" 
              onClick={handleComplete}
            >
              Get Started
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
