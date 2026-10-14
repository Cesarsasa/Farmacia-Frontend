import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import VentaForm from './VentaForm';
import VentaCreate from './VentaCreate';
import { useAuth } from '../../../../context/AuthContext';
import { endpoints } from '../../../../config/api';
import { MemoryRouter } from 'react-router-dom';

/**
 * Corresponde a las filas TC-077 ("Cálculo de total en formulario de venta")
 * y TC-078 ("Mensaje de error por stock insuficiente") del plan - Venta, Frontend.
 *
 * HALLAZGOS:
 * - "Buscar NIT" nunca funciona: VentaForm lee `endpoints.cliente.buscarPorNit`,
 *   pero api.js define `endpoints.customer.buscarnit` (otro nombre y otra clave).
 *   Siempre responde "Cliente no encontrado en servidor por ese NIT.".
 * - VentaCreate ignora la casilla "Generar factura" (segundo argumento de
 *   onSubmit): crea la factura siempre.
 */

vi.mock('axios');
vi.mock('../../../../context/AuthContext');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const clientes = [{ id: 1, nombre: 'Ana López', nit: '12345' }];
const sucursales = [{ id: 1, nombre: 'Central' }];
const productos = [
  { id: 1, nombre: 'Vitamina C', precio_unitario: 25 },
  { id: 2, nombre: 'Aspirina', precio_unitario: 10.5 },
];
// Vitamina C: solo 2 unidades en la sucursal Central. Aspirina: 50.
const inventario = [
  { cantidad: 2, producto: { id: 1 }, sucursal: { id: 1 } },
  { cantidad: 50, producto: { id: 2 }, sucursal: { id: 1 } },
];

function mockApi() {
  axios.get.mockImplementation((url) => {
    if (url === endpoints.customer.clientes) return Promise.resolve({ data: clientes });
    if (url === endpoints.sucursal.mostrar) return Promise.resolve({ data: sucursales });
    if (url === endpoints.producto.mostrar) return Promise.resolve({ data: productos });
    if (url === endpoints.inventario.mostrar) return Promise.resolve({ data: inventario });
    return Promise.resolve({ data: [] });
  });
}

async function renderForm(props = {}) {
  const onSubmit = props.onSubmit ?? vi.fn();
  const utils = render(<VentaForm onSubmit={onSubmit} loading={false} />);
  await screen.findByRole('option', { name: 'Central' }); // datos iniciales cargados
  return { onSubmit, ...utils };
}

const selects = () => {
  const [sucursal, producto] = screen.getAllByRole('combobox');
  return { sucursal, producto };
};

async function agregarProducto(user, id) {
  await user.selectOptions(selects().producto, String(id));
  await user.click(screen.getByRole('button', { name: 'Añadir' }));
}

async function elegirCliente(user) {
  await user.type(screen.getByPlaceholderText('Escribe nombre o NIT'), 'Ana');
  await user.click(await screen.findByText('NIT: 12345'));
}

describe('VentaForm - total (TC-077)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ token: 'fake-token', user: { id: 7 }, loading: false });
    mockApi();
  });

  it('TC-077: el total inicial es Q0.00', async () => {
    await renderForm();
    expect(screen.getByText('Total: Q0.00')).toBeInTheDocument();
  });

  it('TC-077b: al añadir un producto el total es precio x 1 y se actualiza al cambiar la cantidad', async () => {
    const user = userEvent.setup();
    await renderForm();

    await agregarProducto(user, 1);
    expect(screen.getByText('Total: Q25.00')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '3' } });
    expect(screen.getByText('Total: Q75.00')).toBeInTheDocument();
  });

  it('TC-077c: con varios productos el total suma cada línea (cantidad x precio) con 2 decimales', async () => {
    const user = userEvent.setup();
    await renderForm();

    await agregarProducto(user, 1); // 25
    await agregarProducto(user, 2); // 10.5
    const [cant1, cant2] = screen.getAllByRole('spinbutton');
    fireEvent.change(cant1, { target: { value: '3' } }); // 75
    fireEvent.change(cant2, { target: { value: '2' } }); // 21

    expect(screen.getByText('Total: Q96.00')).toBeInTheDocument();
  });

  it('TC-077d: quitar un producto recalcula el total', async () => {
    const user = userEvent.setup();
    await renderForm();
    await agregarProducto(user, 1);
    await agregarProducto(user, 2);
    expect(screen.getByText('Total: Q35.50')).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'Quitar' })[0]);

    expect(screen.getByText('Total: Q10.50')).toBeInTheDocument();
  });

  it('TC-077e: una cantidad 0 o negativa se corrige a 1 (no permite totales en cero ni negativos)', async () => {
    const user = userEvent.setup();
    await renderForm();
    await agregarProducto(user, 1);

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '0' } });
    expect(screen.getByText('Total: Q25.00')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '-4' } });
    expect(screen.getByText('Total: Q25.00')).toBeInTheDocument();
  });

  it('TC-077f: no permite añadir el mismo producto dos veces', async () => {
    const user = userEvent.setup();
    await renderForm();

    await agregarProducto(user, 1);
    await agregarProducto(user, 1);

    expect(screen.getByText('El producto ya está en la lista.')).toBeInTheDocument();
    expect(screen.getAllByRole('spinbutton')).toHaveLength(1);
  });
});

