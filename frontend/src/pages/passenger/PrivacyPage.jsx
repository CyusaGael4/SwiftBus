import LegalShell from '../../components/passenger/LegalShell.jsx';

const SECTIONS = [
  {
    id: 'scope',
    heading: 'Who this policy covers',
    body: [
      'This policy explains what SwiftBus collects through the passenger portal, why it is collected, who can see it and how long it is kept. SwiftBus is responsible for the personal data described here.',
      'It applies to the public portal and to passenger accounts. Staff and booking-agent accounts are covered by internal policies in addition to this one.',
    ],
  },
  {
    id: 'what-we-collect',
    heading: 'What we collect',
    bullets: [
      'Account details: your full name, email address and phone number if you provide one, plus your password stored only as a one-way hash.',
      'Reservation details: the departure, seats, passenger names, fare, booking reference and any cancellation you make.',
      'Ticket data: the verification reference behind each QR code, and whether a ticket has been scanned at boarding.',
      'Technical data: the sign-in token kept in your browser so you stay signed in, and the seat-hold record created while you check out.',
    ],
  },
  {
    id: 'why',
    heading: 'Why we use it',
    bullets: [
      'To hold seats, confirm a reservation and issue a ticket for each passenger.',
      'To prevent two passengers being given the same seat, and to check tickets at boarding.',
      'To let you reopen your bookings and tickets, and to handle cancellations.',
      'To keep the service secure, investigate misuse and meet record-keeping obligations that apply to us.',
    ],
  },
  {
    id: 'legal-basis',
    heading: 'Our basis for processing',
    body: [
      'We process reservation and account data because it is needed to perform the service you asked for. Security, fraud prevention and record-keeping rely on our legitimate interest in running a reliable reservation system, and on legal obligations where they apply.',
    ],
  },
  {
    id: 'sharing',
    heading: 'Who can see your data',
    bullets: [
      'SwiftBus staff and booking agents see the reservation details needed to run departures and answer your questions.',
      'Conductors and boarding staff see the passenger name, seat and ticket reference for the departure they are checking.',
      'Our hosting and database providers process data on our instructions so the portal can run.',
      'We do not sell personal data, and we do not share it for advertising.',
    ],
  },
  {
    id: 'cookies',
    heading: 'Cookies and browser storage',
    body: [
      'SwiftBus does not use advertising or analytics trackers. The portal stores a sign-in token and a small cached copy of your profile in your browser so you stay signed in between pages, and keeps your in-progress seat selection in session storage until checkout finishes.',
      'Signing out clears the stored token. Clearing your browser storage also removes it.',
    ],
  },
  {
    id: 'retention',
    heading: 'How long we keep it',
    body: [
      'Reservation and ticket records are kept while your account is active and afterwards for as long as needed to resolve disputes, support accounting for fares collected on board, and meet legal requirements. Seat holds and expired checkout attempts are removed once they are no longer needed.',
      'You can ask us to delete your account and the personal data attached to it, subject to records we are required to keep.',
    ],
  },
  {
    id: 'rights',
    heading: 'Your choices and rights',
    bullets: [
      'Ask for a copy of the personal data we hold about you.',
      'Correct details that are wrong, such as your name or phone number.',
      'Ask for your account and data to be deleted.',
      'Object to processing, or ask us to restrict it, where the law allows.',
    ],
    body: [
      'Send any request to support@swiftbus.rw from the email address on your account so we can verify it. We answer within a reasonable period and explain if we cannot act on a request.',
    ],
  },
  {
    id: 'security',
    heading: 'How we protect it',
    body: [
      'Passwords are stored as bcrypt hashes and are never shown back to you. Access to reservations is authorised on the server, so a signed-in passenger can only reach their own bookings, and staff areas require a staff role.',
      'No system is perfectly secure. If a breach affects your data, we will notify affected passengers and the relevant authority as required.',
    ],
  },
  {
    id: 'changes-to-policy',
    heading: 'Changes to this policy',
    body: [
      'We may update this policy when the service or the law changes. The date at the top of the page shows the current version, and significant changes will be announced on the portal.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalShell
      eyebrow="Legal"
      title="Privacy policy"
      updated="16 November 2026"
      intro="SwiftBus keeps the data needed to reserve a seat, issue a ticket and check it at boarding - nothing more. This page explains exactly what that means in practice."
      sections={SECTIONS}
      crossLink={{ to: '/terms', label: 'Read the terms of use' }}
    />
  );
}
