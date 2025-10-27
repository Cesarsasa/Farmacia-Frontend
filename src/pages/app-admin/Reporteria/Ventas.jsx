import { useAuth } from '../../../context/AuthContext';
import Sidebar from '../../../components/Sidebar';
import PerfilDropdown from '../../../components/PerfilDropdown';
import Navbar from '../../../components/Navbar';
export default function Ventas() {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-center mt-20">Cargando Ventas...</p>;

if ( !user) {
  return <Navigate to="/" replace />;
}

  return (
    <div className="flex h-screen">
  
      <main className="flex-1 p-1 overflow-y-auto">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">
         Ventas
        </h1>
        {/* Cuadro con Power BI */}
        <div className="border rounded-lg shadow-md p-4 bg-white">
        
      <iframe
  title="Power BI Report"
  width="100%"
  height="650"
  src="https://app.powerbi.com/view?r=eyJrIjoiNzY2OTE3MDYtMmQzNC00N2I3LWFkMWEtNTAzZDNmMWRkOGZhIiwidCI6IjVmNTNiNGNlLTYzZDQtNGVlOC04OGQyLTIyZjBiMmQ0YjI3YSIsImMiOjR9"
  allowFullScreen
></iframe>
  
        </div>

      </main>
    </div>
  );
}