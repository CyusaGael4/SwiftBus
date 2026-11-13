import { formatTime, routeLabel } from '../../lib/format.js';

export default function UpcomingDepartures({ departures = [] }) {
  return (
    <section className="card flex h-full flex-col p-6">
      <h2 className="text-[19px] font-semibold leading-none text-navy">
        Upcoming departures
      </h2>

      <div className="mt-8 flex items-center justify-between border-b border-border pb-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
          Route
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
          Departure
        </span>
      </div>

      {departures.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-muted">
          No upcoming departures.
        </p>
      ) : (
        <div className="flex flex-1 flex-col">
          {departures.map((departure) => (
            <div
              key={departure.id}
              className="flex items-center justify-between gap-4 border-b border-border py-[22px] last:border-b-0"
            >
              <p className="text-[14px] text-navy">{routeLabel(departure.route)}</p>
              <p className="text-[15px] font-semibold text-navy">
                {formatTime(departure.departureTime)}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
