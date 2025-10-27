import React from 'react';
import PerfilDropdown from './PerfilDropdown';
import { Link } from "react-router-dom";
const Navbar = () => {
  return (
    <nav className="bg-blue-700 text-white px-8 py-2 flex justify-between items-center shadow-md">
      <Link to="/home" className="text-xl font-bold hover:underline">
  💊 FarmaPlus
</Link>

      <div className="flex items-center gap-8">
        <a href="/home-cli" className="hover:underline">Sitio Web</a>
        <a href="/Repo/Inventario" className="hover:underline">Inventario</a>
        <a href="/Repo" className="hover:underline">Reportes</a>

        {/* Ícono de perfil con padding superior */}
        <div className="pt-1">
          <PerfilDropdown />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;