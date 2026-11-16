import Spinner from './Spinner.jsx';

export function TableMessage({ colSpan, loading, children, error }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center">
        {loading && !error ? (
          <span className="inline-flex w-full justify-center">
            <Spinner />
          </span>
        ) : (
          <p className={`text-[13px] ${error ? 'text-[#A94A30]' : 'text-muted'}`}>
            {error || children}
          </p>
        )}
      </td>
    </tr>
  );
}
