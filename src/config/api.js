// src/config/api.js


export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8082/api";

export const endpoints = {
  // Recursos generales
  
   host : `${API_URL}/`,
  productos: `${API_URL}/producto`,
  login: `${API_URL}/auth/login`,

  // Acciones sobre usuario
  usuario: {
    usuarios: `${API_URL}/usuario/`,
    crear: `${API_URL}/usuario/create`,
    obtener: (id) => `${API_URL}/usuario/${id}`,
    actualizar: (id) => `${API_URL}/usuario/update/${id}`,
    eliminar: (id) => `${API_URL}/usuario/delete/${id}`,
  },

  // Acciones sobre cliente (si aplica)
  customer: {
      clientes: `${API_URL}/customer`,
        crear: `${API_URL}/customer/create`,
      obtener: (id) => `${API_URL}/customer/${id}`,
      eliminar: (id) => `${API_URL}/customer/delete/${id}`,
      actualizar: (id) => `${API_URL}/customer/update/${id}`,
        buscarnit: (id) => `${API_URL}/customer/buscarnit/${id}`,
  },
  proveedor: {
      mostrar: `${API_URL}/prov`,
        crear: `${API_URL}/prov/create`,
      obtener: (id) => `${API_URL}/prov/${id}`,
      eliminar: (id) => `${API_URL}/prov/delete/${id}`,
      actualizar: (id) => `${API_URL}/prov/update/${id}`,
  },
   sucursal: {
      mostrar: `${API_URL}/sucursal`,
        crear: `${API_URL}/sucursal/create`,
      obtener: (id) => `${API_URL}/sucursal/${id}`,
      eliminar: (id) => `${API_URL}/sucursal/delete/${id}`,
      actualizar: (id) => `${API_URL}/sucursal/update/${id}`,
  },
   producto: {
      mostrar: `${API_URL}/producto`,
        crear: `${API_URL}/producto/create`,
      obtener: (id) => `${API_URL}/producto/${id}`,
      eliminar: (id) => `${API_URL}/producto/delete/${id}`,
      actualizar: (id) => `${API_URL}/producto/update/${id}`,
  },
     inventario: {
      mostrar: `${API_URL}/inventario`,
        crear: `${API_URL}/inventario/create`,
      obtener: (id) => `${API_URL}/inventario/${id}`,
      eliminar: (id) => `${API_URL}/inventario/delete/${id}`,
      actualizar: (id) => `${API_URL}/inventario/update/${id}`,
  },
   rol: {
      mostrar: `${API_URL}/rol`,
        crear: `${API_URL}/rol/create`,
      obtener: (id) => `${API_URL}/rol/${id}`,
      eliminar: (id) => `${API_URL}/rol/delete/${id}`,
      actualizar: (id) => `${API_URL}/rol/update/${id}`,
  },
     venta: {
      mostrar: `${API_URL}/ventas`,
        crear: `${API_URL}/ventas/create`,
      obtener: (id) => `${API_URL}/ventas/${id}`,
      eliminar: (id) => `${API_URL}/ventas/delete/${id}`,
      actualizar: (id) => `${API_URL}/ventas/update/${id}`,
  },

  factura: {
      mostrar: `${API_URL}/facturas`,
      enviarCorreo: (id) => `${API_URL}/facturas/correo/${id}`,
        ultima: (id) => `${API_URL}/facturas/ultima/${id}`,
      crear: `${API_URL}/facturas/create`,
        generarPDF: (id) => `${API_URL}/facturas/pdf/${id}`,
      obtener: (id) => `${API_URL}/ventas/${id}`,
      eliminar: (id) => `${API_URL}/ventas/delete/${id}`,
      actualizar: (id) => `${API_URL}/ventas/update/${id}`,
  },
  carrito: {
      mostrar: `${API_URL}/facturas`,
        agregar: `${API_URL}/carrito/agregar`,
      confirmar: `${API_URL}/carrito/confirmar`,
      ver: (id) => `${API_URL}/carrito/ver/${id}`,
      eliminar :`${API_URL}/carrito/eliminar`,
      actualizar : `${API_URL}/carrito/actualizar/`,
  },
  stripe: {
     crear_sesion: `${API_URL}/stripe/checkout`,
      webhook: `${API_URL}/stripe//webhook`,
  },

};