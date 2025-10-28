import { useState, useEffect } from "react";

export default function ClienteForm({ initialData = {}, onSubmit, loading }) {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    nit: "",
    contrasena: "",
    direccion: "",
    telefono: "",
    correo: "",
    ...initialData,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {["nombre", "apellido", "nit", "correo", "telefono", "direccion"].map((field) => (
        <input
          key={field}
          name={field}
          value={form[field]}
          onChange={handleChange}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          className="w-full px-4 py-2 border rounded"
          required={field !== "direccion"} // dirección puede ser opcional
        />
      ))}

      {/* Solo mostrar contraseña si no viene en initialData (modo creación) */}
      {!initialData?.id && (
        <input
          name="contrasena"
          type="password"
          value={form.contrasena}
          onChange={handleChange}
          placeholder="Contraseña"
          className="w-full px-4 py-2 border rounded"
          required
        />
      )}

      <div className="flex gap-4 mt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>

        <button
          type="button"
          onClick={() => window.history.back()}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}