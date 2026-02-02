import type { ReactNode } from "react";
import Script from "next/script";
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";

const metaTitle = "Нейросеть для дизайна интерьера онлайн — InteriorAI Hub";
const metaDescription =
  "InteriorAI Hub — это современный инструмент на базе нейросети, позволяющий создать интерьер мечты по фото за пару минут. Загрузите изображение, выберите стиль и получите профессиональный дизайн-проект квартиры или комнаты онлайн.";

export const metadata: Metadata = {
  metadataBase: new URL("https://interioraihub.com"),
  title: {
    default: metaTitle,
    template: `%s | InteriorAI Hub`,
  },
  description: metaDescription,
  keywords: [
    "нейросеть для дизайна интерьера",
    "дизайн интерьера онлайн",
    "нейросеть дизайн квартиры",
    "ии для интерьера",
    "дизайн комнаты бесплатно",
    "interior ai",
    "нейросеть ремонт",
    "дизайн дома по фото",
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
    url: "https://interioraihub.com",
    siteName: "InteriorAI Hub",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: "/main/ava.png", // Using an existing image as OG
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
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js?id=106510720", "ym");

            ym(106510720, "init", {
              ssr:true,
              webvisor:true,
              clickmap:true,
              ecommerce:"dataLayer",
              referrer: document.referrer,
              url: location.href,
              accurateTrackBounce:true,
              trackLinks:true
            });
          `}
        </Script>
        <noscript>
          <div>
            <img src="https://mc.yandex.ru/watch/106510720" style={{ position: "absolute", left: "-9999px" }} alt="" />
          </div>
        </noscript>
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
