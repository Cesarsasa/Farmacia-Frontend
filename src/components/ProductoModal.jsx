import { useEffect, useState } from "react";
import axios from "axios";
import { endpoints } from "../config/api";
import { useAuth } from "../context/AuthContextCli";

export default function ModalProducto({ producto, onClose }) {
  const [inventario, setInventario] = useState([]);
  const [cantidad, setCantidad] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    axios.get(endpoints.inventario.mostrar)
      .then(res => {
        const filtrado = res.data.filter(i => i.producto.id === producto.id);
        setInventario(filtrado);
      })
      .catch(err => console.error("Error al cargar inventario", err));
  }, [producto]);

  const inventarioTotal = inventario.reduce((acc, item) => acc + item.cantidad, 0);

  const handleAgregar = () => {
    if (!user) {
      alert("Debes iniciar sesión para agregar productos al carrito.");
      return;
    }

    if (inventarioTotal === 0) {
      alert("Este producto no tiene inventario disponible.");
      return;
    }

    if (cantidad > inventarioTotal) {
      alert(`Solo hay ${inventarioTotal} unidades disponibles.`);
      return;
    }

    axios.post(endpoints.carrito.agregar, {
      id_cliente: user.id,
      id_producto: producto.id,
      cantidad
    })
      .then(() => {
        alert("Producto agregado al carrito.");
         // ✅ Actualizar localStorage del carrito
    const carritoActual = JSON.parse(localStorage.getItem("carrito")) || [];

    // Verificar si el producto ya existe
    const index = carritoActual.findIndex(item => item.id === producto.id);
    if (index !== -1) {
      carritoActual[index].cantidad += cantidad;
    } else {
      carritoActual.push({ id: producto.id, cantidad });
    }

    localStorage.setItem("carrito", JSON.stringify(carritoActual));


        onClose();
      })
      .catch(err => {
        console.error("Error al agregar al carrito", err);
        alert("No se pudo agregar al carrito.");
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black">✖</button>

        <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-48 object-cover rounded mb-4" />
        <h2 className="text-xl font-bold mb-2">{producto.nombre}</h2>
        <p className="text-gray-600 mb-2">{producto.descripcion}</p>
        <p className="text-blue-700 font-semibold mb-4">Precio: Q{producto.precio_unitario}</p>

        <h3 className="font-semibold mb-2">Disponibilidad por sucursal:</h3>
        <ul className="space-y-1 text-sm">
          {inventario.map((item, i) => (
            <li key={i} className="flex justify-between border-b py-1">
              <span>{item.sucursal.nombre}</span>
              <span>{item.cantidad} unidades</span>
            </li>
          ))}
        </ul>

        {inventarioTotal === 0 && (
          <p className="text-red-600 text-sm mt-2">Este producto no está disponible actualmente.</p>
        )}

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Cantidad deseada:</label>
          <input
            type="number"
            min="1"
            max={inventarioTotal}
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
            className="border p-2 rounded w-full"
            disabled={inventarioTotal === 0}
          />
          {cantidad > inventarioTotal && (
            <p className="text-red-500 text-sm mt-1">
              Solo hay {inventarioTotal} unidades disponibles.
            </p>
          )}
        </div>

        <button
          className={`mt-4 w-full py-2 rounded ${
            inventarioTotal > 0
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-400 text-white cursor-not-allowed"
          }`}
          onClick={handleAgregar}
          disabled={inventarioTotal === 0}
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}