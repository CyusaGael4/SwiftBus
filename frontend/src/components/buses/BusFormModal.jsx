import { useEffect, useState } from 'react';
import { busesApi } from '../../api/buses.js';
import { toDateInput } from '../../lib/format.js';
import Button from '../ui/Button.jsx';
import { SelectField, TextField } from '../ui/Fields.jsx';
import InlineAlert from '../ui/InlineAlert.jsx';
import Modal from '../ui/Modal.jsx';

const emptyForm = {
  busCode: '',
  plateNumber: '',
  companyName: 'SwiftBus',
  totalCapacity: 48,
  status: 'active',
  assignedRoute: '',
  nextServiceDate: '',
};

export default function BusFormModal({ open, bus, routes, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (bus) {
      setForm({
        busCode: bus.busCode || '',
        plateNumber: bus.plateNumber || '',
        companyName: bus.companyName || 'SwiftBus',
        totalCapacity: bus.totalCapacity || 1,
        status: bus.status || 'active',
        assignedRoute: bus.assignedRoute?.id || '',
        nextServiceDate: bus.nextServiceDate ? toDateInput(bus.nextServiceDate) : '',
      });
    } else {
      setForm(emptyForm);
    }

    setError('');
  }, [open, bus]);

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
      totalCapacity: Number(form.totalCapacity),
      assignedRoute: form.assignedRoute || null,
      nextServiceDate: form.nextServiceDate || null,
    };

    try {
      if (bus) {
        await busesApi.update(bus.id, payload);
      } else {
        await busesApi.create(payload);
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
      title={bus ? 'Bus details' : 'Add bus'}
      description={
        bus
          ? 'Update the vehicle, capacity or route assignment.'
          : 'Register a vehicle in the SwiftBus fleet.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="bus-form" loading={saving}>
            {bus ? 'Save changes' : 'Add bus'}
          </Button>
        </>
      }
    >
      <form id="bus-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error ? <InlineAlert>{error}</InlineAlert> : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Bus ID"
            name="busCode"
            placeholder="SB-007"
            value={form.busCode}
            onChange={handleChange}
            required
          />
          <TextField
            label="Plate number"
            name="plateNumber"
            placeholder="RAE 204 B"
            value={form.plateNumber}
            onChange={handleChange}
            required
          />
          <TextField
            label="Company"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            required
          />
          <TextField
            label="Total seats"
            name="totalCapacity"
            type="number"
            min="1"
            max="120"
            value={form.totalCapacity}
            onChange={handleChange}
            required
          />
          <SelectField
            label="Fleet status"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'maintenance', label: 'Maintenance' },
              { value: 'out_of_service', label: 'Out of service' },
            ]}
          />
          <SelectField
            label="Assigned route"
            name="assignedRoute"
            value={form.assignedRoute}
            onChange={handleChange}
            placeholder="Not assigned"
            options={routes.map((route) => ({
              value: route.id,
              label: `${route.origin} → ${route.destination}`,
            }))}
          />
          <TextField
            label="Next service"
            name="nextServiceDate"
            type="date"
            value={form.nextServiceDate}
            onChange={handleChange}
            className="sm:col-span-2"
          />
        </div>
      </form>
    </Modal>
  );
}
