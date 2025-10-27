import { useState, useEffect } from "react";
import axios from "axios";
import { endpoints } from "../../../../config/api";
import { useAuth } from "../../../../context/AuthContextCli"; // Ajusta la ruta si es diferente

export default function FacturaOpcional() {
  const { user } = useAuth();
  const [nit, setNit] = useState("");
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [venta, setVenta] = useState(null);
  const [errorVenta, setErrorVenta] = useState(false);
  const [facturaGenerada, setFacturaGenerada] = useState(false);
//const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const camposLlenos = Boolean(nit.trim() && nombre.trim() && direccion.trim());

  useEffect(() => {
    if (!user?.id) {
      console.warn("⚠️ No hay usuario autenticado.");
      return;
    }

    console.log("🧑‍💼 ID del cliente recibido:", user.id);

    axios
      .get(endpoints.factura.ultima(user.id))
      .then((res) => {
        console.log("🧾 Venta recibida:", res.data);
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

    // Paso 1: crear la factura en el backend
    const facturaRes = await axios.post(endpoints.factura.crear, {
      id_venta: venta.id
    });

    const factura = facturaRes.data.factura;
    
    // Paso 2: generar el PDF de la factura recién creada


    alert("Factura generada correctamente.");
setFacturaGenerada(true);

const nuevaVentana = window.open("", "_blank"); // abrir de inmediato

setTimeout(() => {
  nuevaVentana.location.href = endpoints.factura.generarPDF(factura.id);
}, 3000);

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
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold text-green-700 mb-4">¡Compra exitosa!</h2>
      <p className="mb-6">
        Gracias por tu compra. Si deseas factura, completa los siguientes datos:
      </p>

      {errorVenta && (
        <p className="text-red-600 mb-4">
          No se pudo cargar la venta. Intenta nuevamente más tarde.
        </p>
      )}

      <div className="space-y-4">
        <input
          type="text"
          placeholder="NIT"
          value={nit}
          onChange={(e) => setNit(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Dirección"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />
      </div>

      {!camposLlenos && (
        <p className="text-sm text-red-500 mt-2">
          Completa todos los campos para habilitar el botón.
        </p>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={() => (window.location.href = "/home-cli")}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Salir
        </button>

        <button
          onClick={generarFactura}
          disabled={!camposLlenos || !venta || facturaGenerada}
          className={`px-4 py-2 rounded ${
            camposLlenos && venta && !facturaGenerada
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