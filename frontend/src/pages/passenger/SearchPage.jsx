import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { passengerApi } from '../../api/passenger.js';
import SearchForm from '../../components/passenger/SearchForm.jsx';
import TripCard from '../../components/passenger/TripCard.jsx';
import { formatDate, nextDay, toDateInput } from '../../lib/format.js';

export default function SearchPage() {
  const [params] = useSearchParams();
  const origin = params.get('origin') || '';
  const destination = params.get('destination') || '';
  const date = params.get('date') || toDateInput();
  const passengers = Math.min(6, Math.max(1, Number(params.get('passengers')) || 1));

  const [sort, setSort] = useState('departure');
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

  const trips = useMemo(() => {
    const list = [...data.trips];

    return list.sort((first, second) => {
      if (sort === 'price') return first.priceRwf - second.priceRwf;
      return new Date(first.departureTime) - new Date(second.departureTime);
    });
  }, [data.trips, sort]);

  const tomorrowParams = useMemo(() => {
    const next = new URLSearchParams({ date: nextDay(date, 1), passengers: String(passengers) });
    if (origin) next.set('origin', origin);
    if (destination) next.set('destination', destination);
    return next.toString();
  }, [date, origin, destination, passengers]);

  return (
    <div className="passenger-shell py-6 lg:py-10">
      <div>
        <h1 className="text-[27px] font-semibold leading-tight tracking-[-0.025em] text-navy sm:text-[34px]">
          {origin && destination ? `${origin} → ${destination}` : 'Available trips'}
        </h1>
        <p className="mt-1.5 text-[13px] text-muted">
          {formatDate(`${date}T12:00:00`)} · {passengers}{' '}
          {passengers === 1 ? 'passenger' : 'passengers'}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setEditOpen((current) => !current)}
        className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-border bg-surface px-3 text-[12px] font-medium text-navy lg:hidden"
      >
        {editOpen ? 'Hide search' : 'Change search'}
      </button>

      <div className={`mt-3 lg:mt-5 ${editOpen ? 'block' : 'hidden'} lg:block`}>
        <SearchForm
          origins={meta.origins}
          destinations={meta.destinations}
          initial={{ origin, destination, date, passengers }}
          compact
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <p className="text-[13px] text-muted">
          {loading
            ? 'Finding departures…'
            : `${trips.length} departure${trips.length === 1 ? '' : 's'} with seats available`}
        </p>

        <label className="flex items-center gap-2 text-[12.5px] text-muted">
          Sort by
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="field-select h-9 w-[165px] py-0 text-[12.5px]"
          >
            <option value="departure">Departure time</option>
            <option value="price">Lowest fare</option>
          </select>
        </label>
      </div>

      <div className="mt-4 space-y-3">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-[112px] animate-pulse rounded-[8px] border border-border bg-surface"
              />
            ))
          : null}

        {!loading && error ? (
          <div className="rounded-[8px] border border-[#E3C4B8] bg-warning-soft px-5 py-8 text-center">
            <p className="text-[14px] font-semibold text-[#8E4A33]">{error}</p>
            <p className="mt-1.5 text-[12.5px] text-[#8E4A33]/85">
              Check the route or choose another travel date.
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
          <div className="rounded-[8px] border border-border bg-surface px-5 py-10 text-center">
            <p className="text-[15px] font-semibold text-navy">
              No departures for this search
            </p>
            <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
              {origin && destination
                ? `Every bus from ${origin} to ${destination} on ${formatDate(`${date}T12:00:00`)} is either full or not scheduled yet.`
                : `No buses on ${formatDate(`${date}T12:00:00`)} have enough seats for ${passengers} passenger${passengers === 1 ? '' : 's'}.`}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link
                to={`/search?${tomorrowParams}`}
                className="inline-flex h-9 items-center rounded-[4px] bg-accent px-4 text-[12px] font-semibold text-white"
              >
                Try the next day
              </Link>
              <Link
                to="/search"
                className="inline-flex h-9 items-center rounded-[4px] border border-border bg-surface px-4 text-[12px] font-medium text-navy"
              >
                See all trips
              </Link>
            </div>
          </div>
        ) : null}

        {!loading && !error
          ? trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} passengers={passengers} />
            ))
          : null}
      </div>
    </div>
  );
}
