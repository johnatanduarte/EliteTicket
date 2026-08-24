import api from './api';

export async function searchCatalog(keyword) {
  const { data } = await api.get('/catalog/search', { params: { keyword } });
  return data;
}