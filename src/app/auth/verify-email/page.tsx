"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import { authService } from "@/services/auth";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const translateError = (message: string): string => {
  const map: Record<string, string> = {
    "Could not validate credentials": "Не удалось проверить учетные данные",
    "Email not verified": "Email не подтвержден",
    "Too many requests": "Слишком много запросов, попробуйте позже",
    "Invalid token": "Неверный токен",
    "Token expired": "Срок действия токена истек",
  };
  return map[message] || message || "Не удалось подтвердить email.";
};

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setError("Отсутствует токен подтверждения.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const res = await fetch(
          `${API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`,
          { method: "GET" }
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(translateError(data?.message));
        }

        const access = data?.access_token || data?.accessToken;
        const refresh = data?.refresh_token || data?.refreshToken;
        const tokenType = data?.token_type || data?.tokenType;

        if (!access) {
          throw new Error("Токены не получены от сервера.");
        }

        // Сохраняем токены и ведём в дэшборд
        authService.setTokens(access, refresh);
        setSuccess("Email подтверждён! Перенаправляем в кабинет...");
        router.replace("/dashboard");
      } catch (err: any) {
        setError(translateError(err?.message));
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token, router]);

  return (
    <section className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-[0_25px_60px_rgba(15,23,42,0.05)] transition-colors space-y-4">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Подтверждение email
          </h1>

          {loading && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Проверяем токен...</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-2xl bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-700 dark:text-green-300">
              <CheckCircle2 className="h-5 w-5" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
              <XCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 text-sm text-slate-500 dark:text-slate-400">
            {loading ? "Загружаем..." : "Если не произошло, обновите страницу."}
          </div>
        </div>
      </div>
    </section>
  );
}

