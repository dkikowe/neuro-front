import Button from "./Button";

export default function CTASection() {
  return (
    <section className="bg-slate-900">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center text-white">
        <p className="text-sm uppercase tracking-[0.25em] text-white/60">
          Попробуйте сегодня
        </p>
        <h2 className="mt-4 text-3xl font-semibold">Соберите свою галерею</h2>
        <p className="mt-3 text-base text-white/70">
          Подготовьте набор исходников, выберите стиль и получите готовые серии
          картинок в высоком разрешении.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button href="/auth/register">Создать аккаунт</Button>
          <Button href="/auth/login" variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
            Войти
          </Button>
        </div>
      </div>
    </section>
  );
}

