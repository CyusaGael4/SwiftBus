export default function InlineAlert({ children, tone = 'error' }) {
  if (!children) return null;

  const tones = {
    error: 'border-[#E3C4B8] bg-warning-soft text-[#8E4A33]',
    info: 'border-border bg-table-head text-navy',
  };

  return (
    <div
      className={`rounded-[4px] border px-3.5 py-2.5 text-[12.5px] leading-relaxed ${tones[tone]}`}
      role="alert"
    >
      {children}
    </div>
  );
}
