import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContextCli";
import ClienteForm from "./ClienteForm";
import { endpoints } from "../../../../config/api";
import Navbar from "../../../../components/NavbarCli";
export default function ClientePerfil() {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Verificación antes de usar user.id
  useEffect(() => {
    if (!user || !user.id) return;

    axios
      .get(endpoints.customer.obtener(user.id), {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setFormData(res.data))
      .catch((err) => console.error("Error al cargar perfil:", err))
      .finally(() => setLoading(false));
  }, [user, token]);

  const handleUpdate = async (form) => {
    setLoading(true);
    try {
      await axios.put(endpoints.customer.actualizar(user.id), form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Perfil actualizado correctamente");
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Mostrar mensaje si no hay usuario
  if (!user || !user.id) {
    return <div className="p-6 text-red-600">No se pudo cargar el perfil. ¿Estás autenticado?</div>;
  }

  if (loading || !formData) return <div className="p-6">Cargando perfil...</div>;

return (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4 text-center">Mi Perfil</h1>
      <h1 className="text-2xl font-bold mb-4 text-center">Mi Perfil</h1>
      <ClienteForm initialData={formData} onSubmit={handleUpdate} loading={loading} />
    </div>
  </div>
);
}