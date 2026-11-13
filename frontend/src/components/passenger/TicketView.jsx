import { QRCodeSVG } from 'qrcode.react';
import { formatDate, formatTime } from '../../lib/format.js';

const STATUS_STYLE = {
  active: 'bg-success-soft text-success',
  completed: 'bg-[#EFEEE6] text-muted',
  cancelled: 'bg-warning-soft text-warning',
};

const STATUS_LABEL = {
  active: 'Ready to board',
  completed: 'Trip completed',
  cancelled: 'Cancelled',
};

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
        {label}
      </p>
      <p className="mt-1 text-[12.5px] leading-snug text-navy">{children}</p>
    </div>
  );
}

export default function TicketView({ ticket, className = '' }) {
  if (!ticket) return null;

  return (
    <div
      className={`print-ticket overflow-hidden rounded-[8px] border border-border bg-surface ${className}`}
    >
      <div className="flex items-center justify-between gap-3 bg-navy px-4 py-3">
        <div className="min-w-0">
          <p className="text-[9.5px] font-medium uppercase tracking-[0.14em] text-cream/55">
            SwiftBus e-ticket
          </p>
          <p className="mt-1 truncate text-[13.5px] font-semibold text-cream">
            {ticket.route.origin} → {ticket.route.destination}
          </p>
        </div>
        <span
          className={`badge shrink-0 ${STATUS_STYLE[ticket.status] || STATUS_STYLE.completed}`}
        >
          {STATUS_LABEL[ticket.status] || ticket.status}
        </span>
      </div>

      <div className="grid gap-4 px-4 py-4 sm:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <div className="flex items-start gap-6">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
                Seat
              </p>
              <p className="mt-0.5 text-[24px] font-semibold leading-none text-accent">
                {ticket.seatNumber || '—'}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
                Passenger
              </p>
              <p className="mt-1 truncate text-[13.5px] font-medium text-navy">
                {ticket.passengerName || '—'}
              </p>
              <p className="mt-0.5 truncate text-[11.5px] text-muted">
                {ticket.passengerPhone || '—'}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 border-t border-dashed border-border pt-3">
            <div>
              <p className="text-[16px] font-semibold leading-none text-navy">
                {formatTime(ticket.departureTime)}
              </p>
              <p className="mt-1 text-[10.5px] text-muted">{ticket.route.origin}</p>
            </div>
            <div className="flex flex-1 items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-navy" />
              <span className="h-px flex-1 bg-border" />
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            </div>
            <div className="text-right">
              <p className="text-[16px] font-semibold leading-none text-navy">
                {formatTime(ticket.arrivalTime)}
              </p>
              <p className="mt-1 text-[10.5px] text-muted">{ticket.route.destination}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-dashed border-border pt-3">
            <Field label="Travel date">{formatDate(ticket.departureTime)}</Field>
            <Field label="Bus">
              {ticket.bus.busCode || '—'}
              {ticket.bus.plateNumber ? ` · ${ticket.bus.plateNumber}` : ''}
            </Field>
            <Field label="Booking" className="col-span-2">
              <span className="break-all font-mono text-[11.5px]">
                {ticket.reference || '—'}
              </span>
            </Field>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 sm:border-l sm:border-dashed sm:border-border sm:pl-4">
          {ticket.verificationCode ? (
            <>
              <div className="rounded-[4px] bg-white p-2">
                <QRCodeSVG value={ticket.verificationCode} size={104} level="M" />
              </div>
              <p className="max-w-[124px] text-center text-[9.5px] leading-tight text-muted">
                Show this code to the conductor
              </p>
            </>
          ) : (
            <p className="max-w-[130px] text-center text-[10px] text-muted">
              No scannable code for this ticket.
            </p>
          )}
        </div>
      </div>

      <p className="border-t border-border px-4 py-2 text-[10px] text-muted">
        Reservation only · Pay the conductor in RWF when boarding · Ticket{' '}
        <span className="font-mono">{ticket.code}</span>
      </p>
    </div>
  );
}
