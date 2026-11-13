import { useCallback, useEffect, useState } from 'react';
import { peekCache } from '../api/http.js';
import { usersApi } from '../api/users.js';
import Button from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import InlineAlert from '../components/ui/InlineAlert.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import SearchInput from '../components/ui/SearchInput.jsx';
import StatGroup from '../components/ui/StatGroup.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { TableMessage } from '../components/ui/TableMessage.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import UserFormModal from '../components/users/UserFormModal.jsx';
import useDebouncedValue from '../hooks/useDebouncedValue.js';
import { formatLastActive, roleLabel } from '../lib/format.js';

export default function UsersPage() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [data, setData] = useState(
    () =>
      peekCache('/users', { params: { status: 'all' } }) || {
        users: [],
        stats: { total: 0, administrators: 0, agents: 0, drivers: 0 },
        counts: { all: 0, active: 0, invited: 0, deactivated: 0 },
      }
  );
  const [loading, setLoading] = useState(
    () => !peekCache('/users', { params: { status: 'all' } })
  );
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [resendingId, setResendingId] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(
      !peekCache('/users', { params: { status: tab, search: debouncedSearch } })
    );
    setError('');

    try {
      const result = await usersApi.list({
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
    loadUsers();
  }, [loadUsers]);

  const openInvite = () => {
    setSelectedUser(null);
    setFormOpen(true);
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setFormOpen(true);
  };

  const handleSaved = (result) => {
    setFormOpen(false);
    setSelectedUser(null);

    if (result?.temporaryPassword) {
      setNotice(
        `User added: ${result.user.email}. Temporary password: ${result.temporaryPassword}`
      );
    } else {
      setNotice('');
    }

    loadUsers();
  };

  const requestDelete = (user) => {
    setFormOpen(false);
    setDeleteTarget(user);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    setDeleteError('');

    try {
      await usersApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      setSelectedUser(null);
      loadUsers();
    } catch (requestError) {
      setDeleteError(requestError.message);
    } finally {
      setDeleting(false);
    }
  };

  const resendInvite = async (user) => {
    setResendingId(user.id);
    setError('');

    try {
      await usersApi.resend(user.id);
      setNotice(`Access details resent to ${user.email}.`);
      loadUsers();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setResendingId(null);
    }
  };

  const { stats, counts, users } = data;

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Manage your team and their access to Swiftbus."
        action={
          <Button plus className="w-full sm:w-auto sm:min-w-[148px]" onClick={openInvite}>
            Add user
          </Button>
        }
      />

      <StatGroup
        variant="page"
        eyebrow="Team & access"
        items={[
          { label: 'Team members', value: stats.total, padded: true },
          { label: 'Administrators', value: stats.administrators, padded: true },
          { label: 'Booking agents', value: stats.agents, padded: true },
          { label: 'Drivers', value: stats.drivers, padded: true },
        ]}
      />

      {error ? (
        <div className="mt-5">
          <InlineAlert>{error}</InlineAlert>
        </div>
      ) : null}

      {notice ? (
        <div className="mt-5">
          <InlineAlert tone="info">{notice}</InlineAlert>
        </div>
      ) : null}

      <section className="mt-[39px] table-shell">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: 'all', label: 'All users', count: counts.all },
            { value: 'active', label: 'Active', count: counts.active },
            { value: 'invited', label: 'Added', count: counts.invited },
            { value: 'deactive', label: 'Deactivated', count: counts.deactivated },
          ]}
          right={
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Find by name or email"
            />
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-full sm:min-w-[760px]">
            <thead>
              <tr className="table-head-row">
                <th className="th">Team member</th>
                <th className="th">Role</th>
                <th className="th">Status</th>
                <th className="th hidden sm:table-cell">Last active</th>
                <th className="th sr-only">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading || error ? (
                <TableMessage colSpan={5} loading={loading} error={error} />
              ) : users.length === 0 ? (
                <TableMessage colSpan={5}>
                  No team members match this view.
                </TableMessage>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border transition-colors last:border-b-0 hover:bg-[#F9F7EF]"
                  >
                    <td className="td">
                      <p className="font-medium leading-none">{user.fullName}</p>
                      <p className="mt-1.5 text-[11.5px] leading-none text-muted">
                        {user.email}
                      </p>
                    </td>
                    <td className="td">{roleLabel(user.role)}</td>
                    <td className="td">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="td hidden text-[12.5px] text-muted sm:table-cell">
                      {formatLastActive(user.lastActiveAt)}
                    </td>
                    <td className="td text-right">
                      <div className="flex items-center justify-end gap-3 whitespace-nowrap sm:gap-4">
                        {user.status === 'invited' ? (
                          <button
                            type="button"
                            className="link-action disabled:opacity-60"
                            onClick={() => resendInvite(user)}
                            disabled={resendingId === user.id}
                          >
                            {resendingId === user.id ? 'Sending…' : 'Resend'}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="link-action"
                          onClick={() => openEdit(user)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="link-danger"
                          onClick={() => requestDelete(user)}
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

      <UserFormModal
        open={formOpen}
        user={selectedUser}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
        onDelete={requestDelete}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove this team member?"
        message={
          deleteTarget
            ? `${deleteTarget.fullName} (${deleteTarget.email}) will lose access to SwiftBus.`
            : ''
        }
        confirmLabel="Remove user"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
        error={deleteError}
      />
    </div>
  );
}
