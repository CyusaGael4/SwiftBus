import { createPortal } from 'react-dom';
import TicketView from './TicketView.jsx';

// The app screens stay on screen only. Printing swaps in this sheet, so the
// printed page gets a clean document instead of the page behind the modal.
export default function TicketPrintSheet({ tickets = [] }) {
  if (!tickets.length) return null;

  return createPortal(
    <div className="print-sheet" aria-hidden="true">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="print-sheet__page">
          <TicketView ticket={ticket} />
        </div>
      ))}
    </div>,
    document.body
  );
}
