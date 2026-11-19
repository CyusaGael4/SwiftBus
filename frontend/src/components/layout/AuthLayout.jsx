import { Link } from 'react-router-dom';
import Brand from '../ui/Brand.jsx';

// Return navigation sits at the top leading edge: people scan a page from
// there, and it stays reachable before the form is read instead of after it.
// The negative margin keeps the label flush with the card's left edge while
// the padding keeps a 44px touch target.
function BackLink() {
  return (
    <Link
      to="/"
      className="-ml-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-[4px] px-2 text-[13px] font-medium text-navy/70 transition hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M19 12H5m0 0 6-6m-6 6 6 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Back to home
    </Link>
  );
}

// One centred column. `m-auto` centres the group vertically without clipping
// the top of a tall form on short screens, which `justify-center` does once
// the content is taller than the viewport.
export default function AuthLayout({
  eyebrow,
  title,
  description,
  footer,
  children,
}) {
  const hasHeading = Boolean(eyebrow || title || description);

  return (
    <div className="flex min-h-screen flex-col bg-cream px-5 py-6 sm:px-6 sm:py-10">
      <div className="m-auto w-full max-w-[440px]">
        <div className="mb-3 sm:mb-4">
          <BackLink />
        </div>

        <div className="overflow-hidden rounded-[10px] border border-border bg-white shadow-[0_1px_2px_rgba(40,43,74,0.04),0_18px_40px_-32px_rgba(40,43,74,0.45)]">
          <div className="flex justify-center border-b border-border px-6 py-6 sm:px-9">
            <Link
              to="/"
              aria-label="SwiftBus home"
              className="transition hover:opacity-90"
            >
              <Brand onLight />
            </Link>
          </div>

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
            <div className="border-t border-border bg-cream/40 px-6 py-6 sm:px-9">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
