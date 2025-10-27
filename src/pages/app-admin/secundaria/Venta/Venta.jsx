import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import Sidebar from "../../../../components/Sidebar";
import { endpoints } from "../../../../config/api";

export default function Venta() {
  const { token, loading: authLoading } = useAuth();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchVentas = async () => {
      try {
        const res = await axios.get(endpoints.venta.mostrar, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVentas(res.data);
      } catch (error) {
        console.error("Error al cargar ventas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVentas();
  }, [token]);

  if (authLoading || loading) {
    return <div className="p-6 text-gray-600">Cargando ventas...</div>;
  }
   if (!authLoading && !token) {
  return <Navigate to="/" replace />;
}
const handleVerProductos = (venta) => {
  const productos = venta.detalle_ventas?.map((detalle) => {
    const nombre = detalle.producto?.nombre || "—";
    const cantidad = detalle.cantidad;
    const precio = detalle.precio_unitario;
    return `• ${nombre} — ${cantidad} x Q${precio}`;
  }).join("\n");

  alert(`Productos vendidos:\n\n${productos || "No hay productos registrados."}`);
};

  return (
    <div className="flex">
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Historial de Ventas</h1>
<div className="mb-4">
  <button
    onClick={() => window.location.href = "/ventas/nueva"}
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
  >
    Crear nueva venta
  </button>
</div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Cliente</th>
                <th className="px-4 py-2 text-left">Usuario</th>
                <th className="px-4 py-2 text-left">Sucursal</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Productos</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => (
                <tr key={venta.id} className="border-t">
                  <td className="px-4 py-2">{new Date(venta.fecha).toLocaleString()}</td>
                  <td className="px-4 py-2">{venta.cliente?.nombre || "—"}</td>
                  <td className="px-4 py-2">{venta.usuario?.nombre || "—"}</td>
                  <td className="px-4 py-2">{venta.sucursal?.nombre || "—"}</td>
           <td className="px-4 py-2">{venta.total  ? `Q${parseFloat(venta.total).toFixed(2)}` : "—"}</td>
                  <td className="px-4 py-2">
  {venta.detalle_ventas?.length || 0} producto(s)
  <button
    onClick={() => handleVerProductos(venta)}
    className="ml-2 text-blue-600 hover:underline text-sm"
  >
    Ver
  </button>
</td>

                </tr>
                
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}