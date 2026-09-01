import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Logincli from './Login';
import { loginCliente } from '../../../services/authService-cliente';
import { useAuth } from '../../../context/AuthContextCli';

// Mocks de las dependencias externas del componente
vi.mock('../../../services/authService-cliente');
vi.mock('../../../context/AuthContextCli');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderLogin() {
  return render(
    <MemoryRouter>
      <Logincli />
    </MemoryRouter>
  );
}

describe('Login de Cliente', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ login: mockLogin });
  });

  it('TC-AUTO-001: Login exitoso navega a /home-cli y guarda el token', async () => {
    loginCliente.mockResolvedValue({ token: 'fake-jwt-token' });
    const user = userEvent.setup();

    renderLogin();

    await user.type(screen.getByPlaceholderText('usuario@farmaplus.com'), 'cliente@ejemplo.com');
    await user.type(screen.getByPlaceholderText('Contraseña'), 'password123');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(loginCliente).toHaveBeenCalledWith('cliente@ejemplo.com', 'password123');
      expect(mockLogin).toHaveBeenCalledWith('fake-jwt-token');
      expect(mockNavigate).toHaveBeenCalledWith('/home-cli');
    });
  });

  it('TC-AUTO-002: Login fallido muestra mensaje de error', async () => {
    loginCliente.mockRejectedValue(new Error('Error al iniciar sesión'));
    const user = userEvent.setup();

    renderLogin();

    await user.type(screen.getByPlaceholderText('usuario@farmaplus.com'), 'cliente@ejemplo.com');
    await user.type(screen.getByPlaceholderText('Contraseña'), 'incorrecta');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('TC-AUTO-003: Renderiza el formulario con los campos esperados', () => {
    renderLogin();

    expect(screen.getByPlaceholderText('usuario@farmaplus.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });
});