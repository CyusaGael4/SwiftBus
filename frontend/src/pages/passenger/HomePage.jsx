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

const BOOKING_PATHS = [
  {
    eyebrow: 'In this portal',
    title: 'Book it yourself',
    points: [
      'Pick seats on the live coach map and hold them for ten minutes.',
      'Tickets sit in your account - one QR per passenger, re-openable any time.',
      'Review or cancel from My bookings before the coach leaves.',
    ],
    note: 'A passenger account is needed at the confirmation step, not before it.',
  },
  {
    eyebrow: 'At the departures desk',
    title: 'Let an agent book it',
    points: [
      'Booking agents reserve from the same seat inventory as this portal.',
      'Counter bookings are kept under a reference given to you by the agent.',
      'Those reservations are not attached to an online passenger account.',
    ],
    note: 'Ask the agent for your reference - it is what the desk and the conductor look up.',
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

const HOME_FAQS = [
  {
    q: 'Do I need an account to book?',
    a: 'Not to browse or pick a seat. You sign in or create a passenger account at the confirmation step, so the ticket can be stored and reopened later.',
  },
  {
    q: 'How long are my seats held?',
    a: 'Ten minutes from the moment you pick them. The countdown appears on the trip and checkout pages; if it runs out the seats go back on sale automatically.',
  },
  {
    q: 'When and how do I pay?',
    a: 'On board, in Rwandan francs, to the conductor. Nothing is charged online and the full total is shown before you confirm.',
  },
  {
    q: 'Can I change or cancel a reservation?',
    a: 'You can cancel from My bookings any time before departure. The booking is marked cancelled and its seats are released to other passengers straight away.',
  },
];

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
                Common intercity routes at published fares
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

      <section aria-labelledby="two-ways-to-book" className="passenger-shell mt-12 lg:mt-16">
        <Reveal className="max-w-[640px]">
          <h2
            id="two-ways-to-book"
            className="text-[24px] font-semibold tracking-[-0.025em] text-navy sm:text-[28px]"
          >
            Two ways to book the same seat
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            Both run on one inventory, so a seat sold at the counter disappears from
            this portal straight away - and the other way round.
          </p>
        </Reveal>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {BOOKING_PATHS.map((path, index) => (
            <Reveal key={path.title} delay={index * 80}>
              <div className="flex h-full flex-col rounded-[8px] border border-border bg-surface p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">
                  {path.eyebrow}
                </p>
                <h3 className="mt-2 text-[17px] font-semibold leading-snug text-navy">
                  {path.title}
                </h3>
                <ul className="mt-3 space-y-2">
                  {path.points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-2 text-[12.5px] leading-relaxed text-muted"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-auto border-t border-border pt-3 text-[11.5px] leading-relaxed text-muted/85 sm:mt-4">
                  {path.note}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="home-faq-title"
        className="passenger-shell mt-12 lg:mt-16"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)] lg:gap-12">
          <Reveal>
            <h2
              id="home-faq-title"
              className="text-[24px] font-semibold tracking-[-0.025em] text-navy sm:text-[28px]"
            >
              Questions before you book
            </h2>
            <p className="mt-2 max-w-[40ch] text-[13px] leading-relaxed text-muted">
              The four things passengers ask most at the departures desk. The help
              centre covers the rest.
            </p>
            <Link
              to="/help"
              className="mt-4 inline-flex text-[12.5px] font-semibold text-navy underline decoration-navy/30 underline-offset-4 transition hover:text-accent hover:decoration-accent"
            >
              Open the help centre
            </Link>
          </Reveal>

          <Reveal
            as="div"
            delay={80}
            className="divide-y divide-border overflow-hidden rounded-[8px] border border-border bg-surface"
          >
            {HOME_FAQS.map((item) => (
              <details key={item.q} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[13.5px] font-medium text-navy marker:hidden">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-[16px] leading-none text-muted transition group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-2.5 max-w-[640px] text-[12.5px] leading-relaxed text-muted">
                  {item.a}
                </p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Closing call to action. A rule and the shared container grid do the
          grouping instead of a filled panel, so the only dark surface left at
          the end of the page is the footer. */}
      <section
        aria-labelledby="travel-today"
        className="passenger-shell mt-14 lg:mt-20"
      >
        <div className="border-t border-navy/15 pt-9 lg:pt-12">
          <Reveal className="grid gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-16">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                Departures from Nyabugogo
              </p>
              <h2
                id="travel-today"
                className="mt-3 max-w-[15ch] text-[30px] font-semibold leading-[1.05] tracking-[-0.035em] text-navy sm:text-[36px] lg:text-[42px]"
              >
                Pick a seat and travel today.
              </h2>
            </div>

            <div className="lg:pt-1.5">
              <p className="max-w-[46ch] text-[13.5px] leading-relaxed text-muted">
                Coaches leave throughout the day for Huye, Musanze, Rubavu and
                Ruhango. Choose a departure, take the seats you want, and carry a
                ticket for every passenger.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  to="/search"
                  className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-accent px-6 text-[13.5px] font-semibold text-white transition hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Find a trip
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  to="/help"
                  className="inline-flex min-h-[44px] items-center text-[13px] font-semibold text-navy underline decoration-navy/30 underline-offset-4 transition hover:text-accent hover:decoration-accent"
                >
                  Booking help
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal
            as="ul"
            delay={80}
            className="mt-9 flex flex-wrap gap-x-7 gap-y-2.5 border-t border-border pt-5 text-[11.5px] text-muted lg:mt-12"
          >
            {['Seats held 10 minutes', 'No online payment', 'Cancel before departure'].map(
              (fact) => (
                <li key={fact} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-1 w-1 rounded-full bg-accent"
                  />
                  {fact}
                </li>
              )
            )}
          </Reveal>
        </div>
      </section>
    </div>
  );
}
