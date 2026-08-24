import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { getSharedTicket } from "../../services/sharedTicketService";
import TicketCard from "../../components/TicketCard";
import "./SharedTicketPage.css";

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

const STATUS_LABEL = {
  VALID: { text: "Válido", className: "shared-status-valid" },
  USED: { text: "Já utilizado", className: "shared-status-used" },
};

export default function SharedTicketPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSharedTicket(ticketId)
      .then(setTicket)
      .catch(() => setError("Este ingresso não foi encontrado."))
      .finally(() => setLoading(false));
  }, [ticketId]);

  if (loading) return <p className="shared-status">Carregando...</p>;
  if (error) return <p className="shared-status error">{error}</p>;

  const status = STATUS_LABEL[ticket.status] || STATUS_LABEL.VALID;

  return (
    <div className="shared-page">
      <p className="shared-logo">EliteTicket</p>

      <TicketCard className="shared-card">
        <div className="shared-header">
          <h1 className="shared-title">{ticket.event.title}</h1>
          <span className={`shared-status-badge ${status.className}`}>
            {status.text}
          </span>
        </div>

        <p className="shared-meta">{formatDate(ticket.event.date)}</p>
        <p className="shared-meta">{ticket.event.location}</p>

        <hr className="ticket-divider" />

        <div className="shared-qr-wrap">
          <QRCodeSVG value={ticket.qrCode} size={160} fgColor="#14161F" />
          <p className="shared-quantity">{ticket.quantity} ingresso(s)</p>
        </div>
      </TicketCard>
    </div>
  );
}
