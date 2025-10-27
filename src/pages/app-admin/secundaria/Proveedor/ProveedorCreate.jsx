import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import ProveedorForm from "./ProveedorForm"; // Asegúrate de tener este componente
import { useNavigate } from "react-router-dom";
import { endpoints } from "../../../../config/api";

export default function ProveedorCreate() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (form) => {
    setLoading(true);
    try {
      await axios.post(endpoints.proveedor.crear, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/proveedor");
    } catch (err) {
      console.error("Error al crear proveedor:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Nuevo Proveedor</h1>
        <ProveedorForm onSubmit={handleCreate} loading={loading} />
      </main>
    </div>
  );
}