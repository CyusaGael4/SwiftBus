import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { passengerApi } from '../../api/passenger.js';
import Reveal from '../../components/ui/Reveal.jsx';
import TicketView from '../../components/passenger/TicketView.jsx';
import {
  formatDate,
  formatDuration,
  formatRwf,
  formatTime,
} from '../../lib/format.js';

export default function BookingConfirmationPage() {
  const { reference } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    passengerApi
      .booking(reference)
      .then((result) => {
        if (active) setData(result);
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
  }, [reference]);

  if (loading) {
    return (
      <div className="passenger-shell py-10">
        <div className="h-[320px] animate-pulse rounded-[8px] border border-border bg-surface" />
      </div>
    );
  }

  if (error || !data?.booking) {
    return (
      <div className="passenger-shell py-16 text-center">
        <p className="text-[18px] font-semibold text-navy">Booking not found</p>
        <p className="mx-auto mt-2 max-w-sm text-[13px] text-muted">
          {error || 'We could not load this reservation.'}
        </p>
        <Link
          to="/passenger/bookings"
          className="mt-5 inline-flex h-10 items-center rounded-[4px] bg-accent px-5 text-[12.5px] font-semibold text-white"
        >
          My bookings
        </Link>
      </div>
    );
  }

  const { booking, tickets } = data;
  const trip = booking.trip;

  return (
    <div className="passenger-shell py-6 lg:py-10">
      <Reveal as="section" delay={0} className="rounded-[8px] border border-success/25 bg-success-soft p-5">
        <div className="flex items-start gap-3.5">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success text-white">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="m5 12.5 4.5 4.5L19 7.5"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-success">
              Seats reserved
            </p>
            <h1 className="mt-1 text-[23px] font-semibold leading-tight text-navy sm:text-[26px]">
              {trip.route.origin} → {trip.route.destination}
            </h1>
            <p className="mt-1 text-[12.5px] text-navy/70">
              {formatDate(trip.departureTime)} at {formatTime(trip.departureTime)} ·
              Reference{' '}
              <span className="font-mono font-semibold text-navy">
                {booking.reference}
              </span>
            </p>
          </div>
        </div>
      </Reveal>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Reveal delay={80} className="rounded-[8px] border border-border bg-surface p-5">
            <h2 className="text-[15px] font-semibold text-navy">Journey</h2>

            <div className="mt-4 flex items-center gap-4">
              <div className="shrink-0">
                <p className="text-[21px] font-semibold leading-none text-navy">
                  {formatTime(trip.departureTime)}
                </p>
                <p className="mt-1 text-[11.5px] text-muted">{trip.route.origin}</p>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-navy" />
                  <span className="h-px flex-1 bg-border" />
                  <span className="h-2 w-2 rounded-full bg-accent" />
                </div>
                <p className="mt-1.5 text-center text-[11px] text-muted">
                  {formatDuration(trip.route.estimatedDurationMins)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[21px] font-semibold leading-none text-navy">
                  {formatTime(trip.arrivalTime)}
                </p>
                <p className="mt-1 text-[11.5px] text-muted">{trip.route.destination}</p>
              </div>
            </div>

            <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-[12.5px] sm:grid-cols-3">
              <div>
                <dt className="text-[11px] text-muted">Seats</dt>
                <dd className="mt-0.5 font-semibold text-navy">
                  {booking.seats.join(', ')}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted">Bus</dt>
                <dd className="mt-0.5 font-medium text-navy">
                  {trip.bus.busCode} · {trip.bus.plateNumber}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted">Pay on board</dt>
                <dd className="mt-0.5 font-semibold text-navy">
                  {formatRwf(booking.totalAmountRwf)}
                </dd>
              </div>
            </dl>
          </Reveal>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-navy">
                Digital tickets{' '}
                <span className="font-normal text-muted">({tickets.length})</span>
              </h2>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-9 items-center rounded-[4px] border border-border bg-surface px-3 text-[12px] font-medium text-navy transition hover:border-navy/30"
              >
                Print tickets
              </button>
            </div>

            <p className="text-[12px] leading-relaxed text-muted">
              One ticket per seat. Show the QR code to the conductor and pay the fare
              in RWF.
            </p>

            {tickets.map((ticket, index) => (
              <Reveal key={ticket.id} delay={200 + index * 70}>
                <TicketView ticket={ticket} />
              </Reveal>
            ))}
          </div>
        </div>

        <aside className="space-y-2.5 lg:sticky lg:top-24 lg:self-start">
          <Link
            to="/passenger/bookings"
            className="flex h-10 items-center justify-center rounded-[4px] bg-accent text-[12.5px] font-semibold text-white transition hover:bg-accent/90"
          >
            View my bookings
          </Link>
          <Link
            to="/passenger/tickets"
            className="flex h-10 items-center justify-center rounded-[4px] border border-border bg-surface text-[12.5px] font-medium text-navy transition hover:border-navy/30"
          >
            All my tickets
          </Link>
          <Link
            to="/search"
            className="flex h-10 items-center justify-center text-[12.5px] text-muted transition hover:text-navy"
          >
            Book another trip
          </Link>
        </aside>
      </div>
    </div>
  );
}
