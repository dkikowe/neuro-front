"use client";

import { useEffect, useState } from "react";
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

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);

  // Таймер для кулдауна повтора письма
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

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

      // 2) Показываем сообщение и предлагаем подтвердить email
      setSuccess(
        "Аккаунт создан. Мы отправили письмо для подтверждения email. Проверьте почту и перейдите по ссылке."
      );
      setError("");
      setResendCooldown(60);
      setCodeSent(true);
    } catch (err: any) {
      const parsed = extractErrorMessage(err);
      const errorMessage = translateError(parsed.text, parsed.status);
      setError(errorMessage);
      console.error("Register error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0) return;
    try {
      setError("");
      setSuccess("");
      await authService.resendVerification({ email });
      setSuccess("Письмо отправлено повторно. Проверьте почту.");
      setResendCooldown(60);
    } catch (err: any) {
      const parsed = extractErrorMessage(err);
      const errorMessage = translateError(parsed.text, parsed.status);
      setError(errorMessage);
      console.error("Resend verification error:", err);
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
            {success && (
              <div className="rounded-2xl bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-700 dark:text-green-300">
                {success}
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
              disabled={loading || codeSent}
              className={`w-full rounded-full bg-slate-900 dark:bg-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed ${
                codeSent ? "hidden" : ""
              }`}
            >
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={!codeSent || !email || resendCooldown > 0}
              className={`w-full rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-900 dark:text-slate-50 transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                codeSent ? "" : "hidden"
              }`}
            >
              {resendCooldown > 0
                ? `Отправить письмо ещё раз (${resendCooldown}с)`
                : "Отправить письмо ещё раз"}
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

