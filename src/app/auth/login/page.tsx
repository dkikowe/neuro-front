"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login({
        username: email,
        password,
      });

      // Сейчас важен только accessToken, refresh токен опционален
      if (!response.accessToken) {
        throw new Error("Токен не получен от сервера");
      }

      // Сохраняем только accessToken (refresh при необходимости добавим позже)
      authService.setTokens(response.accessToken, response.refreshToken);
      
      // Проверяем, что токены действительно сохранились
      const savedToken = authService.getAccessToken();
      if (!savedToken) {
        throw new Error("Не удалось сохранить токен");
      }
      
      // Используем router.replace для навигации без полной перезагрузки
      router.replace("/dashboard");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Ошибка входа. Проверьте данные.";
      setError(errorMessage);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-slate-50">
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_25px_60px_rgba(15,23,42,0.05)]">
          <h1 className="text-2xl font-semibold text-slate-900">Войти</h1>
          <p className="mt-2 text-sm text-slate-500">
            Продолжите работу с нейрогенерацией.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Пароль
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Вход..." : "Войти"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            Нет аккаунта?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-slate-900 hover:underline"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

