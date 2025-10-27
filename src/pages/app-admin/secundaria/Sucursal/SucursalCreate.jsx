import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import SucursalForm from "./SucursalForm"; // Asegúrate de tener este componente
import { useNavigate } from "react-router-dom";
import { endpoints } from "../../../../config/api";

export default function SucursalCreate() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (form) => {
    setLoading(true);
    try {
      await axios.post(endpoints.sucursal.crear, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/sucursal");
    } catch (err) {
      console.error("Error al crear sucursal:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Nueva Sucursal</h1>
        <SucursalForm onSubmit={handleCreate} loading={loading} />
      </main>
    </div>
  );
}