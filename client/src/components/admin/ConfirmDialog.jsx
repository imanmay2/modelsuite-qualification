import { createPortal } from 'react-dom';

const ConfirmDialog = ({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onCancel,
  onConfirm,
}) => {
  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[300] p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={onCancel}>
      <div
        className="bg-bg-card border border-border rounded-xl w-full max-w-sm shadow-[0_32px_80px_rgba(0,0,0,0.65)] animate-modal-in"
        onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-border">
          <h2 id="confirm-dialog-title" className="text-[17px] font-semibold text-text-primary">
            {title}
          </h2>
        </div>

        <div className="p-6">
          <p className="text-[14px] leading-relaxed text-text-muted [overflow-wrap:anywhere]">
            {message}
          </p>

          <div className="flex gap-3 pt-5 mt-5 border-t border-border">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 bg-bg-input text-text-muted border border-border rounded-lg text-sm font-medium cursor-pointer hover:bg-bg-hover hover:text-text-primary transition-all font-sans">
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 py-2.5 bg-danger/10 text-danger border border-danger/30 rounded-lg text-sm font-semibold cursor-pointer hover:bg-danger/20 transition-all font-sans">
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDialog;
