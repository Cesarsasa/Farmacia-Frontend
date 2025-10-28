import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthProviderCli } from './context/AuthContextCli';

import Login from './pages/app-admin/login/Login';
import ForgotPassword from './pages/app-admin/login/recupetacioncon';
import ResetPassword from './pages/app-admin/login/restablecer';
import Layout from './components/Layout';
import Home from './pages/app-admin/Principal/Home';
import Colaborador from './pages/app-admin/secundaria/Colaborador/Colaborador';
import ColaboradorCreate from './pages/app-admin/secundaria/Colaborador/ColaboradorCreate';
import ColaboradorEdit from './pages/app-admin/secundaria/Colaborador/ColaboradorEdit';
import Cliente from './pages/app-admin/secundaria/Cliente/Cliente';
import ClienteCreate from './pages/app-admin/secundaria/Cliente/ClienteCreate';
import ClienteEdit from './pages/app-admin/secundaria/Cliente/ClienteEdit';
import Proveedor from './pages/app-admin/secundaria/Proveedor/Proveedor';
import ProveedorCreate from './pages/app-admin/secundaria/Proveedor/ProveedorCreate';
import ProveedorEdit from './pages/app-admin/secundaria/Proveedor/ProveedorEdit';
import Sucursal from './pages/app-admin/secundaria/Sucursal/Sucursal';
import SucursalEdit from './pages/app-admin/secundaria/Sucursal/SucursalEdit';
import SucursalCreate from './pages/app-admin/secundaria/Sucursal/SucursalCreate';
import Producto from './pages/app-admin/secundaria/Producto/Producto';
import ProductoCreate from './pages/app-admin/secundaria/Producto/ProductoCreate';
import ProductoEdit from './pages/app-admin/secundaria/Producto/ProductoEdit';
import Inventario from './pages/app-admin/secundaria/Inventario/Inventario';
import InventarioCreate from './pages/app-admin/secundaria/Inventario/InventarioCreate';
import InventarioEdit from './pages/app-admin/secundaria/Inventario/InventarioEdit';
import Roles from './pages/app-admin/secundaria/Rol/Rol';
import RolCreate from './pages/app-admin/secundaria/Rol/RolCreate';
import RolEdit from './pages/app-admin/secundaria/Rol/RolEdit';
import Venta from './pages/app-admin/secundaria/Venta/Venta';
import VentaCreate from './pages/app-admin/secundaria/Venta/VentaCreate';
import Facturas from './pages/app-admin/secundaria/Factura/Factura';
import Logincli from './pages/app-customer/login/Login';
import Homecli from './pages/app-customer/Principal/HomeCli';
import ProductosCliente from './pages/app-customer/Secundaria/Producto/ProductoCliente';
import CarritoCliente from './pages/app-customer/Secundaria/Carrito/Carrito';
import RegistroCliente from './pages/app-customer/Secundaria/Registro/RegistroCreate';
import FacturaAcciones from './pages/app-customer/Secundaria/Factura/Factura';
import InventarioRepo from './pages/app-admin/Reporteria/Inventario';
 import Contactocli from './pages/app-customer/Principal/Contactos';
 import Reportes from './pages/app-admin/Reporteria/Reporte';
 import Usu from './pages/app-admin/Reporteria/Usuarios';
 import Ventas from './pages/app-admin/Reporteria/Ventas';
 import Salario from './pages/app-admin/Reporteria/Salario';
 import ClientePerfil from './pages/app-customer/Secundaria/Cliente/ClientePerfil';

function App() {
  return (
    <>
      {/* Contexto para rutas de administrador */}
      <AuthProvider>
        <Routes>
          {/* Rutas públicas admin */}
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Rutas protegidas admin */}
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/colaborador" element={<Colaborador />} />
            <Route path="/colaboradorcreate" element={<ColaboradorCreate />} />
            <Route path="/colaboradores/edit/:id" element={<ColaboradorEdit />} />
            <Route path="/cliente" element={<Cliente />} />
            <Route path="/clientecreate" element={<ClienteCreate />} />
            <Route path="/cliente/edit/:id" element={<ClienteEdit />} />
            <Route path="/proveedor" element={<Proveedor />} />
            <Route path="/proveedorcreate" element={<ProveedorCreate />} />
            <Route path="/proveedor/edit/:id" element={<ProveedorEdit />} />
            <Route path="/sucursal" element={<Sucursal />} />
            <Route path="/sucursalcreate" element={<SucursalCreate />} />
            <Route path="/sucursal/edit/:id" element={<SucursalEdit />} />
            <Route path="/producto" element={<Producto />} />
            <Route path="/productocreate" element={<ProductoCreate />} />
            <Route path="/producto/edit/:id" element={<ProductoEdit />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/inventariocreate" element={<InventarioCreate />} />
            <Route path="/inventario/edit/:id" element={<InventarioEdit />} />
            <Route path="/rol" element={<Roles />} />
            <Route path="/rolcreate" element={<RolCreate />} />
            <Route path="/rol/edit/:id" element={<RolEdit />} />
            <Route path="/venta" element={<Venta />} />
            <Route path="/factura" element={<Facturas />} />
            <Route path="/ventas/nueva" element={<VentaCreate />} />
            <Route path="/Repo/Inventario" element={<InventarioRepo />} />
              <Route path="/Repo" element={<Reportes />} />
              <Route path="/Repo/venta" element={<Ventas />} />
              <Route path="/Repo/usuario" element={<Usu />} />
              <Route path="/Repo/salario" element={<Salario />} />
          </Route>
        </Routes>
      </AuthProvider>

      {/* Contexto para rutas de cliente */}
      <AuthProviderCli>
        <Routes>
          <Route path="/login-cli" element={<Logincli />} />
          <Route path="/home-cli" element={<Homecli/>} />
          <Route path="/producto-cli" element={<ProductosCliente />} />
          <Route path="/carrito" element={<CarritoCliente />} />
           <Route path="/register" element={<RegistroCliente />} />
            <Route path="/factura/opc" element={<FacturaAcciones />} />
            <Route path="/contacto-cli" element={<Contactocli />} />
            <Route path="/cliente-perfil" element={<ClientePerfil/>} />
            
          
        </Routes>
      </AuthProviderCli>
    </>
  );
}

export default App;