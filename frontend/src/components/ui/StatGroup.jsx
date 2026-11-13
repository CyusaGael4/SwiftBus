export default function StatGroup({ items, eyebrow, variant = 'default' }) {
  if (variant === 'page') {
    return (
      <section>
        {eyebrow ? (
          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
            {eyebrow}
          </p>
        ) : null}

        <div className="mt-5 grid grid-cols-2 pb-1 lg:grid-cols-4">
          {items.map((item, index) => {
            const mobileLeftBorder = index % 2 === 1;
            const mobileTopBorder = index > 1;
            const desktopLeftBorder = index > 0;

            return (
              <div
                key={item.label}
                className={[
                  mobileLeftBorder ? 'border-l border-border pl-5' : '',
                  mobileTopBorder
                    ? 'mt-6 border-t border-border pt-5 lg:mt-0 lg:border-t-0 lg:pt-0'
                    : '',
                  desktopLeftBorder
                    ? 'lg:border-l lg:border-border lg:pl-6'
                    : '',
                ].join(' ')}
              >
                <p
                  className={`text-[26px] font-semibold leading-none tracking-[-0.02em] sm:text-[34px] ${
                    item.accent ? 'text-accent' : 'text-navy'
                  }`}
                >
                  {item.padded
                    ? String(item.value ?? 0).padStart(2, '0')
                    : (item.value ?? 0)}
                </p>
                <p className="mt-[10px] text-[13px] leading-none text-muted sm:text-[14px]">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-2 border-b border-border lg:grid-cols-4">
      {items.map((item, index) => {
        const mobileLeftBorder = index % 2 === 1;
        const mobileTopBorder = index > 1;
        const desktopLeftBorder = index > 0;

        return (
          <div
            key={item.label}
            className={[
              'pt-5 pb-6 sm:pt-6 sm:pb-8 lg:pt-[27px] lg:pb-[56px]',
              mobileLeftBorder ? 'border-l border-border pl-5' : 'pr-4',
              mobileTopBorder ? 'border-t border-border lg:border-t-0' : '',
            ].join(' ')}
          >
            <div
              className={[
                'flex items-start justify-between gap-4',
                desktopLeftBorder
                  ? 'lg:border-l lg:border-border lg:pl-8'
                  : '',
              ].join(' ')}
            >
              <div>
                <p className="text-[14px] leading-none text-muted">
                  {item.label}
                </p>
                <p
                  className={`mt-[18px] text-[30px] font-semibold leading-none tracking-[-0.02em] sm:mt-[23px] sm:text-[38px] ${
                    item.accent ? 'text-accent' : 'text-navy'
                  }`}
                >
                  {item.value ?? 0}
                </p>
              </div>
              {item.icon ? (
                <img
                  src={item.icon}
                  alt=""
                  className="mt-0.5 h-6 w-6 shrink-0 object-contain sm:h-7 sm:w-7"
                />
              ) : null}
            </div>
          </div>
        );
      })}
    </section>
  );
}
