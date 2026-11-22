import { Link } from 'react-router-dom';
import Reveal from '../../components/ui/Reveal.jsx';

const FAQS = [
  {
    q: 'Do I need an account to search for a bus?',
    a: 'No. You can browse departures and pick seats without signing in. An account is only needed when you confirm the reservation, so the ticket can be stored and shown to the conductor.',
  },
  {
    q: 'How long are my seats held while I check out?',
    a: 'As soon as you select seats, SwiftBus holds them for a short window (10 minutes by default). The countdown is shown on the trip and checkout pages. If the hold expires the seats go back on sale and you will be asked to choose again.',
  },
  {
    q: 'How do I pay for my trip?',
    a: 'Online payment is not offered. SwiftBus records the reservation and issues your ticket; the fare is paid in Rwandan francs to the conductor when you board. The total is always shown before you confirm.',
  },
  {
    q: 'What do I show when boarding?',
    a: 'Open My bookings or Tickets and show the digital ticket for each seat. Every ticket has a QR code containing a verification reference that staff scan - never your personal details. You can also print the tickets or save them as a PDF.',
  },
  {
    q: 'Can I change or cancel a reservation?',
    a: 'You can cancel a reservation from My bookings any time before the bus departs. The booking is marked as cancelled and its seats are released for other passengers. Completed journeys can no longer be cancelled - speak to a SwiftBus staff member instead.',
  },
  {
    q: 'Can I book for more than one passenger?',
    a: 'Yes. Choose the number of passengers in the search form, then select that many seats on the bus map. Each seat gets its own QR ticket under the same booking reference.',
  },
  {
    q: 'What happens if two people pick the same seat?',
    a: 'The first confirmed reservation keeps the seat. SwiftBus checks availability on the server when you select seats and again when you confirm, so a seat that was just taken will be reported and you will be asked to pick another one.',
  },
  {
    q: 'I booked at a SwiftBus counter. Where is my booking?',
    a: 'Counter and booking-agent reservations are handled by our staff and are not attached to a passenger account. Use this portal for reservations you make online, and ask the agent for your reference for anything booked in person.',
  },
];

const STEPS = [
  {
    title: 'Search',
    body: 'Pick your departure town, destination and travel date. No account needed.',
  },
  {
    title: 'Choose seats',
    body: 'See the live bus layout, pick free seats, and hold them while you finish.',
  },
  {
    title: 'Sign in',
    body: 'Create a passenger account or sign in so the booking is linked to you.',
  },
  {
    title: 'Travel',
    body: 'Show the QR ticket at boarding and pay the fare to the conductor.',
  },
];

export default function HelpPage() {
  return (
    <div className="passenger-shell py-8 lg:py-12">
      <Reveal className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
          Help centre
        </p>
        <h1 className="mt-2 text-[29px] font-semibold leading-tight tracking-[-0.03em] text-navy sm:text-[36px]">
          Need help booking your SwiftBus seat?
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-muted">
          Get quick answers on finding routes, holding your seat, tickets, and
          cancellations. Every booking connects directly to our live station system,
          so your seat is always guaranteed.
        </p>
      </Reveal>

      {/* Timeline: a horizontal rail with the steps left to right on desktop,
          and the same rail turned vertical for phones. */}
      <Reveal as="ol" delay={80} className="relative mt-10 sm:mt-12 sm:grid sm:grid-cols-4">
        <span
          aria-hidden="true"
          className="absolute bottom-2 left-[5px] top-2 w-px bg-border sm:hidden"
        />

        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="relative pb-8 pl-7 last:pb-0 sm:pb-0 sm:pl-0 sm:pr-7 sm:last:pr-0"
          >
            <span
              aria-hidden="true"
              className="absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-[3px] border-cream bg-accent sm:top-[9px]"
            />
            {index < STEPS.length - 1 ? (
              <span
                aria-hidden="true"
                className="absolute left-[13px] right-0 top-[14px] hidden h-px bg-border sm:block"
              />
            ) : null}

            <div className="sm:pt-8">
              <p className="text-[11px] font-semibold tracking-[0.08em] text-accent">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h2 className="mt-1 text-[16px] font-semibold leading-snug tracking-[-0.02em] text-navy">
                {step.title}
              </h2>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </Reveal>

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <Reveal as="section" delay={160} className="overflow-hidden rounded-[8px] border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-[16px] font-semibold text-navy">Frequently asked</h2>
            <p className="mt-0.5 text-[12.5px] text-muted">
              Tap a question to read the answer.
            </p>
          </div>

          <div className="divide-y divide-border">
            {FAQS.map((item) => (
              <details key={item.q} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[13.5px] font-medium text-navy marker:hidden">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-[16px] leading-none text-muted transition group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-2.5 max-w-[640px] text-[12.5px] leading-relaxed text-muted">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </Reveal>

        <Reveal as="aside" delay={220} className="space-y-3 lg:sticky lg:top-24">
          <div className="rounded-[8px] border border-border bg-surface p-5">
            <h2 className="text-[14.5px] font-semibold text-navy">Need a hand?</h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
              If a reservation looks wrong or you need to travel on a different
              departure, speak to a SwiftBus staff member at the departures desk
              with your booking reference.
            </p>
            <Link
              to="/search"
              className="mt-4 flex h-10 items-center justify-center rounded-[4px] bg-accent text-[12.5px] font-semibold text-white transition hover:bg-accent/90"
            >
              Search trips
            </Link>
            <Link
              to="/passenger/bookings"
              className="mt-2 flex h-10 items-center justify-center rounded-[4px] border border-border bg-surface text-[12.5px] font-medium text-navy transition hover:border-navy/30"
            >
              My bookings
            </Link>
          </div>

          <div className="rounded-[8px] border border-border bg-table-head px-4 py-3.5">
            <p className="text-[11.5px] leading-relaxed text-navy">
              SwiftBus does not take card or Mobile Money payments in this portal.
              Fares are collected on board by the conductor.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
