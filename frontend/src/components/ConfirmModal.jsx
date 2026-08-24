import { useEffect } from "react";
import TicketCard from "./TicketCard";
import "./ConfirmModal.css";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <TicketCard
        className="confirm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="confirm-title">{title}</h2>
        <p className="confirm-message">{message}</p>

        <hr className="ticket-divider" />

        <div className="confirm-actions">
          <button className="confirm-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={`confirm-confirm ${variant === "danger" ? "danger" : ""}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </TicketCard>
    </div>
  );
}
