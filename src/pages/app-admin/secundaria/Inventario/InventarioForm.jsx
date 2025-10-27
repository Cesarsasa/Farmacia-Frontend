import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { endpoints } from "../../../../config/api";

export default function InventarioForm({ initialData = {}, onSubmit, loading }) {
  const { token } = useAuth();
  const [form, setForm] = useState({
    cantidad: "",
    id_producto: "",
    id_sucursal: "",
    ...initialData,
  });

  const [productos, setProductos] = useState([]);
  const [sucursales, setSucursales] = useState([]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [resProductos, resSucursales] = await Promise.all([
          axios.get(endpoints.producto.mostrar, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(endpoints.sucursal.mostrar, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setProductos(resProductos.data);
        setSucursales(resSucursales.data);
      } catch (err) {
        console.error("Error al cargar productos o sucursales:", err);
      }
    };

    fetchData();
  }, [token]);

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
        type="number"
        name="cantidad"
        value={form.cantidad}
        onChange={handleChange}
        placeholder="Cantidad"
        className="w-full px-4 py-2 border rounded"
        required
        min={0}
      />

      <select
        name="id_producto"
        value={form.id_producto}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded"
        required
      >
        <option value="">Seleccionar producto</option>
        {productos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre}
          </option>
        ))}
      </select>

      <select
        name="id_sucursal"
        value={form.id_sucursal}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded"
        required
      >
        <option value="">Seleccionar sucursal</option>
        {sucursales.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nombre}
          </option>
        ))}
      </select>

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