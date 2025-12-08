"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";
import { getUploads, type UploadItem } from "@/lib/api";
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  RefreshCw,
  Clock3,
} from "lucide-react";

type GalleryItem = {
  id: string;
  originalUrl: string;
  resultUrl: string;
  style?: string;
  createdAt: string;
};

export default function GalleryPage() {
  const router = useRouter();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          };
        })
        .filter(Boolean) as GalleryItem[];

      setItems(mapped);
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
    url: string,
    filename = "neuroframe-generated-image.jpg"
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

  const handleRefresh = () => {
    loadUploads();
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
            className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-100 transition hover:bg-slate-50 dark:hover:bg-slate-700"
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
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock3 size={16} />
                    <span>
                      {new Date(item.createdAt).toLocaleString("ru-RU", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  {item.style && (
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {item.style}
                    </span>
                  )}
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
                        className="w-full h-auto object-contain"
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
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() =>
                      handleDownload(item.resultUrl, "generated-image.jpg")
                    }
                    className="flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:hover:bg-slate-600"
                  >
                    <Download size={16} />
                    Скачать
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
