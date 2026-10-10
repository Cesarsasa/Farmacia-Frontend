import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Logincli from './Login';
import { loginCliente } from '../../../services/authService-cliente';
import { useAuth } from '../../../context/AuthContextCli';

/**
 * Corresponde a las filas TC-043 y TC-044 del plan de pruebas
 * ("Login Customer - campos vacíos" y "mensaje tras varios intentos
 * fallidos"). Complementa a Login.test.jsx (TC-AUTO-001 a 003).
 */

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

describe('Login Cliente - campos vacíos y reintentos', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ login: mockLogin });
  });

  it('TC-043 (hallazgo): enviar el formulario vacío NO lo bloquea - igual intenta iniciar sesión con campos vacíos', async () => {
    // Los <input> de correo/contraseña en Login.jsx (customer) no tienen el
    // atributo `required`, así que el navegador no bloquea el envío. El
    // formulario llama a loginCliente('', '') y deja que sea el backend
    // quien rechace la petición; no hay validación previa en el cliente.
    loginCliente.mockRejectedValue(new Error('Error al iniciar sesión'));
    const user = userEvent.setup();

    renderLogin();
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(loginCliente).toHaveBeenCalledWith('', '');
    });
    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('TC-044 (hallazgo): varios intentos fallidos seguidos muestran siempre el mismo mensaje, sin bloqueo ni aviso especial', async () => {
    // No hay contador de intentos ni estado de "cuenta bloqueada" en
    // Logincli: cada envío fallido simplemente vuelve a mostrar
    // "Credenciales inválidas", igual que el primero.
    loginCliente.mockRejectedValue(new Error('Error al iniciar sesión'));
    const user = userEvent.setup();

    renderLogin();
    const correo = screen.getByPlaceholderText('usuario@farmaplus.com');
    const contrasena = screen.getByPlaceholderText('Contraseña');
    const boton = screen.getByRole('button', { name: /iniciar sesión/i });

    for (let intento = 1; intento <= 5; intento++) {
      await user.clear(correo);
      await user.clear(contrasena);
      await user.type(correo, 'cliente@ejemplo.com');
      await user.type(contrasena, `incorrecta${intento}`);
      await user.click(boton);
      expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument();
    }

    expect(loginCliente).toHaveBeenCalledTimes(5);
    expect(mockNavigate).not.toHaveBeenCalled();
    // No existe ningún mensaje adicional tipo "demasiados intentos" o cuenta bloqueada.
    expect(
      screen.queryByText(/bloquead|demasiados intentos|espera/i)
    ).not.toBeInTheDocument();
  });

  it('TC-044b: tras varios fallos, unas credenciales correctas sí funcionan (no hay bloqueo real)', async () => {
    loginCliente
      .mockRejectedValueOnce(new Error('Error al iniciar sesión'))
      .mockRejectedValueOnce(new Error('Error al iniciar sesión'))
      .mockResolvedValueOnce({ token: 'fake-jwt-token' });
    const user = userEvent.setup();

    renderLogin();
    const correo = screen.getByPlaceholderText('usuario@farmaplus.com');
    const contrasena = screen.getByPlaceholderText('Contraseña');
    const boton = screen.getByRole('button', { name: /iniciar sesión/i });

    for (let i = 0; i < 2; i++) {
      await user.clear(correo);
      await user.clear(contrasena);
      await user.type(correo, 'cliente@ejemplo.com');
      await user.type(contrasena, 'incorrecta');
      await user.click(boton);
      await screen.findByText('Credenciales inválidas');
    }

    await user.clear(contrasena);
    await user.type(contrasena, 'correcta123');
    await user.click(boton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home-cli');
    });
  });
});
