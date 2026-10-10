import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Inventario from './Inventario';
import { useAuth } from '../../../../context/AuthContext';

/**
 * Corresponde a las filas TC-037 y TC-038 del plan de pruebas
 * ("Inventario - Alerta visual de stock mínimo" y "Fecha de caducidad
 * vencida muestra advertencia").
 *
 * HALLAZGO IMPORTANTE: ninguna de las dos funcionalidades existe hoy.
 *
 * - TC-037: Inventario.jsx solo imprime "Cantidad: {i.cantidad}" como texto
 *   plano, sin ningún umbral, color condicional ni ícono de alerta.
 * - TC-038: no hay ningún campo de fecha de caducidad en ningún lado del
 *   sistema. El modelo Sequelize `inventario` (app/models/inventario.model.js
 *   en el backend) solo tiene id, cantidad, id_producto e id_sucursal; una
 *   búsqueda de "caducidad"/"vencimiento"/"expira" en ambos repositorios no
 *   encuentra nada relacionado con fechas de vencimiento de producto.
 *
 * Estas pruebas no verifican una regla de negocio real (no existe): dejan
 * constancia de la ausencia, para que quede documentada como hallazgo del
 * plan de pruebas y como posible mejora pendiente (es particularmente
 * relevante en un sistema de farmacia, por la seguridad del paciente).
 */

vi.mock('axios');
vi.mock('../../../../context/AuthContext');

const inventarioStockBajo = {
  id: 1,
  cantidad: 1, // stock crítico
  producto: { id: 10, nombre: 'Aspirina', imagen_url: null },
  sucursal: { id: 1, nombre: 'Sucursal Central' },
};

function renderInventario() {
  return render(
    <MemoryRouter>
      <Inventario />
    </MemoryRouter>
  );
}

describe('Inventario (admin) - alertas (hallazgos de funcionalidad ausente)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ token: 'fake-token', loading: false });
    axios.get.mockImplementation((url) => {
      if (url.includes('sucursal')) return Promise.resolve({ data: [inventarioStockBajo.sucursal] });
      return Promise.resolve({ data: [inventarioStockBajo] });
    });
  });

  it('TC-037 (hallazgo): un producto con stock crítico (cantidad=1) NO muestra ninguna alerta visual', async () => {
    renderInventario();

    expect(await screen.findByText('Cantidad: 1')).toBeInTheDocument();

    // No hay ningún texto, clase ni ícono de advertencia asociado al stock bajo.
    expect(screen.queryByText(/stock bajo|stock crítico|agotándose|¡alerta!/i)).not.toBeInTheDocument();
    const tarjeta = screen.getByText('Cantidad: 1').closest('div.bg-white');
    expect(tarjeta.className).not.toMatch(/red|amber|yellow|warning|danger/i);
  });

  it('TC-038 (hallazgo): la tarjeta de inventario no tiene forma de mostrar ni de recibir una fecha de caducidad', async () => {
    renderInventario();

    await screen.findByText('Cantidad: 1');

    // No existe ningún campo ni etiqueta relacionado a vencimiento/caducidad
    // en la tarjeta, porque el modelo de datos de inventario no lo contempla.
    expect(
      screen.queryByText(/caduc|vence|vencimiento|expira/i)
    ).not.toBeInTheDocument();
  });
});
