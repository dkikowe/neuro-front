const pairs = [
  { 
    label: "Современная роскошь", 
    beforeImage: "/main/ex1before.jpg",
    afterImage: "/main/ex1after.png"
  },
  { 
    label: "Япанди", 
    beforeImage: "/main/ex2before.jpg",
    afterImage: "/main/ex2after.png"
  },
  { 
    label: "Арт деко", 
    beforeImage: "/main/ex3before.jpg",
    afterImage: "/main/ex3after.jpg"
  },
];

export default function BeforeAfterSection() {
  return (
    <section className="bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 max-w-2xl space-y-4">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
            Примеры
          </p>
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-50">
            До/после для разных стилей
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {pairs.map((pair) => (
            <div
              key={pair.label}
              className="space-y-4 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-colors"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                <span>До</span>
                <span>После</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative h-48 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                  <img
                    src={pair.beforeImage}
                    alt="До"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="relative h-48 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                  <img
                    src={pair.afterImage}
                    alt="После"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{pair.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

