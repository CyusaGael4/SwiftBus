import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { passengerApi } from '../../api/passenger.js';
import HoldTimer from '../../components/passenger/HoldTimer.jsx';
import InlineAlert from '../../components/ui/InlineAlert.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { clearDraft, readDraft } from '../../lib/bookingDraft.js';
import {
  formatDate,
  formatDuration,
  formatRwf,
  formatTime,
} from '../../lib/format.js';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const draft = useMemo(() => readDraft(), []);

  const [trip, setTrip] = useState(draft?.trip || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    contactName: user?.fullName || '',
    contactPhone: user?.phoneNumber || '',
  });

  useEffect(() => {
    if (!draft?.scheduleId || !draft?.seats?.length) {
      setLoading(false);
      return undefined;
    }

    let active = true;

    passengerApi
      .seats(draft.scheduleId, { holdToken: draft.holdToken })
      .then((result) => {
        if (!active) return;
        setTrip(result.trip);

        const seatMap = new Map(result.seats.map((seat) => [seat.label, seat]));
        const lost = draft.seats.filter((label) => {
          const seat = seatMap.get(label);
          return !seat || seat.taken || !seat.selected;
        });

        if (lost.length) {
          setError(
            `Seat${lost.length > 1 ? 's' : ''} ${lost.join(
              ', '
            )} are no longer held. Go back to the trip and select seats again.`
          );
        }
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
  }, [draft]);

  if (!draft?.scheduleId || !draft?.seats?.length) {
    return (
      <div className="passenger-shell py-16 text-center">
        <p className="text-[18px] font-semibold text-navy">No seats selected</p>
        <p className="mx-auto mt-2 max-w-sm text-[13px] text-muted">
          Pick a trip and choose your seats before checking out.
        </p>
        <Link
          to="/search"
          className="mt-5 inline-flex h-10 items-center rounded-[4px] bg-accent px-5 text-[12.5px] font-semibold text-white"
        >
          Find a trip
        </Link>
      </div>
    );
  }

  const total = (trip?.priceRwf || 0) * draft.seats.length;

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    if (error) setError('');
  };

  const handleConfirm = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.contactPhone.trim()) {
      setError('Add a phone number so the operator can reach you before departure.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await passengerApi.createBooking({
        scheduleId: draft.scheduleId,
        seats: draft.seats,
        holdToken: draft.holdToken,
        contactName: form.contactName.trim(),
        contactPhone: form.contactPhone.trim(),
      });

      clearDraft();
      navigate(`/booking/${result.booking.reference}`, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="passenger-shell py-10">
        <div className="h-[360px] animate-pulse rounded-[8px] border border-border bg-surface" />
      </div>
    );
  }

  return (
    <div className="passenger-shell pb-10 pt-6 lg:pt-10">
      <Link
        to={`/trips/${draft.scheduleId}?passengers=${draft.seats.length}`}
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted transition hover:text-navy"
      >
        <span aria-hidden="true">←</span> Back to seats
      </Link>

      <h1 className="mt-4 text-[27px] font-semibold leading-tight tracking-[-0.025em] text-navy sm:text-[32px]">
        Confirm your reservation
      </h1>
      <p className="mt-1.5 text-[13.5px] text-muted">
        No payment now. Your seats are reserved and the fare is paid on board.
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <form onSubmit={handleConfirm} className="order-2 space-y-4 lg:order-1" noValidate>
          {error ? <InlineAlert>{error}</InlineAlert> : null}

          <div className="rounded-[8px] border border-border bg-surface p-5">
            <h2 className="text-[15px] font-semibold text-navy">Passenger details</h2>
            <p className="mt-0.5 text-[12px] text-muted">
              These appear on the ticket and are used at boarding.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="field-label !text-[13px]">Full name</span>
                <input
                  name="contactName"
                  value={form.contactName}
                  onChange={handleChange}
                  className="field-input"
                  autoComplete="name"
                  required
                />
              </label>

              <label className="block">
                <span className="field-label !text-[13px]">Phone number</span>
                <input
                  name="contactPhone"
                  value={form.contactPhone}
                  onChange={handleChange}
                  className="field-input"
                  autoComplete="tel"
                  placeholder="+250 7XX XXX XXX"
                  required
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="field-label !text-[13px]">Email</span>
                <input value={user?.email || ''} className="field-input" readOnly disabled />
                <span className="mt-1.5 block text-[11.5px] text-muted">
                  Your tickets are attached to this account.
                </span>
              </label>
            </div>
          </div>

          <div className="rounded-[8px] border border-border bg-table-head/60 px-4 py-3 text-[12.5px] leading-relaxed text-navy">
            You will pay <strong>{formatRwf(total)}</strong> in cash to the conductor.
            Bring the QR ticket on your phone or printed.
          </div>

          <button
            type="submit"
            disabled={submitting || Boolean(error)}
            className="inline-flex h-11 w-full items-center justify-center rounded-[4px] bg-accent px-5 text-[13.5px] font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[260px]"
          >
            {submitting ? 'Reserving seats…' : 'Confirm reservation'}
          </button>
        </form>

        <aside className="order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[8px] border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-navy">Your trip</h2>
              {draft.expiresAt ? <HoldTimer expiresAt={draft.expiresAt} /> : null}
            </div>

            {trip ? (
              <>
                <p className="mt-3 text-[17px] font-semibold leading-tight text-navy">
                  {trip.route.origin} → {trip.route.destination}
                </p>
                <p className="mt-1 text-[12.5px] text-muted">
                  {formatDate(trip.departureTime)} · {formatTime(trip.departureTime)} →{' '}
                  {formatTime(trip.arrivalTime)}
                </p>
                <p className="mt-0.5 text-[12px] text-muted">
                  {formatDuration(trip.durationMins)} · Bus{' '}
                  {trip.bus.plateNumber || trip.bus.busCode}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {draft.seats.map((seat) => (
                    <span
                      key={seat}
                      className="rounded-[3px] border border-border bg-table-head px-2 py-1 text-[11.5px] font-semibold text-navy"
                    >
                      Seat {seat}
                    </span>
                  ))}
                </div>

                <div className="mt-4 space-y-2 border-t border-border pt-3 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-muted">
                      {draft.seats.length} seat{draft.seats.length === 1 ? '' : 's'} ×{' '}
                      {formatRwf(trip.priceRwf)}
                    </span>
                    <span className="text-navy">{formatRwf(total)}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-muted">Total on board</span>
                    <span className="text-[19px] font-semibold text-navy">
                      {formatRwf(total)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="mt-3 text-[12.5px] text-muted">Loading trip details…</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
