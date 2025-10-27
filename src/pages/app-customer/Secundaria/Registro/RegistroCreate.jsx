import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { loginCliente } from "../../../../services/authService-cliente";
import { useAuth } from "../../../../context/AuthContextCli";
import { endpoints } from "../../../../config/api";

export default function RegistroCliente() {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    nitTipo: "CF",
    nitNumero: "",
    correo: "",
    telefono: "",
    direccion: "",
    contrasena: ""
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nitFinal = form.nitTipo === "CF" ? "CF" : form.nitNumero.trim();

    if (form.nitTipo === "NIT" && !nitFinal) {
      alert("Por favor ingresa un número de NIT válido.");
      return;
    }

    if (form.contrasena.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoValido.test(form.correo)) {
      alert("Por favor ingresa un correo válido.");
      return;
    }

    try {
      await axios.post(endpoints.customer.crear, {
        nombre: form.nombre,
        apellido: form.apellido,
        nit: nitFinal,
        correo: form.correo,
        telefono: form.telefono,
        direccion: form.direccion,
        contrasena: form.contrasena
      });

      const loginRes = await loginCliente(form.correo, form.contrasena);
      if (!loginRes || !loginRes.token) {
        alert("Error al iniciar sesión automáticamente.");
        return;
      }

      await login(loginRes.token);
      navigate("/producto-cli");
    } catch (err) {
      console.error("Error al registrar cliente:", err);
      alert("Error al registrar cliente. Verifica los datos.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sección izquierda: bienvenida */}
      <div className="md:w-1/2 bg-blue-600 text-white flex flex-col justify-center items-center p-10">
        <h1 className="text-4xl font-bold mb-4">Bienvenido a Farmaplus</h1>
        <p className="text-lg text-center max-w-md">
          Regístrate para acceder a nuestro catálogo de productos, promociones exclusivas y seguimiento de tus pedidos.
        </p>
        <img src="https://cdn-icons-png.flaticon.com/512/9670/9670601.png" alt="Farmaplus Logo" className="mt-6 w-32 h-auto" />
      </div>

      {/* Sección derecha: formulario */}
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Registro de Cliente</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required className="border p-2 rounded w-full" />
            <input name="apellido" value={form.apellido} onChange={handleChange} placeholder="Apellido" required className="border p-2 rounded w-full" />

            <select name="nitTipo" value={form.nitTipo} onChange={handleChange} className="border p-2 rounded w-full">
              <option value="CF">Consumidor Final (CF)</option>
              <option value="NIT">Ingresar NIT</option>
            </select>

            {form.nitTipo === "NIT" && (
              <input name="nitNumero" value={form.nitNumero} onChange={handleChange} placeholder="Número de NIT" required className="border p-2 rounded w-full" />
            )}

            <input name="correo" value={form.correo} onChange={handleChange} placeholder="Correo" required className="border p-2 rounded w-full" />
            <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono" className="border p-2 rounded w-full" />
            <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Dirección" className="border p-2 rounded w-full" />
            <input name="contrasena" type="password" value={form.contrasena} onChange={handleChange} placeholder="Contraseña" required className="border p-2 rounded w-full" />
          </div>

          <button type="submit" className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}