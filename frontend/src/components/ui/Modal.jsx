import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-[540px]',
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/45 p-4 backdrop-blur-[1px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <section
        className={`max-h-[92vh] w-full ${maxWidth} animate-fade-in overflow-hidden rounded-[6px] border border-border bg-surface shadow-modal`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-4 py-4 sm:gap-6 sm:px-6 sm:py-5">
          <div>
            <h2 id="modal-title" className="text-[19px] font-semibold text-navy">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-[12.5px] text-muted">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded text-[22px] leading-none text-muted transition hover:bg-black/5 hover:text-navy"
            aria-label="Close dialog"
          >
            ×
          </button>
        </header>

        <div className="max-h-[calc(92vh-150px)] overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {children}
        </div>

        {footer ? (
          <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-border bg-table-head/50 px-4 py-3 sm:px-6 sm:py-4">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>,
    document.body
  );
}
