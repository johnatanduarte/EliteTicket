import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { listMyReservations } from '../../services/reservationService';
import TicketCard from '../../components/TicketCard';
import './TicketsPage.css';

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_LABEL = {
  VALID: { text: 'Válido', className: 'status-valid' },
  USED: { text: 'Já utilizado', className: 'status-used' },
};

const FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'VALID', label: 'Válidos' },
  { value: 'USED', label: 'Já utilizados' },
];

function TicketItem({ reservation }) {
  const { event, ticket } = reservation;
  const [copied, setCopied] = useState(false);

  if (!ticket) return null;

  const shareUrl = `${window.location.origin}/tickets/shared/${ticket.id}`;

  function handleShare() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const status = STATUS_LABEL[ticket.status] || STATUS_LABEL.VALID;

  return (
    <TicketCard className="ticket-item">
      <div className="ticket-item-header">
        <div>
          <h2 className="ticket-item-title">{event.title}</h2>
          <p className="ticket-item-meta">{formatDate(event.date)} · {event.location}</p>
        </div>
        <span className={`ticket-status ${status.className}`}>{status.text}</span>
      </div>

      <hr className="ticket-divider" />

      <div className="ticket-qr-wrap">
        <QRCodeSVG value={ticket.qrCode} size={140} fgColor="#14161F" />
        <p className="ticket-code">{ticket.qrCode.slice(0, 8)}...</p>
      </div>

      <button className="ticket-share-button" onClick={handleShare}>
        {copied ? 'Link copiado!' : 'Compartilhar ingresso'}
      </button>
    </TicketCard>
  );
}

export default function TicketsPage() {
  const location = useLocation();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    listMyReservations()
      .then(setReservations)
      .catch(() => setError('Não foi possível carregar seus ingressos.'))
      .finally(() => setLoading(false));
  }, []);

  const paidReservations = reservations.filter((r) => r.status === 'PAID' && r.ticket);
  const filteredReservations = paidReservations.filter((r) =>
    filter === 'all' ? true : r.ticket.status === filter
  );

  const counts = {
    all: paidReservations.length,
    VALID: paidReservations.filter((r) => r.ticket.status === 'VALID').length,
    USED: paidReservations.filter((r) => r.ticket.status === 'USED').length,
  };

  return (
    <div className="tickets-page">
      <header className="tickets-header">
        <Link to="/" className="back-link">&larr; Ver eventos</Link>
        <h1>Meus ingressos</h1>
      </header>

      {location.state?.justPurchased && (
        <p className="tickets-success">Ingresso comprado com sucesso! Confira abaixo.</p>
      )}

      {!loading && !error && paidReservations.length > 0 && (
        <div className="tickets-filters">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`tickets-filter ${filter === f.value ? 'active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label} <span className="tickets-filter-count">{counts[f.value]}</span>
            </button>
          ))}
        </div>
      )}

      {loading && <p className="tickets-status">Carregando...</p>}
      {error && <p className="tickets-status error">{error}</p>}
      {!loading && !error && paidReservations.length === 0 && (
        <p className="tickets-status">Você ainda não tem ingressos.</p>
      )}
      {!loading && !error && paidReservations.length > 0 && filteredReservations.length === 0 && (
        <p className="tickets-status">Nenhum ingresso nessa categoria.</p>
      )}

      <div className="tickets-list">
        {filteredReservations.map((reservation) => (
          <TicketItem key={reservation.id} reservation={reservation} />
        ))}
      </div>
    </div>
  );
}