const steps = [
  {
    title: "Загрузка",
    description: "Добавьте одно или несколько исходных фото в личном кабинете.",
  },
  {
    title: "Выбор стиля",
    description: "Настройте стили или выберите готовые пресеты для сцены.",
  },
  {
    title: "Генерация",
    description: "Получите серию результатов и управляйте параметрами вывода.",
  },
  {
    title: "Галерея и экспорт",
    description: "Скачайте предпросмотры или оформите HD-рендер за пару кликов.",
  },
];

export default function Steps() {
  return (
    <section className="border-y border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 max-w-2xl space-y-4">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
            Как это работает
          </p>
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-50">
            Полный путь от загрузки до HD-версии занимает меньше минуты
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Каждый шаг построен так, чтобы вы могли быстро проверить результат и
            перейти к оплате только при необходимости.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 p-6 transition-colors"
            >
              <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-slate-50">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

