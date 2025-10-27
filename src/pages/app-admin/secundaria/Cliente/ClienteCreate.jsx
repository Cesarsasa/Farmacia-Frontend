import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import ClienteForm from "./ClienteForm"; // Asegúrate de tener este componente
import { useNavigate } from "react-router-dom";
import { endpoints } from "../../../../config/api";

export default function ClienteCreate() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (form) => {
    setLoading(true);
    try {
      await axios.post(endpoints.customer.crear, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/cliente"); // Ajusta la ruta según tu sistema
    } catch (err) {
      console.error("Error al crear cliente:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Nuevo Cliente</h1>
        <ClienteForm onSubmit={handleCreate} loading={loading} />
      </main>
    </div>
  );
}