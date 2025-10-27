import { useAuth } from '../../../context/AuthContext';
import Sidebar from '../../../components/Sidebar';
import PerfilDropdown from '../../../components/PerfilDropdown';
import Navbar from '../../../components/Navbar';
import { Navigate, Link } from 'react-router-dom';

export default function Reportes() {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-center mt-20">Cargando repo...</p>;
  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
 
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <h1 className="text-3xl font-bold text-blue-700 mb-4">
            Reportes disponibles
          </h1>
          <p className="text-gray-600 mb-6">Puesto: {user.puesto}</p>

          {/* Tarjetas de reportes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Inventario */}
            <Link to="/Repo/Inventario">
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4 text-center cursor-pointer">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/7021/7021224.png "
                  alt="Inventario"
                  className="w-40 h-40 mx-auto mb-2"
                />
                <h2 className="text-lg font-semibold text-gray-700">Inventario</h2>
              </div>
            </Link>

            {/* Ventas */}
            <Link to="/Repo/venta">
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4 text-center cursor-pointer">
                <img
                  src="   https://cdn-icons-png.flaticon.com/512/5567/5567435.png "
                  alt="Ventas"
                  className="w-40 h-40 mx-auto mb-2"
                />
                <h2 className="text-lg font-semibold text-gray-700">Ventas</h2>
              </div>
            </Link>

            {/* Clientes */}
            <Link to="/Repo/usuario">
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4 text-center cursor-pointer">
                <img
                  src="   https://cdn-icons-png.flaticon.com/512/9815/9815679.png "
                  alt="Clientes"
                  className="w-40 h-40 mx-auto mb-2"
                />
                <h2 className="text-lg font-semibold text-gray-700">Empleados</h2>
              </div>
            </Link>

            {/* Facturación */}
            <Link to="/Repo/salario">
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4 text-center cursor-pointer">
                <img
                  src="   https://cdn-icons-png.flaticon.com/512/11356/11356438.png "
                  alt="Facturación"
                  className="w-40 h-40 mx-auto mb-2"
                />
                <h2 className="text-lg font-semibold text-gray-700">Salario</h2>
              </div>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}