import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getEvent } from "../../services/eventService";
import {
  createReservation,
  payReservation,
} from "../../services/reservationService";
import TicketCard from "../../components/TicketCard";
import "./CheckoutPage.css";
import { useAuthModal } from "../../context/AuthModalContext";

function formatPrice(price) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}

export default function CheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState("select"); // select | paying | declined
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    if (!localStorage.getItem("eliteticket_token")) {
      navigate("/");
      openAuthModal();
      return;
    }
    getEvent(id)
      .then(setEvent)
      .catch(() => setError("Evento não encontrado."));
  }, [id, navigate]);

  async function handleReserve() {
    setError("");
    setLoading(true);
    try {
      const res = await createReservation(id, quantity);
      setReservation(res);
      setStep("paying");
    } catch (err) {
      setError(
        err.response?.data?.error || "Não foi possível criar a reserva.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handlePayment(approve) {
    setError("");
    setLoading(true);
    try {
      const result = await payReservation(reservation.id, approve);
      if (approve) {
        navigate(`/tickets`, { state: { justPurchased: result } });
      } else {
        setStep("declined");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao processar pagamento.");
    } finally {
      setLoading(false);
    }
  }

  if (!event)
    return <p className="checkout-status">{error || "Carregando..."}</p>;

  const total = event.price * quantity;

  return (
    <div className="checkout-page">
      <Link to={`/events/${id}`} className="back-link">
        &larr; Voltar ao evento
      </Link>

      <TicketCard className="checkout-card">
        <span className="checkout-step-label">
          {step === "select" && "Escolha a quantidade"}
          {step === "paying" && "Confirmar pagamento"}
          {step === "declined" && "Pagamento recusado"}
        </span>

        <h1 className="checkout-title">{event.title}</h1>

        <hr className="ticket-divider" />

        {step === "select" && (
          <>
            <div className="quantity-row">
              <span>Ingressos</span>
              <div className="quantity-control">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                >
                  +
                </button>
              </div>
            </div>

            <div className="total-row">
              <span>Total</span>
              <span className="total-value">{formatPrice(total)}</span>
            </div>

            {error && <p className="checkout-error">{error}</p>}

            <button
              className="checkout-button"
              onClick={handleReserve}
              disabled={loading}
            >
              {loading ? "Aguarde..." : "Continuar"}
            </button>
          </>
        )}

        {step === "paying" && (
          <>
            <p className="checkout-summary">
              {quantity} ingresso(s) · {formatPrice(total)}
            </p>
            <p className="checkout-note">
              Pagamento simulado — nenhuma cobrança real será feita.
            </p>

            {error && <p className="checkout-error">{error}</p>}

            <div className="payment-actions">
              <button
                className="checkout-button"
                onClick={() => handlePayment(true)}
                disabled={loading}
              >
                {loading ? "Processando..." : "Confirmar pagamento"}
              </button>
              <button
                className="checkout-button-outline"
                onClick={() => handlePayment(false)}
                disabled={loading}
              >
                Simular recusa
              </button>
            </div>
          </>
        )}

        {step === "declined" && (
          <>
            <p className="checkout-declined">
              Seu pagamento foi recusado. Nenhum valor foi cobrado e o lugar foi
              liberado.
            </p>
            <Link to={`/events/${id}`} className="checkout-button-link">
              Voltar ao evento
            </Link>
          </>
        )}
      </TicketCard>
    </div>
  );
}
