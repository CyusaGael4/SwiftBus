import { useState } from 'react';
import { passengerApi } from '../../api/passenger.js';
import Button from '../../components/ui/Button.jsx';
import { TextField } from '../../components/ui/Fields.jsx';
import InlineAlert from '../../components/ui/InlineAlert.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDate, initials } from '../../lib/format.js';

const MIN_PASSWORD_LENGTH = 8;

function SectionCard({ title, description, children, footer }) {
  return (
    <section className="overflow-hidden rounded-[8px] border border-border bg-surface">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-[15px] font-semibold text-navy">{title}</h2>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{description}</p>
      </div>
      <div className="px-5 py-5">{children}</div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-table-head/60 px-5 py-3">
        {footer}
      </div>
    </section>
  );
}

export default function ProfilePage() {
  const { user, updateUser, signOut } = useAuth();

  const saved = {
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  };

  const [form, setForm] = useState(saved);
  const [profileState, setProfileState] = useState({ saving: false, error: '', notice: '' });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordState, setPasswordState] = useState({
    saving: false,
    error: '',
    notice: '',
  });

  const profileDirty =
    form.fullName !== saved.fullName ||
    form.email !== saved.email ||
    form.phoneNumber !== saved.phoneNumber;

  const newPasswordLongEnough = passwords.newPassword.length >= MIN_PASSWORD_LENGTH;
  const newPasswordsMatch =
    passwords.confirmPassword.length > 0 &&
    passwords.newPassword === passwords.confirmPassword;
  const passwordReady =
    passwords.currentPassword.length > 0 && newPasswordLongEnough && newPasswordsMatch;

  const handleProfile = async (event) => {
    event.preventDefault();
    if (!profileDirty || profileState.saving) return;

    setProfileState({ saving: true, error: '', notice: '' });

    try {
      const result = await passengerApi.updateProfile(form);
      updateUser(result.user);
      setForm({
        fullName: result.user.fullName || '',
        email: result.user.email || '',
        phoneNumber: result.user.phoneNumber || '',
      });
      setProfileState({ saving: false, error: '', notice: result.message });
    } catch (requestError) {
      setProfileState({ saving: false, error: requestError.message, notice: '' });
    }
  };

  const handlePassword = async (event) => {
    event.preventDefault();
    if (!passwordReady || passwordState.saving) return;

    setPasswordState({ saving: true, error: '', notice: '' });

    try {
      const result = await passengerApi.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordState({ saving: false, error: '', notice: result.message });
    } catch (requestError) {
      setPasswordState({ saving: false, error: requestError.message, notice: '' });
    }
  };

  return (
    <div className="passenger-shell py-6 lg:py-10">
      <div>
        <h1 className="text-[27px] font-semibold leading-tight tracking-[-0.025em] text-navy sm:text-[32px]">
          Profile
        </h1>
        <p className="mt-1.5 text-[13px] text-muted">
          Your personal details and how you sign in to SwiftBus.
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
        <aside className="lg:sticky lg:top-24">
          <section className="rounded-[8px] border border-border bg-surface">
            <div className="px-5 pb-5 pt-6">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy text-[17px] font-semibold text-cream">
                {initials(user?.fullName) || 'Me'}
              </span>
              <p className="mt-4 text-[16px] font-semibold leading-snug text-navy">
                {user?.fullName || 'Your account'}
              </p>
              <p className="mt-0.5 break-all text-[12.5px] text-muted">{user?.email}</p>

              <dl className="mt-5 space-y-2.5 border-t border-border pt-4 text-[12.5px]">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted">Phone</dt>
                  <dd className="text-right font-medium text-navy">
                    {user?.phoneNumber || 'Not added'}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted">Account</dt>
                  <dd className="text-right font-medium text-navy">Passenger</dd>
                </div>
                {user?.createdAt ? (
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-muted">Member since</dt>
                    <dd className="text-right font-medium text-navy">
                      {formatDate(user.createdAt)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>

            <div className="border-t border-border px-5 py-4">
              <p className="text-[11.5px] leading-relaxed text-muted">
                Signed in on this device
              </p>
              <Button
                variant="secondary"
                size="md"
                className="mt-2.5 w-full"
                onClick={signOut}
              >
                Sign out
              </Button>
            </div>
          </section>
        </aside>

        <div className="space-y-5">
          <SectionCard
            title="Personal details"
            description="Shown on your tickets and used when the conductor contacts you."
            footer={
              <>
                <span className="text-[11.5px] text-muted">
                  {profileDirty ? 'Unsaved changes' : ''}
                </span>
                <div className="ml-auto flex items-center gap-3">
                  {profileDirty ? (
                    <button
                      type="button"
                      onClick={() => {
                        setForm(saved);
                        setProfileState({ saving: false, error: '', notice: '' });
                      }}
                      className="text-[12px] font-medium text-muted transition hover:text-navy"
                    >
                      Discard
                    </button>
                  ) : null}
                  <Button
                    type="submit"
                    form="profile-details"
                    size="md"
                    loading={profileState.saving}
                    disabled={!profileDirty}
                  >
                    Save changes
                  </Button>
                </div>
              </>
            }
          >
            <form id="profile-details" onSubmit={handleProfile} noValidate>
              {profileState.error ? (
                <div className="mb-4">
                  <InlineAlert>{profileState.error}</InlineAlert>
                </div>
              ) : null}
              {profileState.notice ? (
                <div className="mb-4">
                  <InlineAlert tone="info">{profileState.notice}</InlineAlert>
                </div>
              ) : null}

              <div className="space-y-4">
                <TextField
                  label="Full name"
                  name="fullName"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, fullName: event.target.value }))
                  }
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
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  hint="Use this address the next time you sign in."
                  required
                />

                <TextField
                  label="Phone number"
                  name="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={form.phoneNumber}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, phoneNumber: event.target.value }))
                  }
                  hint="The conductor may call this number before departure."
                  required
                />
              </div>
            </form>
          </SectionCard>

          <SectionCard
            title="Password"
            description="Choose something you don't use on other sites."
            footer={
              <>
                <span className="text-[11.5px] text-muted">
                  {passwords.confirmPassword && !newPasswordsMatch
                    ? 'New passwords do not match'
                    : ''}
                </span>
                <Button
                  type="submit"
                  form="profile-password"
                  size="md"
                  className="ml-auto"
                  variant="secondary"
                  loading={passwordState.saving}
                  disabled={!passwordReady}
                >
                  Update password
                </Button>
              </>
            }
          >
            <form id="profile-password" onSubmit={handlePassword} noValidate>
              {passwordState.error ? (
                <div className="mb-4">
                  <InlineAlert>{passwordState.error}</InlineAlert>
                </div>
              ) : null}
              {passwordState.notice ? (
                <div className="mb-4">
                  <InlineAlert tone="info">{passwordState.notice}</InlineAlert>
                </div>
              ) : null}

              <div className="space-y-4">
                <TextField
                  label="Current password"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  value={passwords.currentPassword}
                  onChange={(event) =>
                    setPasswords((current) => ({
                      ...current,
                      currentPassword: event.target.value,
                    }))
                  }
                  required
                />

                <TextField
                  label="New password"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  value={passwords.newPassword}
                  onChange={(event) =>
                    setPasswords((current) => ({ ...current, newPassword: event.target.value }))
                  }
                  hint={
                    <span
                      className={`text-[11.5px] ${
                        newPasswordLongEnough ? 'text-success' : 'text-muted'
                      }`}
                    >
                      At least {MIN_PASSWORD_LENGTH} characters
                    </span>
                  }
                  required
                />

                <TextField
                  label="Confirm new password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={passwords.confirmPassword}
                  onChange={(event) =>
                    setPasswords((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                  error={
                    passwords.confirmPassword && !newPasswordsMatch
                      ? 'The new passwords do not match.'
                      : ''
                  }
                  required
                />
              </div>
            </form>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
