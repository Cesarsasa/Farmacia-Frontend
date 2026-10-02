import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import CarritoTabla from '../CarritoTabla';
import { useAuth } from '../../context/AuthContextCli';

/**
 * Módulo: Carrito (frontend)
 * Herramienta: Vitest + React Testing Library
 * Corresponde a la fila TC-018 del plan de pruebas
 * ("Eliminar último ítem recalcula el total").
 *
 * NOTA: CarritoTabla no calcula el total al eliminar de forma local:
 * tras el DELETE vuelve a pedir el carrito con axios.get y recalcula con
 * lo que responde el backend. Por eso los mocks de axios.get se encadenan
 * (primera llamada = carrito completo, segunda = carrito ya sin el ítem).
 */

vi.mock('axios');
vi.mock('../../context/AuthContextCli');
// Evita que @stripe/stripe-js intente cargar el script real de Stripe.
vi.mock('@stripe/stripe-js', () => ({ loadStripe: vi.fn() }));

const aspirina = {
  id_producto: 1,
  cantidad: 2,
  producto: { nombre: 'Aspirina', precio_unitario: 10 },
};
const ibuprofeno = {
  id_producto: 2,
  cantidad: 1,
  producto: { nombre: 'Ibuprofeno', precio_unitario: 15 },
};

describe('CarritoTabla - eliminar ítems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAuth.mockReturnValue({ user: { correo: 'cliente@ejemplo.com' } });
    axios.delete.mockResolvedValue({});
  });

  it('TC-018: al eliminar el último ítem el carrito queda vacío y desaparece el total', async () => {
    const user = userEvent.setup();
    axios.get
      .mockResolvedValueOnce({ data: [aspirina] }) // carga inicial
      .mockResolvedValueOnce({ data: [] }); // recarga tras eliminar

    render(<CarritoTabla id_cliente={1} />);

    expect(await screen.findByText('Q20.00')).toBeInTheDocument(); // total inicial: 2 * 10

    await user.click(screen.getByRole('button', { name: /eliminar/i }));

    expect(await screen.findByText('Tu carrito está vacío.')).toBeInTheDocument();
    expect(screen.queryByText(/total:/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Aspirina')).not.toBeInTheDocument();
  });

  it('TC-018b: al eliminar un ítem de varios, recalcula el total con los ítems restantes', async () => {
    const user = userEvent.setup();
    // Simula lo que ya guarda la app en localStorage al agregar productos
    localStorage.setItem('carrito', JSON.stringify([{ id: 1 }, { id: 2 }]));

    axios.get
      .mockResolvedValueOnce({ data: [aspirina, ibuprofeno] }) // total: 20 + 15 = 35
      .mockResolvedValueOnce({ data: [ibuprofeno] }); // total: 15

    render(<CarritoTabla id_cliente={1} />);

    expect(await screen.findByText('Q35.00')).toBeInTheDocument();

    // Elimina el primer ítem (Aspirina, id_producto = 1)
    const botones = screen.getAllByRole('button', { name: /eliminar/i });
    await user.click(botones[0]);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/carrito/eliminar'),
        { data: { id_cliente: 1, id_producto: 1 } }
      );
    });

    // Total recalculado y ítem eliminado de la tabla
    expect(await screen.findByText('Q15.00')).toBeInTheDocument();
    expect(screen.queryByText('Q35.00')).not.toBeInTheDocument();
    expect(screen.queryByText('Aspirina')).not.toBeInTheDocument();
    expect(screen.getByText('Ibuprofeno')).toBeInTheDocument();

    // El localStorage también se sincroniza (queda solo el producto 2)
    expect(JSON.parse(localStorage.getItem('carrito'))).toEqual([{ id: 2 }]);
  });
});
