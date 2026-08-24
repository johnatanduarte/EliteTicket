import api from './api';

export async function validateTicket(qrCode, eventId) {
  const { data } = await api.post('/checkin/validate', { qrCode, eventId });
  return data;
}