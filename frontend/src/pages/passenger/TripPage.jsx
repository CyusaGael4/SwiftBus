import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { passengerApi } from '../../api/passenger.js';
import HoldTimer from '../../components/passenger/HoldTimer.jsx';
import SeatPicker from '../../components/passenger/SeatPicker.jsx';
import Reveal from '../../components/ui/Reveal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  clearDraft,
  createHoldToken,
  readDraft,
  saveDraft,
} from '../../lib/bookingDraft.js';
import {
  formatDate,
  formatDuration,
  formatRwf,
  formatTime,
} from '../../lib/format.js';

export default function TripPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const passengers = Math.min(6, Math.max(1, Number(params.get('passengers')) || 1));
  const [holdToken] = useState(() => {
    const draft = readDraft();
    return draft?.scheduleId === id && draft?.holdToken ? draft.holdToken : createHoldToken();
  });

  const [trip, setTrip] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState(() => {
    const draft = readDraft();
    return draft?.scheduleId === id ? draft.seats || [] : [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [holding, setHolding] = useState(false);
  const [heldUntil, setHeldUntil] = useState(() => {
    const draft = readDraft();
    return draft?.scheduleId === id ? draft.expiresAt || null : null;
  });

  const selectedKey = selected.join(',');

  const loadSeats = useCallback(
    async (options = {}) => {
      const result = await passengerApi.seats(id, { holdToken });

      if (!options.silent) {
        setTrip(result.trip);
        setSeats(result.seats);
      }

      return result;
    },
    [id, holdToken]
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    loadSeats()
      .then((result) => {
        if (!active) return;
        setTrip(result.trip);
        setSeats(result.seats);

        // A restored draft may point at seats that someone else took while the
        // page was closed; drop them so the map and the summary agree.
        const free = new Set(
          result.seats.filter((seat) => !seat.taken).map((seat) => seat.label)
        );
        setSelected((current) => current.filter((label) => free.has(label)));
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadSeats]);

  // Other passengers keep reserving seats, so the map is refreshed whenever the
  // traveller comes back to this tab and selections that were taken are dropped.
  useEffect(() => {
    const handleVisibility = async () => {
      if (document.visibilityState !== 'visible') return;

      try {
        const result = await loadSeats();
        const free = new Set(
          result.seats.filter((seat) => !seat.taken).map((seat) => seat.label)
        );
        setSelected((current) => current.filter((label) => free.has(label)));
      } catch {
        // Keep the map already on screen; the next interaction reports errors.
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [loadSeats]);

  useEffect(() => {
    if (!trip || selected.length === 0) {
      if (selected.length === 0) clearDraft();
      setHeldUntil(null);
      return undefined;
    }

    let active = true;
    setHolding(true);

    const timer = setTimeout(async () => {
      try {
        const result = await passengerApi.holdSeats(trip.id, {
          seats: selected,
          holdToken,
        });

        if (!active) return;
        setHeldUntil(result.expiresAt);
        setNotice('');
        saveDraft({
          scheduleId: trip.id,
          seats: selected,
          holdToken,
          passengers,
          trip,
          expiresAt: result.expiresAt,
        });
      } catch (requestError) {
        if (!active) return;
        setNotice(requestError.message);
        setSelected([]);
        clearDraft();
        const refreshed = await loadSeats({ silent: true });
        if (active) setSeats(refreshed.seats);
      } finally {
        if (active) setHolding(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey, holdToken, trip?.id, passengers]);

  const total = useMemo(
    () => (trip ? trip.priceRwf * selected.length : 0),
    [trip, selected.length]
  );

  const toggleSeat = (seat) => {
    if (seat.taken) return;

    setSelected((current) => {
      if (current.includes(seat.label)) {
        return current.filter((label) => label !== seat.label);
      }

      if (current.length >= passengers) {
        setNotice(
          `You are booking for ${passengers} passenger${
            passengers === 1 ? '' : 's'
          }. Deselect a seat to choose another.`
        );
        return current;
      }

      setNotice('');
      return [...current, seat.label];
    });
  };

  const handleContinue = () => {
    if (!trip) return;

    if (selected.length !== passengers) {
      setNotice(
        `Select ${passengers} seat${passengers === 1 ? '' : 's'} to continue. You have selected ${selected.length}.`
      );
      return;
    }

    saveDraft({
      scheduleId: trip.id,
      seats: selected,
      holdToken,
      passengers,
      trip,
      expiresAt: heldUntil,
    });

    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    if (user.role !== 'passenger') {
      setNotice('Sign in with a passenger account to complete this reservation.');
      return;
    }

    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="passenger-shell py-10">
        <div className="h-[420px] animate-pulse rounded-[8px] border border-border bg-surface" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="passenger-shell py-16 text-center">
        <p className="text-[16px] font-semibold text-navy">Trip unavailable</p>
        <p className="mx-auto mt-2 max-w-sm text-[13px] text-muted">
          {error || 'This trip could not be found.'}
        </p>
        <Link
          to="/search"
          className="mt-5 inline-flex h-9 items-center rounded-[4px] bg-accent px-4 text-[12px] font-semibold text-white"
        >
          Search other trips
        </Link>
      </div>
    );
  }

  const freeSeats = seats.filter((seat) => !seat.taken).length;

  return (
    <div className="passenger-shell pb-32 pt-6 lg:pb-10 lg:pt-10">
      <Link
        to={`/search?origin=${encodeURIComponent(trip.route.origin)}&destination=${encodeURIComponent(
          trip.route.destination
        )}&date=${trip.departureTime.slice(0, 10)}&passengers=${passengers}`}
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted transition hover:text-navy"
      >
        <span aria-hidden="true">←</span> Back to results
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div>
          <section className="rounded-[8px] border border-border bg-surface p-5">
            <p className="text-[12px] text-muted">{formatDate(trip.departureTime)}</p>
            <h1 className="mt-1 text-[25px] font-semibold leading-tight tracking-[-0.02em] text-navy">
              {trip.route.origin} → {trip.route.destination}
            </h1>

            <div className="mt-5 flex items-center gap-4">
              <div className="shrink-0">
                <p className="text-[22px] font-semibold leading-none text-navy">
                  {formatTime(trip.departureTime)}
                </p>
                <p className="mt-1 text-[11.5px] text-muted">{trip.route.origin}</p>
              </div>

              <div className="min-w-0 flex-1">
                <div className="relative flex items-center">
                  <span className="h-2 w-2 rounded-full bg-navy" />
                  <span className="h-px flex-1 bg-border" />
                  <span className="h-2 w-2 rounded-full bg-accent" />
                </div>
                <p className="mt-1.5 text-center text-[11px] text-muted">
                  {formatDuration(trip.durationMins)}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-[22px] font-semibold leading-none text-navy">
                  {formatTime(trip.arrivalTime)}
                </p>
                <p className="mt-1 text-[11.5px] text-muted">{trip.route.destination}</p>
              </div>
            </div>

            <p className="mt-4 border-t border-border pt-3 text-[12px] text-muted">
              Bus {trip.bus.plateNumber || trip.bus.busCode} · {freeSeats} of{' '}
              {trip.totalSeats} seats free
            </p>
          </section>

          <Reveal
            as="section"
            delay={40}
            className="mt-4 rounded-[8px] border border-border bg-surface p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-[16px] font-semibold text-navy">Choose your seats</h2>
                <p className="mt-0.5 text-[12px] text-muted">
                  You can choose {passengers} seat{passengers === 1 ? '' : 's'} for this
                  booking.
                </p>
              </div>
              <span className="shrink-0 rounded-[3px] bg-table-head px-2 py-1 text-[11.5px] font-semibold text-navy">
                {selected.length}/{passengers} selected
              </span>
            </div>

            <div className="mt-4">
              <SeatPicker seats={seats} selected={selected} onToggle={toggleSeat} />
            </div>

            {notice ? (
              <p className="mt-4 rounded-[4px] border border-[#E3C4B8] bg-warning-soft px-3 py-2 text-[12px] leading-relaxed text-[#8E4A33]">
                {notice}
              </p>
            ) : null}
          </Reveal>
        </div>

        <Reveal as="aside" delay={140} className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[8px] border border-border bg-surface p-5">
            <h2 className="text-[15px] font-semibold text-navy">Booking summary</h2>

            <div className="mt-4 space-y-2.5 text-[13px]">
              <div className="flex justify-between gap-3">
                <span className="text-muted">Fare per seat</span>
                <span className="font-medium text-navy">{formatRwf(trip.priceRwf)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted">Seats</span>
                <span className="text-right font-medium text-navy">
                  {selected.length ? selected.join(', ') : 'None selected'}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted">Passengers</span>
                <span className="font-medium text-navy">{passengers}</span>
              </div>
              <div className="flex items-start justify-between gap-3 border-t border-border pt-3">
                <span className="text-muted">Total on board</span>
                <span className="text-[18px] font-semibold leading-none text-navy">
                  {formatRwf(total)}
                </span>
              </div>
            </div>

            {heldUntil ? (
              <div className="mt-4 flex items-center justify-between gap-2 rounded-[4px] border border-border bg-table-head px-3 py-2">
                <HoldTimer expiresAt={heldUntil} />
                {holding ? <span className="text-[11px] text-muted">Updating…</span> : null}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleContinue}
              disabled={selected.length !== passengers || holding}
              className="mt-4 hidden h-11 w-full items-center justify-center rounded-[4px] bg-accent px-4 text-[13px] font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60 lg:inline-flex"
            >
              Continue to checkout
            </button>

            <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
              This is a reservation, not a payment. Pay the conductor in RWF when you
              board.
            </p>
          </div>
        </Reveal>
      </div>

      <div className="fixed inset-x-0 bottom-[59px] z-30 border-t border-border bg-surface px-4 py-3 lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-muted">
              {selected.length}/{passengers} seats · total on board
            </p>
            <p className="text-[17px] font-semibold leading-tight text-navy">
              {formatRwf(total)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleContinue}
            disabled={selected.length !== passengers || holding}
            className="inline-flex h-11 items-center justify-center rounded-[4px] bg-accent px-5 text-[13px] font-semibold text-white transition disabled:opacity-60"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
