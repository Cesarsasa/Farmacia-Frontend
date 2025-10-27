import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import InventarioForm from "./InventarioForm";
import { endpoints } from "../../../../config/api";

export default function InventarioEdit() {
  const { id } = useParams();
  const { token } = useAuth();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    axios
      .get(endpoints.inventario.obtener(id), {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;

        // Adaptar estructura si viene anidada
        const adaptado = {
          cantidad: data.cantidad,
          id_producto: data.producto?.id || "",
          id_sucursal: data.sucursal?.id || "",
        };

        setFormData(adaptado);
      })
      .catch((err) => console.error("Error al cargar inventario:", err))
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleUpdate = async (form) => {
    setLoading(true);
    try {
      await axios.put(endpoints.inventario.actualizar(id), form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/inventario");
    } catch (err) {
      console.error("Error al actualizar inventario:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !formData) return <div className="p-6">Cargando inventario...</div>;

  return (
    <div className="flex">
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Editar Inventario</h1>
        <InventarioForm initialData={formData} onSubmit={handleUpdate} loading={loading} />
      </main>
    </div>
  );
}