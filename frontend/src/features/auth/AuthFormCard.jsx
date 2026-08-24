import { useState } from 'react';
import api from '../../services/api';
import TicketCard from '../../components/TicketCard';
import './AuthPage.css';

const ROLES = [
  { value: 'CUSTOMER', label: 'Cliente' },
  { value: 'ORGANIZER', label: 'Organizador' },
  { value: 'STAFF', label: 'Portaria' },
];

export default function AuthFormCard({ onSuccess, cardClassName = 'auth-card' }) {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('CUSTOMER');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await api.post('/auth/register', { ...form, role });
      }
      const { data } = await api.post('/auth/login', {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem('eliteticket_token', data.token);
      localStorage.setItem('eliteticket_user', JSON.stringify(data.user));

      onSuccess(data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Algo deu errado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <TicketCard className={cardClassName}>
      <div className="auth-tabs">
        <button
          type="button"
          className={mode === 'login' ? 'active' : ''}
          onClick={() => setMode('login')}
        >
          Entrar
        </button>
        <button
          type="button"
          className={mode === 'register' ? 'active' : ''}
          onClick={() => setMode('register')}
        >
          Criar conta
        </button>
      </div>

      <hr className="ticket-divider" />

      <form onSubmit={handleSubmit} className="auth-form">
        {mode === 'register' && (
          <label>
            Nome
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Como você quer ser chamado"
              required
            />
          </label>
        )}

        <label>
          E-mail
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="voce@email.com"
            required
          />
        </label>

        <label>
          Senha
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Mínimo 6 caracteres"
            minLength={6}
            required
          />
        </label>

        {mode === 'register' && (
          <div className="role-select">
            <span>Você é:</span>
            <div className="role-options">
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r.value}
                  className={role === r.value ? 'active' : ''}
                  onClick={() => setRole(r.value)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
        </button>
      </form>
    </TicketCard>
  );
}