import { Link } from 'react-router-dom';
import {
  formatDate,
  formatDuration,
  formatNumber,
  formatRwf,
  formatTime,
} from '../../lib/format.js';

// One row per departure, arranged as a small journey: leave time and stop on
// the left, travel time across the middle, arrival on the right. Everything a
// rider compares sits in the card, so nothing needs a click to decide.
export default function TripCard({ trip, passengers = 1 }) {
  const route = trip.route || {};
  const bus = trip.bus || {};
  const enoughSeats = trip.availableSeats >= passengers;
  const scarce = trip.availableSeats > 0 && trip.availableSeats <= 6;
  const totalSeats = Number(trip.totalSeats) || 0;
  // The schedule fare is the single source of truth; the trip page and the
  // booking use the same value, so the card must not override it.
  const priceRwf = Number(trip.priceRwf) || 0;
  const total = priceRwf * passengers;

  return (
    <article className="rounded-[10px] border border-border bg-surface p-4 transition hover:border-navy/30 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <p className="text-[22px] font-semibold leading-none tracking-[-0.02em] text-navy">
                {formatTime(trip.departureTime)}
              </p>
              <p className="mt-1.5 truncate text-[11.5px] text-muted">
                {route.origin || 'Departure'}
              </p>
            </div>

            <div className="flex min-w-0 flex-1 flex-col items-center px-1">
              <span className="whitespace-nowrap text-[10.5px] text-muted">
                {formatDuration(trip.durationMins)}
              </span>
              <span aria-hidden="true" className="mt-1 h-px w-full bg-border" />
            </div>

            <div className="shrink-0 text-right">
              <p className="text-[22px] font-semibold leading-none tracking-[-0.02em] text-navy">
                {formatTime(trip.arrivalTime)}
              </p>
              <p className="mt-1.5 truncate text-[11.5px] text-muted">
                {route.destination || 'Arrival'}
              </p>
            </div>
          </div>

          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-muted">
            <span>{formatDate(trip.departureTime)}</span>
            <span aria-hidden="true">·</span>
            <span>
              Bus {bus.plateNumber || bus.busCode || 'to be assigned'}
            </span>
            {totalSeats ? (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {trip.availableSeats} of {totalSeats} seats free
                </span>
              </>
            ) : null}
          </p>
        </div>

        <div className="flex items-end justify-between gap-4 border-t border-border pt-3 sm:min-w-[190px] sm:flex-col sm:items-end sm:gap-2.5 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          <div className="sm:text-right">
            <p className="text-[16px] font-semibold leading-tight text-navy">
              {formatRwf(priceRwf)}{' '}
              <span className="text-[11px] font-normal text-muted">per seat</span>
            </p>
            <p className="mt-0.5 text-[11.5px] text-muted">
              {passengers > 1
                ? `${formatRwf(total)} for ${passengers} passengers`
                : 'Paid to the conductor on boarding'}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {trip.availableSeats === 0 ? (
              <span className="inline-flex h-9 items-center whitespace-nowrap rounded-[4px] border border-border px-4 text-[12px] font-medium text-muted">
                Fully booked
              </span>
            ) : (
              <Link
                to={`/trips/${trip.id}?passengers=${passengers}`}
                className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-[4px] bg-accent px-4 text-[12px] font-semibold text-white transition hover:bg-accent/90"
              >
                {enoughSeats ? 'Pick your seat' : `Only ${trip.availableSeats} left`}
              </Link>
            )}
            {scarce ? (
              <span className="whitespace-nowrap text-[11px] font-medium text-accent">
                Only {formatNumber(trip.availableSeats)} seats left
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
