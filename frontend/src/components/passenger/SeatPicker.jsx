function seatClass(seat, selected) {
  if (seat.taken) {
    return 'cursor-not-allowed border border-[#E2DFD3] bg-[#E9E6DA] text-[#A6A79C]';
  }

  if (selected) {
    return 'border border-[#EC5E27] bg-[#EC5E27] text-white shadow-[0_6px_14px_-8px_rgba(236,94,39,0.9)]';
  }

  return 'border border-border bg-surface text-navy hover:border-[#EC5E27] hover:bg-table-head/60';
}

export default function SeatPicker({ seats = [], selected = [], onToggle, disabled }) {
  const rows = [];
  for (let index = 0; index < seats.length; index += 4) {
    rows.push(seats.slice(index, index + 4));
  }

  const renderSeat = (seat) => {
    if (!seat) return null;
    const isSelected = selected.includes(seat.label);

    return (
      <button
        key={seat.label}
        type="button"
        onClick={() => onToggle(seat)}
        disabled={seat.taken || disabled}
        aria-pressed={isSelected}
        aria-label={`Seat ${seat.label}${seat.taken ? ' (taken)' : isSelected ? ' (selected)' : ''}`}
        className={`flex h-11 w-11 items-center justify-center rounded-[6px] text-[12px] font-semibold transition sm:h-10 sm:w-10 ${seatClass(seat, isSelected)} ${disabled ? 'opacity-70' : ''}`}
      >
        {seat.label}
      </button>
    );
  };

  return (
    <div>
      <div className="overflow-hidden rounded-[8px] border border-border">
        <div className="flex items-center justify-between border-b border-border bg-table-head px-4 py-2.5">
          <span className="text-[11.5px] font-medium text-muted">Front of bus</span>
          <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-muted">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Driver
          </span>
        </div>

        <div className="space-y-2 bg-surface px-3 py-4">
          {rows.map((row, index) => (
            <div key={`row-${index}`} className="flex items-center justify-center gap-2">
              <span className="w-4 text-right text-[10px] text-muted/60">{index + 1}</span>
              {row.slice(0, 2).map(renderSeat)}
              <span aria-hidden="true" className="w-5" />
              {row.slice(2, 4).map(renderSeat)}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11.5px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded-[4px] border border-border bg-surface" /> Available
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded-[4px] bg-accent" /> Selected
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded-[4px] bg-[#E9E6DA]" /> Taken
        </span>
      </div>
    </div>
  );
}