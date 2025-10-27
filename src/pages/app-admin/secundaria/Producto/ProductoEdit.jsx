import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import ProductoForm from "./ProductoForm"; // Asegúrate de tener este componente
import { endpoints } from "../../../../config/api";

export default function ProductoEdit() {
  const { id } = useParams();
  const { token } = useAuth();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(endpoints.producto.obtener(id), {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setFormData(res.data))
      .catch((err) => console.error("Error al cargar producto:", err))
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleUpdate = async (form) => {
    setLoading(true);
    try {
      await axios.put(endpoints.producto.actualizar(id), form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/producto");
    } catch (err) {
      console.error("Error al actualizar producto:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !formData) return <div className="p-6">Cargando producto...</div>;

  return (
    <div className="flex">
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Editar Producto</h1>
        <ProductoForm initialData={formData} onSubmit={handleUpdate} loading={loading} />
      </main>
    </div>
  );
}