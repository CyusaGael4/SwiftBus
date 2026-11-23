import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { passengerApi } from '../../api/passenger.js';
import Modal from '../../components/ui/Modal.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import TicketPrintSheet from '../../components/passenger/TicketPrintSheet.jsx';
import TicketView from '../../components/passenger/TicketView.jsx';
import { statusLabel, statusStyle } from '../../lib/bookingStatus.js';
import { formatDate, formatTime } from '../../lib/format.js';

export default function MyTicketsPage() {
  const [params] = useSearchParams();
  const reference = params.get('booking');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [active, setActive] = useState(null);

  useEffect(() => {
    let mounted = true;

    passengerApi
      .tickets()
      .then((result) => {
        if (mounted) setTickets(result.tickets);
      })
      .catch((requestError) => {
        if (mounted) setError(requestError.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const visible = useMemo(
    () =>
      reference
        ? tickets.filter((ticket) => ticket.reference === reference.toUpperCase())
        : tickets,
    [tickets, reference]
  );

  return (
    <div className="passenger-shell py-6 lg:py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[27px] font-semibold leading-tight tracking-[-0.025em] text-navy sm:text-[32px]">
            Tickets
          </h1>
          <p className="mt-1.5 text-[13.5px] text-muted">
            One QR ticket per seat. Show it to the conductor when you board.
          </p>
        </div>
        <Link
          to="/passenger/bookings"
          className="inline-flex h-10 shrink-0 items-center justify-center self-start rounded-[4px] border border-border bg-surface px-4 text-[12.5px] font-medium text-navy transition hover:border-navy/30"
        >
          My bookings
        </Link>
      </div>

      {reference ? (
        <p className="mt-4 flex flex-wrap items-center gap-2 rounded-[4px] border border-border bg-table-head px-3 py-2 text-[12px] text-navy">
          Showing tickets for reservation{' '}
          <span className="font-mono font-semibold">{reference.toUpperCase()}</span>
          <Link
            to="/passenger/tickets"
            className="font-medium text-accent underline underline-offset-2"
          >
            Show all
          </Link>
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-[4px] border border-[#E3C4B8] bg-warning-soft px-3.5 py-2.5 text-[12.5px] text-[#8E4A33]">
          {error}
        </p>
      ) : null}

      <div className="mt-5 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-[8px] border border-border bg-surface px-5 py-14">
            <Spinner size="lg" />
            <p className="text-[13px] text-muted">Loading your tickets</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-[8px] border border-border bg-surface px-5 py-10 text-center">
            <p className="text-[15px] font-semibold text-navy">No tickets yet</p>
            <p className="mx-auto mt-1.5 max-w-sm text-[13px] text-muted">
              Tickets appear here as soon as a reservation is confirmed.
            </p>
            <Link
              to="/search"
              className="mt-4 inline-flex h-9 items-center rounded-[4px] bg-accent px-4 text-[12px] font-semibold text-white"
            >
              Book a trip
            </Link>
          </div>
        ) : (
          visible.map((ticket) => (
            <article
              key={ticket.id}
              className="flex flex-col gap-4 rounded-[8px] border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-[54px] w-[54px] shrink-0 flex-col items-center justify-center rounded-[6px] bg-table-head">
                  <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-muted">
                    Seat
                  </span>
                  <span className="text-[16px] font-semibold leading-tight text-navy">
                    {ticket.seatNumber || '-'}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[14.5px] font-semibold text-navy">
                      {ticket.route.origin} → {ticket.route.destination}
                    </p>
                    <span className={`badge ${statusStyle(ticket.status)}`}>
                      {statusLabel(ticket.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-[11.5px] text-muted">
                    {formatDate(ticket.departureTime)} ·{' '}
                    {formatTime(ticket.departureTime)} · Bus{' '}
                    {ticket.bus.plateNumber || ticket.bus.busCode}
                  </p>
                  <p className="mt-0.5 font-mono text-[10.5px] text-muted">
                    {ticket.reference}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActive(ticket)}
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-[4px] bg-accent px-4 text-[12px] font-semibold text-white transition hover:bg-accent/90"
              >
                View ticket
              </button>
            </article>
          ))
        )}
      </div>

      <Modal
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title="Digital ticket"
        description={active ? `Seat ${active.seatNumber} · ${active.reference}` : ''}
        maxWidth="max-w-[540px]"
        footer={
          <>
            <button
              type="button"
              onClick={() => setActive(null)}
              className="inline-flex h-9 items-center rounded-[4px] border border-border bg-surface px-4 text-[12px] font-medium text-navy"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-9 items-center rounded-[4px] bg-accent px-4 text-[12px] font-semibold text-white"
            >
              Print / save
            </button>
          </>
        }
      >
        {active ? <TicketView ticket={active} /> : null}
      </Modal>

      <TicketPrintSheet tickets={active ? [active] : []} />
    </div>
  );
}
