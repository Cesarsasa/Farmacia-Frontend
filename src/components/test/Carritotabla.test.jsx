import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import CarritoTabla from '../CarritoTabla';
import { useAuth } from '../../context/AuthContextCli';

/**
 * Corresponde a la ficha TC-AUTO-010 del informe técnico.
 *
 * NOTA: el ficha original describía un botón "+" para incrementar cantidad,
 * pero el componente real (CarritoTabla.jsx) no expone esa acción: solo
 * lista los productos del carrito, calcula el total y permite eliminar un
 * ítem. El caso de prueba se ajustó a ese comportamiento real.
 */

vi.mock('axios');
vi.mock('../../context/AuthContextCli');

const mockItems = [
  {
    id_producto: 1,
    cantidad: 2,
    producto: { nombre: 'Aspirina', precio_unitario: 10 },
  },
];

describe('CarritoTabla', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: { correo: 'cliente@ejemplo.com' } });
    axios.get.mockResolvedValue({ data: mockItems });
    axios.delete.mockResolvedValue({});
  });

  it('TC-AUTO-010: muestra los productos del carrito y calcula el total correctamente', async () => {
    render(<CarritoTabla id_cliente={1} />);

    expect(await screen.findByText('Aspirina')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Q20')).toBeInTheDocument(); // subtotal: 2 * 10
    expect(screen.getByText('Q20.00')).toBeInTheDocument(); // total
  });

  it('TC-AUTO-010b: elimina un producto del carrito al hacer clic en "Eliminar"', async () => {
    const user = userEvent.setup();
    render(<CarritoTabla id_cliente={1} />);

    const botonEliminar = await screen.findByRole('button', { name: /eliminar/i });
    await user.click(botonEliminar);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/carrito/eliminar'),
        { data: { id_cliente: 1, id_producto: 1 } }
      );
    });
  });
});