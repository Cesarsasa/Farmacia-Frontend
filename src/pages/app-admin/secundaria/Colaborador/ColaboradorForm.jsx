import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { endpoints } from "../../../../config/api";

export default function ColaboradorForm({ initialData = {}, onSubmit, loading }) {
  const { token } = useAuth();
  const mountedRef = useRef(true);

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    puesto: "",
    telefono: "",
    id_sucursal: "",
    id_rol: "",
    salario: "", // ← nuevo campo
    ...initialData,
  });

  const [sucursales, setSucursales] = useState([]);
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    mountedRef.current = true;
    if (!token) return;

    const fetchListas = async () => {
      setCargando(true);
      setError("");
      try {
        const sucUrl = endpoints?.sucursal?.mostrar || endpoints?.sucursal?.obtener || endpoints?.sucursal;
        const rolUrl = endpoints?.rol?.mostrar || endpoints?.rol?.obtener || endpoints?.rol;
        if (!sucUrl || !rolUrl) throw new Error("Rutas de sucursal o rol no configuradas en endpoints");

        const [resSuc, resRol] = await Promise.all([
          axios.get(sucUrl, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(rolUrl, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!mountedRef.current) return;

        setSucursales(Array.isArray(resSuc.data) ? resSuc.data : resSuc.data?.data || []);
        setRoles(Array.isArray(resRol.data) ? resRol.data : resRol.data?.data || []);
      } catch (err) {
        console.error("Error cargando sucursales/roles:", err);
        if (mountedRef.current) setError("No se pudieron cargar sucursales o roles.");
      } finally {
        if (mountedRef.current) setCargando(false);
      }
    };

    fetchListas();
    return () => {
      mountedRef.current = false;
    };
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.nombre) return setError("Nombre es requerido");
    if (!form.correo) return setError("Correo es requerido");
    if (!form.puesto) return setError("Puesto es requerido");
    if (!form.telefono) return setError("Teléfono es requerido");
    if (!form.id_sucursal) return setError("Selecciona una sucursal");
    if (!form.id_rol) return setError("Selecciona un rol");
    if (!form.salario || isNaN(form.salario)) return setError("Salario es requerido y debe ser un número válido");

    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600 font-medium">{error}</div>}

      {["nombre", "correo", "contrasena", "puesto", "telefono"].map((field) => (
        <input
          key={field}
          name={field}
          type={field === "contrasena" ? "password" : field === "telefono" ? "tel" : "text"}
          value={form[field]}
          onChange={handleChange}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          className="w-full px-4 py-2 border rounded"
          required={field !== "contrasena" ? true : !!initialData?.contrasena === false}
        />
      ))}

      <input
        name="salario"
        type="number"
        step="0.01"
        value={form.salario}
        onChange={handleChange}
        placeholder="Salario"
        className="w-full px-4 py-2 border rounded"
        required
      />

      <div>
        <label className="block text-sm font-medium mb-1">Sucursal</label>
        {cargando ? (
          <div className="text-sm text-gray-600">Cargando sucursales...</div>
        ) : (
          <select
            name="id_sucursal"
            value={form.id_sucursal}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="">Selecciona sucursal</option>
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre || s.direccion || `Sucursal ${s.id}`}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Rol</label>
        {cargando ? (
          <div className="text-sm text-gray-600">Cargando roles...</div>
        ) : (
          <select
            name="id_rol"
            value={form.id_rol}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="">Selecciona rol</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre || r.descripcion || `Rol ${r.id}`}
              </option>
            ))}
          </select>
        )}
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