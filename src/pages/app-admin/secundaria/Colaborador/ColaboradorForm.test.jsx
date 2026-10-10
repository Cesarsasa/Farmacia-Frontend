import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import ColaboradorForm from './ColaboradorForm';
import { useAuth } from '../../../../context/AuthContext';

/**
 * Corresponde a la fila TC-030 del plan de pruebas
 * ("Colaborador - Validación de formulario").
 *
 * A diferencia de ClienteForm (que usa validación nativa del navegador con
 * `required`), ColaboradorForm valida él mismo con setError(...) y muestra
 * el mensaje en un <div>, así que aquí SÍ se puede verificar el texto en
 * pantalla.
 */

vi.mock('axios');
vi.mock('../../../../context/AuthContext');

describe('ColaboradorForm - validación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ token: 'fake-token' });
    axios.get.mockImplementation((url) => {
      if (url.includes('sucursal')) {
        return Promise.resolve({ data: [{ id: 1, nombre: 'Sucursal Central' }] });
      }
      if (url.includes('rol')) {
        return Promise.resolve({ data: [{ id: 1, nombre: 'Vendedor' }] });
      }
      return Promise.resolve({ data: [] });
    });
  });

  it('TC-030: no permite enviar el formulario sin completar los campos obligatorios', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    const { container } = render(<ColaboradorForm onSubmit={onSubmit} loading={false} />);
    await screen.findByRole('option', { name: 'Sucursal Central' }); // espera a que cargue

    // Los <input required> nativos interceptan el submit por clic (igual que
    // en un navegador real) antes de llegar al handleSubmit del componente,
    // así que se dispara el evento "submit" directamente (mismo patrón que
    // ProductoForm.test.jsx) para ejercitar la validación propia del form.
    fireEvent.submit(container.querySelector('form'));

    expect(await screen.findByText('Nombre es requerido')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('TC-030b: valida los campos uno por uno, en el orden del formulario', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    const { container } = render(<ColaboradorForm onSubmit={onSubmit} loading={false} />);
    await screen.findByRole('option', { name: 'Sucursal Central' });
    const form = container.querySelector('form');

    await user.type(screen.getByPlaceholderText('Nombre'), 'Carlos Ruiz');
    fireEvent.submit(form);
    expect(await screen.findByText('Correo es requerido')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Correo'), 'carlos@farmaplus.com');
    fireEvent.submit(form);
    expect(await screen.findByText('Puesto es requerido')).toBeInTheDocument();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('TC-030c: el salario debe ser numérico, no solo estar presente', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    const { container } = render(<ColaboradorForm onSubmit={onSubmit} loading={false} />);
    await screen.findByRole('option', { name: 'Sucursal Central' });

    await user.type(screen.getByPlaceholderText('Nombre'), 'Carlos Ruiz');
    await user.type(screen.getByPlaceholderText('Correo'), 'carlos@farmaplus.com');
    await user.type(screen.getByPlaceholderText('Puesto'), 'Vendedor');
    await user.type(screen.getByPlaceholderText('Telefono'), '5555-1234');
    const [selectSucursal, selectRol] = screen.getAllByRole('combobox');
    await user.selectOptions(selectSucursal, '1');
    await user.selectOptions(selectRol, '1');
    // El input es type="number": escribir texto no numérico lo deja vacío,
    // así que el formulario cae en la misma validación que "salario faltante".
    await user.type(screen.getByPlaceholderText('Salario'), 'abc');

    // El input de salario queda vacío (type="number" descarta "abc"), por lo
    // que HTML5 lo trata como campo requerido vacío y bloquea el click; se
    // dispara el submit directamente para llegar a la validación del form.
    fireEvent.submit(container.querySelector('form'));

    expect(
      await screen.findByText('Salario es requerido y debe ser un número válido')
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('TC-030d: con todos los campos válidos, envía el formulario completo', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<ColaboradorForm onSubmit={onSubmit} loading={false} />);
    await screen.findByRole('option', { name: 'Sucursal Central' });

    await user.type(screen.getByPlaceholderText('Nombre'), 'Carlos Ruiz');
    await user.type(screen.getByPlaceholderText('Correo'), 'carlos@farmaplus.com');
    await user.type(screen.getByPlaceholderText('Contrasena'), 'Pass1234');
    await user.type(screen.getByPlaceholderText('Puesto'), 'Vendedor');
    await user.type(screen.getByPlaceholderText('Telefono'), '5555-1234');
    const [sucursalSelect, rolSelect] = screen.getAllByRole('combobox');
    await user.selectOptions(sucursalSelect, '1');
    await user.selectOptions(rolSelect, '1');
    await user.type(screen.getByPlaceholderText('Salario'), '3500');

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'Carlos Ruiz',
          correo: 'carlos@farmaplus.com',
          puesto: 'Vendedor',
          telefono: '5555-1234',
          id_sucursal: '1',
          id_rol: '1',
          salario: '3500',
        })
      );
    });
  });
});
