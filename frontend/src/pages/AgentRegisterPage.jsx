import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { authApi } from '../api/auth.js';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import Button from '../components/ui/Button.jsx';
import { TextField } from '../components/ui/Fields.jsx';
import InlineAlert from '../components/ui/InlineAlert.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import useErrorFocus from '../hooks/useErrorFocus.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[\d\s()-]{7,20}$/;
const MIN_PASSWORD_LENGTH = 8;

const emptyForm = {
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
  agencyName: '',
  agencyAddress: '',
  agencyRegistrationNo: '',
};

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

  if (!form.agencyName.trim()) {
    errors.agencyName = 'Enter the name of your agency or counter.';
  }

  if (!form.agencyAddress.trim()) {
    errors.agencyAddress = 'Enter the address passengers come to for your counter.';
  }

  if (!agreed) {
    errors.agreed = 'Please confirm the agency terms to continue.';
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

export default function AgentRegisterPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [agreed, setAgreed] = useState(false);
  const [touched, setTouched] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState(null);
  const { formRef, markAttempt } = useErrorFocus(error);

  if (user) {
    return (
      <Navigate
        to={user.role === 'passenger' ? '/passenger/dashboard' : '/dashboard'}
        replace
      />
    );
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

    if (!isComplete) {
      markAttempt();
      return;
    }

    setSubmitting(true);

    try {
      const result = await authApi.registerAgent({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
        agencyName: form.agencyName.trim(),
        agencyAddress: form.agencyAddress.trim(),
        agencyRegistrationNo: form.agencyRegistrationNo.trim(),
      });
      setApplication(result.application);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (application) {
    return (
      <AuthLayout
        eyebrow="Application received"
        title="Your counter is in review"
        description={
          <>
            We have your details for{' '}
            <span className="font-medium text-navy">{application.agencyName}</span>.
            An administrator checks every agency before it can sell seats, so the
            account is not active yet.
          </>
        }
      >
        <dl className="divide-y divide-border border-y border-border text-[13px]">
          <div className="flex items-baseline justify-between gap-4 py-3">
            <dt className="text-muted">Sign-in email</dt>
            <dd className="font-medium text-navy">{application.email}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 py-3">
            <dt className="text-muted">Counter</dt>
            <dd className="text-right font-medium text-navy">
              {application.agencyAddress}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 py-3">
            <dt className="text-muted">Status</dt>
            <dd className="font-medium text-navy">Pending approval</dd>
          </div>
        </dl>

        <p className="mt-6 text-[13px] leading-relaxed text-muted">
          Once it is approved, sign in with the email and password you just chose
          to open the booking desk, sell seats and print tickets.
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <Link
            to="/login"
            className="inline-flex h-12 items-center justify-center rounded-[4px] bg-accent px-6 text-[14px] font-semibold text-white transition hover:bg-accent/90"
          >
            Go to sign in
          </Link>
          <Link
            to="/"
            className="inline-flex h-12 items-center justify-center rounded-[4px] border border-border px-6 text-[13.5px] font-medium text-navy transition hover:border-navy/35"
          >
            Back to the passenger site
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Apply for an agent account"
      footer={
        <p className="text-[13.5px] text-muted">
          Already approved?{' '}
          <Link
            to="/login"
            className="font-semibold text-navy underline decoration-navy/35 underline-offset-2 transition hover:text-accent hover:decoration-accent"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form ref={formRef} className="space-y-4" onSubmit={handleSubmit} noValidate>
        {error ? <InlineAlert>{error}</InlineAlert> : null}

        <fieldset className="space-y-4">
          <legend className="text-[11px] font-semibold uppercase tracking-[0.1em] text-navy/60">
            You
          </legend>

          <TextField
            label="Full name"
            name="fullName"
            autoComplete="name"
            inputClassName="h-11 text-[16px]"
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
            inputClassName="h-11 text-[16px]"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={fieldError('email')}
            hint="This becomes your sign-in email once the account is approved."
            aria-invalid={Boolean(fieldError('email'))}
            required
          />

          <TextField
            label="Phone number"
            name="phoneNumber"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            inputClassName="h-11 text-[16px]"
            value={form.phoneNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="+250 788 000 000"
            error={fieldError('phoneNumber')}
            aria-invalid={Boolean(fieldError('phoneNumber'))}
            required
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            inputClassName="h-11 text-[16px]"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={fieldError('password')}
            hint={<PasswordRule met={form.password.length >= MIN_PASSWORD_LENGTH} />}
            aria-invalid={Boolean(fieldError('password'))}
            required
          />
        </fieldset>

        <fieldset className="space-y-4 border-t border-border pt-5">
          <legend className="text-[11px] font-semibold uppercase tracking-[0.1em] text-navy/60">
            Your counter
          </legend>

          <TextField
            label="Agency or counter name"
            name="agencyName"
            autoComplete="organization"
            inputClassName="h-11 text-[16px]"
            value={form.agencyName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={fieldError('agencyName')}
            aria-invalid={Boolean(fieldError('agencyName'))}
            required
          />

          <TextField
            label="Counter address"
            name="agencyAddress"
            autoComplete="street-address"
            inputClassName="h-11 text-[16px]"
            value={form.agencyAddress}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Nyabugogo main terminal, Kigali"
            error={fieldError('agencyAddress')}
            hint="Where passengers collect the tickets you sell."
            aria-invalid={Boolean(fieldError('agencyAddress'))}
            required
          />

          <TextField
            label="Company registration number"
            name="agencyRegistrationNo"
            inputClassName="h-11 text-[16px]"
            value={form.agencyRegistrationNo}
            onChange={handleChange}
            hint="Optional. Leave it blank if your counter is not registered yet."
          />
        </fieldset>

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
              I confirm these counter details are accurate and agree to the{' '}
              <Link
                to="/terms"
                className="text-navy underline decoration-navy/35 underline-offset-2 transition hover:text-accent hover:decoration-accent"
              >
                Terms of Use
              </Link>
              .
            </span>
          </label>
          {attempted && errors.agreed ? (
            <p className="field-error">{errors.agreed}</p>
          ) : null}
        </div>

        <Button type="submit" size="lg" className="mt-1" loading={submitting}>
          Submit application
        </Button>
      </form>
    </AuthLayout>
  );
}
