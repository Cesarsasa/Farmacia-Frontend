export default function ProductoCard({ producto, onAgregar }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col text-center">
      <div className="relative w-full h-60 bg-gray-100">
        <img
          src={producto.imagen_url || "/placeholder.jpg"} // imagen por defecto si no hay URL
          alt={producto.nombre}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-semibold text-lg text-gray-800">{producto.nombre}</h3>
        <p className="text-blue-600 font-bold text-sm">Q{producto.precio_unitario}</p>

        <button
          onClick={onAgregar}
          className="mt-2 bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition"
        >
          Agregar
        </button>
      </div>
    </div>
  );
}