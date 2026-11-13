export function TableMessage({ colSpan, loading, children, error }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center">
        <p
          className={`text-[13px] ${
            error ? 'text-[#A94A30]' : loading ? 'animate-pulse text-muted' : 'text-muted'
          }`}
        >
          {error || (loading ? 'Loading…' : children)}
        </p>
      </td>
    </tr>
  );
}
