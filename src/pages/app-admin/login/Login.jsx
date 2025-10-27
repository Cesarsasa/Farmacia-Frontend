import { useState } from 'react';
import { loginEmpleado } from '../../../services/authService';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';



export default function Login() {
  const [form, setForm] = useState({ correo: '', contrasena: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await loginEmpleado(form.correo, form.contrasena);
      login(data.token);
      navigate('/home');
    } catch (err) {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gray-100">
      {/* Branding */}
      <div className="flex flex-col justify-center px-12 space-y-6 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">FP</div>
          <h1 className="text-3xl font-bold text-gray-800">FarmaPlus</h1>
        </div>
        <h2 className="text-4xl font-bold text-gray-700">Sistema de Gestión Farmacéutica</h2>
        <p className="text-lg text-gray-600">
          Accede a tu panel de control para gestionar inventario, recetas, ventas y más.
        </p>
        <div className="grid grid-cols-2 gap-4 pt-8">
          <Feature icon="shield" title="Seguro" desc="Datos protegidos con encriptación" />
          <Feature icon="zap" title="Eficiente" desc="Optimiza tus operaciones diarias" />
        </div>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold text-center">Iniciar Sesión</h2>
          <p className="text-sm text-center text-gray-500">Ingresa tus credenciales para acceder al sistema</p>
          <input
            name="correo"
            type="email"
            placeholder="usuario@farmaplus.com"
            value={form.correo}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            name="contrasena"
            type="password"
            placeholder="Contraseña"
            value={form.contrasena}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <div className="flex justify-between items-center text-sm">
            <label>
              <input type="checkbox" className="mr-2" /> Recordar mi sesión
            </label>
            <Link to="/forgot-password" className="text-blue-600 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="space-y-1">
      <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
        {/* Aquí puedes usar íconos de Heroicons o SVGs personalizados */}
        <span className="text-blue-600 font-bold">{icon}</span>
      </div>
      <h3 className="font-semibold text-gray-700">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}