describe('VentaForm - stock insuficiente (TC-078)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ token: 'fake-token', user: { id: 7 }, loading: false });
    mockApi();
  });

  it('TC-078: pedir más unidades que el inventario muestra el mensaje con lo disponible y NO envía la venta', async () => {
    const user = userEvent.setup();
    const { onSubmit } = await renderForm();
    await elegirCliente(user);
    await user.selectOptions(selects().sucursal, '1');
    await agregarProducto(user, 1);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '5' } });

    await user.click(screen.getByRole('button', { name: 'Registrar venta' }));

    expect(await screen.findByText('Inventario insuficiente: Vitamina C (disponible 2).')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('TC-078b: pedir exactamente el stock disponible sí envía la venta con el payload esperado', async () => {
    const user = userEvent.setup();
    const { onSubmit } = await renderForm();
    await elegirCliente(user);
    await user.selectOptions(selects().sucursal, '1');
    await agregarProducto(user, 1);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '2' } });

    await user.click(screen.getByRole('button', { name: 'Registrar venta' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      {
        id_usuario: 7,
        id_cliente: 1,
        id_sucursal: '1',
        detalle_ventas: [{ id_producto: 1, cantidad: 2, precio_unitario: 25 }],
      },
      false
    );
    expect(screen.queryByText(/inventario insuficiente/i)).not.toBeInTheDocument();
  });

  it('TC-078c: si una sola línea no tiene stock se rechaza toda la venta aunque las demás sí tengan', async () => {
    const user = userEvent.setup();
    const { onSubmit } = await renderForm();
    await elegirCliente(user);
    await user.selectOptions(selects().sucursal, '1');
    await agregarProducto(user, 2); // 50 disponibles, pide 1
    await agregarProducto(user, 1); // 2 disponibles
    const [, cantVitamina] = screen.getAllByRole('spinbutton');
    fireEvent.change(cantVitamina, { target: { value: '9' } });

    await user.click(screen.getByRole('button', { name: 'Registrar venta' }));

    expect(await screen.findByText('Inventario insuficiente: Vitamina C (disponible 2).')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('TC-078d: sin cliente, sin sucursal o sin productos muestra el aviso correspondiente', async () => {
    const user = userEvent.setup();
    const { onSubmit, container } = await renderForm();
    const form = container.querySelector('form');

    fireEvent.submit(form);
    expect(await screen.findByText('Seleccione o busque un cliente.')).toBeInTheDocument();

    await elegirCliente(user);
    fireEvent.submit(form);
    expect(await screen.findByText('Seleccione una sucursal.')).toBeInTheDocument();

    await user.selectOptions(selects().sucursal, '1');
    fireEvent.submit(form);
    expect(await screen.findByText('Agregue al menos un producto.')).toBeInTheDocument();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('TC-078e (hallazgo): "Buscar NIT" siempre responde "no encontrado" porque endpoints.cliente no existe', async () => {
    const user = userEvent.setup();
    await renderForm();

    await user.type(screen.getByPlaceholderText('Escribe nombre o NIT'), '12345');
    await user.click(screen.getByRole('button', { name: 'Buscar NIT' }));

    expect(await screen.findByText('Cliente no encontrado en servidor por ese NIT.')).toBeInTheDocument();
    expect(endpoints.cliente).toBeUndefined();
  });
});

describe('VentaCreate - factura', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ token: 'fake-token', user: { id: 7 }, loading: false });
    mockApi();
    axios.post.mockImplementation((url) =>
      Promise.resolve({ data: url === endpoints.venta.crear ? { venta: { id: 99 } } : {} })
    );
  });

  it('TC-077g (hallazgo): se crea la factura aunque "Generar factura" esté desmarcado', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <VentaCreate />
      </MemoryRouter>
    );
    await screen.findByRole('option', { name: 'Central' });
    await elegirCliente(user);
    await user.selectOptions(selects().sucursal, '1');
    await agregarProducto(user, 2);
    // el <label> "Generar factura" no está asociado al checkbox (sin htmlFor), se busca por name
    expect(document.querySelector('input[name="requiere_factura"]')).not.toBeChecked();

    await user.click(screen.getByRole('button', { name: 'Registrar venta' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/venta'));
    const urls = axios.post.mock.calls.map((c) => c[0]);
    expect(urls).toEqual([endpoints.venta.crear, endpoints.factura.crear]);
    expect(axios.post.mock.calls[1][1]).toEqual({ id_venta: 99 });
  });
});
