import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Ventas from './Ventas';
import InventarioRepo from './Inventario';
import { useAuth } from '../../../context/AuthContext';

/**
 * Corresponde a las filas TC-063 ("Filtro por rango de fecha (Ventas)") y
 * TC-064 ("Manejo de datos vacíos (Inventario)") del plan - Reportería.
 *
 * HALLAZGO GENERAL: las pantallas de reportería son solo un <iframe> de
 * Power BI. La app no consulta datos, no tiene filtros de fecha propios y no
 * tiene estado "sin datos"; esos comportamientos viven dentro de Power BI y
 * no se pueden verificar con pruebas de componente. Aquí se prueba lo que sí
 * le corresponde al frontend: el acceso (sesión) y el contenido embebido.
 *
 * HALLAZGO 2: Ventas.jsx e Inventario.jsx usan <Navigate> sin importarlo de
 * react-router-dom; un usuario sin sesión provoca un ReferenceError (pantalla
 * en blanco) en vez de redirigir a "/".
 */

vi.mock('../../../context/AuthContext');

const pantallas = [
  { nombre: 'Ventas', Componente: Ventas, titulo: 'Ventas', cargando: 'Cargando Ventas...' },
  { nombre: 'Inventario', Componente: InventarioRepo, titulo: 'Inventario', cargando: 'Cargando inventario...' },
];

const renderPantalla = (Componente) =>
  render(
    <MemoryRouter>
      <Componente />
    </MemoryRouter>
  );

describe.each(pantallas)('Reportería - $nombre', ({ Componente, titulo, cargando }) => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC-063/064: con sesión muestra el título y el reporte Power BI embebido', () => {
    useAuth.mockReturnValue({ user: { id: 1 }, loading: false });
    renderPantalla(Componente);

    expect(screen.getByRole('heading', { name: titulo })).toBeInTheDocument();
    const iframe = screen.getByTitle('Power BI Report');
    expect(iframe.getAttribute('src')).toMatch(/^https:\/\/app\.powerbi\.com\//);
  });

  it('TC-063b (hallazgo): la pantalla no tiene controles propios de filtro por fecha', () => {
    useAuth.mockReturnValue({ user: { id: 1 }, loading: false });
    const { container } = renderPantalla(Componente);

    expect(container.querySelector('input[type="date"]')).toBeNull();
    expect(screen.queryByText(/desde|hasta|rango/i)).not.toBeInTheDocument();
  });

  it('TC-064b (hallazgo): no hay estado de "sin datos"; solo existe el estado de carga de sesión', () => {
    useAuth.mockReturnValue({ user: null, loading: true });
    renderPantalla(Componente);

    expect(screen.getByText(cargando)).toBeInTheDocument();
    expect(screen.queryByTitle('Power BI Report')).not.toBeInTheDocument();
    expect(screen.queryByText(/sin datos|no hay datos/i)).not.toBeInTheDocument();
  });

  it('TC-063c (hallazgo): sin sesión revienta con ReferenceError (Navigate no está importado) en vez de redirigir', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    useAuth.mockReturnValue({ user: null, loading: false });

    expect(() => renderPantalla(Componente)).toThrow(/Navigate is not defined/);
    errSpy.mockRestore();
  });
});
