import { Link } from 'react-router-dom';

export default function LegalShell({ eyebrow, title, updated, intro, sections, crossLink }) {
  return (
    <div className="passenger-shell py-8 lg:py-12">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_236px] lg:gap-12">
        <article className="max-w-[680px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-[29px] font-semibold leading-tight tracking-[-0.03em] text-navy sm:text-[36px]">
            {title}
          </h1>
          <p className="mt-2 text-[12px] text-muted">Last updated {updated}</p>
          <p className="mt-4 text-[14px] leading-relaxed text-muted">{intro}</p>

          <div className="mt-9 space-y-8">
            {sections.map((section, index) => (
              <section key={section.heading} id={section.id} className="scroll-mt-24">
                <h2 className="text-[16px] font-semibold text-navy">
                  <span aria-hidden="true" className="mr-2 text-[13px] font-semibold text-muted">
                    {String(index + 1).padStart(2, '0')}
                  </span>{' '}
                  {section.heading}
                </h2>
                {section.body?.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-2.5 text-[13.5px] leading-relaxed text-muted"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[13.5px] leading-relaxed text-muted marker:text-border">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </article>

        <aside className="mt-10 lg:mt-0 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[8px] border border-border bg-surface p-5">
            <h2 className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-navy">
              On this page
            </h2>
            <ol className="mt-3 space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-[12.5px] leading-snug text-muted transition hover:text-navy"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-3 rounded-[8px] border border-border bg-surface p-5">
            <p className="text-[12.5px] leading-relaxed text-muted">
              Questions about this document? Write to{' '}
              <a
                href="mailto:support@swiftbus.rw"
                className="font-medium text-navy underline decoration-navy/30 underline-offset-2"
              >
                support@swiftbus.rw
              </a>
              .
            </p>
            <Link
              to={crossLink.to}
              className="mt-3 inline-flex text-[12.5px] font-semibold text-navy underline decoration-navy/30 underline-offset-4 transition hover:text-accent hover:decoration-accent"
            >
              {crossLink.label}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
