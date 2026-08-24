import { Link } from 'react-router-dom';
import TicketCard from '../../components/TicketCard';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <p className="not-found-logo">
        <img src="/logo-elite.png" alt="" className="not-found-logo-icon" />
        EliteTicket
      </p>

      <TicketCard className="not-found-card">
        <span className="not-found-stamp">CANCELADO</span>

        <span className="not-found-code">ERRO 404</span>
        <h1 className="not-found-title">Página não encontrada</h1>

        <hr className="ticket-divider" />

        <p className="not-found-message">
          Esse link não corresponde a nenhuma página válida. Pode ser um endereço
          digitado errado ou um link que não existe mais.
        </p>

        <Link to="/" className="not-found-button">
          Voltar aos eventos
        </Link>
      </TicketCard>
    </div>
  );
}