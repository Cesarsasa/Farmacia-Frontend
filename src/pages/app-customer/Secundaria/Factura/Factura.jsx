import { useState, useEffect } from "react";
import axios from "axios";
import { endpoints } from "../../../../config/api";
import { useAuth } from "../../../../context/AuthContextCli";

export default function FacturaAcciones() {
  const { user } = useAuth();
  const [venta, setVenta] = useState(null);
  const [errorVenta, setErrorVenta] = useState(false);
  const [facturaGenerada, setFacturaGenerada] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      console.warn("⚠️ No hay usuario autenticado.");
      return;
    }

    axios
      .get(endpoints.factura.ultima(user.id))
      .then((res) => {
        setVenta(res.data);
        setErrorVenta(false);
      })
      .catch((err) => {
        console.error("Error al cargar venta:", err);
        setVenta(null);
        setErrorVenta(true);
      });
  }, [user]);

  const generarFactura = async () => {
    try {
      if (!venta) {
        alert("La venta aún no está disponible.");
        return;
      }

      // Crear factura en el backend
      const facturaRes = await axios.post(endpoints.factura.crear, {
        id_venta: venta.id
      });

      const factura = facturaRes.data.factura;

      // Abrir PDF en nueva pestaña
      const nuevaVentana = window.open("", "_blank");
      setTimeout(() => {
        nuevaVentana.location.href = endpoints.factura.generarPDF(factura.id);
      }, 3000);

      // Enviar factura por correo
      await axios.get(endpoints.factura.enviarCorreo(factura.id));

      alert("Factura generada y enviada correctamente.");
      setFacturaGenerada(true);
    } catch (err) {
      console.error("Error en el proceso de facturación:", err);
      alert("No se pudo generar la factura.");
    }
  };

  if (!user) {
    return (
      <div className="text-center mt-10 text-red-600">
        Debes iniciar sesión para generar una factura.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded text-center">
      <h2 className="text-2xl font-bold text-green-700 mb-4">¡Compra exitosa!</h2>
      <p className="mb-6">Tu factura está lista para imprimir y enviar.</p>

      {errorVenta && (
        <p className="text-red-600 mb-4">
          No se pudo cargar la venta. Intenta nuevamente más tarde.
        </p>
      )}

      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => (window.location.href = "/home-cli")}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Salir
        </button>

        <button
          onClick={generarFactura}
          disabled={!venta || facturaGenerada}
          className={`px-4 py-2 rounded ${
            venta && !facturaGenerada
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {facturaGenerada ? "Factura generada ✅" : "Imprimir factura"}
        </button>
      </div>
    </div>
  );
}