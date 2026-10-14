import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import ProductoModal from '../ProductoModal';
import { useAuth } from '../../context/AuthContextCli';

/**
 * Corresponde a la fila TC-059 del plan de pruebas
 * ("Producto sin stock deshabilita botón de compra" - Frontend).
 *
 * La lógica de stock vive en el modal de detalle (ProductoModal), no en
 * ProductoCard: el botón "Agregar al carrito" se deshabilita cuando la suma
 * de inventario de todas las sucursales es 0.
 */

vi.mock('axios');
vi.mock('../../context/AuthContextCli');

const producto = {
  id: 1,
  nombre: 'Vitamina C',
  descripcion: 'Caja x30',
  precio_unitario: 25,
  imagen_url: '',
};

function inventario(...cantidades) {
  return cantidades.map((cantidad, i) => ({
    cantidad,
    producto: { id: 1 },
    sucursal: { nombre: `Sucursal ${i + 1}` },
  }));
}

describe('ProductoModal - disponibilidad', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: { id: 9 } });
    axios.post.mockResolvedValue({ data: {} });
    window.alert = vi.fn();
  });

  it('TC-059: con stock total 0 el botón de compra queda deshabilitado y se avisa que no hay disponibilidad', async () => {
    axios.get.mockResolvedValue({ data: inventario(0, 0) });
    const user = userEvent.setup();

    render(<ProductoModal producto={producto} onClose={vi.fn()} />);

    expect(await screen.findByText('Este producto no está disponible actualmente.')).toBeInTheDocument();
    const boton = screen.getByRole('button', { name: /agregar al carrito/i });
    expect(boton).toBeDisabled();
    expect(screen.getByRole('spinbutton')).toBeDisabled();

    await user.click(boton);
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('TC-059b: si no hay filas de inventario para el producto también queda deshabilitado', async () => {
    axios.get.mockResolvedValue({ data: [] });

    render(<ProductoModal producto={producto} onClose={vi.fn()} />);

    expect(await screen.findByText('Este producto no está disponible actualmente.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /agregar al carrito/i })).toBeDisabled();
  });

  it('TC-059c: con stock disponible el botón está habilitado y agrega al carrito', async () => {
    axios.get.mockResolvedValue({ data: inventario(3, 2) });
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<ProductoModal producto={producto} onClose={onClose} />);

    await screen.findByText('Sucursal 1');
    const boton = screen.getByRole('button', { name: /agregar al carrito/i });
    expect(boton).toBeEnabled();
    expect(screen.queryByText('Este producto no está disponible actualmente.')).not.toBeInTheDocument();

    await user.click(boton);

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(expect.stringMatching(/carrito\/agregar$/), {
        id_cliente: 9,
        id_producto: 1,
        cantidad: 1,
      })
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('TC-059d: pedir más unidades que el stock total muestra el aviso y no agrega al carrito', async () => {
    axios.get.mockResolvedValue({ data: inventario(2) });
    const user = userEvent.setup();

    render(<ProductoModal producto={producto} onClose={vi.fn()} />);
    await screen.findByText('Sucursal 1');

    const cantidad = screen.getByRole('spinbutton');
    await user.clear(cantidad);
    await user.type(cantidad, '5');
    await user.click(screen.getByRole('button', { name: /agregar al carrito/i }));

    expect(screen.getAllByText('Solo hay 2 unidades disponibles.').length).toBeGreaterThan(0);
    expect(axios.post).not.toHaveBeenCalled();
  });
});
