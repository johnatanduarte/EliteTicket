import api from "./api";

export async function getSharedTicket(ticketId) {
  const { data } = await api.get(`/reservations/shared/${ticketId}`);
  return data;
}
