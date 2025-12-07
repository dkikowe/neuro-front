const pairs = [
  { label: "Портрет", from: "До", to: "После" },
  { label: "Fashion", from: "До", to: "После" },
  { label: "Cinematic", from: "До", to: "После" },
];

export default function BeforeAfterSection() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 max-w-2xl space-y-4">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
            Примеры
          </p>
          <h2 className="text-3xl font-semibold text-slate-900">
            До/после для разных стилей
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {pairs.map((pair) => (
            <div
              key={pair.label}
              className="space-y-4 rounded-3xl border border-slate-100 bg-white p-5"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
                <span>{pair.from}</span>
                <span>{pair.to}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[pair.from, pair.to].map((state) => (
                  <div
                    key={state}
                    className="relative h-48 overflow-hidden rounded-2xl bg-slate-100"
                  >
                    <img
                      src="/test/test.jpg"
                      alt={state}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-slate-600">{pair.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

