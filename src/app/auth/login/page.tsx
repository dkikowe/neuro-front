"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth";

const translateError = (message: string, status?: number): string => {
  const map: Record<string, string> = {
    "Could not validate credentials": "Не удалось проверить учетные данные",
    "Email not verified": "Email не подтвержден",
    "Too many requests": "Слишком много запросов, попробуйте позже",
    "User with this email already exists": "Пользователь с таким email уже существует",
    "Disposable email domains are not allowed": "Одноразовые email запрещены",
    "Invalid token": "Неверный токен",
    "Token expired": "Срок действия токена истек",
    "Please wait before requesting again": "Подождите перед повторной отправкой",
    "Incorrect email or password": "Неверный email или пароль",
    "Filename is required": "Имя файла обязательно",
    "File is empty": "Файл пустой",
    "Style is required": "Стиль обязателен",
    "Unsupported style": "Неподдерживаемый стиль. Проверьте /styles",
    "Upload not found": "Загрузка не найдена",
    "key is required": "Не указан ключ файла",
    "File not found": "Файл не найден",
    "Could not validate refresh token": "Не удалось проверить refresh токен",
  };

  if (!message && status) {
    if (status === 429) return "Слишком много запросов, попробуйте позже";
    if (status === 401) return "Требуется авторизация";
    if (status === 403) return "Доступ запрещен";
    if (status === 404) return "Не найдено";
    if (status >= 500) return "Ошибка сервера";
  }

  if (message && map[message]) return map[message];

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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      router.replace("/dashboard/generate");
    } catch (err: any) {
      const parsed = extractErrorMessage(err);
      const errorMessage = translateError(parsed.text, parsed.status);
      setError(errorMessage);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-[0_25px_60px_rgba(15,23,42,0.05)] transition-colors">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Войти</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Продолжите работу с нейрогенерацией.
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
                  placeholder="••••••••"
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
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-slate-900 dark:bg-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Вход..." : "Войти"}
            </button>
            <div className="text-center">
              <Link
                href="/auth/forgot-password"
                className="text-sm font-semibold text-slate-900 dark:text-slate-50 hover:underline"
              >
                Забыли пароль?
              </Link>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Нет аккаунта?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-slate-900 dark:text-slate-50 hover:underline"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

