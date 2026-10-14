import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import ProductoEdit from './ProductoEdit';
import { useAuth } from '../../../../context/AuthContext';
import { endpoints } from '../../../../config/api';

/**
 * Corresponde a las filas TC-057 ("Edición de producto existente") y
 * TC-058 ("Precio negativo rechazado") del plan de pruebas - Producto, Frontend.
 *
 * NOTA TC-058: ProductoForm solo comprueba que el precio no esté vacío
 * (`!form.precio_unitario`) y el input <type="number"> no define `min`, así
 * que un precio negativo (o "0") se envía igual. Se documenta como hallazgo.
 */

vi.mock('axios');
vi.mock('../../../../context/AuthContext');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const producto = {
  id: 5,
  nombre: 'Ibuprofeno',
  descripcion: '400 mg caja x10',
  precio_unitario: 30,
  imagen_url: '',
  id_proveedor: 1,
  categoria: 'Analgésico',
};

function renderEdit() {
  return render(
    <MemoryRouter initialEntries={['/producto/edit/5']}>
      <Routes>
        <Route path="/producto/edit/:id" element={<ProductoEdit />} />
      </Routes>
    </MemoryRouter>
  );
}

async function cambiarPrecio(user, valor) {
  const precio = await screen.findByPlaceholderText('Precio Unitario');
  await user.clear(precio);
  await user.type(precio, valor);
}

describe('ProductoEdit - edición', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ token: 'fake-token' });
    axios.get.mockImplementation((url) => {
      if (url === endpoints.producto.obtener(5)) return Promise.resolve({ data: producto });
      if (url === endpoints.proveedor.mostrar) {
        return Promise.resolve({ data: [{ id: 1, nombre: 'Proveedor Uno' }] });
      }
      return Promise.resolve({ data: [] });
    });
    axios.put.mockResolvedValue({ data: {} });
  });

  it('TC-057: carga el producto existente con sus datos precargados en el formulario', async () => {
    renderEdit();

    expect(await screen.findByDisplayValue('Ibuprofeno')).toBeInTheDocument();
    expect(screen.getByDisplayValue('400 mg caja x10')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Precio Unitario')).toHaveValue(30);
    expect(screen.getByText('Editar Producto')).toBeInTheDocument();
  });

  it('TC-057b: al cambiar el precio y guardar, envía PUT con los datos nuevos y vuelve a /producto', async () => {
    const user = userEvent.setup();
    renderEdit();
    await screen.findByRole('option', { name: /Proveedor Uno/ });

    await cambiarPrecio(user, '35');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
    const [url, body, config] = axios.put.mock.calls[0];
    expect(url).toBe(endpoints.producto.actualizar(5));
    expect(body).toMatchObject({ nombre: 'Ibuprofeno', precio_unitario: '35' });
    expect(config.headers.Authorization).toBe('Bearer fake-token');
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/producto'));
  });

  it('TC-057c: si el PUT falla no navega (se queda en el formulario)', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    axios.put.mockRejectedValue(new Error('500'));
    const user = userEvent.setup();
    renderEdit();
    await screen.findByRole('option', { name: /Proveedor Uno/ });

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(mockNavigate).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('TC-058 (hallazgo): un precio negativo NO es rechazado, se envía al backend', async () => {
    const user = userEvent.setup();
    renderEdit();
    await screen.findByRole('option', { name: /Proveedor Uno/ });

    await cambiarPrecio(user, '-5');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
    expect(axios.put.mock.calls[0][1].precio_unitario).toBe('-5');
    expect(screen.getByPlaceholderText('Precio Unitario')).not.toHaveAttribute('min');
  });

  it('TC-058b (hallazgo): el precio "0" tampoco es rechazado (el chequeo es sobre el string "0", que es truthy)', async () => {
    const user = userEvent.setup();
    renderEdit();
    await screen.findByRole('option', { name: /Proveedor Uno/ });

    await cambiarPrecio(user, '0');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
    expect(axios.put.mock.calls[0][1].precio_unitario).toBe('0');
  });
});
