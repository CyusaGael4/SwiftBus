import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import Button from '../components/ui/Button.jsx';
import { TextField } from '../components/ui/Fields.jsx';
import InlineAlert from '../components/ui/InlineAlert.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { readDraft } from '../lib/bookingDraft.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[\d\s()-]{7,20}$/;
const MIN_PASSWORD_LENGTH = 8;

function validate(form, agreed) {
  const errors = {};

  if (!form.fullName.trim()) {
    errors.fullName = 'Enter your full name.';
  } else if (form.fullName.trim().length < 3) {
    errors.fullName = 'Your name must be at least 3 characters long.';
  }

  if (!form.email.trim()) {
    errors.email = 'Enter your email address.';
  } else if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = 'Enter a valid email address, for example name@example.com.';
  }

  if (!form.phoneNumber.trim()) {
    errors.phoneNumber = 'Enter your phone number.';
  } else if (!PHONE_PATTERN.test(form.phoneNumber.trim())) {
    errors.phoneNumber = 'Enter a valid phone number, for example +250 788 000 000.';
  }

  if (!form.password) {
    errors.password = 'Create a password.';
  } else if (form.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Your password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
  }

  if (!agreed) {
    errors.agreed = 'Please accept the Terms of Use to continue.';
  }

  return errors;
}

function PasswordRule({ met }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11.5px] transition ${
        met ? 'text-success' : 'text-muted'
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border transition ${
          met ? 'border-success bg-success text-white' : 'border-border bg-transparent'
        }`}
      >
        {met ? (
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
            <path
              d="m5 13 4.5 4.5L19 7"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
      At least {MIN_PASSWORD_LENGTH} characters
    </span>
  );
}

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [touched, setTouched] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const afterSignUp = () => (readDraft() ? '/checkout' : '/passenger/dashboard');

  if (user) {
    return <Navigate to={user.role === 'passenger' ? afterSignUp() : '/dashboard'} replace />;
  }

  const errors = validate(form, agreed);
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
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
      });
      navigate(afterSignUp(), { replace: true });
    } catch (requestError) {
      setSubmitting(false);
      setError(requestError.message);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      description="Keep your bookings, seat choices and QR tickets together, and check out faster next time."
      footer={
        <>
          <p className="text-[13.5px] text-muted">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-navy underline decoration-navy/35 underline-offset-2 transition hover:text-accent hover:decoration-accent"
            >
              Sign in
            </Link>
          </p>
          <p className="mt-3 text-[12.5px] leading-relaxed text-muted/85">
            Sell seats at a counter?{' '}
            <Link
              to="/register/agent"
              className="font-semibold text-navy underline decoration-navy/35 underline-offset-2 transition hover:text-accent hover:decoration-accent"
            >
              Apply for a booking agent account
            </Link>
            .
          </p>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {error ? <InlineAlert>{error}</InlineAlert> : null}

        <TextField
          label="Full name"
          name="fullName"
          autoComplete="name"
          inputClassName="h-12 text-[16px]"
          value={form.fullName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={fieldError('fullName')}
          aria-invalid={Boolean(fieldError('fullName'))}
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
          label="Phone number"
          name="phoneNumber"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          inputClassName="h-12 text-[16px]"
          value={form.phoneNumber}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="+250 788 000 000"
          error={fieldError('phoneNumber')}
          hint="The conductor may call this number before departure."
          aria-invalid={Boolean(fieldError('phoneNumber'))}
          required
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          inputClassName="h-12 text-[16px]"
          value={form.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={fieldError('password')}
          hint={<PasswordRule met={form.password.length >= MIN_PASSWORD_LENGTH} />}
          aria-invalid={Boolean(fieldError('password'))}
          required
        />

        <div className="pt-1">
          <label className="flex cursor-pointer items-start gap-2.5 py-1 text-[13px] leading-relaxed text-muted">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => {
                setAgreed(event.target.checked);
                setTouched((current) => ({ ...current, agreed: true }));
                if (error) setError('');
              }}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-[2px] border border-border accent-[#EC5E27]"
            />
            <span>
              I agree to the{' '}
              <a
                href="#terms"
                onClick={(event) => event.preventDefault()}
                className="text-navy underline decoration-navy/35 underline-offset-2 transition hover:text-accent hover:decoration-accent"
              >
                Terms of Use
              </a>
            </span>
          </label>
          {attempted && errors.agreed ? (
            <p className="field-error">{errors.agreed}</p>
          ) : null}
        </div>

        <Button type="submit" size="lg" className="mt-1" loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
