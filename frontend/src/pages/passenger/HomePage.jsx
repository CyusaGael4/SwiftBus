import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { passengerApi } from '../../api/passenger.js';
import SearchForm from '../../components/passenger/SearchForm.jsx';
import Reveal from '../../components/ui/Reveal.jsx';
import {
  formatDuration,
  formatNumber,
  toDateInput,
} from '../../lib/format.js';

const STEPS = [
  {
    title: 'Search route',
    body: 'Pick your departure town, destination and travel date.',
  },
  {
    title: 'Select seat',
    body: 'Choose your seats from the live layout of the coach.',
  },
  {
    title: 'Sign in',
    body: 'Confirm with a passenger account so each ticket is stored for you.',
  },
  {
    title: 'Travel',
    body: 'Show the QR ticket at boarding and pay the fare to the conductor.',
  },
];

const BOOKING_OPTIONS = [
  {
    eyebrow: 'On this website',
    title: 'Reserve and pick your own seat',
    bestFor: 'Best if you want a particular seat, or you are booking for a group.',
    points: [
      'See the coach layout before you book, so you know exactly where you will sit.',
      'Your seats are held for ten minutes while you finish, so nobody else can take them.',
      'The QR ticket stays in your account and opens on any phone at boarding.',
      'Cancel from My bookings and the seats go back on sale straight away.',
    ],
    action: { label: 'Find a departure', to: '/search' },
  },
  {
    eyebrow: 'At the agent desk',
    title: 'Let an agent book it for you',
    bestFor: 'Best if you are already at the bus park, or you would rather pay in cash.',
    points: [
      'Tell the agent your destination and they pick the seat together with you.',
      'No email address or online account is needed at the counter.',
      'You leave with a ticket and a reference number to show at boarding.',
      'Ask the same agent to change or cancel the booking before the coach leaves.',
    ],
    action: { label: 'Read the booking help', to: '/help' },
  },
];

const REASONS = [
  {
    kind: 'seat',
    title: 'A seat you actually picked',
    body: 'Every departure shows the real coach layout, updated as other passengers reserve.',
  },
  {
    kind: 'ticket',
    title: 'One ticket per passenger',
    body: 'Each seat gets its own scannable code, so a group never shares a single booking slip.',
  },
  {
    kind: 'fare',
    title: 'No surprises at checkout',
    body: 'The fare per seat and the total appear before you confirm. Nothing is charged online.',
  },
];

function ReasonIcon({ kind }) {
  const common = { stroke: 'currentColor', strokeWidth: 1.6, fill: 'none' };

  if (kind === 'ticket') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5v2a1.8 1.8 0 0 0 0 3.6v1.4a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 15.5v-1.4a1.8 1.8 0 0 0 0-3.6v-2Z"
          strokeLinejoin="round"
          {...common}
        />
        <path d="M10 6v12" strokeWidth="1.4" strokeDasharray="2 2" {...common} />
      </svg>
    );
  }

  if (kind === 'fare') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" {...common} />
        <path d="M9.5 15V9h2.2a2 2 0 0 1 0 4H9.5m0 0h2.8" strokeLinecap="round" {...common} />
      </svg>
    );
  }

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2.5" {...common} />
      <path d="M8 9h3M8 12.5h3M8 16h8" strokeLinecap="round" {...common} />
      <path d="M14.5 9.5h2v3h-2z" {...common} />
    </svg>
  );
}

