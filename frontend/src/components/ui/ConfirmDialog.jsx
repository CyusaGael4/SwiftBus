import Button from './Button.jsx';
import Modal from './Modal.jsx';

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onClose,
  loading = false,
  error = '',
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="max-w-[420px]"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-[14px] leading-relaxed text-muted">{message}</p>
      {error ? (
        <p className="mt-3 rounded-[4px] border border-[#E3C4B8] bg-warning-soft px-3 py-2 text-[12.5px] text-[#8E4A33]">
          {error}
        </p>
      ) : null}
    </Modal>
  );
}
