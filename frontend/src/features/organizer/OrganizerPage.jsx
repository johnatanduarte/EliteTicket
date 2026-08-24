import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listMyEvents, deleteEvent } from "../../services/eventService";
import TicketCard from "../../components/TicketCard";
import "./OrganizerPage.css";
import { useAuthModal } from "../../context/AuthModalContext";

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(price) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}

export default function OrganizerPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    if (!localStorage.getItem("eliteticket_token")) {
      navigate("/");
      openAuthModal();
      return;
    }
    loadEvents();
  }, [navigate]);

  function loadEvents() {
    setLoading(true);
    listMyEvents()
      .then(setEvents)
      .catch(() => setError("Não foi possível carregar seus eventos."))
      .finally(() => setLoading(false));
  }

  async function handleDelete(id) {
    if (
      !window.confirm("Excluir este evento? Esta ação não pode ser desfeita.")
    )
      return;
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Não foi possível excluir o evento.");
    }
  }

  return (
    <div className="organizer-page">
      <header className="organizer-header">
        <p className="organizer-logo">EliteTicket · Organizador</p>
        <div className="organizer-title-row">
          <h1>Meus eventos</h1>
          <Link to="/organizer/new" className="organizer-new-button">
            + Novo evento
          </Link>
        </div>
      </header>

      {loading && <p className="organizer-status">Carregando...</p>}
      {error && <p className="organizer-status error">{error}</p>}
      {!loading && !error && events.length === 0 && (
        <p className="organizer-status">Você ainda não criou nenhum evento.</p>
      )}

      <div className="organizer-list">
        {events.map((event) => (
          <TicketCard key={event.id} className="organizer-event-card">
            <h2 className="organizer-event-title">{event.title}</h2>
            <p className="organizer-event-meta">
              {formatDate(event.date)} · {event.location}
            </p>

            <hr className="ticket-divider" />

            <div className="organizer-event-footer">
              <span>
                {formatPrice(event.price)} · {event.capacity} lugares
              </span>
              <div className="organizer-event-actions">
                <Link
                  to={`/organizer/${event.id}/edit`}
                  className="organizer-action-link"
                >
                  Editar
                </Link>
                <button
                  className="organizer-action-delete"
                  onClick={() => handleDelete(event.id)}
                >
                  Excluir
                </button>
              </div>
            </div>
          </TicketCard>
        ))}
      </div>
    </div>
  );
}
