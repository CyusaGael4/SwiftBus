import { Link } from 'react-router-dom';
import Brand from '../ui/Brand.jsx';

// One centred column, locked to the viewport so an auth screen never scrolls the
// document. If a short window cannot fit the card, the card itself scrolls
// instead of pushing the page.
export default function AuthLayout({
  eyebrow,
  title,
  description,
  footer,
  children,
}) {
  const hasHeading = Boolean(eyebrow || title || description);

  return (
    <div className="flex h-[100svh] flex-col overflow-hidden bg-cream px-5 py-4 sm:px-6 sm:py-6">
      <div className="m-auto max-h-full w-full max-w-[440px] overflow-y-auto overscroll-contain rounded-[10px]">
        <div className="overflow-hidden rounded-[10px] border border-border bg-white shadow-[0_1px_2px_rgba(40,43,74,0.04),0_18px_40px_-32px_rgba(40,43,74,0.45)]">
          <div className="flex justify-center border-b border-border px-6 py-5 sm:px-9">
            <Link
              to="/"
              aria-label="SwiftBus home"
              className="transition hover:opacity-90"
            >
              <Brand onLight />
            </Link>
          </div>

          <div className="px-6 py-6 sm:px-9">
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
    </div>
  );
}
