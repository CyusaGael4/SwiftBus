import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { passengerApi } from '../../api/passenger.js';
import SearchForm from '../../components/passenger/SearchForm.jsx';
import TripCard from '../../components/passenger/TripCard.jsx';
import Reveal from '../../components/ui/Reveal.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { formatDate, toDateInput } from '../../lib/format.js';

// Departures are grouped the way riders think about a day of travel, so a
// morning coach and an evening coach are not compared line by line.
const PERIODS = [
  { key: 'morning', label: 'Morning departures', test: (hour) => hour < 12 },
  { key: 'afternoon', label: 'Afternoon departures', test: (hour) => hour >= 12 && hour < 17 },
  { key: 'evening', label: 'Evening departures', test: (hour) => hour >= 17 },
];

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

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="m15.2 15.2 4.3 4.3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SearchPage() {
  const [params] = useSearchParams();
  const origin = params.get('origin') || '';
  const destination = params.get('destination') || '';
  const date = params.get('date') || toDateInput();
  const passengers = Math.min(6, Math.max(1, Number(params.get('passengers')) || 1));

  const [editOpen, setEditOpen] = useState(false);
  const [meta, setMeta] = useState({ origins: [], destinations: [] });
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

  const trips = useMemo(
    () =>
      [...data.trips].sort(
        (first, second) => new Date(first.departureTime) - new Date(second.departureTime)
      ),
    [data.trips]
  );

  const groups = useMemo(() => {
    if (!trips.length) return [];

    return PERIODS.map((period) => ({
      ...period,
      trips: trips.filter((trip) =>
        period.test(new Date(trip.departureTime).getHours())
      ),
    })).filter((group) => group.trips.length);
  }, [trips]);

  const dayLabel = formatDate(`${date}T12:00:00`);
  const routeTitle =
    origin && destination ? `${origin} to ${destination}` : 'Every scheduled departure';

  const summary = loading
    ? `Finding trips on ${dayLabel}`
    : trips.length
      ? `All ${trips.length} ${trips.length === 1 ? 'trip' : 'trips'} on ${dayLabel}`
      : `No trips on ${dayLabel}`;

  const openSearch = () => {
    setEditOpen(true);
    document
      .getElementById('trip-search')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="passenger-shell py-6 lg:py-10">
      {/* The search stays on screen as one panel: a summary line with the date,
          then the fields themselves, so a wrong day or route is caught here. */}
      <Reveal>
        <section
          id="trip-search"
          className="overflow-hidden rounded-[10px] border border-border bg-surface"
        >
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
              aria-label={editOpen ? 'Close search' : 'Change search'}
              title={editOpen ? 'Close search' : 'Change search'}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-border bg-surface text-navy transition hover:border-navy/30 lg:hidden"
            >
              {editOpen ? <CloseIcon /> : <SearchIcon />}
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
        <h1 className="text-[22px] font-semibold tracking-[-0.025em] text-navy sm:text-[26px]">
          Search routes
        </h1>
      </Reveal>

      <div className="mt-6 space-y-7">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-[10px] border border-border bg-surface px-5 py-16">
            <Spinner size="lg" />
            <p className="text-[13px] text-muted">Finding trips on {dayLabel}</p>
          </div>
        ) : null}

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
          <div className="rounded-[10px] border border-border bg-surface px-5 py-12 text-center">
            <button
              type="button"
              onClick={openSearch}
              className="inline-flex h-11 items-center justify-center rounded-[6px] bg-accent px-6 text-[13px] font-semibold text-white transition hover:bg-accent/90"
            >
              Change search
            </button>
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
