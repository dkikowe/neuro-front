export default function Footer() {
  return (
    <footer className="border-t border-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} NeuroFrame</p>
        <p>Сервис генерации изображений на базе нейросетей</p>
      </div>
    </footer>
  );
}

