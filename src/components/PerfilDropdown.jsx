import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { UserCircleIcon } from "@heroicons/react/24/outline"; // necesitas instalar Heroicons

export default function PerfilDropdown() {
  const { user, signout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    signout();
    navigate("/");
  };

  const handleCuenta = () => {
    navigate("/cuenta");
  };

  return (
    <div className="relative inline-block  text-left ">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-6 text-gray-700 hover:text-blue-600"
      >
        <UserCircleIcon className="h-8 w-8 " />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded shadow-lg z-50">
          <div className="p-4">
            <p className="text-sm text-gray-600">👤 {user.nombre}</p>
            <p className="text-sm text-gray-600">📧 {user.correo}</p>
          </div>
          <div className="border-t px-4 py-2 flex flex-col gap-2">
            <button
              onClick={handleCuenta}
              className="text-left text-blue-600 hover:underline"
            >
             Cuenta
            </button>
            <button
              onClick={handleLogout}
              className="text-left text-red-600 hover:underline"
            >
            Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}