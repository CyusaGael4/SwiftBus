const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export const roleLabel = (role) =>
  ({
    admin: 'Administrator',
    booking_agent: 'Booking agent',
    driver: 'Driver',
    passenger: 'Passenger',
  })[role] || 'Team member';

export function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-US');
}

export function formatSales(value) {
  const amount = Number(value || 0);
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  }
  if (amount >= 10_000) {
    return `${(amount / 1000).toFixed(1).replace(/\.?0+$/, '')}K`;
  }
  return formatNumber(amount);
}

export function formatRwf(value) {
  return `RWF ${formatNumber(value)}`;
}

export function formatDate(value) {
  if (!value) return '—';
  return dateFormatter.format(new Date(value));
}

export function formatTime(value) {
  if (!value) return '—';
  return timeFormatter.format(new Date(value));
}

export function formatDateTime(value) {
  if (!value) return '—';
  return `${formatDate(value)} · ${formatTime(value)}`;
}

export function formatDuration(minutes) {
  const total = Number(minutes) || 0;
  if (!total) return '—';

  const hours = Math.floor(total / 60);
  const mins = total % 60;

  return [hours ? `${hours}h` : '', mins ? `${mins}m` : ''].filter(Boolean).join(' ');
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function formatLastActive(value) {
  if (!value) return 'Not signed in';

  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (first, second) =>
    first.getDate() === second.getDate() &&
    first.getMonth() === second.getMonth() &&
    first.getFullYear() === second.getFullYear();

  if (sameDay(date, today)) return `Today, ${formatTime(date)}`;
  if (sameDay(date, yesterday)) return `Yesterday, ${formatTime(date)}`;
  return formatDate(date);
}

export function toDateInput(value = new Date()) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toTimeInput(value = new Date()) {
  const date = new Date(value);
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`;
}

export function combineDateTime(date, time) {
  return new Date(`${date}T${time}:00`).toISOString();
}

export function routeLabel(route) {
  if (!route) return 'Not assigned';
  return `${route.origin} → ${route.destination}`;
}

export function nextDay(dateString, amount) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return toDateInput(date);
}
