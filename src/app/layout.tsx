import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";

const metaTitle = "InteriorAI Hub — Дизайн интерьера с помощью ИИ";
const metaDescription =
  "Загрузите фото, выберите стиль и получите готовые нейроизображения интерьера в высоком разрешении. AI-генерация дизайна за секунды.";

export const metadata: Metadata = {
  metadataBase: new URL("https://interioeaihub.com"),
  title: {
    default: metaTitle,
    template: `%s | InteriorAI Hub`,
  },
  description: metaDescription,
  keywords: [
    "AI дизайн интерьера",
    "нейросеть интерьер",
    "редизайн комнаты онлайн",
    "дизайн квартиры по фото",
    "Interior AI",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: metaTitle,
    description: metaDescription,
    url: "https://interioeaihub.com",
    siteName: "InteriorAI Hub",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: "/main/block.jpg", // Using an existing image as OG
        width: 1200,
        height: 630,
        alt: "InteriorAI Hub Preview",
      },
    ],
  },
  icons: {
    icon: "/main/ava.png",
    shortcut: "/main/ava.png",
    apple: "/main/ava.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'light';
                  document.documentElement.classList.toggle('dark', theme === 'dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased transition-colors duration-200 dark:bg-slate-950 dark:text-slate-50">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
