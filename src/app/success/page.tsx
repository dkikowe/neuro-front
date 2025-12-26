"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBillingBalance, type BillingBalance } from "@/lib/api";
import { authService } from "@/services/auth";
import Link from "next/link";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<BillingBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const isAuth = await authService.ensureAuthenticated();
      if (!isAuth) {
        router.replace("/auth/login");
        return;
      }
      try {
        const b = await getBillingBalance();
        setBalance(b);
      } catch (e: any) {
        setError(
          e?.response?.data?.detail ||
            e?.response?.data?.message ||
            e?.message ||
            "Не удалось обновить баланс"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  return (
    <section className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="mx-auto max-w-3xl px-6 py-16 space-y-8 text-center">
        <div className="flex justify-center">
          {loading ? (
            <Loader2 className="h-12 w-12 animate-spin text-slate-500" />
          ) : error ? (
            <AlertTriangle className="h-12 w-12 text-amber-500" />
          ) : (
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          )}
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Оплата успешно завершена
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Мы проверяем начисление. Если баланс не обновился, попробуйте
            перезагрузить страницу.
          </p>
        </div>

        {error && (
          <div className="mx-auto max-w-xl rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
            {error}
          </div>
        )}

        {!loading && !error && balance && (
          <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-left shadow-sm">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Текущий план:
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {balance.current_plan || balance.plan || "—"}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
                <p className="text-slate-500 dark:text-slate-400">
                  Генераций осталось
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {balance.remaining_std ?? "—"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
                <p className="text-slate-500 dark:text-slate-400">HD осталось</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {balance.remaining_hd ?? "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-full bg-slate-900 text-white px-5 py-3 text-sm font-semibold hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            В личный кабинет
          </Link>
          <button
            onClick={() => router.refresh()}
            className="rounded-full border border-slate-300 dark:border-slate-700 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Обновить баланс
          </button>
        </div>
      </div>
    </section>
  );
}


