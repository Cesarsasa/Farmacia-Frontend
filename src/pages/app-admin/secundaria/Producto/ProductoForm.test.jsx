import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import ProductoForm from './ProductoForm';
import { useAuth } from '../../../../context/AuthContext';

/**
 * Corresponde a la ficha TC-AUTO-009 del informe técnico.
 *
 * El componente valida los campos obligatorios con window.alert() antes de
 * llamar a onSubmit, así que se espía window.alert en lugar de buscar un
 * mensaje en el DOM.
 */

vi.mock('axios');
vi.mock('../../../../context/AuthContext');

describe('ProductoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ token: 'fake-token' });
    // La lista de proveedores se carga al montar el componente
    axios.get.mockResolvedValue({ data: [{ id: 1, nombre: 'Proveedor QA' }] });
    window.alert = vi.fn();
  });

  it('TC-AUTO-009: no permite enviar el formulario sin completar los campos obligatorios', async () => {
    const onSubmit = vi.fn();

    const { container } = render(<ProductoForm onSubmit={onSubmit} loading={false} />);
    await screen.findByRole('option', { name: 'Proveedor QA' }); // espera a que cargue el formulario

    // Los <input required> nativos interceptan el submit por clic antes de
    // llegar al JS del componente (igual que en un navegador real), así que
    // se dispara el evento "submit" directamente para ejercitar la
    // validación propia de handleSubmit().
    fireEvent.submit(container.querySelector('form'));

    expect(window.alert).toHaveBeenCalledWith('Nombre es requerido');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('TC-AUTO-009b: envía el formulario cuando todos los campos requeridos están completos', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<ProductoForm onSubmit={onSubmit} loading={false} />);

    await user.type(screen.getByPlaceholderText('Nombre'), 'Ibuprofeno');
    await user.type(screen.getByPlaceholderText('Descripción'), 'Antiinflamatorio');
    await user.type(screen.getByPlaceholderText('Precio Unitario'), '12.5');

    // Los <label> del formulario no usan htmlFor/id, así que no quedan
    // asociados semánticamente a sus <select>; se seleccionan por orden.
    await screen.findByRole('option', { name: 'Proveedor QA' }); // espera a que carguen los proveedores
    const combos = screen.getAllByRole('combobox');
    const selectCategoria = combos[0];
    const selectProveedor = combos[1];

    await user.selectOptions(selectCategoria, 'Antiinflamatorio');
    await user.selectOptions(selectProveedor, '1');

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(window.alert).not.toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});