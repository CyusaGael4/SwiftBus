import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { passengerApi } from '../../api/passenger.js';
import SearchForm from '../../components/passenger/SearchForm.jsx';
import TripCard from '../../components/passenger/TripCard.jsx';
import Reveal from '../../components/ui/Reveal.jsx';
import { formatDate, formatRwf, nextDay, toDateInput } from '../../lib/format.js';

const SORTS = [
  { key: 'departure', label: 'Leaves earliest' },
  { key: 'arrival', label: 'Arrives earliest' },
  { key: 'fare', label: 'Lowest fare' },
];

// Departures are grouped the way riders think about a day of travel, so a
// morning coach and an evening coach are not compared line by line.
const PERIODS = [
  { key: 'morning', label: 'Morning departures', test: (hour) => hour < 12 },
  { key: 'afternoon', label: 'Afternoon departures', test: (hour) => hour >= 12 && hour < 17 },
  { key: 'evening', label: 'Evening departures', test: (hour) => hour >= 17 },
];

const FACTS = [
  'Fare is paid to the conductor on boarding.',
  'Seats are held for 10 minutes while you finish.',
  'Cancel before departure from My bookings.',
];

function relativeDate(date) {
  const today = toDateInput();
  if (date === today) return `Today, ${formatDate(`${date}T12:00:00`)}`;
  if (date === nextDay(today, 1)) return `Tomorrow, ${formatDate(`${date}T12:00:00`)}`;
  return formatDate(`${date}T12:00:00`);
}

function CalendarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-navy/55"
    >
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 10h17M8 3.5V7m8-3.5V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function SearchPage() {
  const [params] = useSearchParams();
  const origin = params.get('origin') || '';
  const destination = params.get('destination') || '';
  const date = params.get('date') || toDateInput();
  const passengers = Math.min(6, Math.max(1, Number(params.get('passengers')) || 1));

  const [sort, setSort] = useState('departure');
  const [editOpen, setEditOpen] = useState(false);
  const [meta, setMeta] = useState({ origins: [], destinations: [], popular: [] });
  const [data, setData] = useState({ trips: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    passengerApi
      .destinations()
      .then((result) => {
        if (active) setMeta(result);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    passengerApi
      .searchTrips({ origin, destination, date, passengers })
      .then((result) => {
        if (active) setData(result);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.message);
        setData({ trips: [], count: 0 });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [origin, destination, date, passengers]);

  const trips = useMemo(() => {
    const list = [...data.trips];

    return list.sort((first, second) => {
      if (sort === 'fare') return first.priceRwf - second.priceRwf;
      if (sort === 'arrival') {
        return new Date(first.arrivalTime) - new Date(second.arrivalTime);
      }
      return new Date(first.departureTime) - new Date(second.departureTime);
    });
  }, [data.trips, sort]);

  const cheapest = useMemo(
    () =>
      trips.reduce(
        (lowest, trip) => (lowest === 0 || trip.priceRwf < lowest ? trip.priceRwf : lowest),
        0
      ),
    [trips]
  );

  const groups = useMemo(() => {
    if (!trips.length) return [];
    if (sort === 'fare') return [{ key: 'all', label: '', trips }];

    return PERIODS.map((period) => ({
      ...period,
      trips: trips.filter((trip) =>
        period.test(new Date(trip.departureTime).getHours())
      ),
    })).filter((group) => group.trips.length);
  }, [trips, sort]);

  const dayLink = (offset) => {
    const next = new URLSearchParams({
      date: nextDay(date, offset),
      passengers: String(passengers),
    });
    if (origin) next.set('origin', origin);
    if (destination) next.set('destination', destination);
    return `/search?${next.toString()}`;
  };

  const dayLabel = formatDate(`${date}T12:00:00`);
  const routeTitle =
    origin && destination ? `${origin} to ${destination}` : 'Every scheduled departure';
  const popularRoutes = (meta.popular || []).slice(0, 3);

  const summary = loading
    ? `Finding trips on ${dayLabel}`
    : trips.length
      ? `All ${trips.length} ${trips.length === 1 ? 'trip' : 'trips'} on ${dayLabel}`
      : `No trips on ${dayLabel}`;

  const resultsNote = loading
    ? 'Comparing every departure on this date.'
    : cheapest
      ? `${passengers} ${passengers === 1 ? 'seat' : 'seats'} needed. Fares from ${formatRwf(
          cheapest
        )} per seat.`
      : 'Nothing is selling for this date yet.';

  return (
    <div className="passenger-shell py-6 lg:py-10">
      {/* The search stays on screen as one panel: a summary line with the date,
          then the fields themselves, so a wrong day or route is caught here. */}
      <Reveal>
        <section className="overflow-hidden rounded-[10px] border border-border bg-surface">
          <div className="flex items-center gap-2.5 border-b border-border bg-cream/70 px-3.5 py-2.5 sm:px-4">
            <CalendarIcon />
            <p className="min-w-0 flex-1 truncate text-[13px] text-navy">
              {summary}
              {origin && destination ? (
                <span className="hidden text-muted sm:inline"> · {routeTitle}</span>
              ) : null}
            </p>
            <span className="hidden shrink-0 items-center rounded-full border border-border bg-surface px-2.5 py-1 text-[11.5px] text-navy/70 sm:inline-flex">
              {passengers} {passengers === 1 ? 'passenger' : 'passengers'}
            </span>
            <button
              type="button"
              onClick={() => setEditOpen((current) => !current)}
              aria-expanded={editOpen}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[4px] border border-border bg-surface px-2.5 text-[11.5px] font-medium text-navy transition hover:border-navy/30 lg:hidden"
            >
              {editOpen ? 'Close' : 'Change'}
            </button>
          </div>

          <div
            className={`px-3.5 py-4 sm:px-4 sm:py-5 ${
              editOpen ? 'block' : 'hidden'
            } lg:block`}
          >
            <SearchForm
              origins={meta.origins}
              destinations={meta.destinations}
              initial={{ origin, destination, date, passengers }}
              panel
            />
          </div>
        </section>
      </Reveal>

      <Reveal delay={60} className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <h1 className="text-[22px] font-semibold tracking-[-0.025em] text-navy sm:text-[26px]">
              Search routes
            </h1>
            <p className="mt-1.5 max-w-[60ch] text-[13px] leading-relaxed text-muted">
              {resultsNote}
            </p>
          </div>

          <div
            role="group"
            aria-label="Sort departures"
            className="inline-flex flex-wrap rounded-[6px] border border-border bg-surface p-0.5"
          >
            {SORTS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setSort(option.key)}
                aria-pressed={sort === option.key}
                className={`h-8 rounded-[4px] px-3 text-[12px] font-medium transition ${
                  sort === option.key
                    ? 'bg-navy text-cream'
                    : 'text-muted hover:text-navy'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 rounded-[8px] border border-border bg-cream/60 px-4 py-3">
          {FACTS.map((fact) => (
            <li key={fact} className="flex items-center gap-2 text-[11.5px] text-muted">
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent" />
              {fact}
            </li>
          ))}
        </ul>
      </Reveal>

      <div className="mt-6 space-y-7">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-[128px] animate-pulse rounded-[10px] border border-border bg-surface"
              />
            ))
          : null}

        {!loading && error ? (
          <div className="rounded-[10px] border border-[#E3C4B8] bg-warning-soft px-5 py-8 text-center">
            <p className="text-[14px] font-semibold text-[#8E4A33]">
              We could not load departures
            </p>
            <p className="mx-auto mt-1.5 max-w-md text-[12.5px] leading-relaxed text-[#8E4A33]/85">
              {error} Nothing was booked. Try the search again, or pick another date.
            </p>
            <Link
              to="/search"
              className="mt-4 inline-flex h-9 items-center rounded-[4px] bg-accent px-4 text-[12px] font-semibold text-white"
            >
              Start a new search
            </Link>
          </div>
        ) : null}

        {!loading && !error && trips.length === 0 ? (
          <div className="rounded-[10px] border border-border bg-surface px-5 py-8 sm:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
              Nothing on sale
            </p>
            <h2 className="mt-2 text-[19px] font-semibold leading-snug text-navy">
              {origin && destination
                ? `No ${origin} to ${destination} coach on ${relativeDate(date)}`
                : `No departures on ${relativeDate(date)}`}
            </h2>
            <p className="mt-2 max-w-[58ch] text-[13px] leading-relaxed text-muted">
              {origin && destination
                ? `Either this date has not been scheduled yet, or every seat for ${passengers} ${
                    passengers === 1 ? 'passenger' : 'passengers'
                  } is already taken. Seats are usually released closer to the day, so the dates either side are worth a look.`
                : `Coaches for ${passengers} ${
                    passengers === 1 ? 'passenger' : 'passengers'
                  } are not listed for this date. Try the days either side, or choose a route below.`}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {date > toDateInput() ? (
                <Link
                  to={dayLink(-1)}
                  className="inline-flex h-9 items-center rounded-[4px] border border-border bg-surface px-4 text-[12px] font-medium text-navy transition hover:border-navy/30"
                >
                  Previous day
                </Link>
              ) : null}
              <Link
                to={dayLink(1)}
                className="inline-flex h-9 items-center rounded-[4px] bg-accent px-4 text-[12px] font-semibold text-white transition hover:bg-accent/90"
              >
                Next day
              </Link>
              <Link
                to="/search"
                className="inline-flex h-9 items-center rounded-[4px] border border-border bg-surface px-4 text-[12px] font-medium text-navy transition hover:border-navy/30"
              >
                Change the search
              </Link>
            </div>

            {popularRoutes.length ? (
              <div className="mt-7 border-t border-border pt-5">
                <p className="text-[12px] font-medium text-navy">
                  Routes with seats on sale right now
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {popularRoutes.map((route) => (
                    <Link
                      key={route.routeCode}
                      to={`/search?origin=${encodeURIComponent(
                        route.origin
                      )}&destination=${encodeURIComponent(
                        route.destination
                      )}&date=${date}&passengers=${passengers}`}
                      className="flex items-center justify-between gap-3 rounded-[6px] border border-border px-3 py-2.5 text-[12.5px] text-navy transition hover:border-navy/30"
                    >
                      <span className="min-w-0 truncate">
                        {route.origin} to {route.destination}
                      </span>
                      <span className="shrink-0 text-[11.5px] text-muted">
                        {formatRwf(route.fareRwf)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <p className="mt-5 text-[12px] leading-relaxed text-muted/85">
              Travelling today and the coach is not online? Counter bookings at the
              Nyabugogo desk sell from the same seats.{' '}
              <Link
                to="/help"
                className="font-medium text-navy underline decoration-navy/25 underline-offset-2"
              >
                How counter booking works
              </Link>
              .
            </p>
          </div>
        ) : null}

        {!loading && !error
          ? groups.map((group) => (
              <section key={group.key} aria-labelledby={`${group.key}-heading`}>
                {group.label ? (
                  <div className="mb-2.5 flex items-baseline justify-between gap-3">
                    <h3
                      id={`${group.key}-heading`}
                      className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-navy/55"
                    >
                      {group.label}
                    </h3>
                    <span className="text-[11.5px] text-muted">
                      {group.trips.length}{' '}
                      {group.trips.length === 1 ? 'trip' : 'trips'}
                    </span>
                  </div>
                ) : null}

                <div className="space-y-3">
                  {group.trips.map((trip, index) => (
                    <Reveal key={trip.id} delay={Math.min(index, 6) * 50}>
                      <TripCard trip={trip} passengers={passengers} />
                    </Reveal>
                  ))}
                </div>
              </section>
            ))
          : null}
      </div>
    </div>
  );
}
