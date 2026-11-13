const LABELS = {
  upcoming: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  active: 'Ready to board',
};

const STYLES = {
  upcoming: 'bg-success-soft text-success',
  completed: 'bg-[#EFEEE6] text-muted',
  cancelled: 'bg-warning-soft text-warning',
  active: 'bg-success-soft text-success',
};

export const statusLabel = (status) => LABELS[status] || status;

export const statusStyle = (status) => STYLES[status] || STYLES.completed;
