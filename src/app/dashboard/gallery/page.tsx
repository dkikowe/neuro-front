"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";
import { API_BASE_URL, getUploads, type UploadItem } from "@/lib/api";
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  RefreshCw,
  Clock3,
  Loader2,
} from "lucide-react";

type GalleryItem = {
  id: string;
  originalUrl: string;
  resultUrl: string;
  style?: string;
  createdAt: string;
  daysLeft?: number | null;
};

// Маппинг стилей на русский язык (из бэкенда)
const styleNamesRu: Record<string, string> = {
  "soft-minimal": "Софт-минимализм",
  "warm-modern": "Тёплый модерн",
  "neo-japandi": "Нео-Япанди",
  "organic-modern": "Органичный модерн",
  "wabi-sabi-modern": "Ваби-саби модерн",
  "neo-scandinavian": "Нео-скандинавский",
  "monochrome-premium": "Премиальный монохром",
  "soft-brutalism": "Софт-брутализм",
  "modern-mediterranean": "Современный средиземноморский",
  "design-hotel": "Дизайн-отель",
};

const getStyleDisplayName = (styleId?: string): string => {
  if (!styleId) return "";
  return styleNamesRu[styleId] || styleId;
};

const buildDownloadUrl = (fileUrl: string): string => {
  try {
    const urlObj = new URL(fileUrl);
    const key = (urlObj.pathname || "").replace(/^\/+/, "");
    return `${API_BASE_URL}/api/download?key=${encodeURIComponent(key)}`;
  } catch (e) {
    // Если это не валидный URL (вдруг пришёл относительный путь) — пробуем как есть
    const key = fileUrl.replace(/^\/+/, "");
    return `${API_BASE_URL}/api/download?key=${encodeURIComponent(key)}`;
  }
};

