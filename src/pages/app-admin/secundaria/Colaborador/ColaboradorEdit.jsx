import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";

import ColaboradorForm from "./ColaboradorForm";
import { endpoints } from "../../../../config/api";
export default function ColaboradorEdit() {
  const { id } = useParams();
  const { token } = useAuth();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(endpoints.usuario.obtener(id), {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setFormData(res.data))
      .catch((err) => console.error("Error al cargar usuario:", err))
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleUpdate = async (form) => {
    setLoading(true);
    try {
      await axios.put(endpoints.usuario.actualizar(id), form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/colaborador");
    } catch (err) {
      console.error("Error al actualizar:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !formData) return <div className="p-6">Cargando...</div>;

  return (
    <div className="flex">
        
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Editar Colaborador</h1>
        <ColaboradorForm initialData={formData} onSubmit={handleUpdate} loading={loading} />
      </main>
    </div>
  );
}