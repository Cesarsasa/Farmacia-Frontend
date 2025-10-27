// src/components/Sidebar.jsx
import PerfilDropdown from './PerfilDropdown';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ visible = true }) {
  const navigate = useNavigate();

  if (!visible) return null;

  return (
    <aside className="w-50 bg-blue-800 text-white flex flex-col p-4 min-h-screen">
     

 

      <button onClick={() => navigate('/producto')} className="text-left px-4 py-2 hover:bg-blue-700 rounded">
        Producto
      </button>
         <button onClick={() => navigate('/inventario')} className="text-left px-4 py-2 hover:bg-blue-700 rounded">
        Invetario
      </button>

      <button onClick={() => navigate('/sucursal')} className="text-left px-4 py-2 hover:bg-blue-700 rounded">
        Sucursal 
      </button>

      <button onClick={() => navigate('/proveedor')} className="text-left px-4 py-2 hover:bg-blue-700 rounded">
        Proveedores
      </button>

      <button onClick={() => navigate('/colaborador')} className="text-left px-4 py-2 hover:bg-blue-700 rounded">
        Empleados
      </button>
      <button onClick={() => navigate('/rol')} className="text-left px-4 py-2 hover:bg-blue-700 rounded">
        Roles
      </button>
       <button onClick={() => navigate('/cliente')} className="text-left px-4 py-2 hover:bg-blue-700 rounded">
        Clientes
      </button>
      <button onClick={() => navigate('/venta')} className="text-left px-4 py-2 hover:bg-blue-700 rounded">
        Ventas
      </button>
        <button onClick={() => navigate('/factura')} className="text-left px-4 py-2 hover:bg-blue-700 rounded">
        Facturacion
      </button>
    </aside>
  );
}