import { useEffect, useState } from "react";
import axios from "axios";
import { endpoints } from "../config/api";
import { useAuth } from "../context/AuthContextCli";
import { iniciarPago } from "../services/stripeService";

export default function CarritoTabla({ id_cliente }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const cargarCarrito = () => {
    axios.get(endpoints.carrito.ver(id_cliente))
      .then(res => setItems(res.data))
      .catch(err => console.error("Error al cargar carrito", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (id_cliente) cargarCarrito();
  }, [id_cliente]);

const eliminarItem = (id_producto) => {
  axios.delete(endpoints.carrito.eliminar, {
    data: { id_cliente, id_producto }
  }).then(() => {
    // ✅ Actualizar localStorage
    const carritoActual = JSON.parse(localStorage.getItem("carrito")) || [];
    const nuevoCarrito = carritoActual.filter(item => item.id !== id_producto);
    localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));

    // ✅ Recargar datos del carrito
    cargarCarrito();
  });
};


  const total = items.reduce((acc, item) => acc + item.cantidad * item.producto.precio_unitario, 0);

  if (loading) return <p>Cargando carrito...</p>;
  if (items.length === 0) return <p>Tu carrito está vacío.</p>;

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full bg-white rounded shadow">
        <thead className="bg-blue-100 text-blue-700">
          <tr>
            <th className="px-4 py-2 text-left">Producto</th>
            <th className="px-4 py-2">Cantidad</th>
            <th className="px-4 py-2">Precio</th>
            <th className="px-4 py-2">Subtotal</th>
            <th className="px-4 py-2">Acción</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id_producto} className="border-t">
              <td className="px-4 py-2">{item.producto.nombre}</td>
              <td className="px-4 py-2 text-center">{item.cantidad}</td>
              <td className="px-4 py-2 text-center">Q{item.producto.precio_unitario}</td>
              <td className="px-4 py-2 text-center">Q{item.cantidad * item.producto.precio_unitario}</td>
              <td className="px-4 py-2 text-center">
                <button
                  onClick={() => eliminarItem(item.id_producto)}
                  className="text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 font-semibold">
            <td colSpan="3" className="px-4 py-2 text-right">Total:</td>
            <td className="px-4 py-2 text-center">Q{total.toFixed(2)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <div className="mt-4 text-center">
       
        <button
        onClick={() => iniciarPago(id_cliente, user.correo, 1, 1)}
        className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700"
      >
        Pagar con tarjeta 💳
      </button>
      </div>
    </div>
  );
}

/*function confirmarCompra(id_cliente) {
  axios.post(endpoints.carrito.confirmar, {
    id_cliente,
    id_usuario: 1, // ajustá según tu sistema
    id_sucursal: 1
  }).then(res => {
    alert("Compra confirmada");
    window.location.reload();
  }).catch(err => {
    console.error("Error al confirmar compra", err);
    alert("Error al confirmar compra");
  });
}*/