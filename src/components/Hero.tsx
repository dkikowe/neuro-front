import Button from "./Button";

export default function Hero() {
  return (
    <section className="bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-24 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-6">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
            Фото → Интерьер → Рендер
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
            Создавайте новый интерьер из любой фотографии
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Загрузите изображение комнаты и получите серию реалистичных вариантов в разных стилях. AI аккуратно сохраняет планировку и структуру помещения, предлагая обновлённый дизайн в студийном качестве.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button href="/auth/register">Попробовать</Button>
            <Button href="/auth/login" variant="secondary">
              Уже есть аккаунт
            </Button>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4 rounded-3xl border border-white/70 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            {["20+ стилей", "HD экспорт", "Мгновенные превью"].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-4 text-slate-600 dark:text-slate-400"
              >
                {item}
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 p-6 text-white">
            <p className="text-sm uppercase tracking-widest text-white/70">
              Превью генерации
            </p>
            <p className="mt-3 text-2xl font-semibold">
              Нейросеть готова к запуску
            </p>
            <p className="mt-2 text-white/70">
              Просматривайте результаты сразу после загрузки фото.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

