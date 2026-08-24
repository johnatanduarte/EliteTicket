import TicketCard from "../../components/TicketCard";
import "./EventCard.css";

const SOURCE_LABEL = {
  TICKETMASTER: "Show",
  TMDB: "Filme",
};

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

export default function EventCard({ event, onOpen }) {
  return (
    <TicketCard
      className="event-card clickable"
      onClick={() => onOpen(event.id)}
    >
      {event.image && (
        <img src={event.image} alt="" className="event-card-image" />
      )}

      <span className="event-tag">
        {SOURCE_LABEL[event.source] || event.source}
      </span>
      <h2 className="event-title">{event.title}</h2>
      <p className="event-meta">
        {formatDate(event.date)} · {event.location}
      </p>
      <hr className="ticket-divider" />
      <div className="event-footer">
        <span className="event-price">{formatPrice(event.price)}</span>
        <span className="event-capacity">{event.capacity} lugares</span>
      </div>
    </TicketCard>
  );
}
