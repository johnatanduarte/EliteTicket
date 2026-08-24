import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getEvent } from "../../services/eventService";
import TicketCard from "../../components/TicketCard";
import "./EventDetailPage.css";

const SOURCE_LABEL = {
  TICKETMASTER: "Show",
  TMDB: "Filme",
};

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(price) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}

export default function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getEvent(id)
      .then(setEvent)
      .catch(() => setError("Evento não encontrado."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="detail-status">Carregando...</p>;
  if (error) return <p className="detail-status error">{error}</p>;

  return (
    <div className="event-detail-page">
      <Link to="/" className="back-link">
        &larr; Voltar aos eventos
      </Link>

      <TicketCard className="detail-card">
        {event.image && (
          <img src={event.image} alt="" className="detail-card-image" />
        )}

        <span className="event-tag">
          {SOURCE_LABEL[event.source] || event.source}
        </span>
        <h1 className="detail-title">{event.title}</h1>
        <p className="detail-date">{formatDate(event.date)}</p>
        <p className="detail-location">{event.location}</p>

        <hr className="ticket-divider" />

        <div className="detail-footer">
          <div>
            <span className="detail-label">Preço por ingresso</span>
            <span className="detail-price">{formatPrice(event.price)}</span>
          </div>
          <div>
            <span className="detail-label">Capacidade</span>
            <span className="detail-capacity">{event.capacity} lugares</span>
          </div>
        </div>

        <button
          className="reserve-button"
          onClick={() => navigate(`/events/${event.id}/checkout`)}
        >
          Reservar ingresso
        </button>
      </TicketCard>
    </div>
  );
}
