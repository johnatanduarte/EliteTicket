import api from "./api";

export async function createReservation(eventId, quantity) {
  const { data } = await api.post("/reservations", { eventId, quantity });
  return data;
}

export async function payReservation(reservationId, approve) {
  const { data } = await api.post(`/reservations/${reservationId}/pay`, {
    approve,
  });
  return data;
}

export async function listMyReservations() {
  const { data } = await api.get("/reservations/mine");
  return data;
}
