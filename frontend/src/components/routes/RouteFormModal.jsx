import { useEffect, useState } from 'react';
import { routesApi } from '../../api/routes.js';
import Button from '../ui/Button.jsx';
import { TextField } from '../ui/Fields.jsx';
import InlineAlert from '../ui/InlineAlert.jsx';
import Modal from '../ui/Modal.jsx';

const emptyForm = {
  routeCode: '',
  origin: 'Nyabugogo',
  destination: '',
  fareRwf: '',
  estimatedDurationMins: '',
};

export default function RouteFormModal({ open, route, onClose, onSaved, onDelete }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setForm(
      route
        ? {
            routeCode: route.routeCode || '',
            origin: route.origin || '',
            destination: route.destination || '',
            fareRwf: route.fareRwf ?? '',
            estimatedDurationMins: route.estimatedDurationMins ?? '',
          }
        : emptyForm
    );
    setError('');
  }, [open, route]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      ...form,
      fareRwf: Number(form.fareRwf),
      estimatedDurationMins: Number(form.estimatedDurationMins || 0),
    };

    try {
      if (route) {
        await routesApi.update(route.id, payload);
      } else {
        await routesApi.create(payload);
      }
      onSaved();
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
      title={route ? 'Edit route' : 'Add route'}
      description={
        route
          ? 'Update the connection, fare or travel time.'
          : 'Create a new connection for your departure schedule.'
      }
      footer={
        <>
          {route ? (
            <button
              type="button"
              onClick={() => onDelete(route)}
              className="mr-auto text-[12.5px] font-medium text-[#A94A30] underline decoration-[#A94A30]/50 underline-offset-2 hover:text-[#8E3E28]"
            >
              Delete route
            </button>
          ) : null}
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="route-form" loading={saving}>
            {route ? 'Save changes' : 'Add route'}
          </Button>
        </>
      }
    >
      <form id="route-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error ? <InlineAlert>{error}</InlineAlert> : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Route code"
            name="routeCode"
            placeholder="NYA-HUY"
            value={form.routeCode}
            onChange={handleChange}
            required
            className="sm:col-span-2"
          />
          <TextField
            label="Origin"
            name="origin"
            placeholder="Nyabugogo"
            value={form.origin}
            onChange={handleChange}
            required
          />
          <TextField
            label="Destination"
            name="destination"
            placeholder="Huye"
            value={form.destination}
            onChange={handleChange}
            required
          />
          <TextField
            label="Fare (RWF)"
            name="fareRwf"
            type="number"
            min="0"
            placeholder="5000"
            value={form.fareRwf}
            onChange={handleChange}
            required
          />
          <TextField
            label="Duration (mins)"
            name="estimatedDurationMins"
            type="number"
            min="0"
            placeholder="120"
            value={form.estimatedDurationMins}
            onChange={handleChange}
          />
        </div>
      </form>
    </Modal>
  );
}
