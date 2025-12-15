export default function Footer() {
  return (
    <footer className="border-t border-slate-100 dark:border-slate-800 transition-colors">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} interiorAI hub</p>
        <p>Сервис генерации изображений на базе нейросетей</p>
      </div>
    </footer>
  );
}
