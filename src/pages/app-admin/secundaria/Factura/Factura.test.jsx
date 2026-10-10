import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import axios from 'axios';
import Facturas from './Factura';
import { useAuth } from '../../../../context/AuthContext';

/**
 * Corresponde a la fila TC-033 del plan de pruebas
 * ("Factura - Visualización correcta de totales").
 *
 * NOTA: Factura.jsx usa <Navigate> sin importarlo de react-router-dom
 * (bug de compilación si authLoading=false y token es falsy). Por eso
 * todas las pruebas aquí mockean useAuth con un token presente, para no
 * ejercitar esa rama rota.
 */

vi.mock('axios');
vi.mock('../../../../context/AuthContext');

const facturaBase = {
  id: 1,
  numero_factura: 'F-1700000000000',
  fecha_emision: '2026-09-20T10:00:00.000Z',
  venta: {
    total: 135.5,
    cliente: { nombre: 'Ana López' },
    sucursal: { nombre: 'Sucursal Central' },
    usuario: { nombre: 'Carlos Ruiz' },
  },
};

describe('Facturas (admin) - totales', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ token: 'fake-token', loading: false });
  });

  it('TC-033: muestra el total formateado con el símbolo Q y 2 decimales', async () => {
    axios.get.mockResolvedValue({ data: [facturaBase] });

    render(<Facturas />);

    expect(await screen.findByText('Q135.50')).toBeInTheDocument();
    expect(screen.getByText('F-1700000000000')).toBeInTheDocument();
    expect(screen.getByText('Ana López')).toBeInTheDocument();
  });

  it('TC-033b: redondea el total a 2 decimales aunque venga con más precisión', async () => {
    const factura = {
      ...facturaBase,
      id: 2,
      venta: { ...facturaBase.venta, total: 99.999 },
    };
    axios.get.mockResolvedValue({ data: [factura] });

    render(<Facturas />);

    expect(await screen.findByText('Q100.00')).toBeInTheDocument();
  });

  it('TC-033c: si la factura no trae total, muestra un guión en vez de "Q undefined" o "QNaN"', async () => {
    const factura = { ...facturaBase, id: 3, venta: { ...facturaBase.venta, total: undefined } };
    axios.get.mockResolvedValue({ data: [factura] });

    render(<Facturas />);

    await screen.findByText('F-1700000000000');
    const fila = screen.getByText('F-1700000000000').closest('tr');
    expect(fila).toHaveTextContent('—');
    expect(fila).not.toHaveTextContent('NaN');
    expect(fila).not.toHaveTextContent('undefined');
  });

  it('TC-033d: con varias facturas, cada fila muestra su propio total de forma independiente', async () => {
    axios.get.mockResolvedValue({
      data: [
        facturaBase,
        { ...facturaBase, id: 2, numero_factura: 'F-2', venta: { ...facturaBase.venta, total: 10 } },
      ],
    });

    render(<Facturas />);

    expect(await screen.findByText('Q135.50')).toBeInTheDocument();
    expect(screen.getByText('Q10.00')).toBeInTheDocument();
  });
});
