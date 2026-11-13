import { useId, useState } from 'react';

function EyeIcon({ hidden }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.25" stroke="currentColor" strokeWidth="1.6" />
      {hidden ? (
        <path
          d="M4 20 20 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ) : null}
    </svg>
  );
}

export function TextField({
  label,
  error,
  hint,
  className = '',
  inputClassName = '',
  type = 'text',
  ...props
}) {
  const generatedId = useId();
  const id = props.id || generatedId;
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={className}>
      {label ? (
        <label htmlFor={id} className="field-label">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={id}
          type={isPassword && visible ? 'text' : type}
          className={`field-input ${error ? 'border-[#C47B65]' : ''} ${
            isPassword ? 'pr-11' : ''
          } ${inputClassName}`}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded text-muted transition hover:text-navy focus:outline-none focus-visible:text-navy"
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            tabIndex={0}
          >
            <EyeIcon hidden={visible} />
          </button>
        ) : null}
      </div>
      {hint && !error ? <p className="mt-1.5 text-[11.5px] text-muted">{hint}</p> : null}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

export function SelectField({
  label,
  error,
  hint,
  options = [],
  placeholder,
  className = '',
  ...props
}) {
  const generatedId = useId();
  const id = props.id || generatedId;

  return (
    <div className={className}>
      {label ? (
        <label htmlFor={id} className="field-label">
          {label}
        </label>
      ) : null}
      <select
        id={id}
        className={`field-select ${error ? 'border-[#C47B65]' : ''}`}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && !error ? <p className="mt-1.5 text-[11.5px] text-muted">{hint}</p> : null}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
