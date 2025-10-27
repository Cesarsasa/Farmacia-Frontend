import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import Sidebar from "../../../../components/Sidebar";
import { endpoints } from "../../../../config/api";

export default function Facturas() {
  const { token, loading: authLoading } = useAuth();
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchFacturas = async () => {
      try {
        const res = await axios.get(endpoints.factura.mostrar, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFacturas(res.data);
      } catch (error) {
        console.error("Error al cargar facturas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacturas();
  }, [token]);
 if (!authLoading && !token) {
  return <Navigate to="/" replace />;
}
const handleImprimir = async (id) => {
  window.open(endpoints.factura.generarPDF(id), "_blank");
};

  if (authLoading || loading) {
    return <div className="p-6 text-gray-600">Cargando facturas...</div>;
  }

  return (
    <div className="flex">
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Facturas Emitidas</h1>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Número</th>
                <th className="px-4 py-2 text-left">Cliente</th>
                <th className="px-4 py-2 text-left">Sucursal</th>
                <th className="px-4 py-2 text-left">Usuario</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((factura) => (
                <tr key={factura.id} className="border-t">
                  <td className="px-4 py-2">
                    {new Date(factura.fecha_emision).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{factura.numero_factura}</td>
                  <td className="px-4 py-2">{factura.venta?.cliente?.nombre || "—"}</td>
                  <td className="px-4 py-2">{factura.venta?.sucursal?.nombre || "—"}</td>
                  <td className="px-4 py-2">{factura.venta?.usuario?.nombre || "—"}</td>
                  <td className="px-4 py-2">
                    {factura.venta?.total
                      ? `Q${parseFloat(factura.venta.total).toFixed(2)}`
                      : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleImprimir(factura.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Imprimir
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