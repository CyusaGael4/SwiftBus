import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { passengerApi } from '../../api/passenger.js';
import Reveal from '../../components/ui/Reveal.jsx';
import {
  formatDate,
  formatDuration,
  formatRwf,
  formatTime,
  nextDay,
  toDateInput,
} from '../../lib/format.js';

const STEPS = [
  {
    number: '1',
    title: 'Search',
    body: 'Pick your two towns and travel date. Browsing is free and needs no account.',
  },
  {
    number: '2',
    title: 'Choose your seats',
    body: 'See the live layout of the actual coach and hold the exact seats you want.',
  },
  {
    number: '3',
    title: 'Travel',
    body: 'Show the QR ticket for each passenger at boarding and settle the fare in RWF.',
  },
];

const TICKET_FACTS = [
  {
    label: 'Seat assignment',
    value: 'The exact seat you chose, named on that passenger’s ticket.',
  },
  {
    label: 'Ticket',
    value:
      'One QR code per seat. Staff scan it at the door - it carries a verification reference, not your personal details.',
  },
  {
    label: 'Seat hold',
    value:
      'Your seats are held for ten minutes while you finish checkout, then they go back on sale automatically.',
  },
  {
    label: 'Fare',
    value: 'Published per route in Rwandan francs, and always shown before you confirm.',
  },
  {
    label: 'Payment',
    value:
      'Paid in RWF to the conductor when you board. No card or Mobile Money is taken online.',
  },
  {
    label: 'Changes',
    value:
      'Cancel from My bookings before departure and the seats are released immediately.',
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
    title: 'A seat you actually picked',
    body: 'Every departure shows the real coach layout, updated as other passengers reserve.',
  },
  {
    title: 'One ticket per passenger',
    body: 'Each seat gets its own scannable code, so a group never shares a single booking slip.',
  },
  {
    title: 'No surprises at checkout',
    body: 'The fare per seat and the total appear before you confirm. Nothing is charged online.',
  },
];

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
  const [today, setToday] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [boardDate, setBoardDate] = useState(() => toDateInput());
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const todayKey = toDateInput();
  const nextTrip = useMemo(() => today[0] || null, [today]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    passengerApi
      .searchTrips({ date: todayKey, passengers: 1 })
      .then(async (trips) => {
        if (!active) return;

        const list = trips.trips || [];
        setToday(list);
        setBoardDate(todayKey);

        if (list.length) {
          setUpcoming(list);
          return;
        }

        // Late in the day every coach has left; show the next travel day
        // rather than an empty board.
        const fallbackDate = nextDay(todayKey, 1);
        const fallback = await passengerApi.searchTrips({
          date: fallbackDate,
          passengers: 1,
        });

        if (!active) return;
        setUpcoming(fallback.trips || []);
        setBoardDate(fallbackDate);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [todayKey, reloadKey]);

  useEffect(() => {
    let active = true;

    passengerApi
      .destinations()
      .then((result) => {
        if (active) setPopular((result.popular || []).slice(0, 6));
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
      {/* Fold: the coach photo runs unedited; the message sits on a neutral
          scrim so nothing is tinted across the whole frame. */}
      <section className="relative isolate overflow-hidden bg-[#0A0C16]">
        <img
          src="/bus.jpeg"
          srcSet="/bus-2x.jpeg 2x"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C16]/90 via-[#0A0C16]/60 to-[#0A0C16]/15 lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C16]/65 via-transparent to-[#0A0C16]/20 lg:hidden" />

        <div className="passenger-shell relative flex min-h-[calc(100svh-9rem)] flex-col justify-center py-10 lg:min-h-[calc(100vh-4rem)] lg:py-16">
          <div className="hero-copy max-w-[600px]">
            <Reveal delay={0}>
              <h1 className="text-[34px] font-semibold leading-[1.04] tracking-[-0.035em] text-cream sm:text-[44px] lg:text-[50px]">
                Book the seat.
                <br className="hidden sm:block" /> Not just the bus.
              </h1>
            </Reveal>

            <Reveal delay={80}>
              <p className="mt-5 max-w-[480px] text-[14px] leading-relaxed text-cream/80 sm:text-[15px]">
                Choose exactly where you sit on coaches from Nyabugogo to Huye,
                Musanze, Rubavu and Ruhango. Every passenger gets a QR ticket, the
                fare is shown before you confirm, and you pay the conductor when
                you board.
              </p>
            </Reveal>

            <Reveal delay={160}>
              <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <Link
                  to="/search"
                  className="inline-flex h-12 items-center justify-center rounded-[4px] bg-accent px-7 text-[14px] font-semibold text-white transition hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
                >
                  Find a trip
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex h-12 items-center justify-center rounded-[4px] border border-cream/35 px-5 text-[13.5px] font-medium text-cream transition hover:border-cream/60 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
                >
                  How it works
                </a>
              </div>
            </Reveal>

            {!loading && nextTrip ? (
              <Reveal delay={240}>
                <p className="mt-7 border-t border-cream/20 pt-4 text-[12.5px] leading-relaxed text-cream/65">
                  Next departure today:{' '}
                  <span className="font-semibold text-cream">
                    {formatTime(nextTrip.departureTime)}
                  </span>{' '}
                  to {nextTrip.route.destination} ·{' '}
                  <span className="text-cream/85">
                    {nextTrip.availableSeats} seat
                    {nextTrip.availableSeats === 1 ? '' : 's'} left
                  </span>
                </p>
              </Reveal>
            ) : null}
          </div>
        </div>
      </section>

      {error ? (
        <div className="passenger-shell mt-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[6px] border border-[#E3C4B8] bg-warning-soft px-4 py-3">
            <p className="text-[12.5px] text-[#8E4A33]">
              We couldn&apos;t load today&apos;s departures just now.
            </p>
            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              className="text-[12px] font-semibold text-[#8E4A33] underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      ) : null}

      <section
        id="how-it-works"
        aria-labelledby="how-it-works-title"
        className="passenger-shell mt-14 scroll-mt-20 lg:mt-24"
      >
        <Reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <h2
              id="how-it-works-title"
              className="text-[24px] font-semibold tracking-[-0.025em] text-navy sm:text-[28px]"
            >
              Booking takes three steps
            </h2>
            <p className="mt-2 max-w-[54ch] text-[13px] leading-relaxed text-muted">
              No account until you confirm. Your seats are held for ten minutes
              while you finish, and the fare is shown before you commit.
            </p>
          </div>
          <Link
            to="/help"
            className="order-last shrink-0 text-[12.5px] font-semibold text-navy underline decoration-navy/30 underline-offset-4 transition hover:text-accent hover:decoration-accent sm:order-none"
          >
            Full booking guide
          </Link>
        </Reveal>

        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <Reveal as="li" key={step.number} delay={index * 80}>
              <div className="flex h-full flex-col rounded-[8px] border border-border bg-surface p-5 transition hover:border-navy/30 hover:shadow-[0_18px_40px_-32px_rgba(40,43,74,0.9)]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-[12.5px] font-semibold text-cream">
                  {step.number}
                </span>
                <h3 className="mt-4 text-[16px] font-semibold leading-snug text-navy">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="departure-board"
        className="passenger-shell mt-12 lg:mt-16"
      >
        <Reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2
              id="departure-board"
              className="text-[24px] font-semibold tracking-[-0.025em] text-navy sm:text-[28px]"
            >
              Departure board
            </h2>
            <p className="mt-2 max-w-[58ch] text-[13px] leading-relaxed text-muted">
              {boardDate === todayKey
                ? 'Coaches still to leave Nyabugogo today, and how many seats are open on each.'
                : `Today’s coaches have all left — this is the board for ${formatDate(
                    `${boardDate}T12:00:00`
                  )}.`}
            </p>
          </div>
          <Link
            to={`/search?date=${boardDate}&passengers=1`}
            className="order-last shrink-0 text-[12.5px] font-semibold text-navy underline decoration-navy/30 underline-offset-4 transition hover:text-accent hover:decoration-accent sm:order-none"
          >
            See every departure
          </Link>
        </Reveal>

        {upcoming.length ? (
          <div className="mt-4 overflow-hidden rounded-[8px] border border-border bg-surface">
            <div className="hidden grid-cols-[80px_minmax(0,1fr)_112px_96px_132px] gap-4 border-b border-border bg-table-head px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-navy/60 sm:grid">
              <span>Departs</span>
              <span>Route</span>
              <span>Fare</span>
              <span>Seats left</span>
              <span className="text-right">Reserve</span>
            </div>
            <ul className="divide-y divide-border">
              {upcoming.slice(0, 6).map((trip) => (
                <li
                  key={trip.id}
                  className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-5 py-3.5 sm:grid-cols-[80px_minmax(0,1fr)_112px_96px_132px] sm:items-center sm:gap-4"
                >
                  <span className="text-[15px] font-semibold leading-none tabular-nums text-navy">
                    {formatTime(trip.departureTime)}
                  </span>
                  <span className="col-span-2 min-w-0 sm:col-span-1">
                    <span className="block truncate text-[13.5px] font-medium text-navy">
                      {trip.route.origin} → {trip.route.destination}
                    </span>
                    <span className="mt-0.5 block text-[11.5px] text-muted">
                      {formatDuration(trip.durationMins)}
                      {trip.bus?.busCode ? ` · Coach ${trip.bus.busCode}` : ''}
                    </span>
                  </span>
                  <span className="text-[12.5px] text-muted">
                    {formatRwf(trip.priceRwf)}
                  </span>
                  <span
                    className={`text-[12.5px] ${
                      trip.availableSeats <= 6
                        ? 'font-semibold text-accent'
                        : 'text-muted'
                    }`}
                  >
                    {trip.availableSeats} left
                  </span>
                  <Link
                    to={`/trips/${trip.id}?passengers=1`}
                    className="col-span-2 inline-flex h-9 w-fit items-center justify-center rounded-[4px] bg-accent px-4 text-[12px] font-semibold text-white transition hover:bg-accent/90 sm:col-span-1 sm:justify-self-end"
                  >
                    Choose a seat
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : loading ? (
          <div className="mt-4 h-[168px] animate-pulse rounded-[8px] border border-border bg-surface" />
        ) : (
          <p className="mt-4 rounded-[8px] border border-border bg-surface px-5 py-4 text-[12.5px] text-muted">
            No coaches are open for booking right now. Try another travel date.
          </p>
        )}
      </section>

      {popular.length ? (
        <section
          aria-labelledby="popular-routes"
          className="passenger-shell mt-12 lg:mt-16"
        >
          <Reveal className="max-w-[640px]">
            <h2
              id="popular-routes"
              className="text-[24px] font-semibold tracking-[-0.025em] text-navy sm:text-[28px]"
            >
              Routes people book most
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Fares are set per route, not per day, so the price below is the price
              at checkout.
            </p>
          </Reveal>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((route, index) => (
              <Reveal key={route.routeCode} delay={index * 60}>
                <Link
                  to={`/search?origin=${encodeURIComponent(
                    route.origin
                  )}&destination=${encodeURIComponent(
                    route.destination
                  )}&date=${todayKey}&passengers=1`}
                  className="group flex h-full flex-col rounded-[8px] border border-border bg-surface p-5 transition hover:border-navy/30 hover:shadow-[0_18px_40px_-32px_rgba(40,43,74,0.9)]"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                    {route.routeCode}
                  </p>
                  <h3 className="mt-1.5 text-[16px] font-semibold leading-snug text-navy">
                    {route.origin} → {route.destination}
                  </h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">
                    {formatDuration(route.estimatedDurationMins)} · {route.trips}{' '}
                    departures in the next week
                  </p>
                  <div className="mt-4 flex items-end justify-between gap-3 border-t border-border pt-3">
                    <span>
                      <span className="block text-[10.5px] uppercase tracking-[0.08em] text-muted">
                        Fare
                      </span>
                      <span className="text-[15px] font-semibold leading-tight text-navy">
                        {formatRwf(route.fareRwf)}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block text-[10.5px] uppercase tracking-[0.08em] text-muted">
                        Next coach
                      </span>
                      <span className="text-[12.5px] font-medium text-navy">
                        {formatTime(route.nextDeparture)}
                      </span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      <section
        aria-labelledby="why-swiftbus"
        className="passenger-shell mt-12 lg:mt-16"
      >
        <div className="rounded-[10px] border border-border bg-surface p-6 sm:p-8 lg:grid lg:grid-cols-[minmax(0,290px)_minmax(0,1fr)] lg:gap-14 lg:p-10">
          <Reveal>
            <h2
              id="why-swiftbus"
              className="text-[22px] font-semibold leading-tight tracking-[-0.025em] text-navy sm:text-[26px]"
            >
              Built for how Rwanda travels
            </h2>
            <p className="mt-3 max-w-[34ch] text-[13px] leading-relaxed text-muted">
              Reservations live in the same system our staff and booking agents
              use, so the seat you pick is the seat you get.
            </p>
          </Reveal>

          <Reveal
            as="dl"
            delay={80}
            className="mt-7 divide-y divide-border border-t border-border lg:mt-0 lg:border-t-0"
          >
            {REASONS.map((reason) => (
              <div key={reason.title} className="py-4 first:pt-0 lg:py-5">
                <dt className="text-[14.5px] font-semibold text-navy">
                  {reason.title}
                </dt>
                <dd className="mt-1 max-w-[58ch] text-[12.5px] leading-relaxed text-muted">
                  {reason.body}
                </dd>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section
        aria-labelledby="what-every-seat-includes"
        className="passenger-shell mt-12 lg:mt-16"
      >
        <Reveal className="max-w-[640px]">
          <h2
            id="what-every-seat-includes"
            className="text-[24px] font-semibold tracking-[-0.025em] text-navy sm:text-[28px]"
          >
            What every reservation includes
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            The same six things on a RWF 2,000 seat in Ruhango and a RWF 5,000 seat
            in Rubavu - there is no premium tier and no add-on at checkout.
          </p>
        </Reveal>

        <Reveal
          as="dl"
          delay={80}
          className="mt-6 divide-y divide-border border-y border-border"
        >
          {TICKET_FACTS.map((fact) => (
            <div
              key={fact.label}
              className="grid gap-1 py-4 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-baseline sm:gap-8"
            >
              <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-navy/65">
                {fact.label}
              </dt>
              <dd className="max-w-[70ch] text-[13px] leading-relaxed text-muted">
                {fact.value}
              </dd>
            </div>
          ))}
        </Reveal>
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

      <section className="passenger-shell mt-12 lg:mt-16">
        <Reveal className="overflow-hidden rounded-[10px] bg-navy px-6 py-9 sm:px-10 sm:py-11 lg:px-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                Departures from Nyabugogo
              </p>
              <h2 className="mt-3 max-w-[20ch] text-[26px] font-semibold leading-tight tracking-[-0.03em] text-cream sm:text-[32px]">
                Pick a seat and travel today.
              </h2>
              <p className="mt-3 max-w-[48ch] text-[13px] leading-relaxed text-cream/65">
                Coaches leave throughout the day for Huye, Musanze, Rubavu and
                Ruhango. Choose a departure, take the seats you want, and carry a
                ticket for every passenger.
              </p>
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[11.5px] text-cream/55">
                <li>Seats held 10 minutes</li>
                <li aria-hidden="true">·</li>
                <li>No online payment</li>
                <li aria-hidden="true">·</li>
                <li>Cancel before departure</li>
              </ul>
            </div>

            <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row lg:flex-col">
              <Link
                to="/search"
                className="inline-flex h-12 items-center justify-center rounded-[4px] bg-accent px-7 text-[14px] font-semibold text-white transition hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
              >
                Find a trip
              </Link>
              <Link
                to="/help"
                className="inline-flex h-12 items-center justify-center rounded-[4px] border border-cream/30 px-6 text-[13.5px] font-medium text-cream transition hover:border-cream/55 hover:bg-white/5"
              >
                Booking help
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
