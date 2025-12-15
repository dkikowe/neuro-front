"use client";

type Plan = {
  title: string;
  price: string;
  badge?: string;
  description: string;
  details: string[];
};

const oneTime: Plan[] = [
  {
    title: "1 HD — 79 ₽",
    price: "79 ₽",
    description: "1 HD-изображение в высоком качестве",
    details: [
      "Доступ сразу после оплаты",
      "Идеален для 1 комнаты и 1 варианта",
    ],
  },
  {
    title: "3 HD — 149 ₽",
    price: "149 ₽",
    description:
      "Можно сделать 1 комнату в 3 стилях или 3 варианта одного стиля",
    details: ["Экономия относительно покупки по 1 шт."],
  },
  {
    title: "5 HD — 249 ₽",
    price: "249 ₽",
    badge: "★ Хит",
    description: "5 HD-изображений",
    details: [
      "Хватает на 1–2 комнаты или 4–5 разных стилей одной комнаты",
      "Удобен для «до/после» и сохранения лучших вариантов",
    ],
  },
  {
    title: "10 HD — 449 ₽",
    price: "449 ₽",
    description: "10 HD-изображений",
    details: ["Подходит для 2–3 комнат и теста разных стилей"],
  },
  {
    title: "20 HD — 799 ₽",
    price: "799 ₽",
    badge: "PRO",
    description: "20 HD-изображений",
    details: ["Удобно для квартиры целиком (несколько комнат + разные стили)"],
  },
];

const subs: Plan[] = [
  {
    title: "Lite — 299 ₽ / месяц",
    price: "299 ₽ / мес",
    description: "Для тех, кто делает редизайн время от времени.",
    details: [
      "Базовый доступ к сервису",
      "Удобно, если нужны идеи “иногда”",
      "Выгоднее разовых покупок при регулярном использовании",
    ],
  },
  {
    title: "Standard — 599 ₽ / месяц",
    price: "599 ₽ / мес",
    badge: "иРекомендуем",
    description: "Самый сбалансированный план по цене и возможностям.",
    details: [
      "Комфортный режим для регулярных редизайнов",
      "Идеален для теста стилей и подготовки к ремонту",
      "Лучшее соотношение цена/ценность",
    ],
  },
  {
    title: "Pro — 1499 ₽ / месяц",
    price: "1499 ₽ / мес",
    description: "Для активных пользователей и профессионалов.",
    details: [
      "Максимум возможностей",
      "Подходит дизайнерам/риэлторам/контент‑создателям",
      "Лучший вариант, если генерируешь много каждый месяц",
    ],
  },
];

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {plan.title}
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {plan.description}
          </p>
        </div>
        {plan.badge && (
          <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 px-3 py-1 text-xs font-semibold">
            {plan.badge}
          </span>
        )}
      </div>
      <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
        {plan.details.map((d) => (
          <li key={d} className="flex gap-2">
            <span>•</span>
            <span>{d}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          {plan.price}
        </span>
        <button className="rounded-full bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:hover:bg-slate-600">
          Купить
        </button>
      </div>
    </div>
  );
}

export default function PackagesPage() {
  return (
    <section className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="mx-auto max-w-6xl px-6 py-16 space-y-10">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Пакеты и подписки
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Выберите удобный вариант: разовые HD-пакеты или подписку для
            регулярной работы.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            Разовые пакеты HD
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {oneTime.map((plan) => (
              <PlanCard key={plan.title} plan={plan} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            Подписки
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subs.map((plan) => (
              <PlanCard key={plan.title} plan={plan} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
