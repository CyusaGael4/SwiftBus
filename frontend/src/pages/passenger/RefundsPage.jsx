import LegalShell from '../../components/passenger/LegalShell.jsx';

const SECTIONS = [
  {
    id: 'cancel-booking',
    heading: 'Cancelling a reservation',
    body: [
      'A reservation can be cancelled from My bookings on this portal at any time before the coach departs. Open the booking, choose cancel and confirm. The booking is marked as cancelled straight away and the seats on it are released for other passengers.',
      'Cancelling one ticket on a booking for several passengers leaves the other tickets in place. Only the cancelled seat is released and the cancelled passenger is removed from the manifest the conductor checks at boarding.',
      'Once a coach has departed, the booking can no longer be cancelled on the portal. Contact the departures desk at the terminal in that case.',
    ],
  },
  {
    id: 'refunds-online',
    heading: 'Refunds for portal bookings',
    body: [
      'No money is taken through this portal. Fares are paid to the conductor when you board, so SwiftBus has no card, Mobile Money or bank payment to return. A cancellation on the portal therefore does not produce a cash refund - it releases the seat and marks the booking as cancelled.',
      'If you have already paid a fare at the counter and then cancel on the portal, the refund is handled by the counter that took the payment, not by this portal.',
    ],
  },
  {
    id: 'refunds-counter',
    heading: 'Refunds for counter and agent bookings',
    bullets: [
      'Tickets bought at a departures desk or through a booking agent are refunded at the same desk or agent that issued them.',
      'Bring the ticket or the booking reference and the name the reservation was made under.',
      'A refund is normally paid in cash at the desk. Take the receipt you are given and keep it until the refund appears.',
      'Any service fee charged by an agent is subject to that agent\'s own policy.',
    ],
  },
  {
    id: 'no-show',
    heading: 'No-shows and missed departures',
    body: [
      'A seat that is not claimed before the coach leaves may be reallocated, and the fare for an unused seat is not refundable. Arrive at the departure point at least fifteen minutes before the scheduled time.',
      'If you miss a departure because of a delay on our side, or because the coach left early, speak to the departures desk. Those cases are reviewed individually and the fare is refunded or the passenger is moved to the next departure where seats allow.',
    ],
  },
  {
    id: 'changes',
    heading: 'Changing a departure',
    body: [
      'The portal does not move a booking from one departure to another. To travel on a different date or time, cancel the reservation and book again on the departure you want, subject to seats being available.',
      'Where a fare has already been paid at a counter, ask the desk about moving the ticket before you cancel online, so the payment is not lost.',
    ],
  },
  {
    id: 'operator-cancellations',
    heading: 'When SwiftBus cancels a departure',
    body: [
      'Departures are occasionally cancelled or combined because of a breakdown, weather, road closure or too few passengers. When that happens the counter contacts booked passengers using the phone number on the reservation.',
      'Passengers are offered the next available departure or a full refund of the fare paid. Refunds for a cancelled departure are paid at the departures desk that issued the ticket.',
    ],
  },
  {
    id: 'request-refund',
    heading: 'Requesting a refund',
    bullets: [
      'Find the booking reference on your ticket, for example SB-XXXX-XXX.',
      'Take the reference, the passenger name and the departure date to the desk that issued the ticket.',
      'Write to support@swiftbus.rw if you cannot reach the desk, and include the same details so the request can be traced.',
      'Refund requests are answered within five working days. A refund that is approved is paid at the desk, since no payment is collected online.',
    ],
  },
  {
    id: 'contact',
    heading: 'Questions',
    body: [
      'Refund and cancellation questions are handled at the departures desk and by support@swiftbus.rw. Staff and booking agents follow the same rules when they cancel a reservation on a passenger\'s behalf.',
    ],
  },
];

export default function RefundsPage() {
  return (
    <LegalShell
      eyebrow="Policies"
      title="Refunds & cancellations"
      updated="23 November 2026"
      intro="How to cancel a reservation made on this portal, where a refund is paid when a fare was taken at a counter, and what happens when SwiftBus cancels a departure."
      sections={SECTIONS}
      crossLink={{ to: '/terms', label: 'Read the terms of use' }}
    />
  );
}
