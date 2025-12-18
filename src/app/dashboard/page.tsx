"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { authService, User } from "@/services/auth";
import { getBillingBalance, type BillingBalance } from "@/lib/api";
import {
  User as UserIcon,
  Mail,
  Package,
  Image as ImageIcon,
  Settings,
  Sparkles,
  Sun,
  Moon,
  LifeBuoy,
} from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";

const planLabels: Record<string, string> = {
  hd_1: "Пакет 1 HD",
  hd_3: "Пакет 3 HD",
  hd_5: "Пакет 5 HD",
  hd_10: "Пакет 10 HD",
  hd_20: "Пакет 20 HD",
  lite: "Лайт — 30 генераций и 10 HD",
  standard: "Стандарт — 100 генераций и 40 HD",
  pro: "Про — 300 генераций и 150 HD",
};

const translatePlan = (id?: string | null) => {
  if (!id) return null;
  return planLabels[id] || id;
};

export default function DashboardPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [balance, setBalance] = useState<BillingBalance | null>(null);
  const [toasts, setToasts] = useState<
    { id: string; message: string; type: "success" | "error" }[]
  >([]);
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSending, setSupportSending] = useState(false);
  const supportEmail = "support@ВАШ_ДОМЕН";

  const addToast = (message: string, type: "success" | "error") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleSupportSubmit = () => {
    if (!supportSubject.trim() || !supportMessage.trim()) {
      addToast("Заполните тему и описание проблемы", "error");
      return;
    }
    try {
      setSupportSending(true);
      const mailto = `mailto:${supportEmail}?subject=${encodeURIComponent(
        supportSubject.trim()
      )}&body=${encodeURIComponent(supportMessage.trim())}`;
      window.location.href = mailto;
      setSupportOpen(false);
      setSupportSubject("");
      setSupportMessage("");
      addToast("Открылся почтовый клиент для отправки", "success");
    } catch (error) {
      addToast("Не удалось подготовить письмо", "error");
    } finally {
      setSupportSending(false);
    }
  };

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

        try {
          const b = await getBillingBalance();
          setBalance(b);
        } catch (err: any) {
          if (err?.response?.status === 402) {
            addToast("У вас закончились генерации", "error");
            setBalance({
              remaining_std: 0,
              used_std: 0,
              remaining_hd: 0,
              used_hd: 0,
              plan: null,
              purchased_at: null,
            });
          } else {
            addToast("Не удалось загрузить баланс", "error");
          }
        }
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

              try {
                const b = await getBillingBalance();
                setBalance(b);
              } catch (err: any) {
                if (err?.response?.status === 402) {
                  addToast("У вас закончились генерации", "error");
                  setBalance({
                    remaining_std: 0,
                    used_std: 0,
                    remaining_hd: 0,
                    used_hd: 0,
                    plan: null,
                    purchased_at: null,
                  });
                } else {
                  addToast("Не удалось загрузить баланс", "error");
                }
              }
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
    <>
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
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-700 dark:to-slate-600 text-white overflow-hidden">
                <NextImage
                  src="/main/avatar.jpg"
                  alt="Avatar"
                  width={64}
                  height={64}
                  className="h-16 w-16 object-cover"
                />
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  <ImageIcon size={20} />
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

              <Link
                href="/dashboard/packages"
                className="group flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white transition-transform group-hover:scale-110">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                    Пакеты
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Разовые HD и подписки
                  </p>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setSupportOpen(true)}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md text-left"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white transition-transform group-hover:scale-110">
                  <LifeBuoy size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                    Поддержка
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Напишите тему и проблему
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Статистика */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-colors">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-slate-50">
              <Settings size={20} />
              Статистика
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-4">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Осталось (генерациий)
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {balance?.remaining_std ?? "—"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-4">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Использовано (генерациий)
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {balance?.used_std ?? "—"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-4">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Осталось (HD)
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {balance?.remaining_hd ?? "—"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-4">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Использовано (HD)
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {balance?.used_hd ?? "—"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-4">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  План / покупка
                </p>
                {balance?.current_plan && (
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-50 mt-1">
                    {translatePlan(balance.current_plan)}
                  </p>
                )}

                {balance?.purchased_at && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    c{" "}
                    {new Date(balance.purchased_at).toLocaleDateString("ru-RU")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      {supportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Написать в поддержку
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Укажите тему и коротко опишите проблему, мы ответим на почту.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSupportOpen(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Тема
                <input
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  placeholder="Например: Не удаётся скачать HD"
                  className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Описание проблемы
                <textarea
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  rows={4}
                  placeholder="Опишите, что произошло, какие шаги предпринимали, и прикрепите ссылки если нужно."
                  className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 resize-y"
                />
              </label>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSupportOpen(false);
                  setSupportSubject("");
                  setSupportMessage("");
                }}
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSupportSubmit}
                disabled={supportSending}
                className="rounded-full bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {supportSending ? "Отправляем..." : "Отправить"}
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Письмо откроется в вашем почтовом клиенте: {supportEmail}
            </p>
          </div>
        </div>
      )}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
              t.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-rose-600 text-white"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </>
  );
}
