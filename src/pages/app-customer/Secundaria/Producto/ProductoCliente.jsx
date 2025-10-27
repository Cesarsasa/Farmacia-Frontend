import { useEffect, useState } from "react";
import ProductoCard from "../../../../components/ProductoCard";
import ModalProducto from "../../../../components/ProductoModal";
import { endpoints } from "../../../../config/api";
import axios from "axios";
import Navbar from "../../../../components/NavbarCli";

export default function ProductosCliente() {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  useEffect(() => {
    axios.get(endpoints.producto.mostrar) // Ajustá la ruta según tu backend
      .then(res => setProductos(res.data))
      .catch(err => console.error("Error al cargar productos", err));
  }, []);

  return (
    <div className="p-6 mt-20">
        <Navbar/>
      <h2 className="text-2xl font-bold text-blue-700 mb-6">🛍️ Nuestros Productos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productos.map(producto => (
          <ProductoCard
            key={producto.id}
            producto={producto}
            onAgregar={() => setProductoSeleccionado(producto)}
          />
        ))}
      </div>

      {productoSeleccionado && (
        <ModalProducto
          producto={productoSeleccionado}
          onClose={() => setProductoSeleccionado(null)}
        />
      )}
    </div>
  );
}