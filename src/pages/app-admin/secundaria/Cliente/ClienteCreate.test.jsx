import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import ClienteCreate from './ClienteCreate';
import { useAuth } from '../../../../context/AuthContext';

/**
 * Corresponde a la fila TC-029 del plan de pruebas
 * ("Cliente (admin) - Validación de datos duplicados").
 *
 * NOTA (caso ideal vs. comportamiento actual): ClienteCreate.jsx no
 * distingue el error de "correo duplicado" de ningún otro error: su
 * catch solo hace console.error(...) y nunca actualiza el estado del
 * componente, así que NINGÚN mensaje llega a mostrarse en pantalla. El
 * usuario se queda en el formulario sin saber por qué falló. Esta prueba
 * documenta ese comportamiento (no navega, no hay texto de error visible)
 * en vez de validar un mensaje que hoy no existe.
 */

vi.mock('axios');
vi.mock('../../../../context/AuthContext');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderClienteCreate() {
  return render(
    <MemoryRouter>
      <ClienteCreate />
    </MemoryRouter>
  );
}

async function llenarFormulario(user) {
  await user.type(screen.getByPlaceholderText('Nombre'), 'Ana');
  await user.type(screen.getByPlaceholderText('Apellido'), 'López');
  await user.type(screen.getByPlaceholderText('Nit'), '12345678');
  await user.type(screen.getByPlaceholderText('Correo'), 'duplicado@ejemplo.com');
  await user.type(screen.getByPlaceholderText('Telefono'), '5555-5555');
  await user.type(screen.getByPlaceholderText('Direccion'), 'Zona 1');
  await user.type(screen.getByPlaceholderText('Contraseña'), 'Pass1234');
}

describe('ClienteCreate - duplicados', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ token: 'fake-token' });
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('TC-029 (hallazgo): correo duplicado - no navega, pero tampoco muestra ningún error al usuario', async () => {
    const user = userEvent.setup();
    axios.post.mockRejectedValue({
      response: { status: 500, data: { message: 'cliente_correo_key' } },
    });

    renderClienteCreate();
    await llenarFormulario(user);
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    // Correcto: no debe redirigir como si la creación hubiera funcionado.
    expect(mockNavigate).not.toHaveBeenCalled();

    // Hallazgo: tampoco aparece ningún mensaje de error en pantalla.
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(
      screen.queryByText(/correo|duplicad|ya existe|error/i)
    ).not.toBeInTheDocument();
    // El formulario sigue ahí, pero sin ninguna pista de qué pasó.
    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
  });

  it('TC-029b: datos válidos y sin duplicado - crea el cliente y navega a /cliente', async () => {
    const user = userEvent.setup();
    axios.post.mockResolvedValue({ data: { id: 1 } });

    renderClienteCreate();
    await llenarFormulario(user);
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/cliente');
    });
  });
});
