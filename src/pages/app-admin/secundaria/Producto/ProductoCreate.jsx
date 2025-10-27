import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import ProductoForm from "./ProductoForm"; // Asegúrate de tener este componente
import { useNavigate } from "react-router-dom";
import { endpoints } from "../../../../config/api";

export default function ProductoCreate() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (form) => {
    setLoading(true);
    try {
      await axios.post(endpoints.producto.crear, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/producto");
    } catch (err) {
      console.error("Error al crear producto:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Nuevo Producto</h1>
        <ProductoForm onSubmit={handleCreate} loading={loading} />
      </main>
    </div>
  );
}