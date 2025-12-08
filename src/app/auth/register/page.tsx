"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // очищаем старую ошибку

    // Валидация паролей
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
      // 1) Регистрируем пользователя
      await authService.register({
        email,
        password,
      });

      // 2) Если регистрация прошла успешно (201/2xx), сразу логинимся теми же данными
      const loginResponse = await authService.login({
        username: email,
        password,
      });

      // Сейчас важен только accessToken, refresh токен опционален
      if (!loginResponse.accessToken) {
        throw new Error("Токен не получен от сервера при логине");
      }

      // 3) Сохраняем токен из ответа login (refresh при необходимости добавим позже)
      authService.setTokens(loginResponse.accessToken, loginResponse.refreshToken);
      
      // 4) Навигация сразу в генерацию без полной перезагрузки
      router.replace("/dashboard/generate");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Ошибка регистрации. Попробуйте снова.";
      setError(errorMessage);
      console.error("Register error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-[0_25px_60px_rgba(15,23,42,0.05)] transition-colors">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Создать аккаунт
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Получите доступ к генерациям и HD-экспортам.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 px-4 py-3 text-sm focus:border-slate-900 dark:focus:border-slate-600 focus:outline-none transition-colors"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Пароль
              <div className="mt-2 flex items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Придумайте пароль"
                  required
                  className="w-full text-sm outline-none bg-transparent text-slate-900 dark:text-slate-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="ml-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition"
                  aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Подтверждение пароля
              <div className="mt-2 flex items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите пароль"
                  required
                  className="w-full text-sm outline-none bg-transparent text-slate-900 dark:text-slate-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="ml-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition"
                  aria-label={showConfirm ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-slate-900 dark:bg-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Уже есть аккаунт?{" "}
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

