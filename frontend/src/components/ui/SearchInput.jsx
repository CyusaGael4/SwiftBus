export default function SearchInput({
  value,
  onChange,
  placeholder,
  className = 'sm:w-[248px]',
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`h-9 w-full rounded-[4px] border border-border bg-surface px-3 text-[12.5px] text-navy outline-none transition placeholder:text-muted/65 focus:border-navy/50 focus:ring-1 focus:ring-navy/10 ${className}`}
    />
  );
}
