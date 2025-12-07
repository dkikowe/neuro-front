import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";

// Единый конфиг axios для всего фронтенда
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==== REQUEST INTERCEPTOR ====
// Подставляем Authorization только если есть валидный accessToken
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const rawToken = localStorage.getItem("accessToken") || "";
      const accessToken = rawToken.trim();

      // На всякий случай очищаем старый заголовок, если он был
      if (config.headers && "Authorization" in config.headers) {
        delete (config.headers as any).Authorization;
      }

      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    // Если данные - FormData, удаляем Content-Type чтобы браузер добавил его с boundary
    const isFormData = config.data instanceof FormData || 
                       (config.data && typeof config.data === 'object' && 'append' in config.data);
    
    if (isFormData && config.headers) {
      // Удаляем Content-Type из всех возможных мест в axios
      // Удаляем из основных заголовков
      if ("Content-Type" in config.headers) {
        delete (config.headers as any)["Content-Type"];
      }
      if ("content-type" in config.headers) {
        delete (config.headers as any)["content-type"];
      }
      // Удаляем из common заголовков
      if (config.headers.common) {
        if ("Content-Type" in config.headers.common) {
          delete (config.headers.common as any)["Content-Type"];
        }
        if ("content-type" in config.headers.common) {
          delete (config.headers.common as any)["content-type"];
        }
      }
      // Явно устанавливаем undefined для предотвращения автоматической установки axios
      (config.headers as any)["Content-Type"] = undefined;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==== RESPONSE INTERCEPTOR ====
// Авто-рефреш accessToken по refreshToken при 401
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Не пытаемся рефрешить токен на эндпоинтах авторизации
    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      if (typeof window !== "undefined") {
        const rawRefreshToken = localStorage.getItem("refreshToken") || "";
        const refreshToken = rawRefreshToken.trim();

        if (refreshToken) {
          try {
            const response = await axios.post(
              `${API_BASE_URL}/auth/refresh`,
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
              localStorage.setItem("accessToken", newAccessToken);
            }
            if (newRefreshToken) {
              localStorage.setItem("refreshToken", newRefreshToken);
            }

            if (newAccessToken) {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              }

              // Повторяем исходный запрос уже с обновлённым токеном
              return api(originalRequest);
            }
          } catch (refreshError) {
            // Рефреш не удался — чистим токены и отправляем на логин (если не на auth‑странице)
            if (typeof window !== "undefined") {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");

              const isOnAuthPage =
                window.location.pathname.startsWith("/auth/login") ||
                window.location.pathname.startsWith("/auth/register");

              if (!isOnAuthPage) {
                // Используем replace чтобы не было истории
                window.location.replace("/auth/login");
              }
            }

            return Promise.reject(refreshError);
          }
        } else {
          // Нет refreshToken — чистим токены и редирект на логин, если не на auth‑странице
          if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");

            const location = (window as any).location;
            if (location) {
              const isOnAuthPage =
                location.pathname.startsWith("/auth/login") ||
                location.pathname.startsWith("/auth/register");

              if (!isOnAuthPage) {
                location.replace("/auth/login");
              }
            }
          }
        }
      } else {
          // Если нет токена вообще (не было попытки рефреша) - редирект на логин
          if (typeof window !== "undefined") {
            const location = (window as any).location;
            if (location) {
              const isOnAuthPage =
                location.pathname.startsWith("/auth/login") ||
                location.pathname.startsWith("/auth/register");

              if (!isOnAuthPage) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                location.replace("/auth/login");
              }
            }
          }
        }
    }

    return Promise.reject(error);
  }
);

// ==== GENERATION API FUNCTIONS ====

export interface Style {
  id: string;
  name: string;
  displayName: string;
  description?: string;
}

export interface UploadResponse {
  fileId?: string;
  file_id?: string;
  fileName?: string;
  file_name?: string;
  url?: string;
  file_url?: string;
  image_url?: string;
}

export interface StartGenerationRequest {
  image_url: string;
  style: string;
}

export interface StartGenerationResponse {
  task_id: string;
  taskId?: string; // для обратной совместимости
}

export interface GenerationStatus {
  status: "PENDING" | "STARTED" | "SUCCESS" | "FAILURE";
  result_url?: string;
  resultUrl?: string; // для обратной совместимости
  resultImageUrl?: string; // для обратной совместимости
  error?: string;
  // Старые поля для обратной совместимости
  taskId?: string;
  originalImageUrl?: string;
  progress?: number;
}

