import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  getEvent,
  createEvent,
  updateEvent,
} from "../../services/eventService";
import { searchCatalog } from "../../services/catalogService";
import TicketCard from "../../components/TicketCard";
import "./EventFormPage.css";
import { useAuthModal } from "../../context/AuthModalContext";

const EMPTY_FORM = {
  title: "",
  source: "TICKETMASTER",
  externalId: "",
  date: "",
  location: "",
  capacity: "",
  price: "",
};

function toDatetimeLocal(isoString) {
  if (!isoString) return "";
  return isoString.slice(0, 16);
}

export default function EventFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(isEditing);

  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedExternalId, setSelectedExternalId] = useState("");
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    if (!localStorage.getItem("eliteticket_token")) {
      navigate("/");
      openAuthModal();
      return;
    }
    if (isEditing) {
      getEvent(id)
        .then((event) => {
          setForm({
            title: event.title,
            source: event.source,
            externalId: event.externalId,
            date: toDatetimeLocal(event.date),
            location: event.location,
            capacity: event.capacity,
            price: event.price,
          });
          setSelectedExternalId(event.externalId);
        })
        .catch(() => setError("Não foi possível carregar o evento."))
        .finally(() => setLoadingEvent(false));
    }
  }, [id, isEditing, navigate]);

  useEffect(() => {
    if (isEditing) return;

    if (!keyword.trim()) {
      setSearchResults([]);
      setSearchError("");
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError("");
      try {
        const results = await searchCatalog(keyword);
        setSearchResults(results);
        if (results.length === 0)
          setSearchError(
            "Nenhum show encontrado. Tente digitar o nome completo do artista ou show.",
          );
      } catch (err) {
        setSearchError("Não foi possível buscar no catálogo agora.");
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [keyword, isEditing]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSelectResult(result) {
    setForm({
      ...form,
      title: result.title,
      source: "TICKETMASTER",
      externalId: result.externalId,
      date: toDatetimeLocal(result.date),
      location: result.location,
    });
    setSelectedExternalId(result.externalId);
    setSearchResults([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      ...form,
      capacity: Number(form.capacity),
      price: Number(form.price),
    };

    try {
      if (isEditing) {
        await updateEvent(id, payload);
      } else {
        await createEvent(payload);
      }
      navigate("/organizer");
    } catch (err) {
      setError(
        err.response?.data?.error || "Não foi possível salvar o evento.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (loadingEvent) return <p className="event-form-status">Carregando...</p>;

  return (
    <div className="event-form-page">
      <Link to="/organizer" className="back-link">
        &larr; Meus eventos
      </Link>

      {!isEditing && (
        <TicketCard className="catalog-search-card">
          <span className="catalog-search-label">
            Buscar no catálogo (Ticketmaster)
          </span>
          <div className="catalog-search-form">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Nome do artista ou show"
            />
          </div>
          <p className="catalog-search-tip">
            Digite o nome completo do artista para melhores resultados.
          </p>

          {searching && <p className="catalog-search-hint">Buscando...</p>}
          {searchError && <p className="catalog-search-error">{searchError}</p>}

          {searchResults.length > 0 && (
            <div className="catalog-results">
              {searchResults.map((result) => (
                <button
                  type="button"
                  key={result.externalId}
                  className={`catalog-result ${selectedExternalId === result.externalId ? "selected" : ""}`}
                  onClick={() => handleSelectResult(result)}
                >
                  {result.image && <img src={result.image} alt="" />}
                  <div className="catalog-result-info">
                    <span className="catalog-result-title">{result.title}</span>
                    <span className="catalog-result-meta">
                      {result.date
                        ? new Date(result.date).toLocaleDateString("pt-BR")
                        : "Data a definir"}{" "}
                      · {result.location}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </TicketCard>
      )}

      <TicketCard className="event-form-card">
        <h1 className="event-form-title">
          {isEditing ? "Editar evento" : "Novo evento"}
        </h1>
        {!isEditing && (
          <p className="event-form-hint">
            {selectedExternalId
              ? "Preenchido a partir do catálogo — ajuste o que precisar."
              : "Busque um show acima ou preencha manualmente."}
          </p>
        )}

        <hr className="ticket-divider" />

        <form onSubmit={handleSubmit} className="event-form">
          <label>
            Título
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Origem do catálogo
            <select name="source" value={form.source} onChange={handleChange}>
              <option value="TICKETMASTER">Show (Ticketmaster)</option>
              <option value="TMDB">Filme (TMDb)</option>
            </select>
          </label>

          <label>
            ID externo (do catálogo)
            <input
              name="externalId"
              value={form.externalId}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Data e hora
            <input
              type="datetime-local"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Local
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              required
            />
          </label>

          <div className="event-form-row">
            <label>
              Capacidade
              <input
                type="number"
                name="capacity"
                min="1"
                value={form.capacity}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Preço (R$)
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          {error && <p className="event-form-error">{error}</p>}

          <button
            type="submit"
            className="event-form-submit"
            disabled={loading}
          >
            {loading
              ? "Salvando..."
              : isEditing
                ? "Salvar alterações"
                : "Criar evento"}
          </button>
        </form>
      </TicketCard>
    </div>
  );
}
