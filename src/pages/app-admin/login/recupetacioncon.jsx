import { useState } from 'react';
import { API_URL } from "../../../config/api";

export default function ForgotPassword() {
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/solicitar-con`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMensaje(data.message);
    } catch (err) {
      setError(err.message || 'Error al enviar el correo');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">¿Olvidaste tu contraseña?</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-blue-600 text-white py-2 w-full rounded">
          Enviar instrucciones
        </button>
        {mensaje && <p className="text-green-600">{mensaje}</p>}
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
}