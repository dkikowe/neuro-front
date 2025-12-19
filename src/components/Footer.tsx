export default function Footer() {
  return (
    <footer className="border-t border-slate-100 dark:border-slate-800 transition-colors">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-slate-500 dark:text-slate-400">
        <p className="text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} InteriorAI
        </p>
        <p className="text-slate-500 dark:text-slate-400">
          Самозанятый АЛХИМОВ ДАНИЛ РОМАНОВИЧ, ИНН{" "}
          <a href="tel:312832501769" className="hover:underline">
            312832501769
          </a>
        </p>
        <div className="flex flex-col gap-2">
          <a href="/legal/offer" className="hover:underline">
            Публичная оферта
          </a>
          <a href="/legal/privacy" className="hover:underline">
            Политика конфиденциальности
          </a>
          <a href="/legal/refund" className="hover:underline">
            Условия оказания услуг
          </a>
          <a
            href="mailto:contact.interiorai@gmail.com"
            className="hover:underline"
          >
            Контакты
          </a>
          <a
            href="https://www.instagram.com/interiorai_hub?igsh=MW9kamdmZXl6azAwOQ%3D%3D&utm_source=qr"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:underline"
          >
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
