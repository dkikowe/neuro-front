"use client";

export default function RefundPage() {
  return (
    <section className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="mx-auto max-w-4xl px-6 py-12 space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Условия возврата денежных средств
        </h1>

        <div className="space-y-4 text-slate-800 dark:text-slate-200">
          <h2 className="text-xl font-semibold">1. Общие положения</h2>
          <p>1.1. Услуги, предоставляемые на сайте https://neuro-front.vercel.app/, являются цифровыми и оказываются онлайн.</p>

          <h2 className="text-xl font-semibold">2. Возврат средств</h2>
          <p>2.1. Возврат денежных средств возможен только в случае, если услуга не была оказана по техническим причинам со стороны Исполнителя.</p>
          <p>2.2. Возврат не осуществляется, если услуга была оказана, но результат не соответствует субъективным ожиданиям пользователя.</p>

          <h2 className="text-xl font-semibold">3. Порядок обращения</h2>
          <p>3.1. Для запроса возврата необходимо направить обращение на email: contact.interiorai@gmail.com с указанием даты оплаты, суммы и причины обращения.</p>

          <h2 className="text-xl font-semibold">4. Сроки рассмотрения</h2>
          <p>4.1. Обращения рассматриваются в течение 5 рабочих дней.</p>

          <p>Дата публикации: 19.12.2025</p>
        </div>
      </div>
    </section>
  );
}

