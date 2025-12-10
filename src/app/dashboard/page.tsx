"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { authService, User } from "@/services/auth";
import {
  User as UserIcon,
  Mail,
  Package,
  Image,
  Settings,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Предотвращаем гидратацию
  useEffect(() => {
    setMounted(true);
  }, []);

  // Применяем тему напрямую к html элементу
  useEffect(() => {
    if (mounted && theme) {
      const root = document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      console.log("Theme applied:", theme, "Classes:", root.className);
    }
  }, [theme, mounted]);

  useEffect(() => {
    const fetchUser = async () => {
      // Проверяем наличие токена и пытаемся рефрешнуть если нужно
      const isAuthenticated = await authService.ensureAuthenticated();
      if (!isAuthenticated) {
        router.replace("/auth/login");
        return;
      }

      try {
        const userData = await authService.getMe();
        console.log("=== /auth/me Response ===");
        console.log("User Data:", userData);
        console.log("generation_count:", userData.generation_count);
        console.log("generations_count:", userData.generations_count);
        console.log("generations_remaining:", userData.generations_remaining);
        console.log("total_generations:", userData.total_generations);
        console.log("remaining_generations:", userData.remaining_generations);
        console.log("========================");
        setUser(userData);
      } catch (error: any) {
        // Если получили 401, пробуем рефрешнуть токен
        if (error.response?.status === 401) {
          const refreshed = await authService.refreshAccessToken();
          if (refreshed) {
            try {
              const userData = await authService.getMe();
              console.log("=== /auth/me Response (after refresh) ===");
              console.log("User Data:", userData);
              console.log("generation_count:", userData.generation_count);
              console.log("generations_count:", userData.generations_count);
              console.log(
                "generations_remaining:",
                userData.generations_remaining
              );
              console.log("total_generations:", userData.total_generations);
              console.log(
                "remaining_generations:",
                userData.remaining_generations
              );
              console.log("========================================");
              setUser(userData);
            } catch (retryError) {
              authService.logout();
              router.replace("/auth/login");
            }
          } else {
            authService.logout();
            router.replace("/auth/login");
          }
        } else {
          authService.logout();
          router.replace("/auth/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <section className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
        <div className="mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center px-6 py-16 text-center">
          <p className="text-slate-600 dark:text-slate-400">Загрузка...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <section className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center mt-1 justify-center rounded-xl bg-slate-900 text-white">
                <UserIcon size={22} />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">
                  Личный кабинет
                </h1>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                  Управление вашим аккаунтом и проектами
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const newTheme = theme === "dark" ? "light" : "dark";
                console.log("Switching theme from", theme, "to", newTheme);
                setTheme(newTheme);
                // Применяем немедленно
                const root = document.documentElement;
                if (newTheme === "dark") {
                  root.classList.add("dark");
                } else {
                  root.classList.remove("dark");
                }
              }}
              className="flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              {!mounted ? (
                <>
                  <Moon size={16} />
                  Тёмная тема
                </>
              ) : theme === "dark" ? (
                <>
                  <Sun size={16} />
                  Светлая тема
                </>
              ) : (
                <>
                  <Moon size={16} />
                  Тёмная тема
                </>
              )}
            </button>
          </div>
        </div>

        {/* Информация о пользователе */}
        <div className="mb-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-colors">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-700 dark:to-slate-600 text-white">
              <UserIcon size={30} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                Профиль
              </h2>
              <div className="mt-4 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Mail
                    size={16}
                    className="text-slate-600 dark:text-slate-400 shrink-0"
                  />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email
                  </p>
                </div>
                <p className="text-base text-slate-900 dark:text-slate-50">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-50">
            Быстрые действия
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/dashboard/generate"
              className="group flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white transition-transform group-hover:scale-110">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                  Генерация
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Создать новое изображение
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/gallery"
              className="group flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white transition-transform group-hover:scale-110">
                <Image size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                  Галерея
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  До/после и скачивание
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 opacity-60">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
                <Package size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                  Пакеты
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Скоро будет доступно
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-colors">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-slate-50">
            <Settings size={20} />
            Статистика
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-4">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Количество генераций
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
                {user.generation_count ??
                  user.generations_count ??
                  user.total_generations ??
                  0}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-4">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Осталось генераций
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
                {user.generations_remaining ??
                  user.remaining_generations ??
                  "∞"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
