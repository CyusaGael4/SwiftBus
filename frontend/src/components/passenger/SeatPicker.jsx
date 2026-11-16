function seatClass(seat, selected, isAvailable) {
  if (seat.taken) {
    return 'cursor-not-allowed bg-[#E8E7DD] text-[#A9A99B]';
  }

  if (!isAvailable) {
    return 'cursor-not-allowed bg-[#E8E7DD] text-[#A9A99B]';
  }

  if (selected) {
    return 'bg-white text-slate-800 border-2 border-[#3B82F6]';
  }

  return 'bg-[#F26522] text-white font-semibold rounded-md opacity-100 hover:bg-[#d95314]';
}

function WheelIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 4.5V10M5.2 15.8 9.8 13M18.8 15.8 14.2 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DoorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 20V5.5A1.5 1.5 0 0 1 6.5 4h8A1.5 1.5 0 0 1 16 5.5V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3.5 20h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AccessibleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 8.5v4h4l2.5 6M11 12.5h-1a4.5 4.5 0 1 0 4.3 5.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SeatPicker({ seats = [], selected = [], onToggle, disabled }) {
  // Four seats per row (two either side of the aisle).
  const rows = [];
  for (let index = 0; index < seats.length; index += 4) {
    rows.push(seats.slice(index, index + 4));
  }

  const renderSeat = (seat) => {
    if (!seat) return null;
    const isSelected = selected.includes(seat.label);
    const isAvailable = !seat.taken;

    return (
      <button
        key={seat.label}
        type="button"
        onClick={() => onToggle(seat)}
        disabled={seat.taken || disabled}
        aria-pressed={isSelected}
        aria-label={`Seat ${seat.label}${seat.taken ? ' (taken)' : isSelected ? ' (selected)' : ' (available)'}`}
        className={`flex h-[34px] w-[46px] shrink-0 items-center justify-center rounded-[6px] text-[11.5px] font-semibold tabular-nums transition sm:h-[30px] sm:w-[42px] sm:text-[11px] ${seatClass(
          seat,
          isSelected,
          isAvailable
        )} ${disabled && !seat.taken ? 'opacity-70' : ''}`}
      >
        {seat.taken ? (
          <span aria-hidden="true" className="text-[12px] font-normal leading-none">
            ✕
          </span>
        ) : (
          seat.label
        )}
      </button>
    );
  };

  return (
    <div>
      <div className="sm:-mx-1 sm:overflow-x-auto sm:px-1 sm:pb-1">
        <div className="mx-auto w-fit">
          {/* Phones: the coach runs top to bottom, so the front is the top edge.
            Larger screens: the coach runs left to right, front on the left. */}
          <div className="flex flex-col items-stretch rounded-t-[22px] rounded-b-[12px] border-2 border-[#D9D7CA] bg-[#FBFAF4] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:flex-row sm:rounded-l-[22px] sm:rounded-r-[12px] sm:rounded-t-none sm:rounded-b-none">
            <div className="flex w-full shrink-0 items-center justify-center gap-2 border-b border-dashed border-[#DEDCCF] pb-2 sm:w-[38px] sm:flex-col sm:rounded-l-[32px] sm:border-b-0 sm:border-r sm:pb-0 sm:pr-2">
              <span className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-muted">
                Front
              </span>
              <span className="text-navy/55">
                <WheelIcon />
              </span>
              <span className="text-muted/60" title="Door">
                <DoorIcon />
              </span>
            </div>

            <div className="flex flex-col items-center gap-[6px] px-1 py-2 sm:flex-row sm:items-stretch sm:gap-[5px] sm:px-2.5 sm:py-1">
              {rows.map((row, index) => (
                <div
                  key={`row-${index}`}
                  className="flex items-center gap-[5px] sm:flex-col sm:items-stretch"
                >
                  <div className="flex gap-[5px] sm:flex-col">
                    {row.slice(0, 2).map(renderSeat)}
                  </div>
                  <span
                    aria-hidden="true"
                    className="h-[34px] w-[12px] shrink-0 sm:h-[8px] sm:w-full"
                  />
                  <div className="flex gap-[5px] sm:flex-col">
                    {row.slice(2, 4).map(renderSeat)}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex w-full shrink-0 items-center justify-center gap-2 border-t border-dashed border-[#DEDCCF] pt-2 sm:w-[34px] sm:flex-col sm:rounded-r-[16px] sm:border-t-0 sm:border-l sm:pt-0 sm:pl-2">
              <span className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-muted">
                Rear
              </span>
              <span className="text-muted/60" title="Accessible boarding">
                <AccessibleIcon />
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-2 text-center text-[11px] text-muted sm:hidden">
        The front of the coach is at the top.
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11.5px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded-[3px] bg-[#F26522]" /> Available
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded-[3px] bg-white ring-2 ring-orange" /> Selected
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded-[3px] bg-[#E8E7DD]" /> Taken
        </span>
      </div>
    </div>
  );
}