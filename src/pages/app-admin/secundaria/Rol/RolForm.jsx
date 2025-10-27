import { useState, useEffect } from "react";

export default function RolForm({ initialData = {}, onSubmit, loading }) {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
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
      <input
        name="nombre"
        value={form.nombre}
        onChange={handleChange}
        placeholder="Nombre del rol"
        className="w-full px-4 py-2 border rounded"
        required
      />

      <textarea
        name="descripcion"
        value={form.descripcion}
        onChange={handleChange}
        placeholder="Descripción del rol"
        className="w-full px-4 py-2 border rounded resize-none"
        rows={4}
        required
      />

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