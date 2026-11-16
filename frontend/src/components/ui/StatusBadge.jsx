const STYLES = {
  on_route: ['On route', 'bg-success-soft text-success'],
  available: ['Available', 'bg-success-soft text-success'],
  active: ['Active', 'bg-success-soft text-success'],
  invited: ['Added', 'bg-warning-soft text-warning'],
  deactive: ['Deactivated', 'bg-[#EFEEE6] text-muted'],
  maintenance: ['Maintenance', 'bg-warning-soft text-warning'],
  out_of_service: ['Out of service', 'bg-warning-soft text-warning'],
  scheduled: ['Scheduled', 'bg-success-soft text-success'],
  departed: ['Departed', 'bg-success-soft text-success'],
  delayed: ['Delayed', 'bg-warning-soft text-warning'],
  upcoming: ['Confirmed', 'bg-success-soft text-success'],
  confirmed: ['Confirmed', 'bg-success-soft text-success'],
  completed: ['Completed', 'bg-[#EFEEE6] text-muted'],
  cancelled: ['Cancelled', 'bg-warning-soft text-warning'],
  admin: ['Administrator', 'bg-success-soft text-success'],
  booking_agent: ['Booking agent', 'bg-success-soft text-success'],
  driver: ['Driver', 'bg-success-soft text-success'],
  passenger: ['Passenger', 'bg-success-soft text-success'],
};

export default function StatusBadge({ status, label }) {
  const [defaultLabel, style] = STYLES[status] || [status, 'bg-[#EFEEE6] text-muted'];

  return (
    <span className={`badge min-w-[74px] justify-center px-2.5 ${style}`}>
      {label || defaultLabel}
    </span>
  );
}
