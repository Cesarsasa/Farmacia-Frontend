import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { endpoints } from "../../../../config/api";

export default function VentaForm({ initialData = {}, onSubmit, loading }) {
  const { token, user, loading: authLoading } = useAuth();
  const mountedRef = useRef(true);

  const [form, setForm] = useState({
    id_cliente: "",
    id_sucursal: "",
    detalle_ventas: [],
    requiere_factura: false,
    ...initialData,
  });

  const [clientes, setClientes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [productos, setProductos] = useState([]);

  // Buscador de cliente
  const [clienteInput, setClienteInput] = useState("");
  const [clienteFiltrado, setClienteFiltrado] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [usarCF, setUsarCF] = useState(false);

  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    mountedRef.current = true;
    if (!token) return;

    const fetchInitial = async () => {
      try {
        const [resClientes, resSucursales, resProductos] = await Promise.all([
          axios.get(endpoints.customer.clientes, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(endpoints.sucursal.mostrar, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(endpoints.producto.mostrar, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (!mountedRef.current) return;
        setClientes(resClientes.data || []);
        setSucursales(resSucursales.data || []);
        setProductos(resProductos.data || []);
      } catch (err) {
        console.error("Error al cargar datos iniciales:", err);
        setError("No se pudieron cargar clientes, sucursales o productos.");
      }
    };

    fetchInitial();
    return () => {
      mountedRef.current = false;
    };
  }, [token]);

  // Filtrado local de clientes mientras se escribe
  useEffect(() => {
    if (usarCF) {
      const cf = clientes.find((c) => (c.nit || "").toString().toUpperCase() === "CF");
      if (cf) {
        setClienteSeleccionado(cf);
        setForm((prev) => ({ ...prev, id_cliente: cf.id }));
      } else {
        setClienteSeleccionado(null);
        setForm((prev) => ({ ...prev, id_cliente: "" }));
      }
      setClienteFiltrado([]);
      return;
    }

    if (!clienteInput) {
      setClienteFiltrado([]);
      return;
    }

    const lower = clienteInput.toLowerCase();
    const matches = clientes.filter(
      (c) =>
        (c.nombre || "").toLowerCase().includes(lower) ||
        (c.nit || "").toString().toLowerCase().includes(lower)
    );

    setClienteFiltrado(matches.slice(0, 10));
  }, [clienteInput, usarCF, clientes]);

  const buscarClientePorNitBackend = async (nit) => {
    if (!nit || !token) return null;
    const urlBase = endpoints?.cliente?.buscarPorNit;
    if (!urlBase) return null;
    try {
      const res = await axios.get(`${urlBase}/${encodeURIComponent(nit)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch {
      return null;
    }
  };

  const handleClienteInputChange = (value) => {
    setClienteInput(value);
    setClienteFiltrado([]);
    setClienteSeleccionado(null);
    setForm((prev) => ({ ...prev, id_cliente: "" }));
    setError("");
    if (usarCF) setUsarCF(false);
  };

  const handleSelectCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setClienteInput(`${cliente.nombre} (${cliente.nit || "-"})`);
    setForm((prev) => ({ ...prev, id_cliente: cliente.id }));
    setClienteFiltrado([]);
    setError("");
  };

  const handleToggleCF = async (checked) => {
    setUsarCF(checked);
    setClienteFiltrado([]);
    setClienteInput("");
    setError("");
    if (checked) {
      const cfLocal = clientes.find((c) => (c.nit || "").toString().toUpperCase() === "CF");
      if (cfLocal) {
        handleSelectCliente(cfLocal);
        return;
      }
      const cfBackend = await buscarClientePorNitBackend("CF");
      if (cfBackend) {
        handleSelectCliente(cfBackend);
        return;
      }
      setError("Cliente CF no encontrado. Puedes crearlo en Clientes.");
      setForm((prev) => ({ ...prev, id_cliente: "" }));
      setClienteSeleccionado(null);
    } else {
      setForm((prev) => ({ ...prev, id_cliente: "" }));
      setClienteSeleccionado(null);
    }
  };

  const handleAddProducto = () => {
    setError("");
    const prodId = parseInt(productoSeleccionado);
    const producto = productos.find((p) => p.id === prodId);
    if (!producto) {
      setError("Seleccione un producto válido.");
      return;
    }

    const ya = form.detalle_ventas.some((d) => d.id_producto === producto.id);
    if (ya) {
      setError("El producto ya está en la lista.");
      return;
    }

    setForm((prev) => ({
      ...prev,
      detalle_ventas: [
        ...prev.detalle_ventas,
        {
          id_producto: producto.id,
          nombre: producto.nombre,
          cantidad: 1,
          precio_unitario: producto.precio_unitario,
        },
      ],
    }));
    setProductoSeleccionado("");
  };

  const handleDetalleChange = (index, field, value) => {
    setError("");
    setForm((prev) => {
      const copia = [...prev.detalle_ventas];
      copia[index] = {
        ...copia[index],
        [field]: field === "cantidad" ? Math.max(1, parseInt(value || "0")) : value,
      };
      return { ...prev, detalle_ventas: copia };
    });
  };

  const handleRemoveDetalle = (index) => {
    setForm((prev) => {
      const copia = [...prev.detalle_ventas];
      copia.splice(index, 1);
      return { ...prev, detalle_ventas: copia };
    });
  };

  const calcularTotal = () =>
    form.detalle_ventas.reduce((acc, p) => acc + (p.cantidad || 0) * (p.precio_unitario || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (authLoading) {
      setError("Verificando sesión, espera un momento.");
      return;
    }

    if (!user?.id) {
      setError("Usuario no autenticado. Inicia sesión nuevamente.");
      return;
    }

    if (!form.id_cliente) {
      setError("Seleccione o busque un cliente.");
      return;
    }
    if (!form.id_sucursal) {
      setError("Seleccione una sucursal.");
      return;
    }
    if (!form.detalle_ventas || form.detalle_ventas.length === 0) {
      setError("Agregue al menos un producto.");
      return;
    }

    // Usar el endpoint disponible para inventario (mostrar) tal como en tu ModalProducto
    const inventarioUrl = endpoints?.inventario?.mostrar || endpoints?.inventario?.obtener;
    if (!inventarioUrl) {
      console.error("Endpoint de inventario inválido:", endpoints);
      setError("Configuración de endpoints inválida. Contacta al administrador.");
      return;
    }

    try {
      // Traer inventario completo (misma estrategia que ModalProducto)
      const resInv = await axios.get(inventarioUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const inventarioAll = Array.isArray(resInv.data) ? resInv.data : [];

      // Para cada línea, verificar disponibilidad filtrando por producto y sucursal
      for (const item of form.detalle_ventas) {
        const filas = inventarioAll.filter(
          (inv) =>
            // Ajusta estos accesos si la estructura de inventario es distinta
            inv.producto?.id === item.id_producto && String(inv.sucursal?.id) === String(form.id_sucursal)
        );

        const disponible = filas.reduce((acc, f) => acc + (f.cantidad || 0), 0);

        if (disponible < (item.cantidad || 0)) {
          setError(`Inventario insuficiente: ${item.nombre} (disponible ${disponible}).`);
          return;
        }
      }

      // Construir payload usando user.id desde AuthContext
      const payload = {
        id_usuario: user.id,
        id_cliente: form.id_cliente,
        id_sucursal: form.id_sucursal,
        detalle_ventas: form.detalle_ventas.map((d) => ({
          id_producto: d.id_producto,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
        })),
      };

      await onSubmit(payload, form.requiere_factura);
    } catch (err) {
      console.error("Error al verificar inventario o enviar venta:", err);
      setError("Ocurrió un error al intentar registrar la venta.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600 font-medium">{error}</div>}

      {/* Buscador de cliente con dropdown y CF */}
      <div className="space-y-2">
        <label className="block font-medium">Cliente (nombre o NIT)</label>

        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={clienteInput}
            onChange={(e) => handleClienteInputChange(e.target.value)}
            placeholder="Escribe nombre o NIT"
            className="flex-1 px-3 py-2 border rounded"
            disabled={usarCF}
            autoComplete="off"
          />

          <button
            type="button"
            onClick={async () => {
              if (!clienteInput) return;
              const backendCliente = await buscarClientePorNitBackend(clienteInput.trim());
              if (backendCliente) {
                handleSelectCliente(backendCliente);
              } else {
                setError("Cliente no encontrado en servidor por ese NIT.");
              }
            }}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
            disabled={!clienteInput || usarCF}
          >
            Buscar NIT
          </button>

          <label className="flex items-center gap-1 text-sm">
            <input type="checkbox" checked={usarCF} onChange={(e) => handleToggleCF(e.target.checked)} />
            Usar CF
          </label>
        </div>

        {!usarCF && clienteFiltrado.length > 0 && (
          <ul className="border rounded bg-white shadow max-h-40 overflow-y-auto mt-1">
            {clienteFiltrado.map((c) => (
              <li
                key={c.id}
                onClick={() => handleSelectCliente(c)}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <div className="text-sm font-medium">{c.nombre}</div>
                <div className="text-xs text-gray-500">NIT: {c.nit || "-"}</div>
              </li>
            ))}
          </ul>
        )}

        {clienteSeleccionado && (
          <div className="text-green-700 text-sm mt-1">
            Seleccionado: <strong>{clienteSeleccionado.nombre}</strong> — NIT: {clienteSeleccionado.nit}
          </div>
        )}
      </div>

      {/* Sucursal */}
      <div>
        <label className="block font-medium">Sucursal</label>
        <select
          name="id_sucursal"
          value={form.id_sucursal}
          onChange={(e) => setForm((p) => ({ ...p, id_sucursal: e.target.value }))}
          className="w-full px-3 py-2 border rounded"
          required
        >
          <option value="">Seleccionar sucursal</option>
          {sucursales.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Requiere factura */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="requiere_factura"
          checked={form.requiere_factura}
          onChange={(e) => setForm((p) => ({ ...p, requiere_factura: e.target.checked }))}
        />
        <label className="text-sm">Generar factura</label>
      </div>

      {/* Agregar productos */}
      <div className="space-y-2">
        <label className="block font-medium">Productos</label>
        <div className="flex gap-3">
          <select
            value={productoSeleccionado}
            onChange={(e) => setProductoSeleccionado(e.target.value)}
            className="flex-1 px-3 py-2 border rounded"
          >
            <option value="">Seleccione producto</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} — Q{p.precio_unitario}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleAddProducto}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
          >
            Añadir
          </button>
        </div>

        <div className="space-y-2 mt-2">
          {form.detalle_ventas.map((d, i) => (
            <div key={i} className="flex items-center gap-3 border rounded p-2">
              <div className="flex-1">
                <div className="font-medium">{d.nombre}</div>
                <div className="text-xs text-gray-500">Q{d.precio_unitario}</div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={d.cantidad}
                  onChange={(e) => handleDetalleChange(i, "cantidad", e.target.value)}
                  className="w-20 px-2 py-1 border rounded"
                />
                <div className="w-24 text-right font-medium">Q{(d.cantidad * d.precio_unitario).toFixed(2)}</div>
                <button type="button" onClick={() => handleRemoveDetalle(i)} className="text-sm text-red-600 px-2">
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="text-right font-semibold text-gray-700">Total: Q{calcularTotal().toFixed(2)}</div>

      {/* Acciones */}
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          {loading ? "Registrando..." : "Registrar venta"}
        </button>

        <button type="button" onClick={() => window.history.back()} className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
          Cancelar
        </button>
      </div>
    </form>
  );
}