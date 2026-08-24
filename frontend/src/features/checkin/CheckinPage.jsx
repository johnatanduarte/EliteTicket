import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listEvents } from "../../services/eventService";
import { validateTicket } from "../../services/checkinService";
import TicketCard from "../../components/TicketCard";
import QrScanner from "./QrScanner";
import "./CheckinPage.css";
import { useAuthModal } from "../../context/AuthModalContext";

const RESULT_STYLE = {
  VALID: { label: "Válido", className: "result-valid" },
  INVALID: { label: "Inválido", className: "result-invalid" },
  USED: { label: "Já utilizado", className: "result-used" },
  WRONG_EVENT: { label: "Evento errado", className: "result-wrong" },
  ERROR: { label: "Erro", className: "result-invalid" },
};

export default function CheckinPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [mode, setMode] = useState(null); // 'camera' | 'manual'
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    if (!localStorage.getItem("eliteticket_token")) {
      navigate("/login");
      return;
    }
    listEvents({ pageSize: 100 }).then((data) => setEvents(data.events));
  }, [navigate]);

  async function handleValidate(qrCode) {
    if (!qrCode || !eventId) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await validateTicket(qrCode, eventId);
      setResult(data);
    } catch (err) {
      setResult({
        result: "ERROR",
        message: err.response?.data?.message || "Erro ao validar",
      });
    } finally {
      setLoading(false);
      setMode(null);
    }
  }

  function handleManualSubmit(e) {
    e.preventDefault();
    handleValidate(manualCode.trim());
    setManualCode("");
  }

  const resultStyle = result
    ? RESULT_STYLE[result.result] || RESULT_STYLE.ERROR
    : null;

  return (
    <div className="checkin-page">
      <header className="checkin-header">
        <p className="checkin-logo">EliteTicket · Portaria</p>
        <h1>Validar ingresso</h1>
      </header>

      <TicketCard className="checkin-card">
        <label className="checkin-event-select">
          Evento
          <select
            value={eventId}
            onChange={(e) => {
              setEventId(e.target.value);
              setResult(null);
            }}
          >
            <option value="">Selecione o evento</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        </label>

        <hr className="ticket-divider" />

        {!eventId && (
          <p className="checkin-hint">
            Selecione um evento para começar a validar ingressos.
          </p>
        )}

        {eventId && !mode && !loading && (
          <div className="checkin-actions">
            <button
              className="checkin-button"
              onClick={() => setMode("camera")}
            >
              Ler QR pela câmera
            </button>
            <button
              className="checkin-button-outline"
              onClick={() => setMode("manual")}
            >
              Digitar código
            </button>
          </div>
        )}

        {mode === "camera" && (
          <>
            <QrScanner active={mode === "camera"} onScan={handleValidate} />
            <button className="checkin-cancel" onClick={() => setMode(null)}>
              Cancelar leitura
            </button>
          </>
        )}

        {mode === "manual" && (
          <form onSubmit={handleManualSubmit} className="checkin-manual-form">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Cole ou digite o código do ingresso"
              autoFocus
              required
            />
            <div className="checkin-actions">
              <button type="submit" className="checkin-button">
                Validar
              </button>
              <button
                type="button"
                className="checkin-button-outline"
                onClick={() => setMode(null)}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {loading && <p className="checkin-hint">Validando...</p>}

        {result && (
          <div className={`checkin-result ${resultStyle.className}`}>
            <span className="checkin-result-label">{resultStyle.label}</span>
            <p className="checkin-result-message">{result.message}</p>
            {result.customerName && (
              <p className="checkin-result-detail">
                Cliente: {result.customerName}
              </p>
            )}
            {result.quantity && (
              <p className="checkin-result-detail">
                Ingressos: {result.quantity}
              </p>
            )}
            <button
              className="checkin-button-outline"
              onClick={() => setResult(null)}
            >
              Validar outro ingresso
            </button>
          </div>
        )}
      </TicketCard>
    </div>
  );
}
