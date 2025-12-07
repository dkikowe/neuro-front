"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";
import Hero from "@/components/Hero";
import Steps from "@/components/Steps";
import BeforeAfterSection from "@/components/BeforeAfterSection";
import Features from "@/components/Features";
import CTASection from "@/components/CTASection";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Проверяем наличие токена и редиректим на дашборд
    const token = authService.getAccessToken();
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <>
      <Hero />
      <Steps />
      <BeforeAfterSection />
      <Features />
      <CTASection />
    </>
  );
}
