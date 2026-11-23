import { QRCodeSVG } from 'qrcode.react';
import { formatDate, formatTime } from '../../lib/format.js';

const STATUS_STYLE = {
  active: 'bg-[#E7EDE5] text-[#476B4F]',
  completed: 'bg-white/15 text-cream',
  cancelled: 'bg-[#F7E7DD] text-[#EC5E27]',
};

const STATUS_LABEL = {
  active: 'Ready to board',
  completed: 'Trip completed',
  cancelled: 'Cancelled',
};

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className="mt-1 text-[12px] font-medium leading-snug text-navy">{children}</p>
    </div>
  );
}

function RouteArrow() {
  return (
    <svg
      width="26"
      height="12"
      viewBox="0 0 26 12"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-accent"
    >
      <path
        d="M0 6h22M17.5 1.5 23 6l-5.5 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TicketView({ ticket, className = '' }) {
  if (!ticket) return null;

  return (
    <article
      className={`print-ticket overflow-hidden rounded-[8px] border border-border bg-surface ${className}`}
    >
      {/* Masthead */}
      <div className="flex items-center justify-between gap-4 bg-navy px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold uppercase leading-none tracking-[0.2em] text-cream">
            SwiftBus
          </p>
          <p className="mt-1.5 text-[8.5px] font-medium uppercase tracking-[0.16em] text-cream/55">
            Passenger e-ticket
          </p>
        </div>
        <span
          className={`inline-flex h-[24px] shrink-0 items-center rounded-[3px] px-2.5 text-[9.5px] font-semibold uppercase tracking-[0.06em] ${
            STATUS_STYLE[ticket.status] || STATUS_STYLE.completed
          }`}
        >
          {STATUS_LABEL[ticket.status] || ticket.status}
        </span>
      </div>

      {/* Journey */}
      <div className="flex items-end justify-between gap-4 border-b border-border px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
            Journey
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="text-[15.5px] font-semibold leading-tight text-navy">
              {ticket.route.origin || '-'}
            </span>
            <RouteArrow />
            <span className="text-[15.5px] font-semibold leading-tight text-navy">
              {ticket.route.destination || '-'}
            </span>
          </div>
        </div>
        <p className="shrink-0 whitespace-nowrap text-right text-[10.5px] font-medium text-muted">
          {formatDate(ticket.departureTime)}
        </p>
      </div>

      <div className="grid sm:grid-cols-[minmax(0,1fr)_142px]">
        <div className="min-w-0 px-4 py-4 sm:px-5">
          <div className="flex items-start gap-5">
            <div className="shrink-0">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
                Seat
              </p>
              <p className="mt-1 text-[27px] font-semibold leading-none tracking-[-0.02em] text-accent">
                {ticket.seatNumber || '-'}
              </p>
            </div>
            <div className="min-w-0 border-l border-border pl-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
                Passenger
              </p>
              <p className="mt-1 truncate text-[13px] font-semibold leading-snug text-navy">
                {ticket.passengerName || '-'}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-muted">
                {ticket.passengerPhone || '-'}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-dashed border-border pt-3">
            <div className="shrink-0">
              <p className="text-[14.5px] font-semibold leading-none text-navy">
                {formatTime(ticket.departureTime)}
              </p>
              <p className="mt-1 text-[10px] text-muted">{ticket.route.origin}</p>
            </div>
            <div className="flex flex-1 items-center" aria-hidden="true">
              <span className="h-1.5 w-1.5 rounded-full bg-navy" />
              <span className="h-px flex-1 bg-border" />
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[14.5px] font-semibold leading-none text-navy">
                {formatTime(ticket.arrivalTime)}
              </p>
              <p className="mt-1 text-[10px] text-muted">{ticket.route.destination}</p>
            </div>
          </div>

          <div className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-dashed border-border pt-3">
            <Field label="Travel date">{formatDate(ticket.departureTime)}</Field>
            <Field label="Bus">
              {ticket.bus.busCode || '-'}
              {ticket.bus.plateNumber ? ` / ${ticket.bus.plateNumber}` : ''}
            </Field>
            <Field label="Booking reference">
              <span className="break-all font-mono text-[10.5px]">
                {ticket.reference || '-'}
              </span>
            </Field>
            <Field label="Ticket number">
              <span className="break-all font-mono text-[10.5px]">
                {ticket.code || '-'}
              </span>
            </Field>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 border-t border-dashed border-border px-3 py-4 sm:border-l sm:border-t-0">
          {ticket.verificationCode ? (
            <>
              <div className="rounded-[3px] bg-white p-2 ring-1 ring-border">
                <QRCodeSVG value={ticket.verificationCode} size={104} level="M" />
              </div>
              <p className="text-center text-[8.5px] font-semibold uppercase tracking-[0.12em] text-navy">
                Scan at boarding
              </p>
              <p className="max-w-[118px] text-center text-[9px] leading-snug text-muted">
                Show this code to the conductor
              </p>
            </>
          ) : (
            <p className="max-w-[120px] text-center text-[10px] leading-snug text-muted">
              No scannable code for this ticket.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border bg-table-head px-4 py-2.5 sm:px-5">
        <p className="text-[9.5px] leading-relaxed text-muted">
          Reservation only - pay the conductor in RWF when boarding.
        </p>
        <p className="text-[9.5px] font-medium text-muted">support@swiftbus.rw</p>
      </div>
    </article>
  );
}
