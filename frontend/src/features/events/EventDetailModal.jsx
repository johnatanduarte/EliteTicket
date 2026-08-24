import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvent } from '../../services/eventService';
import TicketCard from '../../components/TicketCard';
import { useAuthModal } from '../../context/AuthModalContext';
import './EventDetailModal.css';

const SOURCE_LABEL = {
  TICKETMASTER: 'Show',
  TMDB: 'Filme',
};

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(price) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
}

export default function EventDetailModal({ eventId, onClose }) {
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setEvent(null);
    getEvent(eventId)
      .then(setEvent)
      .catch(() => setError('Evento não encontrado.'))
      .finally(() => setLoading(false));
  }, [eventId]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleReserve() {
    if (!localStorage.getItem('eliteticket_token')) {
      onClose();
      openAuthModal();
      return;
    }
    navigate(`/events/${eventId}/checkout`);
  }

  return (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal-wrap" onClick={(e) => e.stopPropagation()}>
        <button className="event-modal-close" onClick={onClose} aria-label="Fechar">
          ×
        </button>

        <TicketCard className="event-modal-card">
          {loading && <p className="detail-status">Carregando...</p>}
          {error && <p className="detail-status error">{error}</p>}

          {event && (
            <>
              {event.image && (
                <img src={event.image} alt="" className="detail-card-image" />
              )}

              <span className="event-tag">{SOURCE_LABEL[event.source] || event.source}</span>
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

              <button className="reserve-button" onClick={handleReserve}>
                Reservar ingresso
              </button>
            </>
          )}
        </TicketCard>
      </div>
    </div>
  );
}