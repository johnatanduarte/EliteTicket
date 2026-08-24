import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthModal } from "../context/AuthModalContext";
import ConfirmModal from "./ConfirmModal";
import "./Navbar.css";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("eliteticket_user"));
  } catch {
    return null;
  }
}

export default function Navbar() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const { openAuthModal } = useAuthModal();

  function handleLogout() {
    localStorage.removeItem("eliteticket_token");
    localStorage.removeItem("eliteticket_user");
    setConfirmingLogout(false);
    navigate("/");
  }

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-logo">
          <img src="/logo-elite.png" alt="" className="navbar-logo-icon" />
          EliteTicket
        </Link>

        <div className="navbar-links">
          {!user && (
            <button
              className="navbar-link navbar-link-button"
              onClick={openAuthModal}
            >
              Entrar
            </button>
          )}

          {user?.role === "CUSTOMER" && (
            <>
              <Link to="/" className="navbar-link">
                Eventos
              </Link>
              <Link to="/tickets" className="navbar-link">
                Meus ingressos
              </Link>
            </>
          )}

          {user?.role === "ORGANIZER" && (
            <Link to="/organizer" className="navbar-link">
              Meus eventos
            </Link>
          )}

          {user?.role === "STAFF" && (
            <Link to="/checkin" className="navbar-link">
              Portaria
            </Link>
          )}

          {user && (
            <button
              className="navbar-logout"
              onClick={() => setConfirmingLogout(true)}
            >
              Sair
            </button>
          )}
        </div>
      </nav>

      <ConfirmModal
        open={confirmingLogout}
        title="Sair da conta?"
        message={`Você vai precisar entrar novamente para acessar${user?.role === "CUSTOMER" ? " seus ingressos." : "."}`}
        confirmLabel="Sair"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleLogout}
        onCancel={() => setConfirmingLogout(false)}
      />
    </>
  );
}
