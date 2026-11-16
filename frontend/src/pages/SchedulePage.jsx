import { useCallback, useEffect, useState } from 'react';
import { busesApi } from '../api/buses.js';
import { peekCache } from '../api/http.js';
import { routesApi } from '../api/routes.js';
import { schedulesApi } from '../api/schedules.js';
import { usersApi } from '../api/users.js';
import ScheduleFormModal from '../components/schedules/ScheduleFormModal.jsx';
import Button from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import InlineAlert from '../components/ui/InlineAlert.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import StatGroup from '../components/ui/StatGroup.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { TableMessage } from '../components/ui/TableMessage.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import {
  formatDate,
  formatTime,
  nextDay,
  routeLabel,
  toDateInput,
} from '../lib/format.js';

export default function SchedulePage() {
  const [tab, setTab] = useState('today');
  const [date, setDate] = useState(toDateInput());
  const cachedData = peekCache('/schedules', {
    params: { tab: 'today', date },
  });
  const [data, setData] = useState(
    () =>
      cachedData || {
        schedules: [],
        stats: {
          departuresToday: 0,
          routesScheduled: 0,
          busesAssigned: 0,
          delayed: 0,
        },
      }
  );
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(() => !cachedData);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadSchedules = useCallback(async () => {
    setLoading(!peekCache('/schedules', { params: { tab, date } }));
    setError('');

    try {
      const result = await schedulesApi.list({ tab, date });
      setData(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [tab, date]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  useEffect(() => {
    let active = true;

    Promise.all([
      routesApi.list(),
      busesApi.list({ status: 'all' }),
      usersApi.drivers().catch(() => ({ drivers: [] })),
    ])
      .then(([routeResult, busResult, driverResult]) => {
        if (!active) return;
        setRoutes(routeResult.routes);
        setBuses(busResult.buses);
        setDrivers(driverResult.drivers);
      })
      .catch(() => {
        if (active) {
          setRoutes([]);
          setBuses([]);
          setDrivers([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const openCreate = () => {
    setSelectedSchedule(null);
    setFormOpen(true);
  };

  const openEdit = (schedule) => {
    setSelectedSchedule(schedule);
    setFormOpen(true);
  };

  const handleSaved = () => {
    setFormOpen(false);
    setSelectedSchedule(null);
    loadSchedules();
  };

  const requestDelete = (schedule) => {
    setFormOpen(false);
    setDeleteTarget(schedule);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    setDeleteError('');

    try {
      await schedulesApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      setSelectedSchedule(null);
      loadSchedules();
    } catch (requestError) {
      setDeleteError(requestError.message);
    } finally {
      setDeleting(false);
    }
  };

  const goToPreviousDay = () => {
    setDate((current) => nextDay(current, -1));
    setTab('today');
  };

  const { schedules, stats } = data;

  return (
    <div>
      <PageHeader
        title="Schedule"
        subtitle="Plan departures and keep every route moving."
        action={
          <Button plus className="w-full sm:w-auto sm:min-w-[148px]" onClick={openCreate}>
            Add departure
          </Button>
        }
      />

      <StatGroup
        variant="page"
        eyebrow="Daily operations"
        items={[
          {
            label: 'Departures today',
            value: stats.departuresToday,
            padded: true,
          },
          {
            label: 'Routes scheduled',
            value: stats.routesScheduled,
            padded: true,
          },
          {
            label: 'Buses assigned',
            value: stats.busesAssigned,
            padded: true,
          },
          {
            label: 'Departure delayed',
            value: stats.delayed,
            padded: true,
            accent: true,
          },
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
          onChange={setTab}
          items={[
            { value: 'today', label: 'Today' },
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'completed', label: 'Completed' },
          ]}
          right={
            <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
              <button
                type="button"
                onClick={goToPreviousDay}
                className="whitespace-nowrap text-[11.5px] text-muted transition hover:text-navy"
              >
                ‹ Previous day
              </button>
              <label className="relative flex h-9 flex-1 cursor-pointer items-center justify-center rounded-[4px] border border-border bg-surface text-[12.5px] font-semibold text-navy sm:w-[195px] sm:flex-none">
                {formatDate(new Date(`${date}T12:00:00`))}
                <input
                  type="date"
                  value={date}
                  onChange={(event) => {
                    if (event.target.value) setDate(event.target.value);
                    setTab('today');
                  }}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  aria-label="Select departure date"
                />
              </label>
            </div>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-full sm:min-w-[820px]">
            <thead>
              <tr className="table-head-row">
                <th className="th">Departure</th>
                <th className="th">Route</th>
                <th className="th hidden sm:table-cell">Bus</th>
                <th className="th hidden sm:table-cell">Booked / Seats</th>
                <th className="th">Status</th>
                <th className="th sr-only">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading || error ? (
                <TableMessage colSpan={6} loading={loading} error={error} />
              ) : schedules.length === 0 ? (
                <TableMessage colSpan={6}>
                  No departures for this view.
                </TableMessage>
              ) : (
                schedules.map((schedule) => {
                  const capacity = schedule.bus?.totalCapacity || 0;
                  const booked = schedule.seatsBooked || 0;
                  const percentage = capacity
                    ? Math.min(100, (booked / capacity) * 100)
                    : 0;
                  const delayed = schedule.status === 'delayed';

                  return (
                    <tr
                      key={schedule.id}
                      className={`border-b border-border transition-colors last:border-b-0 ${
                        delayed
                          ? 'bg-warning-row [&>td:first-child]:border-l-[3px] [&>td:first-child]:border-l-accent'
                          : 'hover:bg-[#F9F7EF]'
                      }`}
                    >
                      <td className="td py-2 text-[16px] font-semibold">
                        {formatTime(schedule.departureTime)}
                      </td>
                      <td className="td py-2">{routeLabel(schedule.route)}</td>
                      <td className="td hidden py-2 sm:table-cell">
                        {schedule.bus?.busCode || '-'}
                      </td>
                      <td className="td hidden py-2 sm:table-cell">
                        <p className="text-[12.5px] text-navy">
                          {booked} / {capacity || '-'}
                        </p>
                        <div className="mt-2 h-[3px] w-[108px] overflow-hidden bg-[#E4E1D6]">
                          <div
                            className="h-full bg-navy"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </td>
                      <td className="td py-2">
                        <StatusBadge status={schedule.status} />
                      </td>
                      <td className="td py-2 text-right">
                        <div className="flex items-center justify-end gap-3 whitespace-nowrap sm:gap-4">
                          <button
                            type="button"
                            className="link-action"
                            onClick={() => openEdit(schedule)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="link-danger"
                            onClick={() => requestDelete(schedule)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ScheduleFormModal
        open={formOpen}
        schedule={selectedSchedule}
        routes={routes}
        buses={buses}
        drivers={drivers}
        defaultDate={date}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
        onDelete={requestDelete}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this departure?"
        message={
          deleteTarget
            ? `${routeLabel(deleteTarget.route)} at ${formatTime(
                deleteTarget.departureTime
              )} will be removed from the schedule.`
            : ''
        }
        confirmLabel="Delete departure"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
        error={deleteError}
      />
    </div>
  );
}