/**
 * Получить список доступных стилей
 * Стили фиксированные согласно документации API
 */
export function getStyles(): Style[] {
  const availableStyles: Style[] = [
    { id: "anime", name: "anime", displayName: "Аниме" },
    { id: "realistic", name: "realistic", displayName: "Реалистичный" },
    { id: "cartoon", name: "cartoon", displayName: "Мультфильм" },
    { id: "digital-art", name: "digital-art", displayName: "Цифровое искусство" },
    { id: "fantasy", name: "fantasy", displayName: "Фэнтези" },
    { id: "cinematic", name: "cinematic", displayName: "Кинематографический" },
    { id: "3d", name: "3d", displayName: "3D" },
    { id: "pixel", name: "pixel", displayName: "Пиксель" },
    { id: "neon", name: "neon", displayName: "Неон" },
    { id: "isometric", name: "isometric", displayName: "Изометрический" },
    { id: "low-poly", name: "low-poly", displayName: "Low Poly" },
    { id: "line-art", name: "line-art", displayName: "Линейный рисунок" },
    { id: "origami", name: "origami", displayName: "Оригами" },
    { id: "tile", name: "tile", displayName: "Плитка" },
    { id: "modeling", name: "modeling", displayName: "Моделирование" },
    { id: "analog", name: "analog", displayName: "Аналоговый" },
    { id: "enhance", name: "enhance", displayName: "Улучшение" },
  ];
  return availableStyles;
}

/**
 * Загрузить файл через бэкенд (бэкенд сам загрузит в S3)
 * Возвращает URL изображения для использования в генерации
 */
export async function uploadFile(file: File): Promise<string> {
  console.log("Starting file upload:", {
    name: file.name,
    size: file.size,
    type: file.type,
  });

  const formData = new FormData();
  formData.append("file", file);

  try {
    // Интерсептор автоматически удалит Content-Type для FormData
    // Браузер сам установит правильный Content-Type с boundary
    const response = await api.post<UploadResponse>("/upload", formData, {
      // Настройки для больших файлов
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 60000, // 60 секунд таймаут для загрузки
    });
    
    console.log("Upload response:", response.data);
    
    // Извлекаем URL изображения из ответа
    const imageUrl = 
      response.data.image_url || 
      response.data.url || 
      response.data.file_url;
    
    if (!imageUrl) {
      throw new Error("Не удалось получить URL изображения от сервера");
    }
    
    return imageUrl;
  } catch (error: any) {
    console.error("Upload error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
    });
    throw error;
  }
}

/**
 * Начать генерацию изображения
 * POST /generate
 */
export async function startGeneration(data: StartGenerationRequest): Promise<StartGenerationResponse> {
  const response = await api.post<StartGenerationResponse>("/generate", data);
  
  // Нормализуем ответ для обратной совместимости
  const result = response.data;
  if (result.task_id && !result.taskId) {
    result.taskId = result.task_id;
  }
  
  return result;
}

/**
 * Получить статус задачи генерации
 * GET /generate/status/{task_id}
 */
export async function getGenerationStatus(taskId: string): Promise<GenerationStatus> {
  const response = await api.get<GenerationStatus>(`/generate/status/${taskId}`);
  
  // Логируем полный ответ от бэкенда
  console.log("=== GET /generate/status/{task_id} Response ===");
  console.log("Task ID:", taskId);
  console.log("Full response:", response);
  console.log("Response data:", response.data);
  console.log("Response status:", response.status);
  console.log("Response headers:", response.headers);
  console.log("================================================");
  
  // Нормализуем ответ для обратной совместимости
  const result = response.data;
  if (result.result_url && !result.resultUrl) {
    result.resultUrl = result.result_url;
    result.resultImageUrl = result.result_url;
  }
  if (!result.taskId) {
    result.taskId = taskId;
  }
  
  // Маппинг статусов для обратной совместимости
  if (result.status === "SUCCESS") {
    result.status = "SUCCESS" as any;
  } else if (result.status === "FAILURE") {
    result.status = "FAILURE" as any;
  } else if (result.status === "STARTED") {
    result.status = "STARTED" as any;
  } else if (result.status === "PENDING") {
    result.status = "PENDING" as any;
  }
  
  return result;
}

