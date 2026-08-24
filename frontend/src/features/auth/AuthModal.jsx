import { useNavigate } from "react-router-dom";
import { useAuthModal } from "../../context/AuthModalContext";
import AuthFormCard from "./AuthFormCard";
import "./AuthModal.css";

export default function AuthModal() {
  const { isOpen, closeAuthModal } = useAuthModal();
  const navigate = useNavigate();

  if (!isOpen) return null;

  function handleSuccess(user) {
    closeAuthModal();
    if (user.role === "ORGANIZER") {
      navigate("/organizer");
    } else if (user.role === "STAFF") {
      navigate("/checkin");
    } else {
      navigate("/");
    }
  }

  return (
    <div className="auth-modal-overlay" onClick={closeAuthModal}>
      <div className="auth-modal-wrap" onClick={(e) => e.stopPropagation()}>
        <button
          className="auth-modal-close"
          onClick={closeAuthModal}
          aria-label="Fechar"
        >
          ×
        </button>
        <AuthFormCard
          onSuccess={handleSuccess}
          cardClassName="auth-card auth-modal-card"
        />
      </div>
    </div>
  );
}
