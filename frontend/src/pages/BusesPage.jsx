import { useCallback, useEffect, useState } from 'react';
import { busesApi } from '../api/buses.js';
import { peekCache } from '../api/http.js';
import { routesApi } from '../api/routes.js';
import BusFormModal from '../components/buses/BusFormModal.jsx';
import Button from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import InlineAlert from '../components/ui/InlineAlert.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import SearchInput from '../components/ui/SearchInput.jsx';
import StatGroup from '../components/ui/StatGroup.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { TableMessage } from '../components/ui/TableMessage.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import useDebouncedValue from '../hooks/useDebouncedValue.js';
import { formatDate, routeLabel } from '../lib/format.js';

export default function BusesPage() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [data, setData] = useState(
    () =>
      peekCache('/buses', { params: { status: 'all' } }) || {
        buses: [],
        stats: { total: 0, onRoute: 0, available: 0, maintenance: 0 },
        counts: { all: 0, on_route: 0, available: 0, maintenance: 0 },
      }
  );
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(
    () => !peekCache('/buses', { params: { status: 'all' } })
  );
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadBuses = useCallback(async () => {
    setLoading(
      !peekCache('/buses', { params: { status: tab, search: debouncedSearch } })
    );
    setError('');

    try {
      const result = await busesApi.list({
        status: tab,
        search: debouncedSearch,
      });
      setData(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [tab, debouncedSearch]);

  useEffect(() => {
    loadBuses();
  }, [loadBuses]);

  useEffect(() => {
    routesApi
      .list()
      .then((result) => setRoutes(result.routes))
      .catch(() => setRoutes([]));
  }, []);

  const openCreate = () => {
    setSelectedBus(null);
    setFormOpen(true);
  };

  const openEdit = (bus) => {
    setSelectedBus(bus);
    setFormOpen(true);
  };

  const handleSaved = () => {
    setFormOpen(false);
    setSelectedBus(null);
    loadBuses();
  };

  const requestDelete = (bus) => {
    setFormOpen(false);
    setDeleteTarget(bus);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    setDeleteError('');

    try {
      await busesApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      setSelectedBus(null);
      loadBuses();
    } catch (requestError) {
      setDeleteError(requestError.message);
    } finally {
      setDeleting(false);
    }
  };

  const { stats, counts, buses } = data;

  return (
    <div>
      <PageHeader
        title="Buses"
        subtitle="Manage vehicles, capacity, and fleet availability."
        action={
          <Button plus className="w-full sm:w-auto sm:min-w-[148px]" onClick={openCreate}>
            Add bus
          </Button>
        }
      />

      <StatGroup
        variant="page"
        eyebrow="Fleet management"
        items={[
          { label: 'Total buses', value: stats.total, padded: true },
          { label: 'On route', value: stats.onRoute, padded: true },
          { label: 'Available', value: stats.available, padded: true },
          { label: 'In maintenance', value: stats.maintenance, padded: true },
        ]}
      />

      {error ? (
        <div className="mt-5">
          <InlineAlert>{error}</InlineAlert>
        </div>
      ) : null}

      <section className="mt-[39px] table-shell">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: 'all', label: 'All buses', count: counts.all },
            { value: 'on_route', label: 'On route', count: counts.on_route },
            { value: 'available', label: 'Available', count: counts.available },
            {
              value: 'maintenance',
              label: 'Maintenance',
              count: counts.maintenance,
            },
          ]}
          right={
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Find by plate or bus ID"
            />
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] sm:min-w-[760px]">
            <thead>
              <tr className="table-head-row">
                <th className="th">Bus</th>
                <th className="th">Assigned route</th>
                <th className="th hidden sm:table-cell">Seats</th>
                <th className="th">Status</th>
                <th className="th hidden sm:table-cell">Next service</th>
                <th className="th sr-only">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading || error ? (
                <TableMessage colSpan={6} loading={loading} error={error} />
              ) : buses.length === 0 ? (
                <TableMessage colSpan={6}>No buses match this view.</TableMessage>
              ) : (
                buses.map((bus) => (
                  <tr
                    key={bus.id}
                    className="border-b border-border transition-colors last:border-b-0 hover:bg-[#F9F7EF]"
                  >
                    <td className="td">
                      <p className="font-medium leading-none">{bus.busCode}</p>
                      <p className="mt-1.5 text-[11.5px] leading-none text-muted">
                        {bus.plateNumber}
                      </p>
                    </td>
                    <td className="td">
                      {bus.assignedRoute ? (
                        routeLabel(bus.assignedRoute)
                      ) : (
                        <span className="text-muted">Not assigned</span>
                      )}
                    </td>
                    <td className="td hidden sm:table-cell">{bus.totalCapacity}</td>
                    <td className="td">
                      <StatusBadge status={bus.operationalStatus} />
                    </td>
                    <td className="td hidden sm:table-cell">
                      {formatDate(bus.nextServiceDate)}
                    </td>
                    <td className="td text-right">
                      <div className="flex items-center justify-end gap-3 whitespace-nowrap sm:gap-4">
                        <button
                          type="button"
                          className="link-action"
                          onClick={() => openEdit(bus)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="link-danger"
                          onClick={() => requestDelete(bus)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <BusFormModal
        open={formOpen}
        bus={selectedBus}
        routes={routes}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
        onDelete={requestDelete}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this bus?"
        message={
          deleteTarget
            ? `${deleteTarget.busCode} (${deleteTarget.plateNumber}) will be permanently removed from the fleet.`
            : ''
        }
        confirmLabel="Delete bus"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
        error={deleteError}
      />
    </div>
  );
}
