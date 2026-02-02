import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вход в аккаунт",
  description: "Войдите в личный кабинет InteriorAI Hub для доступа к генерации интерьеров.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}



