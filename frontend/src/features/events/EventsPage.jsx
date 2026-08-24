import { useEffect, useState } from "react";
import { listEvents } from "../../services/eventService";
import EventCard from "./EventCard";
import EventDetailModal from "./EventDetailModal";
import "./EventsPage.css";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openEventId, setOpenEventId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    listEvents({ search, page })
      .then((data) => {
        setEvents(data.events);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => setError("Não foi possível carregar os eventos."))
      .finally(() => setLoading(false));
  }, [search, page]);

  function goToPage(newPage) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="events-page">
      <header className="events-header">
        <p className="events-logo">
          <img src="/logo-elite.png" alt="" className="events-logo-icon" />
          EliteTicket
        </p>
        <h1>Eventos em cartaz</h1>

        <div className="events-search">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por artista, show ou cidade"
          />
        </div>
      </header>

      {loading && <p className="events-status">Carregando eventos...</p>}
      {error && <p className="events-status error">{error}</p>}
      {!loading && !error && events.length === 0 && (
        <p className="events-status">Nenhum evento encontrado.</p>
      )}

      <div className="events-grid">
        {events.map((event) => (
          <EventCard key={event.id} event={event} onOpen={setOpenEventId} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="events-pagination">
          <button
            className="events-page-arrow"
            disabled={page === 1}
            onClick={() => goToPage(page - 1)}
          >
            &larr;
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`events-page-number ${p === page ? "active" : ""}`}
              onClick={() => goToPage(p)}
            >
              {p}
            </button>
          ))}

          <button
            className="events-page-arrow"
            disabled={page === totalPages}
            onClick={() => goToPage(page + 1)}
          >
            &rarr;
          </button>
        </nav>
      )}

      {openEventId && (
        <EventDetailModal
          eventId={openEventId}
          onClose={() => setOpenEventId(null)}
        />
      )}
    </div>
  );
}
