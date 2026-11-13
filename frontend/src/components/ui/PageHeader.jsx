export default function PageHeader({ title, subtitle, action }) {
  return (
    <>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[26px] font-semibold leading-none tracking-[-0.015em] text-navy sm:text-[32px]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 text-[14px] leading-none text-muted">{subtitle}</p>
          ) : null}
        </div>
        {action ? (
          <div className="w-full shrink-0 sm:w-auto sm:pt-1">{action}</div>
        ) : null}
      </div>
      <div className="mt-[25px] border-t border-border" />
    </>
  );
}
