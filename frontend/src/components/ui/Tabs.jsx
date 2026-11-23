export default function Tabs({ items, value, onChange, right }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border px-3 py-0 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-6 overflow-x-auto pr-2 sm:gap-12">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`tab shrink-0 ${value === item.value ? 'tab-active' : ''}`}
          >
            <span className="whitespace-nowrap">{item.label}</span>
            {item.count !== undefined ? (
              <span className="ml-1.5 text-[11px] text-muted">{item.count}</span>
            ) : null}
          </button>
        ))}
      </div>
      {right ? <div className="w-full pb-3 sm:w-auto sm:py-3">{right}</div> : null}
    </div>
  );
}
