const features = [
  {
    title: "Стабильные модели",
    description: "Оптимизированные пайплайны для портретов и e-commerce сцен.",
  },
  {
    title: "Прозрачная оплата",
    description: "Предпросмотры бесплатны, HD-рендеры доступны поштучно или в пакете.",
  },
  {
    title: "Галерея в облаке",
    description: "Доступ к истории генераций с любых устройств.",
  },
  {
    title: "Приватность",
    description: "Исходники автоматически удаляются через 24 часа.",
  },
];

export default function Features() {
  return (
    <section className="bg-white dark:bg-slate-900 transition-colors">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
            Преимущества
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-50">
            Всё, что нужно для production
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Настрой инфраструктуру однажды и масштабируй сервис для команды.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.04)] transition-colors"
            >
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

