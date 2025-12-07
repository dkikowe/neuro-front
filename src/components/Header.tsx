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
    <header className="border-b border-slate-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          NeuroFrame
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium text-slate-600">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${
                  pathname === "/dashboard"
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "hover:bg-slate-100"
                }`}
                title="Личный кабинет"
              >
                <User size={18} />
                <span className="hidden sm:inline">Личный кабинет</span>
              </Link>
              <Link
                href="/dashboard/generate"
                className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${
                  pathname === "/dashboard/generate"
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "hover:bg-slate-100"
                }`}
                title="Генерация"
              >
                <Sparkles size={18} />
                <span className="hidden sm:inline">Генерация</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full px-4 py-2 transition-colors hover:bg-slate-100"
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
                className="rounded-full px-4 py-2 transition-colors hover:bg-slate-100"
              >
                Войти
              </Link>
              <Link
                href="/auth/register"
                className="rounded-full bg-slate-900 px-4 py-2 text-white transition-colors hover:bg-slate-800"
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

