import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import RegistroCliente from './RegistroCreate';
import { loginCliente } from '../../../../services/authService-cliente';
import { useAuth } from '../../../../context/AuthContextCli';

/**
 * Corresponde a la fila TC-062 del plan de pruebas
 * ("Registro cliente - Validación de campos requeridos" - Frontend).
 *
 * El formulario combina validación nativa (`required`) con validaciones
 * propias que avisan con window.alert (NIT, largo de contraseña, correo).
 */

vi.mock('axios');
vi.mock('../../../../services/authService-cliente');
vi.mock('../../../../context/AuthContextCli');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockLogin = vi.fn();

function renderRegistro() {
  return render(
    <MemoryRouter>
      <RegistroCliente />
    </MemoryRouter>
  );
}

async function llenar(user, { correo = 'cliente@ejemplo.com', contrasena = 'Secreta123' } = {}) {
  await user.type(screen.getByPlaceholderText('Nombre'), 'Ana');
  await user.type(screen.getByPlaceholderText('Apellido'), 'López');
  await user.type(screen.getByPlaceholderText('Correo'), correo);
  await user.type(screen.getByPlaceholderText('Contraseña'), contrasena);
}

describe('Registro de cliente - validaciones (TC-062)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn();
    useAuth.mockReturnValue({ login: mockLogin });
    axios.post.mockResolvedValue({ data: {} });
    loginCliente.mockResolvedValue({ token: 'token-nuevo' });
  });

  it('TC-062: nombre, apellido, correo y contraseña son obligatorios; teléfono y dirección no', () => {
    renderRegistro();

    expect(screen.getByPlaceholderText('Nombre')).toBeRequired();
    expect(screen.getByPlaceholderText('Apellido')).toBeRequired();
    expect(screen.getByPlaceholderText('Correo')).toBeRequired();
    expect(screen.getByPlaceholderText('Contraseña')).toBeRequired();
    expect(screen.getByPlaceholderText('Teléfono')).not.toBeRequired();
    expect(screen.getByPlaceholderText('Dirección')).not.toBeRequired();
  });

  it('TC-062b: con el formulario vacío el envío es bloqueado y no se llama a la API', async () => {
    const user = userEvent.setup();
    renderRegistro();

    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    expect(axios.post).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText('Nombre')).toBeInvalid();
  });

  it('TC-062c: una contraseña de menos de 6 caracteres se rechaza con aviso', async () => {
    const user = userEvent.setup();
    renderRegistro();
    await llenar(user, { contrasena: '123' });

    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    expect(window.alert).toHaveBeenCalledWith('La contraseña debe tener al menos 6 caracteres.');
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('TC-062d: un correo con formato inválido se rechaza con aviso', async () => {
    const user = userEvent.setup();
    renderRegistro();
    await llenar(user, { correo: 'correo-sin-arroba' });

    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    expect(window.alert).toHaveBeenCalledWith('Por favor ingresa un correo válido.');
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('TC-062e: al elegir "Ingresar NIT" el número de NIT es obligatorio', async () => {
    const user = userEvent.setup();
    const { container } = renderRegistro();
    await llenar(user);

    await user.selectOptions(screen.getByRole('combobox'), 'NIT');
    const nit = screen.getByPlaceholderText('Número de NIT');
    expect(nit).toBeRequired();

    // Se salta la validación nativa para ejercitar la validación propia del componente
    await user.type(nit, '   ');
    fireEvent.submit(container.querySelector('form'));

    expect(window.alert).toHaveBeenCalledWith('Por favor ingresa un número de NIT válido.');
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('TC-062f: con datos válidos registra el cliente (NIT "CF"), inicia sesión y navega a /producto-cli', async () => {
    const user = userEvent.setup();
    renderRegistro();
    await llenar(user);

    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(axios.post.mock.calls[0][1]).toMatchObject({
      nombre: 'Ana',
      apellido: 'López',
      nit: 'CF',
      correo: 'cliente@ejemplo.com',
      contrasena: 'Secreta123',
    });
    expect(loginCliente).toHaveBeenCalledWith('cliente@ejemplo.com', 'Secreta123');
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('token-nuevo'));
    expect(mockNavigate).toHaveBeenCalledWith('/producto-cli');
  });

  it('TC-062g: si el backend rechaza el registro (p. ej. correo duplicado) avisa y no navega', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    axios.post.mockRejectedValue(new Error('400'));
    const user = userEvent.setup();
    renderRegistro();
    await llenar(user);

    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith('Error al registrar cliente. Verifica los datos.')
    );
    expect(mockNavigate).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });
});
