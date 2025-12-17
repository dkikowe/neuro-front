"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth";
import { User, Sparkles, LogOut } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = authService.getAccessToken();
    setIsAuthenticated(!!token);
  }, [pathname]);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    router.push("/");
  };

  return (
    <header className="border-b border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-lg flex items-center gap-2 font-semibold tracking-tight text-slate-900 dark:text-slate-50 transition-colors"
        >
          <span className="inline-flex items-center gap-2">
            <img
              src="/main/ava.png"
              alt="Logo"
              className="h-12 w-12 rounded-md object-cover sm:h-12 sm:w-12"
              loading="lazy"
            />
            interiorAI hub
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-200">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard/generate"
                className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${
                  pathname === "/dashboard/generate"
                    ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
                title="Генерация"
              >
                <Sparkles size={18} />
                <span className="hidden sm:inline">Генерация</span>
              </Link>
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${
                  pathname === "/dashboard"
                    ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
                title="Личный кабинет"
              >
                <User size={18} />
                <span className="hidden sm:inline">Личный кабинет</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full px-4 py-2 transition-colors text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                title="Выйти"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Выйти</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-full px-4 py-2 transition-colors text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Войти
              </Link>
              <Link
                href="/auth/register"
                className="rounded-full bg-slate-900 px-4 py-2 text-white transition-colors hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
