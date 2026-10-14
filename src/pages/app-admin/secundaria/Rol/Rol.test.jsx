import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Roles from './Rol';
import { useAuth } from '../../../../context/AuthContext';
import { endpoints } from '../../../../config/api';

/**
 * Corresponde a la fila TC-067 ("Rol - Control de acceso por rol") del plan.
 *
 * HALLAZGOS:
 * - La pantalla solo comprueba que exista un token, nunca el rol del usuario:
 *   cualquier empleado autenticado (p. ej. un Vendedor) puede ver y eliminar roles.
 * - Sin token usa <Navigate> sin importarlo -> ReferenceError en vez de redirigir.
 */

vi.mock('axios');
vi.mock('../../../../context/AuthContext');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const roles = [
  { id: 1, nombre: 'Administrador', descripcion: 'Acceso total' },
  { id: 2, nombre: 'Vendedor', descripcion: 'Solo ventas' },
];

const renderRoles = () =>
  render(
    <MemoryRouter>
      <Roles />
    </MemoryRouter>
  );

describe('Roles (admin) - control de acceso (TC-067)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: roles });
    axios.delete.mockResolvedValue({ data: {} });
  });

  it('TC-067: con sesión carga y lista los roles usando el token', async () => {
    useAuth.mockReturnValue({ token: 'fake-token', loading: false });
    renderRoles();

    expect(await screen.findByText('Administrador')).toBeInTheDocument();
    expect(screen.getByText('Vendedor')).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(endpoints.rol.mostrar, {
      headers: { Authorization: 'Bearer fake-token' },
    });
  });

  it('TC-067b (hallazgo): un usuario con rol "Vendedor" también ve el CRUD de roles (no se valida el rol)', async () => {
    useAuth.mockReturnValue({ token: 'fake-token', user: { rol: 'Vendedor' }, loading: false });
    renderRoles();

    expect(await screen.findByText('Administrador')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agregar' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Eliminar' })).toHaveLength(2);
  });

  it('TC-067c (hallazgo): sin sesión revienta con ReferenceError (Navigate no está importado) en vez de redirigir', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    useAuth.mockReturnValue({ token: null, loading: false });

    expect(() => renderRoles()).toThrow(/Navigate is not defined/);
    errSpy.mockRestore();
  });

  it('TC-067d: mientras la sesión carga muestra "Cargando roles..." y no pide datos', () => {
    useAuth.mockReturnValue({ token: null, loading: true });
    renderRoles();

    expect(screen.getByText('Cargando roles...')).toBeInTheDocument();
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('TC-067e: eliminar un rol llama al DELETE con token y lo quita de la lista', async () => {
    useAuth.mockReturnValue({ token: 'fake-token', loading: false });
    const user = userEvent.setup();
    renderRoles();
    await screen.findByText('Vendedor');

    await user.click(screen.getAllByRole('button', { name: 'Eliminar' })[1]);

    await waitFor(() =>
      expect(axios.delete).toHaveBeenCalledWith(endpoints.rol.eliminar(2), {
        headers: { Authorization: 'Bearer fake-token' },
      })
    );
    await waitFor(() => expect(screen.queryByText('Vendedor')).not.toBeInTheDocument());
    expect(screen.getByText('Administrador')).toBeInTheDocument();
  });

  it('TC-067f: el buscador filtra los roles por nombre', async () => {
    useAuth.mockReturnValue({ token: 'fake-token', loading: false });
    const user = userEvent.setup();
    renderRoles();
    await screen.findByText('Vendedor');

    await user.type(screen.getByPlaceholderText('Buscar por nombre...'), 'admin');

    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.queryByText('Vendedor')).not.toBeInTheDocument();
  });
});