export default function HomePage() {
  const [meta, setMeta] = useState({ origins: [], destinations: [] });
  const [popular, setPopular] = useState([]);

  const todayKey = toDateInput();

  useEffect(() => {
    let active = true;

    passengerApi
      .destinations()
      .then((result) => {
        if (!active) return;
        setMeta({ origins: result.origins || [], destinations: result.destinations || [] });
        setPopular((result.popular || []).slice(0, 6));
      })
      .catch(() => {
        // Route cards are supplementary; the page still works without them.
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      {/* Fold: the coach photo runs unedited with a single message centred over
          it, and the search fields start below the fold. */}
      <section className="relative isolate overflow-hidden bg-[#0A0C16]">
        <img
          src="/bus.jpeg"
          srcSet="/bus-2x.jpeg 2x"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        {/* One even scrim across the frame: the photo is much brighter on the
            right, so an even tint keeps the two halves the same brightness
            instead of letting the copy sit on a dark-left, bright-right split. */}
        <div className="absolute inset-0 bg-[#0A0C16]/62" />
        <div className="absolute inset-0 bg-gradient-to-l from-[#0A0C16]/30 via-[#0A0C16]/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C16]/55 via-transparent to-[#0A0C16]/25" />

        <div className="passenger-shell relative flex min-h-[calc(100svh-4rem)] flex-col justify-center py-16 text-center lg:py-24">
          <div className="mx-auto max-w-[760px]">
            <Reveal delay={0}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                Rwanda&apos;s bus booking platform
              </p>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-3 text-[34px] font-semibold leading-[1.04] tracking-[-0.035em] text-cream sm:text-[46px] lg:text-[54px]">
                Book your exact seat across Rwanda
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mx-auto mt-5 max-w-[560px] text-[14px] leading-relaxed text-cream/80 sm:text-[15px]">
                Pick your route, choose your seat, get an instant QR ticket, and pay
                the conductor when you board.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* The filter hub sits below the fold, centred, so the fold stays a clean
          image and the first scroll lands on the search fields. */}
      <section
        aria-labelledby="search-hub-title"
        className="passenger-shell pt-10 lg:pt-12"
      >
        <h2 id="search-hub-title" className="sr-only">
          Find a trip
        </h2>
        <Reveal className="mx-auto w-full max-w-[900px]">
          <SearchForm
            origins={meta.origins}
            destinations={meta.destinations}
            initial={{ date: todayKey, passengers: 1 }}
          />
        </Reveal>
      </section>

      <section
        id="how-it-works"
        aria-labelledby="how-it-works-title"
        className="passenger-shell mt-14 scroll-mt-20 lg:mt-24"
      >
        <Reveal className="text-center">
          <h2
            id="how-it-works-title"
            className="text-[25px] font-semibold tracking-[-0.03em] text-navy sm:text-[30px]"
          >
            How it works
          </h2>
          <p className="mx-auto mt-2.5 max-w-[46ch] text-[13.5px] leading-relaxed text-muted">
            Book your bus ticket in four simple steps
          </p>
        </Reveal>

        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <Reveal as="li" key={step.title} delay={index * 80}>
              <div className="relative flex h-full min-h-[152px] flex-col justify-end rounded-[10px] border border-border bg-surface p-5 transition hover:border-navy/30 hover:shadow-[0_18px_40px_-32px_rgba(40,43,74,0.9)]">
                <span className="absolute right-5 top-4 text-[12px] font-medium tracking-[0.04em] text-navy/35">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-[15.5px] font-semibold leading-snug text-navy">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {popular.length ? (
        <section
          aria-labelledby="popular-routes"
          className="passenger-shell mt-12 lg:mt-16"
        >
          <Reveal className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div>
              <h2
                id="popular-routes"
                className="text-[24px] font-semibold tracking-[-0.03em] text-navy sm:text-[28px]"
              >
                Popular routes
              </h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                Common intercity routes at published RURA fares
              </p>
            </div>
            <Link
              to="/search"
              className="inline-flex min-h-[36px] items-center gap-1.5 text-[12.5px] font-semibold text-navy underline decoration-navy/25 underline-offset-4 transition hover:text-accent hover:decoration-accent"
            >
              View all routes
              <span aria-hidden="true">→</span>
            </Link>
          </Reveal>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((route, index) => (
              <Reveal key={route.routeCode} delay={index * 60}>
                <Link
                  to={`/search?origin=${encodeURIComponent(
                    route.origin
                  )}&destination=${encodeURIComponent(
                    route.destination
                  )}&date=${todayKey}&passengers=1`}
                  className="group flex h-full items-start justify-between gap-4 rounded-[10px] border border-border bg-surface px-5 py-4 transition hover:border-navy/30 hover:shadow-[0_18px_40px_-32px_rgba(40,43,74,0.9)]"
                >
                  <span className="min-w-0">
                    <span className="block text-[14.5px] font-semibold leading-snug text-navy">
                      {route.origin}{' '}
                      <span aria-hidden="true" className="text-navy/30">
                        →
                      </span>{' '}
                      {route.destination}
                    </span>
                    <span className="mt-1 block text-[12px] text-muted">
                      {formatDuration(route.estimatedDurationMins)}
                    </span>
                  </span>

                  <span className="shrink-0 text-right">
                    <span className="block text-[15px] font-semibold leading-tight text-navy">
                      {formatNumber(route.fareRwf)}
                    </span>
                    <span className="mt-0.5 block text-[10.5px] uppercase tracking-[0.08em] text-muted">
                      RWF
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* Full-bleed navy band, then three centred cards on the page background.
          The dark strip is the section heading only, so the page does not turn
          into a stack of dark panels before the footer. */}
      <section aria-labelledby="why-swiftbus" className="mt-12 lg:mt-16">
        <div className="bg-navy py-12 lg:py-14">
          <div className="passenger-shell text-center">
            <Reveal>
              <h2
                id="why-swiftbus"
                className="text-[25px] font-semibold tracking-[-0.03em] text-cream sm:text-[30px]"
              >
                Why SwiftBus?
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="mx-auto mt-2.5 max-w-[46ch] text-[13.5px] leading-relaxed text-cream/70">
                Built for the way Rwanda travels
              </p>
            </Reveal>
          </div>
        </div>

        <div className="passenger-shell">
          <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:mt-10">
            {REASONS.map((reason, index) => (
              <Reveal key={reason.title} delay={index * 80}>
                <div className="flex h-full flex-col items-center rounded-[10px] border border-border bg-surface px-6 py-8 text-center transition hover:border-navy/25">
                  <span className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-navy/5 text-navy">
                    <ReasonIcon kind={reason.kind} />
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold leading-snug text-navy">
                    {reason.title}
                  </h3>
                  <p className="mt-2 max-w-[34ch] text-[12.5px] leading-relaxed text-muted">
                    {reason.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Two routes to the same inventory, written from the passenger's side: what
          each one gets you, and who it suits, rather than how the system works. */}
      <section
        aria-labelledby="ways-to-book-title"
        className="passenger-shell mt-12 lg:mt-16"
      >
        <Reveal className="max-w-[620px]">
          <h2
            id="ways-to-book-title"
            className="text-[24px] font-semibold tracking-[-0.025em] text-navy sm:text-[28px]"
          >
            Book it here or at the counter
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            Same seats and same fare either way. Pick whichever is easier on the day
            you travel.
          </p>
        </Reveal>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {BOOKING_OPTIONS.map((option, index) => (
            <Reveal key={option.title} delay={index * 80}>
              <div className="flex h-full flex-col rounded-[10px] border border-border bg-surface p-6 transition hover:border-navy/25">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">
                  {option.eyebrow}
                </p>
                <h3 className="mt-2 text-[18px] font-semibold leading-snug text-navy">
                  {option.title}
                </h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                  {option.bestFor}
                </p>

                <ul className="mt-4 space-y-2.5">
                  {option.points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-2.5 text-[12.5px] leading-relaxed text-navy/75"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={option.action.to}
                  className="mt-auto inline-flex min-h-[36px] items-center gap-1.5 pt-5 text-[12.5px] font-semibold text-navy underline decoration-navy/25 underline-offset-4 transition hover:text-accent hover:decoration-accent"
                >
                  {option.action.label}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

       
      </section>
    </div>
  );
}
