import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductoCard from '../ProductoCard';

/**
 * Corresponde a la ficha TC-AUTO-008 del informe técnico.
 */

describe('ProductoCard', () => {
  const producto = {
    nombre: 'Vitamina C',
    precio_unitario: 25,
    imagen_url: '',
  };

  it('TC-AUTO-008: dispara onAgregar al hacer clic en el botón "Agregar"', async () => {
    const onAgregar = vi.fn();
    const user = userEvent.setup();

    render(<ProductoCard producto={producto} onAgregar={onAgregar} />);

    // Verifica que la información del producto se muestre correctamente
    expect(screen.getByText('Vitamina C')).toBeInTheDocument();
    expect(screen.getByText('Q25')).toBeInTheDocument();

    const boton = screen.getByRole('button', { name: /agregar/i });
    await user.click(boton);

    expect(onAgregar).toHaveBeenCalledTimes(1);
  });
});