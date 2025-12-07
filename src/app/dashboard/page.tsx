"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, User } from "@/services/auth";
import { User as UserIcon, Mail, Package, Image, Settings, Sparkles } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
        setUser(userData);
      } catch (error: any) {
        // Если получили 401, пробуем рефрешнуть токен
        if (error.response?.status === 401) {
          const refreshed = await authService.refreshAccessToken();
          if (refreshed) {
            try {
              const userData = await authService.getMe();
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
      <section className="bg-slate-50 min-h-screen">
        <div className="mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center px-6 py-16 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Загрузка...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <section className="bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-4xl font-bold text-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
              <UserIcon size={24} />
            </div>
            Личный кабинет
          </h1>
          <p className="mt-2 text-slate-600">Управление вашим аккаунтом и проектами</p>
        </div>

        {/* Информация о пользователе */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 to-slate-700 text-white">
              <UserIcon size={32} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-900">Профиль</h2>
              <div className="mt-4 flex items-center gap-3">
                <Mail size={18} className="text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-500">Email</p>
                  <p className="mt-1 text-base text-slate-900">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Быстрые действия</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/dashboard/generate"
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white transition-transform group-hover:scale-110">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Генерация</h3>
                <p className="mt-1 text-sm text-slate-600">Создать новое изображение</p>
              </div>
            </Link>

            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 opacity-60">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <Image size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Галерея</h3>
                <p className="mt-1 text-sm text-slate-600">Скоро будет доступно</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 opacity-60">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
                <Package size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Пакеты</h3>
                <p className="mt-1 text-sm text-slate-600">Скоро будет доступно</p>
              </div>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900">
            <Settings size={20} />
            Статистика
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Сгенерировано</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">0</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">В процессе</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">0</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Осталось генераций</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">∞</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

