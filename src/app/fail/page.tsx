"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function FailPage() {
  const router = useRouter();

  return (
    <section className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="mx-auto max-w-3xl px-6 py-16 space-y-8 text-center">
        <div className="flex justify-center">
          <AlertTriangle className="h-12 w-12 text-amber-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Оплата не завершена
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Попробуйте снова или выберите другой способ оплаты.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard/packages"
            className="rounded-full bg-slate-900 text-white px-5 py-3 text-sm font-semibold hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            Повторить оплату
          </Link>
          <button
            onClick={() => router.refresh()}
            className="rounded-full border border-slate-300 dark:border-slate-700 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Обновить
          </button>
        </div>
      </div>
    </section>
  );
}


