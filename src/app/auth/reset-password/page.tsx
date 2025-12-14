"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth";

const translateError = (message: string, status?: number): string => {
  const map: Record<string, string> = {
    "Too many requests": "Слишком много запросов, попробуйте позже",
    "Invalid token": "Неверный токен",
    "Token expired": "Срок действия токена истек",
    "Could not validate credentials": "Не удалось проверить учетные данные",
  };

  if (!message && status) {
    if (status === 429) return "Слишком много запросов, попробуйте позже";
    if (status === 401) return "Требуется авторизация";
    if (status === 404) return "Не найдено";
    if (status >= 500) return "Ошибка сервера";
  }

  if (map[message]) return map[message];
  if (message?.includes("status code 429")) {
    return "Слишком много запросов, попробуйте позже";
  }
  return message || "Произошла ошибка. Попробуйте позже.";
};

const extractErrorMessage = (err: any): { text: string; status?: number } => {
  const resp = err?.response;
  const data = resp?.data;
  let detail = data?.detail;

  if (Array.isArray(detail)) {
    detail = detail
      .map((d) => (typeof d === "string" ? d : d?.msg || d?.message))
      .filter(Boolean)
      .join(", ");
  }

  const raw =
    detail ||
    data?.message ||
    data?.error ||
    err?.message ||
    err?.toString() ||
    "";

  return { text: raw, status: resp?.status };
};

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Отсутствует токен сброса пароля.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Отсутствует токен сброса пароля.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ token, password });
      setSuccess("Пароль успешно обновлен. Теперь вы можете войти.");
      setTimeout(() => {
        router.replace("/auth/login");
      }, 2000);
    } catch (err: any) {
      const parsed = extractErrorMessage(err);
      const errorMessage = translateError(parsed.text, parsed.status);
      setError(errorMessage);
      console.error("Reset password error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-[0_25px_60px_rgba(15,23,42,0.05)] transition-colors">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Сброс пароля
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Задайте новый пароль для вашего аккаунта.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-2xl bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-700 dark:text-green-300">
                {success}
              </div>
            )}

            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Новый пароль
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Новый пароль"
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 px-4 py-3 text-sm focus:border-slate-900 dark:focus:border-slate-600 focus:outline-none transition-colors"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Подтверждение пароля
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Повторите новый пароль"
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 px-4 py-3 text-sm focus:border-slate-900 dark:focus:border-slate-600 focus:outline-none transition-colors"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-slate-900 dark:bg-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Обновляем..." : "Обновить пароль"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Вспомнили пароль?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-slate-900 dark:text-slate-50 hover:underline"
            >
              Войти
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

