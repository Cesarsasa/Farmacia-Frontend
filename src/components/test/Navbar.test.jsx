import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../Navbar';
import NavbarCli from '../NavbarCli';
import PerfilDropdown from '../PerfilDropdown';
import { useAuth } from '../../context/AuthContext';
import { useAuth as useAuthCli } from '../../context/AuthContextCli';

/**
 * Corresponde a las filas TC-048 ("Navbar - Render condicional según rol de
 * usuario") y TC-068 ("Sidebar - Cierre de sesión (logout)") del plan.
 *
 * NOTAS:
 * - TC-048: el Navbar de administración NO cambia según el rol del usuario
 *   (los enlaces son fijos). Lo único condicional es la sesión: el perfil
 *   (PerfilDropdown) solo aparece con usuario, y el Navbar del cliente
 *   (NavbarCli) alterna entre "Registrarse / Iniciar Sesión" y el nombre.
 * - TC-068: el botón "Cerrar sesión" está en PerfilDropdown (Navbar), no en
 *   el Sidebar.
 */

vi.mock('../../context/AuthContext');
vi.mock('../../context/AuthContextCli');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const enRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('Navbar admin - render condicional (TC-048)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('TC-048 (hallazgo): los enlaces del Navbar admin son los mismos para cualquier rol', () => {
    const enlaces = () => screen.getAllByRole('link').map((a) => a.textContent.trim());

    useAuth.mockReturnValue({ user: { nombre: 'Ana', correo: 'ana@x.com', rol: 'Administrador' }, signout: vi.fn() });
    const { unmount } = enRouter(<Navbar />);
    const comoAdmin = enlaces();
    unmount();

    useAuth.mockReturnValue({ user: { nombre: 'Luis', correo: 'luis@x.com', rol: 'Vendedor' }, signout: vi.fn() });
    enRouter(<Navbar />);
    const comoVendedor = enlaces();

    expect(comoVendedor).toEqual(comoAdmin);
    expect(comoAdmin).toEqual(expect.arrayContaining(['Inventario', 'Reportes']));
  });

  it('TC-048b: el ícono de perfil solo se muestra con usuario autenticado', () => {
    useAuth.mockReturnValue({ user: null, signout: vi.fn() });
    const { unmount } = enRouter(<Navbar />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    unmount();

    useAuth.mockReturnValue({ user: { nombre: 'Ana', correo: 'ana@x.com' }, signout: vi.fn() });
    enRouter(<Navbar />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('TC-048c: Navbar del cliente sin sesión muestra Registrarse e Iniciar Sesión', () => {
    useAuthCli.mockReturnValue({ user: null, signout: vi.fn() });
    enRouter(<NavbarCli />);

    expect(screen.getByRole('link', { name: 'Registrarse' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Iniciar Sesión' })).toBeInTheDocument();
    expect(screen.queryByText(/cerrar sesión/i)).not.toBeInTheDocument();
  });

  it('TC-048d: Navbar del cliente con sesión muestra su nombre y oculta Registrarse / Iniciar Sesión', () => {
    useAuthCli.mockReturnValue({ user: { nombre: 'María' }, signout: vi.fn() });
    enRouter(<NavbarCli />);

    expect(screen.getByText('María')).toBeInTheDocument();
    expect(screen.getByText('Mi perfil')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Registrarse' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Iniciar Sesión' })).not.toBeInTheDocument();
  });
});

describe('Cerrar sesión (TC-068)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('TC-068: PerfilDropdown cierra la sesión (signout) y redirige a "/"', async () => {
    const signout = vi.fn();
    useAuth.mockReturnValue({ user: { nombre: 'Ana', correo: 'ana@x.com' }, signout });
    const user = userEvent.setup();
    enRouter(<PerfilDropdown />);

    expect(screen.queryByText(/cerrar sesión/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('👤 Ana')).toBeInTheDocument();

    await user.click(screen.getByText(/cerrar sesión/i));

    expect(signout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('TC-068b: sin usuario no se muestra ninguna opción de cierre de sesión', () => {
    useAuth.mockReturnValue({ user: null, signout: vi.fn() });
    const { container } = enRouter(<PerfilDropdown />);

    expect(container).toBeEmptyDOMElement();
  });

  it('TC-068c: el Navbar del cliente también llama a signout al cerrar sesión', async () => {
    const signout = vi.fn();
    useAuthCli.mockReturnValue({ user: { nombre: 'María' }, signout });
    const user = userEvent.setup();
    enRouter(<NavbarCli />);

    await user.click(screen.getByText(/cerrar sesión/i));

    expect(signout).toHaveBeenCalledTimes(1);
  });
});
