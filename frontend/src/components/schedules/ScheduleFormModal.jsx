import { useEffect, useState } from 'react';
import { schedulesApi } from '../../api/schedules.js';
import {
  combineDateTime,
  formatTime,
  toDateInput,
  toTimeInput,
} from '../../lib/format.js';
import Button from '../ui/Button.jsx';
import { SelectField, TextField } from '../ui/Fields.jsx';
import InlineAlert from '../ui/InlineAlert.jsx';
import Modal from '../ui/Modal.jsx';

const emptyForm = {
  route: '',
  bus: '',
  driver: '',
  date: toDateInput(),
  time: '08:00',
  seatsBooked: 0,
  status: 'scheduled',
};

export default function ScheduleFormModal({
  open,
  schedule,
  routes,
  buses,
  drivers,
  defaultDate,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (schedule) {
      setForm({
        route: schedule.route?.id || '',
        bus: schedule.bus?.id || '',
        driver: schedule.driver?.id || '',
        date: toDateInput(schedule.departureTime),
        time: toTimeInput(schedule.departureTime),
        seatsBooked: schedule.seatsBooked || 0,
        status: schedule.status || 'scheduled',
      });
    } else {
      setForm({
        ...emptyForm,
        date: defaultDate || toDateInput(),
      });
    }

    setError('');
  }, [open, schedule, defaultDate]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      route: form.route,
      bus: form.bus,
      driver: form.driver || null,
      departureTime: combineDateTime(form.date, form.time),
      seatsBooked: Number(form.seatsBooked),
      status: form.status,
    };

    try {
      if (schedule) {
        await schedulesApi.update(schedule.id, payload);
      } else {
        await schedulesApi.create(payload);
      }
      onSaved();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedBus = buses.find((bus) => bus.id === form.bus);
  const selectedRoute = routes.find((route) => route.id === form.route);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={schedule ? 'Edit departure' : 'Add departure'}
      description={
        schedule
          ? `Scheduled for ${formatTime(schedule.departureTime)} · ${
              schedule.bus?.busCode || ''
            }`
          : 'Plan a departure and assign a bus and driver.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="departure-form" loading={saving}>
            {schedule ? 'Save changes' : 'Add departure'}
          </Button>
        </>
      }
    >
      <form id="departure-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error ? <InlineAlert>{error}</InlineAlert> : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Route"
            name="route"
            value={form.route}
            onChange={handleChange}
            placeholder="Select a route"
            options={routes.map((route) => ({
              value: route.id,
              label: `${route.origin} → ${route.destination}`,
            }))}
            required
            className="sm:col-span-2"
          />
          <SelectField
            label="Bus"
            name="bus"
            value={form.bus}
            onChange={handleChange}
            placeholder="Select a bus"
            options={buses.map((bus) => ({
              value: bus.id,
              label: `${bus.busCode} · ${bus.totalCapacity} seats`,
            }))}
            hint={selectedBus ? `${selectedBus.plateNumber}` : undefined}
            required
          />
          <SelectField
            label="Driver"
            name="driver"
            value={form.driver}
            onChange={handleChange}
            placeholder="Unassigned"
            options={drivers.map((driver) => ({
              value: driver.id,
              label: driver.fullName,
            }))}
          />
          <TextField
            label="Departure date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
          />
          <TextField
            label="Departure time"
            name="time"
            type="time"
            value={form.time}
            onChange={handleChange}
            required
          />
          <TextField
            label="Seats booked"
            name="seatsBooked"
            type="number"
            min="0"
            max={selectedBus?.totalCapacity || 120}
            value={form.seatsBooked}
            onChange={handleChange}
            hint={selectedBus ? `Capacity: ${selectedBus.totalCapacity} seats` : undefined}
          />
          <SelectField
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={[
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'departed', label: 'Departed' },
              { value: 'delayed', label: 'Delayed' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </div>

        {selectedRoute ? (
          <p className="text-[11.5px] text-muted">
            Estimated travel time · {selectedRoute.estimatedDurationMins || 0} mins
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
