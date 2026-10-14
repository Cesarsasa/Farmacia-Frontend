import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import SucursalCreate from './SucursalCreate';
import { useAuth } from '../../../../context/AuthContext';
import { endpoints } from '../../../../config/api';

/**
 * Corresponde a la fila TC-070 ("Sucursal - Creación válida de sucursal",
 * Frontend) del plan de pruebas.
 */

vi.mock('axios');
vi.mock('../../../../context/AuthContext');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderCreate = () =>
  render(
    <MemoryRouter>
      <SucursalCreate />
    </MemoryRouter>
  );

async function llenar(user) {
  await user.type(screen.getByPlaceholderText('Nombre'), 'Sucursal Zona 10');
  await user.type(screen.getByPlaceholderText('Direccion'), '5a Avenida 10-20 zona 10');
  await user.type(screen.getByPlaceholderText('Telefono'), '2222-3333');
}

describe('SucursalCreate (admin)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ token: 'fake-token' });
    axios.post.mockResolvedValue({ data: { id: 1 } });
  });

  it('TC-070: con datos válidos envía POST con token y navega a /sucursal', async () => {
    const user = userEvent.setup();
    renderCreate();
    await llenar(user);

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(axios.post).toHaveBeenCalledWith(
      endpoints.sucursal.crear,
      { nombre: 'Sucursal Zona 10', direccion: '5a Avenida 10-20 zona 10', telefono: '2222-3333' },
      { headers: { Authorization: 'Bearer fake-token' } }
    );
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/sucursal'));
  });

  it('TC-070b: los tres campos son obligatorios y con el formulario vacío no se llama a la API', async () => {
    const user = userEvent.setup();
    renderCreate();

    ['Nombre', 'Direccion', 'Telefono'].forEach((p) =>
      expect(screen.getByPlaceholderText(p)).toBeRequired()
    );
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(axios.post).not.toHaveBeenCalled();
  });

  it('TC-070c (hallazgo): si el POST falla no navega, pero tampoco muestra ningún mensaje de error al usuario', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    axios.post.mockRejectedValue(new Error('500'));
    const user = userEvent.setup();
    const { container } = renderCreate();
    await llenar(user);
    const antes = container.textContent;

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole('button', { name: /guardar/i })).toBeEnabled());
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(container.textContent).toBe(antes);
    errSpy.mockRestore();
  });
});
