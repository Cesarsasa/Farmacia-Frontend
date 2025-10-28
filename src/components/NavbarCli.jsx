import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContextCli";
import { Link } from "react-router-dom";
export default function Navbar() {

const [totalItems, setTotalItems] = useState(0); // ✅ correcto

useEffect(() => {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  setTotalItems(carrito.length > 0 ? 1 : 0); // solo activa si hay algo
}, []);

  const { user, signout } = useAuth();

  return (
    <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center shadow-md fixed top-0 left-0 w-full z-50">
      <h1 className="text-xl font-bold">💊 FarmaPlus</h1>
      <ul className="flex gap-4 items-center relative">
        <li><Link to="/home-cli" className="hover:underline">Servicios</Link></li>
        <li><Link to="/contacto-cli" className="hover:underline">Contactos</Link></li>
        <li><Link to="/producto-cli" className="hover:underline">Productos</Link></li>

        {/* Ícono de carrito con contador */}
        <li className="relative">
          <Link to="/carrito" className="text-2xl hover:text-yellow-300">🛒</Link>
          {totalItems > 0 && (
  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
    !
  </span>
)}
        </li>

        {/* ✅ Mostrar perfil si está logueado */}
        {user ? (
          <li className="relative group">
            <button className="flex items-center gap-2 bg-white text-blue-700 font-semibold px-4 py-2 rounded-full shadow hover:bg-gray-100 transition duration-300">
              <span>👤</span>
              <span>{user.nombre}</span>
            </button>
            <ul className="absolute right-0 mt-0 w-48 bg-white text-blue-700 rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-50">
              <li>
                <a href="/cliente-perfil" className="block px-4 py-3 hover:bg-blue-100">Mi perfil</a>
              </li>
              <li>
                <button
                  onClick={signout}
                  className="w-full text-left px-4 py-3 hover:bg-blue-100"
                >
                  Cerrar sesión
                </button>
              </li>
            </ul>
          </li>
        ) : (
          <>
            <li>
              <Link to="/register"
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-full shadow transition duration-300"
              >
                Registrarse
              </Link>
            </li>
            <li>
              <Link to="/login-cli"
                className="bg-white text-blue-700 font-semibold px-4 py-2 rounded-full shadow hover:bg-gray-100 transition duration-300"
              >
                Iniciar Sesión
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}