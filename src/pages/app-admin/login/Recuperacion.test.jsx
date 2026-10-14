import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ForgotPassword from './recupetacioncon';
import ResetPassword from './restablecer';

/**
 * Corresponde a las filas TC-010 y TC-011 del plan de pruebas
 * ("Auth (recuperación de contraseña)" - Frontend). También cubre el lado
 * frontend de TC-007/008/009 (muestra el mensaje que devuelve el backend).
 *
 * NOTA: la pantalla de restablecer NO tiene campo "confirmar contraseña"
 * (solo un input de contraseña), así que TC-011 no se puede ejecutar como
 * está redactado. TC-011 documenta esa ausencia (hallazgo).
 */

function respuesta(ok, body) {
  return Promise.resolve({ ok, json: () => Promise.resolve(body) });
}

describe('ForgotPassword (admin) - TC-010', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  const renderForgot = () =>
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

  it('TC-010: un correo con formato inválido no se envía (validación nativa type="email")', async () => {
    const user = userEvent.setup();
    renderForgot();

    const input = screen.getByPlaceholderText('Correo');
    expect(input).toHaveAttribute('type', 'email');

    await user.type(input, 'esto-no-es-un-correo');
    await user.click(screen.getByRole('button', { name: /enviar instrucciones/i }));

    expect(global.fetch).not.toHaveBeenCalled();
    expect(input).toBeInvalid();
  });

  it('TC-010b: un correo válido envía la solicitud y muestra el mensaje de éxito', async () => {
    global.fetch.mockReturnValue(respuesta(true, { message: 'Correo enviado con instrucciones.' }));
    const user = userEvent.setup();
    renderForgot();

    await user.type(screen.getByPlaceholderText('Correo'), 'empleado@ejemplo.com');
    await user.click(screen.getByRole('button', { name: /enviar instrucciones/i }));

    expect(await screen.findByText('Correo enviado con instrucciones.')).toBeInTheDocument();
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toMatch(/\/auth\/solicitar-con$/);
    expect(JSON.parse(opts.body)).toEqual({ correo: 'empleado@ejemplo.com' });
  });

  it('TC-010c (hallazgo): el componente no valida el formato por su cuenta; si se salta la validación nativa igual envía la solicitud', async () => {
    global.fetch.mockReturnValue(respuesta(false, { message: 'Correo no registrado' }));
    const { container } = renderForgot();

    fireEvent.change(screen.getByPlaceholderText('Correo'), { target: { value: 'no-es-correo' } });
    fireEvent.submit(container.querySelector('form'));

    expect(await screen.findByText('Correo no registrado')).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('TC-007 (lado frontend): correo no registrado muestra el mensaje del backend', async () => {
    global.fetch.mockReturnValue(respuesta(false, { message: 'Correo no registrado' }));
    const user = userEvent.setup();
    renderForgot();

    await user.type(screen.getByPlaceholderText('Correo'), 'nadie@ejemplo.com');
    await user.click(screen.getByRole('button', { name: /enviar instrucciones/i }));

    expect(await screen.findByText('Correo no registrado')).toBeInTheDocument();
  });
});

describe('ResetPassword (admin) - TC-011', () => {
  let logSpy;

  beforeEach(() => {
    global.fetch = vi.fn();
    // el componente imprime token y contraseña con console.log (hallazgo)
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  const renderReset = (token = 'tok-123') =>
    render(
      <MemoryRouter initialEntries={[`/reset-password?token=${token}`]}>
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
    );

  it('TC-011 (hallazgo): no existe campo de confirmación de contraseña, por lo que no se puede detectar que "no coincide"', () => {
    const { container } = renderReset();

    expect(container.querySelectorAll('input[type="password"]')).toHaveLength(1);
    expect(screen.queryByPlaceholderText(/confirm/i)).not.toBeInTheDocument();
  });

  it('TC-011b: envía el token de la URL junto con la nueva contraseña y muestra el mensaje de éxito', async () => {
    global.fetch.mockReturnValue(respuesta(true, { message: 'Contraseña actualizada correctamente.' }));
    const user = userEvent.setup();
    renderReset('tok-abc');

    await user.type(screen.getByPlaceholderText('Nueva contraseña'), 'NuevaPass1');
    await user.click(screen.getByRole('button', { name: /restablecer/i }));

    expect(await screen.findByText('Contraseña actualizada correctamente.')).toBeInTheDocument();
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toMatch(/\/auth\/restablecer-con$/);
    expect(JSON.parse(opts.body)).toEqual({ token: 'tok-abc', nuevaContrasena: 'NuevaPass1' });
  });

  it('TC-008 (lado frontend): token expirado muestra el mensaje del backend', async () => {
    global.fetch.mockReturnValue(respuesta(false, { message: 'El enlace ha expirado. Solicita uno nuevo.' }));
    const user = userEvent.setup();
    renderReset();

    await user.type(screen.getByPlaceholderText('Nueva contraseña'), 'NuevaPass1');
    await user.click(screen.getByRole('button', { name: /restablecer/i }));

    expect(await screen.findByText('El enlace ha expirado. Solicita uno nuevo.')).toBeInTheDocument();
  });

  it('TC-009 (lado frontend): token inválido muestra el mensaje del backend', async () => {
    global.fetch.mockReturnValue(respuesta(false, { message: 'Token inválido o error al procesar la solicitud.' }));
    const user = userEvent.setup();
    renderReset('basura');

    await user.type(screen.getByPlaceholderText('Nueva contraseña'), 'NuevaPass1');
    await user.click(screen.getByRole('button', { name: /restablecer/i }));

    expect(await screen.findByText('Token inválido o error al procesar la solicitud.')).toBeInTheDocument();
  });
});
