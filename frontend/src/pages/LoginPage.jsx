import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import Button from '../components/ui/Button.jsx';
import { TextField } from '../components/ui/Fields.jsx';
import InlineAlert from '../components/ui/InlineAlert.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { readDraft } from '../lib/bookingDraft.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STAFF_PATHS = [
  '/dashboard',
  '/bookings',
  '/buses',
  '/schedule',
  '/routes',
  '/users',
];

function roleHome(role) {
  if (role !== 'passenger') return '/dashboard';
  return readDraft() ? '/checkout' : '/passenger/dashboard';
}

function destinationFor(role, from) {
  if (!from) return roleHome(role);

  const isStaffPath = STAFF_PATHS.some((path) => from.startsWith(path));
  if (role === 'passenger') return isStaffPath ? roleHome(role) : from;
  return isStaffPath ? from : roleHome(role);
}

function validate(form) {
  const errors = {};

  if (!form.email.trim()) {
    errors.email = 'Enter your email address.';
  } else if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = 'Enter a valid email address, for example name@example.com.';
  }

  if (!form.password) {
    errors.password = 'Enter your password.';
  }

  return errors;
}

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from;

  if (user) return <Navigate to={destinationFor(user.role, from)} replace />;

  const errors = validate(form);
  const isComplete = Object.keys(errors).length === 0;
  const fieldError = (field) => (touched[field] || attempted ? errors[field] : '');

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

    if (!isComplete) return;

    setSubmitting(true);

    try {
      const signedIn = await login(form);
      navigate(destinationFor(signedIn.role, from), { replace: true });
    } catch (requestError) {
      setSubmitting(false);
      setError(requestError.message);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] text-navy sm:text-[34px]">
        Sign in
      </h1>
      <p className="mt-2.5 text-[14px] leading-relaxed text-muted">
        Use the email address you booked with to open your trips and QR tickets.
      </p>

      <form className="mt-8" onSubmit={handleSubmit} noValidate>
        {error ? (
          <div className="mb-5">
            <InlineAlert>{error}</InlineAlert>
          </div>
        ) : null}

        <div className="space-y-5">
          <TextField
            label="Email address"
            name="email"
            type="email"
            autoComplete="username"
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
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            inputClassName="h-12 text-[16px]"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={fieldError('password')}
            aria-invalid={Boolean(fieldError('password'))}
            required
          />
        </div>

        <Button type="submit" size="lg" className="mt-6" loading={submitting}>
          Sign in
        </Button>
      </form>

      <div className="mt-8 border-t border-border pt-6">
        <p className="text-[13.5px] text-muted">
          New to SwiftBus?{' '}
          <Link
            to="/register"
            className="font-semibold text-navy underline decoration-navy/35 underline-offset-2 transition hover:text-accent hover:decoration-accent"
          >
            Create an account
          </Link>
        </p>
        <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted/85">
          You can search departures and choose a seat before signing in - the
          seat is held while you finish.
        </p>
        <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted/85">
          Booking agent at a counter?{' '}
          <Link
            to="/register/agent"
            className="font-medium text-navy underline decoration-navy/35 underline-offset-2 transition hover:text-accent hover:decoration-accent"
          >
            Apply for an agent account
          </Link>
          .
        </p>
      </div>
    </AuthLayout>
  );
}
