import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { endpoints } from "../../../../config/api";

export default function Proveedor() {
  const { token, loading: authLoading } = useAuth();
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const fetchProveedores = async () => {
      try {
        const res = await axios.get(endpoints.proveedor.mostrar, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProveedores(res.data);
      } catch (error) {
        console.error("Error al cargar proveedores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProveedores();
  }, [token]);

  const handleAgregar = () => {
    navigate("/proveedorcreate");
  };
 if (!authLoading && !token) {
  return <Navigate to="/" replace />;
}
  const handleEditar = (id) => {
    navigate(`/proveedor/edit/${id}`);
  };

  const handleEliminar = async (id) => {
    try {
      await axios.delete(endpoints.proveedor.eliminar(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProveedores((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error al eliminar proveedor:", error);
    }
  };

  const proveedoresFiltrados = proveedores.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || loading) {
    return <div className="p-6 text-gray-600">Cargando proveedores...</div>;
  }

  return (
    <div className="flex">
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Proveedores</h1>
          <button
            onClick={handleAgregar}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Agregar
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-6 w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proveedoresFiltrados.map((p) => (
            <div key={p.id} className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-700">{p.nombre}</h2>
              <p className="text-sm text-gray-500">Contacto: {p.contacto}</p>
              <p className="text-sm text-gray-500">Correo: {p.correo}</p>
              <p className="text-sm text-gray-500">Teléfono: {p.telefono}</p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEditar(p.id)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(p.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}