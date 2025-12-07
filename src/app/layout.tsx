import type { ReactNode } from "react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const metaTitle = "NeuroFrame — фотогенерация в пару кликов";
const metaDescription =
  "Загрузите фото, выберите стиль и получите готовые нейроизображения в высоком разрешении.";

export const metadata = {
  title: metaTitle,
  description: metaDescription,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-white font-[family-name:var(--font-sans)] text-slate-900 antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
