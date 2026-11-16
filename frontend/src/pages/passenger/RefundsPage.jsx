import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import { TextField } from '../../components/ui/Fields.jsx';
import InlineAlert from '../../components/ui/InlineAlert.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function RefundsPage() {
  const { user } = useAuth();
  const location = useLocation();
  const from = location.state?.from;

  if (user) {
    const destination = user.role === 'passenger'
      ? '/passenger/dashboard'
      : user.role === 'admin' ? '/dashboard' : '/dashboard';
    return <Navigate to={destination} replace />;
  }

  const [form, setForm] = useState({
    reference: '',
    email: '',
    details: '',
  });
  const [touched, setTouched] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    if (error) setError('');
  };

  const handleBlur = (event) => {
    setTouched((current) => ({ ...current, [event.target.name]: true }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAttempted(true);
    setError('');

    // In a real app, this would submit to an API
    // For now, just navigate back
    const from = location.state?.from || '/passenger/dashboard';
    window.history.go(-1);
  };

  return (
    <AuthLayout>
      <h1 className="text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] text-navy sm:text-[34px]">
        Refunds & Cancellations
      </h1>
      <p className="mt-2.5 text-[14px] leading-relaxed text-muted">
        Request a refund or cancel an existing reservation.
      </p>

      <form className="mt-8" onSubmit={handleSubmit} noValidate>
        {error ? (
          <div className="mb-5">
            <InlineAlert>{error}</InlineAlert>
          </div>
        ) : null}

        <div className="space-y-4">
          <TextField
            label="Booking reference"
            name="reference"
            type="text"
            autoComplete="booking-reference"
            inputClassName="h-12 text-[16px]"
            value={form.reference}
            onChange={handleChange}
            onBlur={handleBlur}
            error={fieldError('reference')}
            aria-invalid={Boolean(fieldError('reference'))}
            placeholder="SB-XXXX-XXX"
            required
          />

          <TextField
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            inputClassName="h-12 text-[16px]"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={fieldError('email')}
            aria-invalid={Boolean(fieldError('email'))}
            required
          />

          <TextField
            label="Details (optional)"
            name="details"
            type="text"
            inputClassName="h-12 text-[16px]"
            value={form.details}
            onChange={handleChange}
            onBlur={handleBlur}
            error={fieldError('details')}
            aria-invalid={Boolean(fieldError('details'))}
          />
        </div>

        <div className="mt-6">
          <Button type="submit" size="lg">Submit request</Button>
          <Button
            type="button"
            size="lg"
            className="ml-3"
            onClick={() => window.history.go(-1)}
          >
            Cancel
          </Button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-border">
        <p className="text-[13.5px] text-muted">
          Need help with an existing booking?{' '}
          <Link
            to="/passenger/bookings"
            className="font-semibold text-navy underline decoration-navy/35 underline-offset-2 transition hover:text-accent hover:decoration-accent"
          >
            View my bookings
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

function fieldError(field, touched, attempted, errors) {
  return touched[field] || attempted ? errors[field] : '';
}