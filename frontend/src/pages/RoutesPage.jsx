import { useCallback, useEffect, useMemo, useState } from 'react';
import { peekCache } from '../api/http.js';
import { routesApi } from '../api/routes.js';
import RouteFormModal from '../components/routes/RouteFormModal.jsx';
import Button from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import InlineAlert from '../components/ui/InlineAlert.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import SearchInput from '../components/ui/SearchInput.jsx';
import { TableMessage } from '../components/ui/TableMessage.jsx';

export default function RoutesPage() {
  const [routes, setRoutes] = useState(() => peekCache('/routes')?.routes || []);
  const [loading, setLoading] = useState(() => !peekCache('/routes'));
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [routeFilter, setRouteFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadRoutes = useCallback(async () => {
    setLoading(!peekCache('/routes'));
    setError('');

    try {
      const result = await routesApi.list();
      setRoutes(result.routes);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  const filteredRoutes = useMemo(() => {
    const term = search.trim().toLowerCase();

    return routes.filter((route) => {
      const matchesSearch =
        !term ||
        route.origin.toLowerCase().includes(term) ||
        route.destination.toLowerCase().includes(term);
      const matchesRoute = !routeFilter || route.id === routeFilter;
      return matchesSearch && matchesRoute;
    });
  }, [routes, search, routeFilter]);

  const openCreate = () => {
    setSelectedRoute(null);
    setFormOpen(true);
  };

  const openEdit = (route) => {
    setSelectedRoute(route);
    setFormOpen(true);
  };

  const handleSaved = () => {
    setFormOpen(false);
    setSelectedRoute(null);
    loadRoutes();
  };

  const requestDelete = (route) => {
    setFormOpen(false);
    setDeleteTarget(route);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    setDeleteError('');

    try {
      await routesApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      setSelectedRoute(null);
      loadRoutes();
    } catch (requestError) {
      setDeleteError(requestError.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Routes"
        subtitle="Manage destinations and route connections."
        action={
          <Button plus className="w-full sm:w-auto sm:min-w-[134px]" onClick={openCreate}>
            Add route
          </Button>
        }
      />

      <section className="mt-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
          Route directory
        </p>
        <h2 className="mt-2 text-[17px] font-semibold text-navy">
          Connections used in your departure schedule
        </h2>

        {error ? (
          <div className="mt-5">
            <InlineAlert>{error}</InlineAlert>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search origin or destination"
            className="sm:w-[355px] !h-[41px]"
          />
          <select
            value={routeFilter}
            onChange={(event) => setRouteFilter(event.target.value)}
            className="field-select h-[41px] w-full text-[12.5px] sm:w-[140px]"
            aria-label="Filter routes"
          >
            <option value="">All routes</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.origin} → {route.destination}
              </option>
            ))}
          </select>
          <p className="text-[12px] text-muted sm:ml-auto">
            {filteredRoutes.length} {filteredRoutes.length === 1 ? 'route' : 'routes'}
          </p>
        </div>

        <div className="mt-[22px] min-h-[375px] table-shell">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full sm:min-w-[680px]">
              <thead>
                <tr className="table-head-row">
                  <th className="th py-4">Origin</th>
                  <th className="th py-4">Destination</th>
                  <th className="th hidden py-4 sm:table-cell">Connection</th>
                  <th className="th py-4 sr-only">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading || error ? (
                  <TableMessage colSpan={4} loading={loading} error={error} />
                ) : filteredRoutes.length === 0 ? (
                  <TableMessage colSpan={4}>
                    No routes match your search.
                  </TableMessage>
                ) : (
                  filteredRoutes.map((route) => (
                    <tr
                      key={route.id}
                      className="border-b border-border transition-colors last:border-b-0 hover:bg-[#F9F7EF]"
                    >
                      <td className="td py-6 text-[13.5px]">{route.origin}</td>
                      <td className="td py-6 text-[13.5px] font-semibold">
                        {route.destination}
                      </td>
                      <td className="td hidden py-6 text-[13px] text-muted sm:table-cell">
                        {route.origin} → {route.destination}
                      </td>
                      <td className="td py-6 text-right">
                        <div className="flex items-center justify-end gap-3 whitespace-nowrap sm:gap-4">
                          <button
                            type="button"
                            className="link-action"
                            onClick={() => openEdit(route)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="link-danger"
                            onClick={() => requestDelete(route)}
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
        </div>
      </section>

      <RouteFormModal
        open={formOpen}
        route={selectedRoute}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
        onDelete={requestDelete}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this route?"
        message={
          deleteTarget
            ? `${deleteTarget.origin} → ${deleteTarget.destination} will be removed from the route directory.`
            : ''
        }
        confirmLabel="Delete route"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
        error={deleteError}
      />
    </div>
  );
}
