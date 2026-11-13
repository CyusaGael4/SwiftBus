import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { passengerApi } from '../../api/passenger.js';
import SearchForm from '../../components/passenger/SearchForm.jsx';
import { formatDuration, formatRwf, formatTime, toDateInput } from '../../lib/format.js';

const TRUST_POINTS = [
  'No account needed to search',
  'Seats held while you check out',
  'Pay the conductor on board',
];

function TrustPoint({ children }) {
  return (
    <li className="inline-flex items-center gap-2">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="m5 12.5 4.5 4.5L19 7.5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </li>
  );
}

function RouteArt() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute -right-20 -top-24 h-[520px] w-[520px] text-cream/[0.07]"
      viewBox="0 0 400 400"
      fill="none"
    >
      <circle cx="200" cy="200" r="170" stroke="currentColor" strokeDasharray="2 14" />
      <circle cx="200" cy="200" r="118" stroke="currentColor" strokeDasharray="2 14" />
      <path
        d="M10 300C120 220 190 300 260 210S360 90 400 60"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="10" cy="300" r="6" fill="currentColor" />
      <circle cx="260" cy="210" r="6" fill="currentColor" />
      <circle cx="400" cy="60" r="6" fill="currentColor" />
    </svg>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [data, setData] = useState({ origins: [], destinations: [], popular: [] });
  const [today, setToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const places = useMemo(
    () => Array.from(new Set([...data.origins, ...data.destinations])),
    [data]
  );

  useEffect(() => {
    let active = true;

    Promise.all([
      passengerApi.destinations(),
      passengerApi.searchTrips({ date: toDateInput(), passengers: 1 }),
    ])
      .then(([destinations, trips]) => {
        if (!active) return;
        setData(destinations);
        setToday((trips.trips || []).slice(0, 4));
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
  }, []);

  const searchDestination = (route) => {
    const params = new URLSearchParams({
      origin: route.origin,
      destination: route.destination,
      date: toDateInput(),
      passengers: '1',
    });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div>
      <section className="relative overflow-hidden bg-navy">
        <RouteArt />

        <div className="passenger-shell relative pb-10 pt-10 sm:pt-14 lg:pb-14">
         

          <h1 className="mt-4 max-w-[720px] text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] text-cream sm:text-[54px]">
            Reserve your seat.
            <br className="hidden sm:block" /> Pay on board.
          </h1>

          <p className="mt-4 max-w-[520px] text-[14.5px] leading-relaxed text-cream/70">
            Choose your exact seat on the bus, get a QR ticket for every passenger,
            and settle the fare with the conductor. Searching is free — no account
            needed.
          </p>

          <div className="mt-8 lg:mt-10">
            <SearchForm origins={data.origins} destinations={data.destinations} />
          </div>

          {error ? (
            <p className="mt-4 max-w-xl rounded-[4px] border border-white/15 bg-white/[0.06] px-3 py-2 text-[12.5px] text-cream/85">
              We couldn&apos;t load live departures right now. Use the search above to
              try again.
            </p>
          ) : null}
        </div>
      </section>

      <section className="passenger-shell mt-10 sm:mt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[21px] font-semibold tracking-[-0.02em] text-navy sm:text-[24px]">
              Departing today
            </h2>
            <p className="mt-1 text-[13px] text-muted">
              Live seat availability for today's departures.
            </p>
          </div>
          <Link
            to="/search"
            className="hidden shrink-0 text-[13px] font-semibold text-navy underline decoration-navy/30 underline-offset-4 transition hover:decoration-accent hover:text-accent sm:inline"
          >
            See all trips
          </Link>
        </div>

        <div className="mt-4 overflow-hidden rounded-[8px] border border-border bg-surface">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-[76px] rounded-[8px] border-b border-border bg-surface last:border-b-0"
              />
            ))
          ) : today.length ? (
            today.map((trip) => {
              const scarce = trip.availableSeats > 0 && trip.availableSeats <= 6;

              return (
                <Link
                  key={trip.id}
                  to={`/trips/${trip.id}?passengers=1`}
                  className="group block border-b border-border px-4 py-4 transition last:border-b-0 hover:bg-table-head/70 sm:px-5"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[17px] font-semibold leading-none text-navy">
                      {formatTime(trip.departureTime)}
                      <span className="ml-2 text-[12px] font-normal text-muted">
                        {formatDuration(trip.durationMins)}
                      </span>
                    </p>
                    <p className="shrink-0 text-[14px] font-semibold text-navy">
                      {formatRwf(trip.priceRwf)}{' '}
                      <span className="text-[10.5px] font-normal text-muted">
                        per seat
                      </span>
                    </p>
                  </div>

                  <p className="mt-1.5 text-[13.5px] font-medium text-navy">
                    {trip.route.origin} → {trip.route.destination}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-muted">
                    Bus {trip.bus.plateNumber || trip.bus.busCode} ·{' '}
                    <span className={scarce ? 'font-medium text-accent' : ''}>
                      {trip.availableSeats} seat
                      {trip.availableSeats === 1 ? '' : 's'} left
                    </span>
                  </p>
                </Link>
              );
            })
          ) : (
            <p className="px-5 py-8 text-center text-[13px] text-muted">
              No more departures today. Choose another travel date in the search.
            </p>
          )}
        </div>

        <Link
          to="/search"
          className="mt-3 inline-flex text-[13px] font-semibold text-navy underline decoration-navy/30 underline-offset-4 sm:hidden"
        >
          See all trips
        </Link>
      </section>

      <section className="passenger-shell mt-12 pb-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[21px] font-semibold tracking-[-0.02em] text-navy sm:text-[24px]">
              Popular routes
            </h2>
            <p className="mt-1 text-[13px] text-muted">
              Fares shown per seat, payable on board.
            </p>
          </div>
          <Link
            to="/search"
            className="hidden shrink-0 text-[13px] font-semibold text-navy underline decoration-navy/30 underline-offset-4 transition hover:decoration-accent hover:text-accent sm:inline"
          >
            Browse all trips
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[134px] rounded-[8px] border border-border bg-surface"
                />
              ))
            : data.popular.map((route) => (
                <button
                  key={route.routeCode}
                  type="button"
                  onClick={() => searchDestination(route)}
                  className="group flex flex-col rounded-[8px] border border-border bg-surface p-5 text-left transition hover:border-navy/35 hover:shadow-[0_14px_30px_-24px_rgba(40,43,74,0.7)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[12px] text-muted">From {route.origin}</p>
                      <p className="mt-1 truncate text-[21px] font-semibold tracking-[-0.01em] text-navy">
                        {route.destination}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-[13px] text-navy transition group-hover:border-accent group-hover:bg-accent group-hover:text-white"
                    >
                      →
                    </span>
                  </div>

                  <div className="mt-7 flex items-end justify-between gap-3 border-t border-border pt-3">
                    <p className="text-[13.5px] font-semibold text-navy">
                      {formatRwf(route.fareRwf)}{' '}
                      <span className="font-normal text-muted">per seat</span>
                    </p>
                    <p className="text-[11.5px] whitespace-nowrap text-muted">
                      {route.trips} departure{route.trips === 1 ? '' : 's'}
                    </p>
                  </div>
                </button>
              ))}
        </div>

        {!loading && !error && data.popular.length === 0 ? (
          <p className="mt-4 rounded-[8px] border border-border bg-surface px-4 py-8 text-center text-[13px] text-muted">
            No routes are open for booking yet. Please check back soon.
          </p>
        ) : null}
      </section>
    </div>
  );
}
