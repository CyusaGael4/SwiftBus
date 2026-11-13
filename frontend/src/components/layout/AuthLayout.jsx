import { Link } from 'react-router-dom';
import Brand from '../ui/Brand.jsx';

function BackLink() {
  return (
    <Link
      to="/"
      className="inline-flex min-h-[44px] items-center gap-2 text-[12.5px] font-medium text-muted transition hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-cream">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(400px,44%)]">
        {/* Form pane: first in the DOM so keyboard and screen-reader users
            reach the task before the brand panel. */}
        <div className="flex min-h-screen flex-col lg:min-h-0">
          <header className="flex h-16 items-center px-5 sm:px-8 lg:hidden">
            <Link to="/" aria-label="SwiftBus home" className="shrink-0">
              <Brand onLight />
            </Link>
          </header>

          <main className="flex flex-1 items-start justify-center px-5 pb-14 pt-1 sm:px-8 lg:items-center lg:py-16">
            <div className="w-full max-w-[404px]">
              <BackLink />

              <div className="mt-1 lg:mt-6">{children}</div>
            </div>
          </main>
        </div>

        <aside className="relative hidden flex-col justify-between overflow-hidden bg-navy px-12 py-12 lg:flex">
          <Link
            to="/"
            aria-label="SwiftBus home"
            className="relative shrink-0 self-start transition hover:opacity-90"
          >
            <Brand />
          </Link>

          <div className="relative my-10 max-w-[360px]">
            <span aria-hidden="true" className="block h-[2px] w-9 bg-accent" />
            <h2 className="mt-5 text-[31px] font-semibold leading-[1.14] tracking-[-0.03em] text-cream">
              Pick your seat
              <br />
              before you board.
            </h2>
            <p className="mt-4 text-[13.5px] leading-relaxed text-cream/65">
              Live seat maps on every departure, a QR ticket for each passenger,
              and the fare shown before you commit.
            </p>
          </div>

          <p className="relative text-[11.5px] leading-relaxed text-cream/40">
            Reserve online · pay the conductor when you board
          </p>
        </aside>
      </div>
    </div>
  );
}
