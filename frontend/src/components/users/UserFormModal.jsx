import { useEffect, useState } from 'react';
import { usersApi } from '../../api/users.js';
import Button from '../ui/Button.jsx';
import { SelectField, TextField } from '../ui/Fields.jsx';
import InlineAlert from '../ui/InlineAlert.jsx';
import Modal from '../ui/Modal.jsx';

const emptyForm = {
  fullName: '',
  email: '',
  role: 'booking_agent',
  status: 'active',
};

export default function UserFormModal({ open, user, onClose, onSaved, onDelete }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setForm(
      user
        ? {
            fullName: user.fullName || '',
            email: user.email || '',
            role: user.role || 'booking_agent',
            status: user.status || 'active',
          }
        : emptyForm
    );
    setError('');
  }, [open, user]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (user) {
        await usersApi.update(user.id, form);
        onSaved();
      } else {
        const result = await usersApi.invite({
          fullName: form.fullName,
          email: form.email,
          role: form.role,
        });
        onSaved(result);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={user ? 'Edit team member' : 'Add user'}
      description={
        user
          ? 'Update this person’s role or access status.'
          : 'Create an account for a new SwiftBus team member.'
      }
      footer={
        <>
          {user ? (
            <button
              type="button"
              onClick={() => onDelete(user)}
              className="mr-auto text-[12.5px] font-medium text-[#A94A30] underline decoration-[#A94A30]/50 underline-offset-2 hover:text-[#8E3E28]"
            >
              Remove user
            </button>
          ) : null}
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="user-form" loading={saving}>
            {user ? 'Save changes' : 'Add user'}
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error ? <InlineAlert>{error}</InlineAlert> : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Full Name"
            name="fullName"
            autoComplete="name"
            value={form.fullName}
            onChange={handleChange}
            required
            className="sm:col-span-2"
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
            className="sm:col-span-2"
          />
          <SelectField
            label="Role"
            name="role"
            value={form.role}
            onChange={handleChange}
            options={[
              { value: 'admin', label: 'Administrator' },
              { value: 'booking_agent', label: 'Booking agent' },
              { value: 'driver', label: 'Driver' },
            ]}
          />
          {user ? (
            <SelectField
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'invited', label: 'Added' },
                { value: 'pending', label: 'Pending review' },
                { value: 'rejected', label: 'Declined' },
                { value: 'deactive', label: 'Deactivated' },
              ]}
            />
          ) : (
            <div className="flex items-end pb-3 text-[11.5px] text-muted">
              A temporary password is created for new users.
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