export default function GalleryPage() {
  const router = useRouter();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadingHdId, setDownloadingHdId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6); // desktop default

  // Определяем количество карточек на страницу: десктоп 6, мобильные 5
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => {
      const isMobile = window.innerWidth < 640;
      setPageSize(isMobile ? 5 : 6);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const init = async () => {
      setError("");
      const isAuthenticated = await authService.ensureAuthenticated();
      if (!isAuthenticated) {
        router.replace("/auth/login");
        return;
      }

      await loadUploads();
    };

    init();
  }, [router]);

  const loadUploads = async () => {
    setLoading(true);
    setError("");
    try {
      const uploads = await getUploads();
      console.log("Uploads response:", uploads);
      const mapped: GalleryItem[] = uploads
        .map((u: UploadItem, index) => {
          const originalUrl =
            u.before_url ||
            u.before ||
            u.image_url ||
            u.url ||
            u.file_url ||
            "";
          const resultUrl =
            u.after_url ||
            u.after ||
            u.result_url ||
            (u as any).resultUrl ||
            "";

          if (!originalUrl || !resultUrl) return null;

          return {
            id:
              u.id ||
              u.upload_id ||
              u.uploadId ||
              u.fileId ||
              u.file_id ||
              `${index}-${originalUrl}`,
            originalUrl,
            resultUrl,
            style: u.style,
            createdAt: u.created_at || u.createdAt || new Date().toISOString(),
            daysLeft: (u as any).days_left ?? (u as any).daysLeft ?? null,
          };
        })
        .filter(Boolean) as GalleryItem[];

      setItems(mapped);
      setCurrentPage(1);
    } catch (e: any) {
      console.error("Failed to load uploads", e);
      setError(
        e.response?.data?.message || e.message || "Не удалось загрузить список"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (
    itemId: string,
    url: string,
    filename = "neuroframe-generated-image.jpg",
    hd = false
  ) => {
    if (!url) return;

    setDownloadingId(itemId);
    if (hd) {
      setDownloadingHdId(itemId);
    }

    try {
      // Скачивание через прямую ссылку на бэкенд (без fetch, с атрибутом download)
      const downloadUrl = hd
        ? `${buildDownloadUrl(url)}&hd=true`
        : buildDownloadUrl(url);
      const link = document.createElement("a");
      link.href = downloadUrl;

      // Если возможно, берём имя файла из ключа
      try {
        const keyFromUrl = decodeURIComponent(
          downloadUrl.split("key=")[1] || ""
        );
        const nameFromKey = keyFromUrl.split("/").pop();
        link.download = nameFromKey || filename;
      } catch {
        link.download = filename;
      }

      link.style.display = "none";
      link.target = "_self";
      document.body.appendChild(link);
      link.click();

      // Минимум 2 секунды "Скачивание..."
      await new Promise((resolve) => setTimeout(resolve, 2000));

      document.body.removeChild(link);
    } catch (err) {
      console.error("Не удалось скачать файл", err);
      // Fallback — прямой клик по исходному URL
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.target = "_self";
      link.rel = "noopener noreferrer";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      await new Promise((resolve) => setTimeout(resolve, 2000));
      document.body.removeChild(link);
    } finally {
      setDownloadingId(null);
      setDownloadingHdId(null);
    }
  };

  const handleRefresh = () => {
    loadUploads();
  };

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const pagedItems = items.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const goToPage = (page: number) => {
    const safePage = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(safePage);
  };

  if (loading) {
    return (
      <section className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
        <div className="mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center px-6 py-16 text-center">
          <p className="text-slate-600 dark:text-slate-400">Загрузка...</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <Sparkles size={22} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                  Галерея
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  До/после ваших генераций
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-100 transition hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              <RefreshCw size={16} />
              Обновить
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {items.length === 0 && !error ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-10 text-center">
              <ImageIcon
                size={48}
                className="mx-auto text-slate-300 dark:text-slate-600"
              />
              <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-50">
                Пока нет работ
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Сгенерируйте изображение, чтобы увидеть его в галерее.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {pagedItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Clock3 size={16} />
                      <span>
                        {new Date(item.createdAt).toLocaleDateString("ru-RU", {
                          dateStyle: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {typeof item.daysLeft === "number"
                          ? `Осталось дней: ${item.daysLeft}`
                          : "Сгенерировано до обновления"}
                      </span>
                      {item.style && (
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                          {getStyleDisplayName(item.style)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <ImageIcon size={16} />
                        До
                      </p>
                      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                        <img
                          src={item.originalUrl}
                          alt="До"
                          loading="lazy"
                          className="w-full h-auto object-contain cursor-zoom-in"
                          onClick={() => setPreviewUrl(item.originalUrl)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Sparkles size={16} />
                        После
                      </p>
                      <div className="relative overflow-hidden rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                        <img
                          src={item.resultUrl}
                          alt="После"
                          loading="lazy"
                          className="w-full h-auto object-contain cursor-zoom-in"
                          onClick={() => setPreviewUrl(item.resultUrl)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() =>
                        handleDownload(
                          item.id,
                          item.resultUrl,
                          "generated-image.jpg",
                          false
                        )
                      }
                      disabled={downloadingId === item.id}
                      className="flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:hover:bg-slate-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadingId === item.id && !downloadingHdId ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Загрузка...
                        </>
                      ) : (
                        <>
                          <Download size={16} />
                          Скачать (SD)
                        </>
                      )}
                    </button>
                    <button
                      onClick={() =>
                        handleDownload(
                          item.id,
                          item.resultUrl,
                          "generated-image-hd.jpg",
                          true
                        )
                      }
                      disabled={downloadingId === item.id}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-900 dark:text-slate-50 transition hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadingHdId === item.id ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Загрузка HD...
                        </>
                      ) : (
                        <>
                          <Download size={16} />
                          Скачать HD
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {items.length > pageSize && (
            <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                «
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      page === currentPage
                        ? "bg-slate-900 text-white dark:bg-slate-700"
                        : "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                »
              </button>
            </div>
          )}
        </div>
      </section>
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-5xl w-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => setPreviewUrl(null)}
                className="rounded-full bg-black/40 text-white px-3 py-1 text-sm hover:bg-black/60"
              >
                Закрыть
              </button>
            </div>
            <div className="flex items-center justify-center max-h-[90vh]">
              <img
                src={previewUrl}
                alt="Предпросмотр"
                className="max-h-[90vh] w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
