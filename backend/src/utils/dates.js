function startOfDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

function addDays(date, amount) {
  const value = new Date(date);
  value.setDate(value.getDate() + amount);
  return value;
}

function parseDateOnly(value) {
  if (!value) return startOfDay(new Date());

  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return startOfDay(new Date());

  return new Date(year, month - 1, day);
}

function toDateKey(date) {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfWeek(date = new Date()) {
  const value = startOfDay(date);
  const offset = (value.getDay() + 6) % 7; // Monday = 0
  return addDays(value, -offset);
}

module.exports = {
  startOfDay,
  endOfDay,
  addDays,
  parseDateOnly,
  toDateKey,
  startOfWeek,
};
