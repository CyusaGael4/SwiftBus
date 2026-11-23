import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toDateInput } from '../../lib/format.js';

const PASSENGER_OPTIONS = [1, 2, 3, 4, 5, 6];

export default function SearchForm({
  origins = [],
  destinations = [],
  initial = {},
  compact = false,
  panel = false,
  onSearch,
}) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    origin: initial.origin || '',
    destination: initial.destination || '',
    date: initial.date || toDateInput(),
    passengers: String(initial.passengers || 1),
  });
  const [error, setError] = useState('');

  const labelClass = panel
    ? 'mb-2 block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted'
    : 'mb-1.5 block text-[12.5px] font-medium text-navy';

  const controlClass = panel ? 'h-12 rounded-[6px] text-[15px]' : '';

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    if (error) setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.origin) {
      setError('Select your departure town.');
      return;
    }

    if (!form.destination) {
      setError('Select your destination.');
      return;
    }

    if (form.origin.toLowerCase() === form.destination.toLowerCase()) {
      setError('Departure and destination must be different.');
      return;
    }

    if (form.date < toDateInput()) {
      setError('Choose today or a future date.');
      return;
    }

    const params = new URLSearchParams({
      origin: form.origin,
      destination: form.destination,
      date: form.date,
      passengers: form.passengers,
    });

    if (onSearch) onSearch(form);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={
        panel
          ? ''
          : `rounded-[8px] border border-border bg-surface ${
              compact
                ? 'p-4 sm:p-5'
                : 'p-4 shadow-[0_24px_50px_-36px_rgba(0,0,0,0.55)] sm:p-5'
            }`
      }
      noValidate
    >
      <div
        className={`grid gap-3 ${
          panel
            ? 'sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.9fr_0.75fr_auto] lg:items-end'
            : 'sm:grid-cols-2 lg:grid-cols-[1.1fr_1.1fr_1fr_0.9fr_auto] lg:items-end'
        }`}
      >
        <label className="block">
          <span className={labelClass}>From</span>
          <select
            value={form.origin}
            onChange={update('origin')}
            className={`field-select ${controlClass}`}
          >
            <option value="">Select</option>
            {origins.map((origin) => (
              <option key={origin} value={origin}>
                {origin}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={labelClass}>To</span>
          <select
            value={form.destination}
            onChange={update('destination')}
            className={`field-select ${controlClass}`}
          >
            <option value="">Select</option>
            {destinations.map((destination) => (
              <option key={destination} value={destination}>
                {destination}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={labelClass}>Date</span>
          <input
            type="date"
            value={form.date}
            min={toDateInput()}
            onChange={update('date')}
            className={`field-input ${controlClass}`}
          />
        </label>

        <label className="block">
          <span className={labelClass}>Passengers</span>
          <select
            value={form.passengers}
            onChange={update('passengers')}
            className={`field-select ${controlClass}`}
          >
            {PASSENGER_OPTIONS.map((count) => (
              <option key={count} value={count}>
                {count} {count === 1 ? 'passenger' : 'passengers'}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className={`inline-flex items-center justify-center gap-2 rounded-[6px] bg-accent text-[13px] font-semibold text-white transition hover:bg-accent/90 sm:col-span-2 lg:col-span-1 ${
            panel ? 'h-12 px-6' : 'h-11 px-5'
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.9" />
            <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          </svg>
          {panel ? 'Search' : 'Search trips'}
        </button>
      </div>

      {error ? <p className="field-error">{error}</p> : null}
    </form>
  );
}
