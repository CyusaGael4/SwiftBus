import { useEffect, useRef, useState } from 'react';

// When a form submission fails, the message can land above or below the visible
// part of the card (especially on a phone). This scrolls the first problem into
// view and puts the cursor on the field that caused it.
function reveal(target) {
  if (!target) return;

  target.scrollIntoView({ block: 'center', behavior: 'smooth' });

  const field = target.matches('input, select, textarea')
    ? target
    : target.closest('div')?.querySelector('input, select, textarea');

  if (field) field.focus({ preventScroll: true });
}

export default function useErrorFocus(error) {
  const formRef = useRef(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!attempt) return;

    const form = formRef.current;
    if (!form) return;

    reveal(
      form.querySelector('[aria-invalid="true"]') ||
        form.querySelector('.field-error')
    );
  }, [attempt]);

  // A request error (wrong password, email already used) arrives after the
  // browser checks pass, so it is handled on its own.
  useEffect(() => {
    if (!error) return;

    reveal(formRef.current?.querySelector('[role="alert"]'));
  }, [error]);

  const markAttempt = () => setAttempt((current) => current + 1);

  return { formRef, markAttempt };
}
