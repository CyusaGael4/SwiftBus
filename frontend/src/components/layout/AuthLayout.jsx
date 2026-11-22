import PassengerHeader from '../passenger/PassengerHeader.jsx';

// Auth screens keep the site header and scroll with the document, so the
// scrollbar sits on the right edge of the window instead of inside the card.
export default function AuthLayout({
  eyebrow,
  title,
  description,
  footer,
  children,
}) {
  const hasHeading = Boolean(eyebrow || title || description);

  return (
    <div className="flex min-h-[100svh] flex-col bg-cream">
      <PassengerHeader />

      <main className="flex flex-1 justify-center px-5 py-10 sm:px-6 sm:py-14">
        <div className="my-auto w-full max-w-[440px]">
          <div className="overflow-hidden rounded-[10px] border border-border bg-white shadow-[0_1px_2px_rgba(40,43,74,0.04),0_18px_40px_-32px_rgba(40,43,74,0.45)]">
            <div className="px-6 py-7 sm:px-9 sm:py-8">
              {eyebrow ? (
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                  {eyebrow}
                </p>
              ) : null}

              {title ? (
                <h1 className="text-[27px] font-semibold leading-[1.15] tracking-[-0.03em] text-navy sm:text-[30px]">
                  {title}
                </h1>
              ) : null}

              {description ? (
                <p className="mt-2.5 text-[14px] leading-relaxed text-muted">
                  {description}
                </p>
              ) : null}

              <div className={hasHeading ? 'mt-7' : ''}>{children}</div>
            </div>

            {footer ? (
              <div className="border-t border-border bg-cream/40 px-6 py-5 sm:px-9">
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
