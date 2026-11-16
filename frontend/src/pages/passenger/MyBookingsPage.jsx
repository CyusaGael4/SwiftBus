import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { passengerApi } from '../../api/passenger.js';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import InlineAlert from '../../components/ui/InlineAlert.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Reveal from '../../components/ui/Reveal.jsx';
import { statusLabel, statusStyle } from '../../lib/bookingStatus.js';
import { formatDate, formatRwf, formatTime } from '../../lib/format.js';

const TABS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function MyBookingsPage() {
  const [tab, setTab] = useState('upcoming');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ bookings: [], counts: {}, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [detail, setDetail] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await passengerApi.bookings({ status: tab, page, limit: 6 });
      setData(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => {
    load();
  }, [load]);

  const changeTab = (value) => {
    setTab(value);
    setPage(1);
    setNotice('');
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;

    setCancelling(true);
    setCancelError('');

    try {
      await passengerApi.cancelBooking(cancelTarget.reference);
      setCancelTarget(null);
      setNotice(`Reservation ${cancelTarget.reference} cancelled. Seats released.`);
      setPage(1);
      load();
    } catch (requestError) {
      setCancelError(requestError.message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="passenger-shell py-6 lg:py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[27px] font-semibold leading-tight tracking-[-0.025em] text-navy sm:text-[32px]">
            My bookings
          </h1>
          <p className="mt-1.5 text-[13.5px] text-muted">
            Review a reservation, open its tickets or cancel before departure.
          </p>
        </div>
        <Link
          to="/search"
          className="inline-flex h-10 shrink-0 items-center justify-center self-start rounded-[4px] bg-accent px-4 text-[12.5px] font-semibold text-white transition hover:bg-accent/90"
        >
          Book a trip
        </Link>
      </div>

      {error ? (
        <div className="mt-4">
          <InlineAlert>{error}</InlineAlert>
        </div>
      ) : null}

      {notice ? (
        <div className="mt-4">
          <InlineAlert tone="info">{notice}</InlineAlert>
        </div>
      ) : null}

      <div className="mt-5 flex gap-1 rounded-[6px] border border-border bg-surface p-1">
        {TABS.map((item) => {
          const active = tab === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => changeTab(item.value)}
              className={`flex h-9 flex-1 items-center justify-center gap-1 rounded-[4px] text-[12px] font-medium transition ${
                active ? 'bg-navy text-cream' : 'text-muted hover:bg-table-head hover:text-navy'
              }`}
            >
              {item.label}
              <span
                className={`text-[10.5px] ${active ? 'text-cream/65' : 'text-muted/80'}`}
              >
                {data.counts?.[item.value] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-[136px] animate-pulse rounded-[8px] border border-border bg-surface"
            />
          ))
        ) : data.bookings.length === 0 ? (
          <div className="rounded-[8px] border border-border bg-surface px-5 py-10 text-center">
            <p className="text-[15px] font-semibold text-navy">
              No {tab} reservations
            </p>
            <p className="mx-auto mt-1.5 max-w-sm text-[13px] text-muted">
              {tab === 'upcoming'
                ? 'Reserve a seat and your trip will appear here.'
                : 'Nothing in this part of your history yet.'}
            </p>
          </div>
        ) : (
          data.bookings.map((booking, index) => (
            <Reveal
              as="article"
              key={booking.id}
              delay={Math.min(index, 5) * 60}
              className="rounded-[8px] border border-border bg-surface p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`badge ${statusStyle(booking.status)}`}>
                      {statusLabel(booking.status)}
                    </span>
                    <span className="font-mono text-[11px] text-muted">
                      {booking.reference}
                    </span>
                  </div>

                  <p className="mt-2 text-[16px] font-semibold leading-snug text-navy">
                    {booking.trip.route.origin} → {booking.trip.route.destination}
                  </p>
                  <p className="mt-1 text-[12.5px] text-muted">
                    {formatDate(booking.trip.departureTime)} ·{' '}
                    {formatTime(booking.trip.departureTime)} · Bus{' '}
                    {booking.trip.bus.plateNumber || booking.trip.bus.busCode}
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-muted">
                    <span>
                      Seats{' '}
                      <strong className="font-semibold text-navy">
                        {booking.seats.join(', ')}
                      </strong>
                    </span>
                    <span>
                      {booking.passengerCount}{' '}
                      {booking.passengerCount === 1 ? 'passenger' : 'passengers'}
                    </span>
                    <span className="font-semibold text-navy">
                      {formatRwf(booking.totalAmountRwf)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                  <Link
                    to={`/passenger/tickets?booking=${booking.reference}`}
                    className="inline-flex h-9 items-center rounded-[4px] bg-accent px-3.5 text-[12px] font-semibold text-white transition hover:bg-accent/90"
                  >
                    Tickets
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDetail(booking)}
                    className="inline-flex h-9 items-center rounded-[4px] border border-border bg-surface px-3 text-[12px] font-medium text-navy transition hover:border-navy/30"
                  >
                    Details
                  </button>
                  {booking.status === 'upcoming' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCancelTarget(booking);
                        setCancelError('');
                      }}
                      className="inline-flex h-9 items-center rounded-[4px] px-2.5 text-[12px] font-medium text-[#A94A30] transition hover:bg-[#A94A30]/5"
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </div>
            </Reveal>
          ))
        )}
      </div>

      {data.pages > 1 ? (
        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1}
            className="inline-flex h-9 items-center rounded-[4px] border border-border bg-surface px-3 text-[12px] text-navy disabled:opacity-50"
          >
            Previous
          </button>
          <p className="text-[11.5px] text-muted">
            Page {data.page} of {data.pages}
          </p>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(data.pages, current + 1))}
            disabled={page >= data.pages}
            className="inline-flex h-9 items-center rounded-[4px] border border-border bg-surface px-3 text-[12px] text-navy disabled:opacity-50"
          >
            Next
          </button>
        </div>
      ) : null}

      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title="Reservation details"
        description={detail ? `Reference ${detail.reference}` : ''}
        footer={
          <button
            type="button"
            onClick={() => setDetail(null)}
            className="inline-flex h-9 items-center rounded-[4px] border border-border bg-surface px-4 text-[12px] font-medium text-navy"
          >
            Close
          </button>
        }
      >
        {detail ? (
          <div className="space-y-3 text-[13px]">
            {[
              ['Status', statusLabel(detail.status)],
              ['Route', `${detail.trip.route.origin} → ${detail.trip.route.destination}`],
              [
                'Travel',
                `${formatDate(detail.trip.departureTime)} · ${formatTime(detail.trip.departureTime)}`,
              ],
              ['Bus', `${detail.trip.bus.busCode} · ${detail.trip.bus.plateNumber}`],
              ['Seats', detail.seats.join(', ')],
              ['Passengers', String(detail.passengerCount)],
              ['Fare per seat', formatRwf(detail.unitPriceRwf)],
              ['Total on board', formatRwf(detail.totalAmountRwf)],
              ['Contact', `${detail.contactName || '-'} · ${detail.contactPhone || '-'}`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between gap-4 border-b border-border pb-2 last:border-b-0"
              >
                <span className="text-muted">{label}</span>
                <span className="text-right font-medium text-navy">{value}</span>
              </div>
            ))}
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel this reservation?"
        message={
          cancelTarget
            ? `${cancelTarget.trip.route.origin} → ${cancelTarget.trip.route.destination} on ${formatDate(
                cancelTarget.trip.departureTime
              )}. Seats ${cancelTarget.seats.join(', ')} will be released for other passengers.`
            : ''
        }
        confirmLabel="Cancel reservation"
        onConfirm={confirmCancel}
        onClose={() => setCancelTarget(null)}
        loading={cancelling}
        error={cancelError}
      />
    </div>
  );
}
