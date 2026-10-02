import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import CarritoTabla from '../CarritoTabla';
import { useAuth } from '../../context/AuthContextCli';

/**
 * Módulo: Checkout / Stripe (frontend)
 * Herramienta: Vitest + React Testing Library
 * Corresponden a las filas TC-021 (pago exitoso) y TC-022 (pago fallido)
 * del plan de pruebas.
 *
 * Flujo real: el botón "Pagar con tarjeta" llama a iniciarPago()
 * (src/services/stripeService.js), que hace POST a /stripe/checkout y, si
 * responde bien, redirige el navegador a res.data.url (Stripe Checkout).
 * Si el POST falla, muestra alert("No se pudo iniciar el pago.").
 *
 * Todo Stripe está mockeado: NO se hace ninguna llamada real ni se cobra nada.
 * - axios se mockea con vi.mock (mismo estilo que Carritotabla.test.jsx).
 * - @stripe/stripe-js se mockea para que no cargue el script real.
 * - window.location se reemplaza con vi.stubGlobal para poder verificar la
 *   redirección sin que jsdom intente navegar.
 */

vi.mock('axios');
vi.mock('../../context/AuthContextCli');
vi.mock('@stripe/stripe-js', () => ({ loadStripe: vi.fn() }));

const URL_STRIPE = 'https://checkout.stripe.com/c/pay/cs_test_a1b2c3';
const URL_INICIAL = 'http://localhost/carrito';

const mockItems = [
  {
    id_producto: 1,
    cantidad: 2,
    producto: { nombre: 'Aspirina', precio_unitario: 10 },
  },
];

describe('CarritoTabla - pago con Stripe', () => {
  let alertSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: { correo: 'cliente@ejemplo.com' } });
    axios.get.mockResolvedValue({ data: mockItems });

    vi.stubGlobal('location', { href: URL_INICIAL });
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it('TC-021: pago exitoso - crea la sesión de Stripe y redirige a la URL de checkout', async () => {
    const user = userEvent.setup();
    axios.post.mockResolvedValue({ data: { url: URL_STRIPE } });

    render(<CarritoTabla id_cliente={1} />);

    await user.click(await screen.findByRole('button', { name: /pagar con tarjeta/i }));

    // Envía al backend el cliente y el correo del usuario logueado
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/stripe/checkout'),
        { id_cliente: 1, cliente_email: 'cliente@ejemplo.com' }
      );
    });

    // Redirige a Stripe y no muestra ningún error
    await waitFor(() => {
      expect(window.location.href).toBe(URL_STRIPE);
    });
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('TC-022: pago fallido - muestra el aviso de error y no redirige', async () => {
    const user = userEvent.setup();
    axios.post.mockRejectedValue(new Error('Network Error'));

    render(<CarritoTabla id_cliente={1} />);

    await user.click(await screen.findByRole('button', { name: /pagar con tarjeta/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('No se pudo iniciar el pago.');
    });

    // Sigue en la misma página (no hubo redirección)
    expect(window.location.href).toBe(URL_INICIAL);
    // El error se registra en consola para diagnóstico
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
