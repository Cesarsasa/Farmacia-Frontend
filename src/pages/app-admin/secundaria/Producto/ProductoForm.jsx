import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { endpoints } from "../../../../config/api";

export default function ProductoForm({ initialData = {}, onSubmit, loading }) {
  const { token } = useAuth();
  const mountedRef = useRef(true);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio_unitario: "",
    imagen_url: "",
    id_proveedor: "",
    categoria: "", // ✅ nuevo campo
    ...initialData,
  });

  const [proveedores, setProveedores] = useState([]);
  const [cargandoProveedores, setCargandoProveedores] = useState(false);
  const [errorProveedores, setErrorProveedores] = useState("");

  useEffect(() => {
    mountedRef.current = true;

    const fetchProveedores = async () => {
      setCargandoProveedores(true);
      setErrorProveedores("");
      try {
        const url = endpoints?.proveedor?.mostrar || endpoints?.proveedor?.obtener || endpoints?.proveedor;
        if (!url) throw new Error("Ruta de proveedores no configurada en endpoints");
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!mountedRef.current) return;
        setProveedores(Array.isArray(res.data) ? res.data : res.data?.data || []);
      } catch (err) {
        console.error("Error cargando proveedores:", err);
        if (mountedRef.current) setErrorProveedores("No se pudieron cargar proveedores.");
      } finally {
        if (mountedRef.current) setCargandoProveedores(false);
      }
    };

    fetchProveedores();
    return () => {
      mountedRef.current = false;
    };
  }, [token]);

  useEffect(() => {
    if (initialData?.id_proveedor && proveedores.length > 0) {
      const match = proveedores.find((p) => String(p.id) === String(initialData.id_proveedor));
      if (!match) {
        // Si no está en la lista, dejar el id en el form
      }
    }
  }, [initialData, proveedores]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre) return alert("Nombre es requerido");
    if (!form.descripcion) return alert("Descripción es requerida");
    if (!form.precio_unitario) return alert("Precio unitario es requerido");
    if (!form.id_proveedor) return alert("Selecciona un proveedor");
    if (!form.categoria) return alert("Selecciona una categoría");

    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="nombre"
        value={form.nombre}
        onChange={handleChange}
        placeholder="Nombre"
        className="w-full px-4 py-2 border rounded"
        required
      />

      <textarea
        name="descripcion"
        value={form.descripcion}
        onChange={handleChange}
        placeholder="Descripción"
        className="w-full px-4 py-2 border rounded"
        required
      />

      <input
        type="number"
        step="0.01"
        name="precio_unitario"
        value={form.precio_unitario}
        onChange={handleChange}
        placeholder="Precio Unitario"
        className="w-full px-4 py-2 border rounded"
        required
      />

      <input
        name="imagen_url"
        value={form.imagen_url}
        onChange={handleChange}
        placeholder="URL de Imagen"
        className="w-full px-4 py-2 border rounded"
      />

      {form.imagen_url && (
        <img
          src={form.imagen_url}
          alt="Vista previa"
          className="w-full h-40 object-cover rounded"
        />
      )}

      {/* ✅ Campo categoría */}
      <div>
        <label className="block text-sm font-medium mb-1">Categoría</label>
        <select
          name="categoria"
          value={form.categoria}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        >
          <option value="">Selecciona categoría</option>
          <option value="Analgésico">Analgésico</option>
          <option value="Antibiótico">Antibiótico</option>
          <option value="Antiinflamatorio">Antiinflamatorio</option>
          <option value="Antigripal">Antigripal</option>
          <option value="Antialérgico">Antialérgico</option>
          <option value="Vitaminas">Vitaminas</option>
          <option value="Otros">Otros</option>
        </select>
      </div>

      {/* Campo proveedor */}
      <div>
        <label className="block text-sm font-medium mb-1">Proveedor</label>

        {cargandoProveedores ? (
          <div className="text-sm text-gray-600">Cargando proveedores...</div>
        ) : errorProveedores ? (
          <div className="text-sm text-red-600">{errorProveedores}</div>
        ) : (
          <select
            name="id_proveedor"
            value={form.id_proveedor}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="">Selecciona proveedor</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre || p.razon_social || `Proveedor ${p.id}`} {p.nit ? `- ${p.nit}` : ""}
              </option>
            ))}
          </select>
        )}

        <div className="mt-2 text-xs text-gray-500">
          Si tu proveedor no aparece, crea uno desde la sección Proveedores.
        </div>
      </div>

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