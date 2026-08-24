import './TicketCard.css';

export default function TicketCard({ children, className = '', onClick }) {
  return (
    <div className={`ticket-card ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}