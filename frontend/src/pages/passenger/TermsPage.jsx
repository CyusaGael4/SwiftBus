import LegalShell from '../../components/passenger/LegalShell.jsx';

const SECTIONS = [
  {
    id: 'service',
    heading: 'What SwiftBus is',
    body: [
      'SwiftBus is a seat reservation system for intercity coaches operating from Nyabugogo in Kigali. This portal lets you browse departures, place a hold on specific seats, confirm a reservation and keep the tickets that come with it.',
      'SwiftBus records reservations and issues tickets. It does not operate the coaches itself and it does not collect fares online - the fare is paid to the conductor when you board.',
    ],
  },
  {
    id: 'accounts',
    heading: 'Your account',
    body: [
      'You can search and select seats without an account. An account is required to confirm a reservation so that the booking is linked to you and your tickets can be reopened later.',
      'You agree to give accurate details when you register, to keep your password to yourself, and to tell us if you believe someone else has used your account. Staff and booking-agent accounts are issued by SwiftBus and are subject to separate operational rules.',
    ],
  },
  {
    id: 'reservations',
    heading: 'Reservations and seat holds',
    bullets: [
      'Selecting a seat places a short hold on it - ten minutes by default - so you can finish checkout. The countdown is shown on screen.',
      'Availability is checked again when you confirm. If a seat was taken in the meantime, the reservation is refused and you are asked to choose another seat.',
      'A reservation is confirmed only when you receive a booking reference. A held seat is not a ticket.',
      'Do not reserve seats you do not intend to use. Repeated no-shows or bulk holds may lead to reservations being cancelled and the account being suspended.',
    ],
  },
  {
    id: 'fares',
    heading: 'Fares and payment',
    body: [
      'The fare per seat and the total for your reservation are shown in Rwandan francs before you confirm. Fares are set per route and per coach and may change between searches.',
      'No card, Mobile Money or bank payment is accepted on this portal, and no payment details are requested or stored. You pay the published fare to the conductor when you board. Keep your ticket available as proof of the reservation.',
    ],
  },
  {
    id: 'tickets',
    heading: 'Tickets and boarding',
    body: [
      'Each passenger on a reservation receives a separate ticket with its own QR code. The code carries a verification reference only - never your password or payment details.',
      'Arrive at the departure point before the scheduled time. Boarding staff may refuse travel if a ticket cannot be verified, if the ticket has been cancelled, or if the passenger count does not match the reservation. Tickets are not transferable to another person or another departure.',
    ],
  },
  {
    id: 'changes',
    heading: 'Changes and cancellations',
    body: [
      'You can cancel a reservation from My bookings at any time before the coach departs. The booking is marked as cancelled and its seats are released for other passengers. Because no money is taken online, no refund is processed by this portal.',
      'Counters and booking agents handle their own reservations. If you booked in person, ask the agent about changes, cancellations and any refund policy that applies to that ticket.',
    ],
  },
  {
    id: 'use',
    heading: 'Acceptable use',
    bullets: [
      'Do not scrape, automate or bulk-request the service in a way that degrades it for other passengers.',
      'Do not attempt to access accounts, reservations or staff areas you are not authorised to use.',
      'Do not upload or transmit malicious code, and do not interfere with the seat-allocation checks that keep two passengers from holding the same seat.',
    ],
  },
  {
    id: 'availability',
    heading: 'Service availability and travel',
    body: [
      'Departure times, coach assignments and seat layouts are indicative and can change because of traffic, breakdowns, weather or operational decisions. SwiftBus may substitute a coach, which can change the seat layout you selected.',
      'We aim to keep the portal available but cannot guarantee uninterrupted access. Maintenance, network problems or failures outside our control may interrupt searches or checkout.',
    ],
  },
  {
    id: 'liability',
    heading: 'Liability',
    body: [
      'To the extent permitted by the laws of Rwanda, SwiftBus is not liable for indirect or consequential loss arising from the use of this portal, from a departure being delayed or cancelled, or from a reservation that could not be completed because a seat was no longer available.',
      'Nothing in these terms limits liability that cannot lawfully be limited, including liability for death or personal injury caused by negligence, or for fraud.',
    ],
  },
  {
    id: 'changes-to-terms',
    heading: 'Changes to these terms',
    body: [
      'We may update these terms as the service changes. The date at the top of this page shows the current version, and material changes will be announced on the portal. Continuing to use SwiftBus after an update means you accept the revised terms.',
      'These terms are governed by the laws of Rwanda. Questions about them can be sent to support@swiftbus.rw.',
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalShell
      eyebrow="Legal"
      title="Terms of use"
      updated="16 November 2026"
      intro="These terms cover your use of the SwiftBus passenger portal: searching departures, holding seats, confirming a reservation and using the tickets issued with it."
      sections={SECTIONS}
      crossLink={{ to: '/privacy', label: 'Read the privacy policy' }}
    />
  );
}
