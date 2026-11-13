export default function BookingAnalyticsChart({ data }) {
  const peak = Math.max(...data.map((item) => item.bookings), 0);
  const axisMax = Math.max(50, Math.ceil(peak / 50) * 50);
  const ticks = Array.from({ length: 5 }, (_, index) =>
    Math.round(axisMax - (index * axisMax) / 4)
  );

  return (
    <div className="mt-8 flex gap-3">
      <div
        className="flex h-[195px] w-7 shrink-0 flex-col justify-between pb-0 text-right text-[10.5px] leading-none text-muted"
        aria-hidden="true"
      >
        {ticks.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div className="relative h-[195px]">
          <div className="absolute inset-0 flex flex-col justify-between" aria-hidden="true">
            {ticks.map((tick) => (
              <span key={tick} className="block h-px w-full bg-[#ECE9DE]" />
            ))}
          </div>

          <div className="relative flex h-full items-end justify-between gap-2 px-2">
            {data.map((item) => {
              const isPeak = peak > 0 && item.bookings === peak;
              const height = axisMax ? (item.bookings / axisMax) * 100 : 0;

              return (
                <div
                  key={item.day}
                  className="flex h-full flex-1 items-end justify-center"
                  title={`${item.day}: ${item.bookings} bookings`}
                >
                  <div
                    className={`w-[14px] max-w-full rounded-t-[1px] transition-[height] duration-500 sm:w-[22px] ${
                      isPeak ? 'bg-accent' : 'bg-navy'
                    }`}
                    style={{ height: `${Math.max(height, item.bookings > 0 ? 1.5 : 0)}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex justify-between gap-2 px-2">
          {data.map((item) => {
            const isPeak = peak > 0 && item.bookings === peak;
            return (
              <span
                key={item.day}
                className={`flex-1 text-center text-[11.5px] ${
                  isPeak ? 'font-medium text-accent' : 'text-muted'
                }`}
              >
                {item.day}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
