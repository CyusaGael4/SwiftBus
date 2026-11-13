import { Link } from 'react-router-dom';
import {
  formatDate,
  formatDuration,
  formatRwf,
  formatTime,
} from '../../lib/format.js';

export default function TripCard({ trip, passengers = 1 }) {
  const route = trip.route || {};
  const bus = trip.bus || {};
  const enoughSeats = trip.availableSeats >= passengers;
  const scarce = trip.availableSeats > 0 && trip.availableSeats <= 6;
  // The schedule fare is the single source of truth; the trip page and the
  // booking use the same value, so the card must not override it.
  const priceRwf = Number(trip.priceRwf) || 0;

  return (
    <article className="rounded-[8px] border border-border bg-surface p-4 transition hover:border-navy/30 sm:shadow-sm sm:shadow-[0_4px_12px_-2_rgba(0,0,0,0.1)]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="flex items-baseline gap-2.5">
          <p className="text-[24px] font-semibold leading-none tracking-[-0.02em] text-navy">
            {formatTime(trip.departureTime)}
          </p>
          <p className="text-[12px] text-muted">
            arrive {formatTime(trip.arrivalTime)} ·{' '}
            {formatDuration(trip.durationMins)}
          </p>
        </div>

        <p className="whitespace-nowrap text-[17px] font-semibold leading-none text-navy">
          {formatRwf(priceRwf)}{' '}
          <span className="text-[11px] font-normal text-muted">per seat</span>
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-t border-border pt-3">
        <div className="min-w-0">
          <p className="text-[15px] font-medium leading-snug text-navy">
            {route.origin} → {route.destination}
          </p>
          <p className="mt-0.5 text-[11.5px] text-muted">
            {formatDate(trip.departureTime)} · Bus{' '}
            {bus.plateNumber || bus.busCode || 'to be assigned'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`whitespace-nowrap text-[11.5px] font-medium ${
              trip.availableSeats === 0
                ? 'text-muted'
                : scarce
                  ? 'text-accent'
                  : 'text-success'
            }`}
          >
            {trip.availableSeats === 0
              ? 'Fully booked'
              : `${trip.availableSeats} seat${trip.availableSeats === 1 ? '' : 's'} left`}
          </span>

          {trip.availableSeats === 0 ? (
            <span className="inline-flex h-9 items-center whitespace-nowrap rounded-[4px] border border-border px-4 text-[12px] font-medium text-muted">
              Unavailable
            </span>
          ) : (
            <Link
              to={`/trips/${trip.id}?passengers=${passengers}`}
              className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-[4px] bg-accent px-4 text-[12px] font-semibold text-white transition hover:bg-accent/90"
            >
              {enoughSeats ? 'Select seats' : `Only ${trip.availableSeats} left`}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
