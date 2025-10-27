import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_URL } from "../../../config/api";
export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');

  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/restablecer-con`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, nuevaContrasena }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMensaje(data.message);
    } catch (err) {
      setError(err.message || 'Error al restablecer la contraseña');
    }
  };
console.log('Token enviado:', token);
console.log('Contraseña enviada:', nuevaContrasena);
console.log('Contraseña enviada al backend:', nuevaContrasena);
  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Restablecer contraseña</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={nuevaContrasena}
          onChange={(e) => setNuevaContrasena(e.target.value)}
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-green-600 text-white py-2 w-full rounded">
          Restablecer
        </button>
        {mensaje && <p className="text-green-600">{mensaje}</p>}
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
}

