import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthModalProvider } from "./context/AuthModalContext";
import Navbar from "./components/Navbar";
import AuthModal from "./features/auth/AuthModal";
import EventsPage from "./features/events/EventsPage";
import EventDetailPage from "./features/events/EventDetailPage";
import CheckoutPage from "./features/checkout/CheckoutPage";
import TicketsPage from "./features/tickets/TicketsPage";
import CheckinPage from "./features/checkin/CheckinPage";
import SharedTicketPage from "./features/tickets/SharedTicketPage";
import OrganizerPage from "./features/organizer/OrganizerPage";
import EventFormPage from "./features/organizer/EventFormPage";
import NotFoundPage from "./features/notfound/NotFoundPage";

function App() {
  return (
    <AuthModalProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/events/:id/checkout" element={<CheckoutPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route
            path="/tickets/shared/:ticketId"
            element={<SharedTicketPage />}
          />
          <Route path="/checkin" element={<CheckinPage />} />
          <Route path="/organizer" element={<OrganizerPage />} />
          <Route path="/organizer/new" element={<EventFormPage />} />
          <Route path="/organizer/:id/edit" element={<EventFormPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <AuthModal />
      </BrowserRouter>
    </AuthModalProvider>
  );
}

export default App;
