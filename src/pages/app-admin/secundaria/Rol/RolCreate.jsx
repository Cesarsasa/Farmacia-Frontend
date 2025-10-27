import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import RolForm from "./RolForm";
import { useNavigate } from "react-router-dom";
import { endpoints } from "../../../../config/api";

export default function RolCreate() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (form) => {
    setLoading(true);
    try {
      await axios.post(endpoints.rol.crear, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/rol");
    } catch (err) {
      console.error("Error al crear rol:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Nuevo Rol</h1>
        <RolForm onSubmit={handleCreate} loading={loading} />
      </main>
    </div>
  );
}