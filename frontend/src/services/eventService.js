import api from "./api";

export async function listEvents({ search = '', page = 1 } = {}) {
  const { data } = await api.get('/events', { params: { search, page } });
  return data;
}

export async function getEvent(id) {
  const { data } = await api.get(`/events/${id}`);
  return data;
}

export async function listMyEvents() {
  const { data } = await api.get("/events/mine");
  return data;
}

export async function createEvent(payload) {
  const { data } = await api.post("/events", payload);
  return data;
}

export async function updateEvent(id, payload) {
  const { data } = await api.put(`/events/${id}`, payload);
  return data;
}

export async function deleteEvent(id) {
  await api.delete(`/events/${id}`);
}
