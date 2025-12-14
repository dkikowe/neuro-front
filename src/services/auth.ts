import { api } from "@/lib/api";

export interface RegisterData {
  email: string;
  password: string;
}

export interface ResendVerificationData {
  email: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  generation_count?: number;
  generations_count?: number;
  generations_remaining?: number;
  total_generations?: number;
  remaining_generations?: number;
}

export const authService = {
  // Регистрация: просто создаём пользователя.
  // Токены здесь не ожидаем, по ТЗ после 201 сразу логинимся отдельным запросом.
  async register(data: RegisterData): Promise<void> {
    await api.post("/auth/register", data);
  },

  async resendVerification(data: ResendVerificationData): Promise<void> {
    await api.post("/auth/resend-verification", data);
  },

  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    await api.post("/auth/forgot-password", data);
  },

  async resetPassword(data: ResetPasswordData): Promise<void> {
    await api.post("/auth/reset-password", data);
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const formData = new URLSearchParams();
    formData.append("username", data.username);
    formData.append("password", data.password);

    const response = await api.post("/auth/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    
    const responseData = response.data;
    return {
      accessToken: responseData.accessToken || responseData.access_token,
      refreshToken: responseData.refreshToken || responseData.refresh_token,
    };
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>("/auth/me");
    console.log("=== authService.getMe() Raw Response ===");
    console.log("Full response:", response);
    console.log("Response data:", response.data);
    console.log("Response status:", response.status);
    console.log("======================================");
    return response.data;
  },

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  },

  // Сейчас нам важен только accessToken, refreshToken делаем опциональным
  setTokens(accessToken: string, refreshToken?: string): void {
    if (typeof window !== "undefined") {
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }
      // refresh токен можем начать использовать позже, пока он не обязателен
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
    }
  },

  getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  },

  getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refreshToken");
    }
    return null;
  },

  // Функция для рефреша токена
  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await api.post(
        "/auth/refresh",
        { refresh_token: refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data: any = response.data;
      const newAccessToken = data.accessToken || data.access_token;
      const newRefreshToken = data.refreshToken || data.refresh_token;

      if (newAccessToken) {
        this.setTokens(newAccessToken, newRefreshToken);
        return newAccessToken;
      }

      return null;
    } catch (error) {
      // Если рефреш не удался, очищаем токены
      this.logout();
      return null;
    }
  },

  // Проверка наличия токена и попытка рефреша при необходимости
  async ensureAuthenticated(): Promise<boolean> {
    const accessToken = this.getAccessToken();
    if (accessToken) {
      return true;
    }

    // Если нет accessToken, пробуем рефреш
    const newToken = await this.refreshAccessToken();
    return !!newToken;
  },
};



