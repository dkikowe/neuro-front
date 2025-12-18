export default function Footer() {
  return (
    <footer className="border-t border-slate-100 dark:border-slate-800 transition-colors">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-slate-500 dark:text-slate-400">
        <p className="text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} InteriorAI
        </p>
        <p className="text-slate-500 dark:text-slate-400">
          Самозанятый Иванов Иван Иванович, ИНН{" "}
          <a href="tel:123456789012" className="hover:underline">
            123456789012
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
          <a href="mailto:support@ВАШ_ДОМЕН" className="hover:underline">
            Контакты
          </a>
        </div>
      </div>
    </footer>
  );
}
