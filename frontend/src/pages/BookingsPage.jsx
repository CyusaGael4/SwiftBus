import { useCallback, useEffect, useState } from 'react';
import { bookingsApi } from '../api/bookings.js';
import InlineAlert from '../components/ui/InlineAlert.jsx';
import Modal from '../components/ui/Modal.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import SearchInput from '../components/ui/SearchInput.jsx';
import StatGroup from '../components/ui/StatGroup.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { TableMessage } from '../components/ui/TableMessage.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import useDebouncedValue from '../hooks/useDebouncedValue.js';
import {
  formatDate,
  formatDateTime,
  formatRwf,
  formatTime,
  routeLabel,
} from '../lib/format.js';

const TABS = [
  { value: 'all', label: 'All bookings' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PAGE_SIZE = 10;

export default function BookingsPage() {
  const [tab, setTab] = useState('all');
  const [source, setSource] = useState('all');
  const [date, setDate] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const query = useDebouncedValue(search, 300);

  const [data, setData] = useState({
    bookings: [],
    stats: { total: 0, online: 0, agent: 0, upcoming: 0, cancelled: 0 },
    pages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await bookingsApi.list({
        status: tab,
        source,
        date,
        q: query,
        page,
        limit: PAGE_SIZE,
      });
      setData(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [tab, source, date, query, page]);

  useEffect(() => {
    load();
  }, [load]);

  const changeTab = (value) => {
    setTab(value);
    setPage(1);
  };

  const { stats, bookings, pages } = data;

  return (
    <div>
      <PageHeader
        title="Bookings"
        subtitle="Online passenger reservations and counter bookings, in one list."
      />

      <StatGroup
        variant="page"
        eyebrow="Reservation activity"
        items={[
          { label: 'Total reservations', value: stats.total, padded: true },
          { label: 'Online bookings', value: stats.online, padded: true },
          { label: 'Agent bookings', value: stats.agent, padded: true },
          { label: 'Cancelled', value: stats.cancelled, padded: true, accent: true },
        ]}
      />

      {error ? (
        <div className="mt-5">
          <InlineAlert>{error}</InlineAlert>
        </div>
      ) : null}

      <section className="mt-[45px] table-shell">
        <Tabs
          value={tab}
          onChange={changeTab}
          items={TABS.map((item) => ({
            ...item,
            count:
              item.value === 'all'
                ? stats.total
                : item.value === 'upcoming'
                  ? stats.upcoming
                  : item.value === 'cancelled'
                    ? stats.cancelled
                    : undefined,
          }))}
          right={
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <SearchInput
                value={search}
                onChange={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
                placeholder="Reference, name or phone"
                className="sm:w-[210px]"
              />
              <select
                value={source}
                onChange={(event) => {
                  setSource(event.target.value);
                  setPage(1);
                }}
                className="field-select h-9 w-full py-0 text-[12.5px] sm:w-[142px]"
                aria-label="Filter by booking source"
              >
                <option value="all">All sources</option>
                <option value="online">Online</option>
                <option value="agent">Booking agent</option>
              </select>
              <label className="relative flex h-9 w-full cursor-pointer items-center rounded-[4px] border border-border bg-surface px-3 text-[12.5px] text-navy sm:w-[150px]">
                <span className={date ? 'text-navy' : 'text-muted/70'}>
                  {date ? formatDate(`${date}T12:00:00`) : 'All travel dates'}
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={(event) => {
                    setDate(event.target.value);
                    setPage(1);
                  }}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  aria-label="Filter by travel date"
                />
              </label>
              {date ? (
                <button
                  type="button"
                  onClick={() => {
                    setDate('');
                    setPage(1);
                  }}
                  className="text-[11.5px] font-medium text-muted transition hover:text-navy"
                >
                  Clear
                </button>
              ) : null}
            </div>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-full sm:min-w-[900px]">
            <thead>
              <tr className="table-head-row">
                <th className="th">Reference</th>
                <th className="th">Passenger</th>
                <th className="th">Route</th>
                <th className="th hidden sm:table-cell">Departure</th>
                <th className="th hidden md:table-cell">Seats</th>
                <th className="th">Source</th>
                <th className="th">Status</th>
                <th className="th hidden sm:table-cell">Amount</th>
                <th className="th sr-only">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading || error ? (
                <TableMessage colSpan={9} loading={loading} error={error} />
              ) : bookings.length === 0 ? (
                <TableMessage colSpan={9}>
                  No reservations match this view.
                </TableMessage>
              ) : (
                bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-border transition-colors last:border-b-0 hover:bg-[#F9F7EF]"
                  >
                    <td className="td py-2 font-mono text-[11.5px]">
                      {booking.reference}
                    </td>
                    <td className="td py-2">
                      <p className="text-[13px] font-medium">
                        {booking.passenger?.fullName || booking.contactName || '-'}
                      </p>
                      <p className="text-[11.5px] text-muted">
                        {booking.contactPhone || booking.passenger?.email || ''}
                      </p>
                    </td>
                    <td className="td py-2">{routeLabel(booking.trip.route)}</td>
                    <td className="td hidden py-2 sm:table-cell">
                      {formatDate(booking.trip.departureTime)}
                      <span className="ml-1.5 text-muted">
                        {formatTime(booking.trip.departureTime)}
                      </span>
                    </td>
                    <td className="td hidden py-2 md:table-cell">
                      {booking.seats.join(', ')}
                    </td>
                    <td className="td py-2">
                      <span
                        className={`badge ${
                          booking.source === 'online'
                            ? 'bg-success-soft text-success'
                            : 'bg-[#EFEEE6] text-muted'
                        }`}
                      >
                        {booking.sourceLabel}
                      </span>
                    </td>
                    <td className="td py-2">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="td hidden py-2 sm:table-cell">
                      {formatRwf(booking.totalAmountRwf)}
                    </td>
                    <td className="td py-2 text-right">
                      <button
                        type="button"
                        className="link-action"
                        onClick={() => setDetail(booking)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {pages > 1 ? (
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
            Page {page} of {pages} · {data.total} reservation
            {data.total === 1 ? '' : 's'}
          </p>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(pages, current + 1))}
            disabled={page >= pages}
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
        maxWidth="max-w-[620px]"
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
              ['Status', detail.status],
              ['Route', routeLabel(detail.trip.route)],
              ['Travel date', formatDate(detail.trip.departureTime)],
              ['Departure', formatTime(detail.trip.departureTime)],
              ['Arrival', formatTime(detail.trip.arrivalTime)],
              [
                'Bus',
                detail.trip.bus ? `${detail.trip.bus.busCode} · ${detail.trip.bus.plateNumber}` : '-',
              ],
              [
                'Driver',
                detail.trip.driver?.fullName || 'Not assigned',
              ],
              ['Seats', detail.seats.join(', ')],
              ['Passengers', String(detail.passengerCount)],
              ['Fare per seat', formatRwf(detail.unitPriceRwf)],
              ['Total amount', formatRwf(detail.totalAmountRwf)],
              ['Source', detail.sourceLabel],
              [
                'Booking agent',
                detail.agent ? `${detail.agent.fullName} (${detail.agent.email})` : '-',
              ],
              ['Passenger account', detail.passenger?.email || '-'],
              ['Contact', `${detail.contactName || '-'} · ${detail.contactPhone || '-'}`],
              ['Booked', formatDateTime(detail.createdAt)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between gap-4 border-b border-border pb-2 last:border-b-0"
              >
                <span className="shrink-0 text-muted">{label}</span>
                <span className="text-right font-medium capitalize text-navy">
                  {value}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
