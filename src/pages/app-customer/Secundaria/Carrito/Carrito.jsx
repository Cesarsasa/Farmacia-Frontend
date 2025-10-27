import CarritoTabla from "../../../../components/CarritoTabla";
import { useAuth } from "../../../../context/AuthContextCli";

import Navbar from "../../../../components/NavbarCli";


export default function CarritoCliente() {
  const { user } = useAuth(); // asumimos que tenés contexto de usuario

  return (
    <div className="p-6 mt-20">
      <Navbar />
      <h2 className="text-2xl font-bold text-blue-700 mb-4">🛒 Tu Carrito</h2>
      <CarritoTabla id_cliente={user?.id} />
    </div>
  );
}