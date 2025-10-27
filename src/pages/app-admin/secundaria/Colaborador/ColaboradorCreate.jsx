import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import ColaboradorForm from "./ColaboradorForm";
import { useNavigate } from "react-router-dom";
import { endpoints } from "../../../../config/api";
export default function ColaboradorCreate() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (form) => {
    setLoading(true);
    try {
      await axios.post(endpoints.usuario.crear, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/colaborador");
    } catch (err) {
      console.error("Error al crear:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Nuevo Colaborador</h1>
        <ColaboradorForm onSubmit={handleCreate} loading={loading} />
      </main>
    </div>
  );
}