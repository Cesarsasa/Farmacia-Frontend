import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { endpoints } from "../../../../config/api";

export default function Inventario() {
   
  const { token, loading: authLoading } = useAuth();
  const [inventario, setInventario] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const fetchInventario = async () => {
      try {
        const [resInventario, resSucursales] = await Promise.all([
          axios.get(endpoints.inventario.mostrar, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(endpoints.sucursal.mostrar, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setInventario(resInventario.data);
        setSucursales(resSucursales.data);
      } catch (error) {
        console.error("Error al cargar inventario o sucursales:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventario();
  }, [token]);

  const handleAgregar = () => {
    navigate("/inventariocreate");
  };
    const handleDashboard = () => {
    navigate("/Repo/Inventario");
  };
 if (!authLoading && !token) {
  return <Navigate to="/" replace />;
}
  const handleEditar = (id) => {
    navigate(`/inventario/edit/${id}`);
  };

  const handleEliminar = async (id) => {
    try {
      await axios.delete(endpoints.inventario.eliminar(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventario((prev) => prev.filter((i) => i.id !== id));
    } catch (error) {
      console.error("Error al eliminar inventario:", error);
    }
  };

  const inventarioFiltrado = inventario.filter((i) => {
    const coincideProducto = i.producto?.nombre?.toLowerCase().includes(search.toLowerCase());
    const coincideSucursal =
      sucursalSeleccionada === "" || i.sucursal?.id === parseInt(sucursalSeleccionada);
    return coincideProducto && coincideSucursal;
  });

  if (authLoading || loading) {
    return <div className="p-6 text-gray-600">Cargando inventario...</div>;
  }

  return (
    <div className="flex">
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-4">
           <button
            onClick={handleDashboard }
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>
         
          <button
            onClick={handleAgregar}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Agregar
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Buscar por producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={sucursalSeleccionada}
            onChange={(e) => setSucursalSeleccionada(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las sucursales</option>
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventarioFiltrado.map((i) => (
            <div key={i.id} className="bg-white shadow-md rounded-lg p-4">
              {i.producto?.imagen_url && (
                <img
                  src={i.producto.imagen_url}
                  alt={i.producto.nombre}
                  className="w-full h-40 object-cover rounded mb-4"
                />
              )}
              <h2 className="text-lg font-semibold text-gray-700">
                {i.producto?.nombre || "Producto desconocido"}
              </h2>
              <p className="text-sm text-gray-500">
                Sucursal: {i.sucursal?.nombre || "Sin sucursal"}
              </p>
              <p className="text-sm text-gray-500">Cantidad: {i.cantidad}</p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEditar(i.id)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(i.id)}
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