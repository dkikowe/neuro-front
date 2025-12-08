"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";
import {
  getStyles,
  uploadFile,
  startGeneration,
  getGenerationStatus,
  deleteUpload,
  type Style,
  type GenerationStatus,
} from "@/lib/api";
import {
  Upload,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  FileImage,
  Palette,
  Zap,
  Download,
} from "lucide-react";

type UploadState = "idle" | "uploading" | "uploaded" | "error";
type GenerationState = "idle" | "generating" | "completed" | "error";
type GalleryItem = {
  id: string;
  originalUrl: string;
  resultUrl: string;
  style?: string;
  createdAt: string;
};

const GALLERY_STORAGE_KEY = "galleryItems";

export default function GeneratePage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadError, setUploadError] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);

  const [styles, setStyles] = useState<Style[]>([]);
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [stylesLoading, setStylesLoading] = useState(false);
  const [stylesError, setStylesError] = useState("");

  const [generationState, setGenerationState] =
    useState<GenerationState>("idle");
  const [generationError, setGenerationError] = useState("");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] =
    useState<GenerationStatus | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Проверка авторизации
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await authService.ensureAuthenticated();
      if (!isAuthenticated) {
        router.replace("/auth/login");
      }
    };

    checkAuth();
  }, [router]);

  // Загрузка списка стилей
  useEffect(() => {
    const loadStyles = async () => {
      setStylesLoading(true);
      setStylesError("");
      try {
        const stylesData = await getStyles();
        setStyles(stylesData);
      } catch (err: any) {
        setStylesError("Не удалось загрузить список стилей");
        console.error("Styles fetch error:", err);
      } finally {
        setStylesLoading(false);
      }
    };

    loadStyles();
  }, []);

  // Polling статуса генерации
  useEffect(() => {
    if (taskId && generationState === "generating") {
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const status = await getGenerationStatus(taskId);

          // Дополнительное логирование на странице
          console.log("=== Status Update on Page ===");
          console.log("Status object:", status);
          console.log("Status.status:", status.status);
          console.log("Status.result_url:", status.result_url);
          console.log("Status.error:", status.error);
          console.log("=============================");

          setGenerationStatus(status);

          if (status.status === "SUCCESS") {
            setGenerationState("completed");
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          } else if (status.status === "FAILURE") {
            setGenerationState("error");
            setGenerationError(
              status.error || "Генерация завершилась с ошибкой"
            );
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          }
        } catch (err: any) {
          console.error("Status polling error:", err);
          console.error("Error response:", err.response);
          console.error("Error data:", err.response?.data);
        }
      }, 2000); // Опрос каждые 2 секунды
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [taskId, generationState]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadState("idle");
      setUploadError("");
      setOriginalImageUrl(URL.createObjectURL(file));
      setUploadId(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Выберите файл");
      return;
    }

    try {
      setUploadState("uploading");
      setUploadError("");

      // Загружаем файл через бэкенд и получаем URL изображения
      const { imageUrl, uploadId: receivedUploadId } = await uploadFile(
        selectedFile
      );

      if (!imageUrl) {
        throw new Error("Не удалось получить URL изображения от сервера");
      }

      setUploadedImageUrl(imageUrl);
      setUploadId(receivedUploadId || null);
      setUploadState("uploaded");
    } catch (err: any) {
      setUploadState("error");

      // Детальная обработка ошибок валидации
      let errorMessage = "Произошла ошибка при загрузке";

      if (err.response?.status === 422) {
        // Ошибка валидации - показываем детали от бэкенда
        const validationErrors =
          err.response?.data?.detail || err.response?.data?.errors;
        if (Array.isArray(validationErrors)) {
          errorMessage = validationErrors
            .map(
              (e: any) =>
                `${e.field || e.loc?.join(".")}: ${e.msg || e.message}`
            )
            .join(", ");
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (typeof validationErrors === "string") {
          errorMessage = validationErrors;
        } else {
          errorMessage = "Ошибка валидации данных. Проверьте формат файла.";
        }
      } else {
        errorMessage =
          err.response?.data?.message || err.message || errorMessage;
      }

      setUploadError(errorMessage);
      console.error("Upload error:", err);
      console.error("Error response:", err.response?.data);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImageUrl) {
      setGenerationError("Сначала загрузите файл");
      return;
    }

    if (!selectedStyleId) {
      setGenerationError("Выберите стиль");
      return;
    }

    try {
      setGenerationState("generating");
      setGenerationError("");

      const response = await startGeneration({
        image_url: uploadedImageUrl,
        style: selectedStyleId,
        upload_id: uploadId || undefined,
      });

      const taskIdValue = response.task_id || response.taskId;
      if (!taskIdValue) {
        throw new Error("Не удалось получить task_id от сервера");
      }

      setTaskId(taskIdValue);
    } catch (err: any) {
      setGenerationState("error");
      setGenerationError(
        err.response?.data?.message || err.message || "Ошибка генерации"
      );
      console.error("Generation start error:", err);
    }
  };

  const handleDeleteUpload = async () => {
    if (!uploadId) {
      setUploadError("Нет идентификатора загрузки для удаления");
      return;
    }

    try {
      setUploadState("uploading");
      await deleteUpload(uploadId);
      handleReset();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Не удалось удалить загрузку";
      setUploadError(errorMessage);
      setUploadState("error");
      console.error("Delete upload error:", err);
    }
  };

  const handleDownload = async (
    url?: string,
    filename = "generated-image.jpg"
  ) => {
    if (!url) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed", err);
      window.open(url, "_blank");
    }
  };

  // Сохраняем результат в локальную галерею
  useEffect(() => {
    if (
      generationState === "completed" &&
      (generationStatus?.result_url ||
        generationStatus?.resultUrl ||
        generationStatus?.resultImageUrl) &&
      originalImageUrl
    ) {
      const resultUrl = (generationStatus.result_url ||
        generationStatus.resultUrl ||
        generationStatus.resultImageUrl) as string;

      const existingRaw =
        typeof window !== "undefined"
          ? localStorage.getItem(GALLERY_STORAGE_KEY)
          : null;
      const existing: GalleryItem[] = existingRaw
        ? JSON.parse(existingRaw)
        : [];

      const newItem: GalleryItem = {
        id:
          generationStatus.taskId ||
          (typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}`),
        originalUrl: originalImageUrl,
        resultUrl,
        style: selectedStyleId || undefined,
        createdAt: new Date().toISOString(),
      };

      const updated = [newItem, ...existing].slice(0, 50);
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(updated));
    }
  }, [generationState, generationStatus, originalImageUrl, selectedStyleId]);

  const handleReset = () => {
    setSelectedFile(null);
    setUploadState("idle");
    setUploadError("");
    setUploadedImageUrl(null);
    setOriginalImageUrl(null);
    setUploadId(null);
    setSelectedStyleId(null);
    setGenerationState("idle");
    setGenerationError("");
    setTaskId(null);
    setGenerationStatus(null);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  return (
    <section className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-slate-50 sm:text-2xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <Sparkles size={24} />
            </div>
            Генерация фото
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Загрузите фото и выберите стиль для создания уникального изображения
          </p>
        </div>

        {/* Блок загрузки файла */}
        <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-8 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              <Upload size={20} />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Шаг 1: Загрузка фото
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Выберите изображение
              </label>

              {!selectedFile ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileImage
                      size={48}
                      className="mb-4 text-slate-400 dark:text-slate-500"
                    />
                    <p className="mb-2 px-4 text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">
                        Нажмите для загрузки
                      </span>{" "}
                      или перетащите файл
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      PNG, JPG, WEBP до 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={
                      uploadState === "uploading" || uploadState === "uploaded"
                    }
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                      <ImageIcon size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-slate-50">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    {uploadState === "uploaded" && (
                      <CheckCircle2 size={24} className="text-green-500" />
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={handleDeleteUpload}
                      disabled={!uploadId || uploadState === "uploading"}
                      className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle size={16} />
                      Удалить загрузку
                    </button>
                  </div>
                </div>
              )}
            </div>

            {uploadError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                <XCircle size={20} />
                <span>{uploadError}</span>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={
                !selectedFile ||
                uploadState === "uploading" ||
                uploadState === "uploaded"
              }
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-700 dark:to-slate-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:from-slate-800 hover:to-slate-700 dark:hover:from-slate-600 dark:hover:to-slate-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {uploadState === "uploading" ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Загрузка...
                </>
              ) : uploadState === "uploaded" ? (
                <>
                  <CheckCircle2 size={18} />
                  Файл загружен
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Загрузить файл
                </>
              )}
            </button>
          </div>
        </div>

        {/* Блок выбора стиля */}
        {uploadState === "uploaded" && (
          <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-8 shadow-sm transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <Palette size={20} />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                Шаг 2: Выбор стиля
              </h2>
            </div>

            {stylesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2
                  size={32}
                  className="animate-spin text-slate-400 dark:text-slate-500"
                />
                <p className="ml-3 text-sm text-slate-600 dark:text-slate-400">
                  Загрузка стилей...
                </p>
              </div>
            ) : stylesError ? (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                <XCircle size={20} />
                <span>{stylesError}</span>
              </div>
            ) : styles.length === 0 ? (
              <div className="text-center py-12">
                <Palette
                  size={48}
                  className="mx-auto text-slate-300 dark:text-slate-600 mb-4"
                />
                <p className="text-slate-600 dark:text-slate-400">
                  Стили не найдены
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyleId(style.id)}
                    disabled={generationState === "generating"}
                    className={`group relative rounded-xl border-2 px-4 py-4 text-sm font-medium transition-all ${
                      selectedStyleId === style.id
                        ? "border-slate-900 dark:border-slate-600 bg-slate-900 dark:bg-slate-700 text-white shadow-lg scale-105"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-md"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {selectedStyleId === style.id && (
                      <CheckCircle2
                        size={20}
                        className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 rounded-full"
                      />
                    )}
                    <div className="flex flex-col items-center gap-2">
                      <Palette
                        size={24}
                        className={
                          selectedStyleId === style.id
                            ? "text-white"
                            : "text-slate-400 dark:text-slate-500"
                        }
                      />
                      <span>{style.displayName || style.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Кнопка генерации */}
        {uploadState === "uploaded" && selectedStyleId && (
          <div className="mb-6">
            <button
              onClick={handleGenerate}
              disabled={generationState === "generating"}
              className="flex items-center justify-center gap-3 w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 text-base font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {generationState === "generating" ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Генерация...
                </>
              ) : generationState === "completed" ? (
                <>
                  <CheckCircle2 size={20} />
                  Готово
                </>
              ) : (
                <>
                  <Zap size={20} />
                  Сгенерировать изображение
                </>
              )}
            </button>
          </div>
        )}

        {/* Статус генерации */}
        {generationState !== "idle" && (
          <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-8 shadow-sm transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  generationState === "completed"
                    ? "bg-gradient-to-br from-green-500 to-emerald-500"
                    : generationState === "error"
                    ? "bg-gradient-to-br from-red-500 to-rose-500"
                    : "bg-gradient-to-br from-blue-500 to-cyan-500"
                } text-white`}
              >
                {generationState === "completed" ? (
                  <CheckCircle2 size={20} />
                ) : generationState === "error" ? (
                  <XCircle size={20} />
                ) : (
                  <Loader2 size={20} className="animate-spin" />
                )}
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                Статус генерации
              </h2>
            </div>

            <div className="space-y-4">
              {generationState === "generating" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin text-blue-500" />
                    <p className="text-base font-medium text-slate-700 dark:text-slate-300">
                      {generationStatus?.status === "PENDING"
                        ? "В очереди на обработку"
                        : generationStatus?.status === "STARTED"
                        ? "Обрабатывается..."
                        : "Генерация изображения..."}
                    </p>
                  </div>
                  {generationStatus?.progress !== undefined && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                        <span>Прогресс</span>
                        <span>{generationStatus.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-300 shadow-sm"
                          style={{ width: `${generationStatus.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {generationState === "completed" && (
                <div className="flex items-center gap-2 rounded-xl bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
                  <CheckCircle2
                    size={20}
                    className="text-green-600 dark:text-green-400"
                  />
                  <p className="text-base font-medium text-green-700 dark:text-green-400">
                    Генерация успешно завершена!
                  </p>
                </div>
              )}

              {generationState === "error" && generationError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                  <XCircle size={20} />
                  <span>{generationError}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Предпросмотр изображений */}
        {(originalImageUrl || generationStatus?.resultImageUrl) && (
          <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <ImageIcon size={20} />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                Предпросмотр
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {originalImageUrl && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileImage
                      size={18}
                      className="text-slate-400 dark:text-slate-500"
                    />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Исходное изображение
                    </p>
                  </div>
                  <div className="relative overflow-hidden rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <img
                      src={originalImageUrl}
                      alt="Исходное"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
              )}
              {(generationStatus?.result_url ||
                generationStatus?.resultUrl ||
                generationStatus?.resultImageUrl) && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-purple-500" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Результат генерации
                    </p>
                  </div>
                  <div className="relative overflow-hidden rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                    <img
                      src={
                        generationStatus.result_url ||
                        generationStatus.resultUrl ||
                        generationStatus.resultImageUrl
                      }
                      alt="Результат"
                      className="w-full h-auto object-contain"
                    />
                    {generationState === "completed" && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
                        <CheckCircle2 size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() =>
                        handleDownload(
                          generationStatus.result_url ||
                            generationStatus.resultUrl ||
                            generationStatus.resultImageUrl,
                          "generated-image.jpg"
                        )
                      }
                      className="flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:hover:bg-slate-600"
                    >
                      <Download size={16} />
                      Скачать
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Кнопка сброса */}
        {(uploadState === "uploaded" || generationState === "completed") && (
          <div className="flex justify-center">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-all hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm hover:shadow-md"
            >
              <RefreshCw size={18} />
              Начать заново
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
