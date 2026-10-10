import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import { loginEmpleado } from '../../../services/authService';
import { useAuth } from '../../../context/AuthContext';

/**
 * Corresponde a las filas TC-039, TC-040 y TC-041 del plan de pruebas
 * ("Login Admin").
 */

vi.mock('../../../services/authService');
vi.mock('../../../context/AuthContext');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

describe('Login Admin', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ login: mockLogin });
  });

  it('TC-039: credenciales inválidas muestra "Credenciales inválidas" y no navega', async () => {
    loginEmpleado.mockRejectedValue(new Error('Error al iniciar sesión'));
    const user = userEvent.setup();

    renderLogin();
    await user.type(screen.getByPlaceholderText('usuario@farmaplus.com'), 'empleado@ejemplo.com');
    await user.type(screen.getByPlaceholderText('Contraseña'), 'incorrecta');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('TC-040: login exitoso guarda el token y navega a /home', async () => {
    loginEmpleado.mockResolvedValue({ token: 'fake-jwt-empleado' });
    const user = userEvent.setup();

    renderLogin();
    await user.type(screen.getByPlaceholderText('usuario@farmaplus.com'), 'empleado@ejemplo.com');
    await user.type(screen.getByPlaceholderText('Contraseña'), 'password123');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(loginEmpleado).toHaveBeenCalledWith('empleado@ejemplo.com', 'password123');
      expect(mockLogin).toHaveBeenCalledWith('fake-jwt-empleado');
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  it('TC-041 (hallazgo): navega a /home sin importar el rol del empleado - no hay restricción de vistas por rol en el login', async () => {
    // Login.jsx llama navigate('/home') de forma incondicional dentro del
    // try, sin leer ni comparar ningún campo de rol. No existe ninguna
    // lógica de enrutamiento condicional por rol en este componente (ni un
    // ProtectedRoute en el resto del frontend, según búsqueda en el
    // repositorio). Esta prueba documenta que un "Cajero" y un "Admin"
    // terminan exactamente en la misma ruta tras el login.
    const user = userEvent.setup();

    for (const rol of ['cajero', 'admin']) {
      vi.clearAllMocks();
      useAuth.mockReturnValue({ login: mockLogin });
      loginEmpleado.mockResolvedValue({ token: `fake-jwt-${rol}`, rol });

      const { unmount } = renderLogin();
      await user.type(screen.getByPlaceholderText('usuario@farmaplus.com'), `${rol}@ejemplo.com`);
      await user.type(screen.getByPlaceholderText('Contraseña'), 'password123');
      await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/home'); // misma ruta para ambos roles
      });
      unmount();
    }
  });

  it('TC-039b: renderiza el formulario con los campos esperados', () => {
    renderLogin();

    expect(screen.getByPlaceholderText('usuario@farmaplus.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });
});
