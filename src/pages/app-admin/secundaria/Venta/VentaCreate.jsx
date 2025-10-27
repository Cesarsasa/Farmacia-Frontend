import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import VentaForm from "./VentaForm";
import { useNavigate } from "react-router-dom";
import { endpoints } from "../../../../config/api";

export default function VentaCreate() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (form) => {
    setLoading(true);
    try {
      const res = await axios.post(endpoints.venta.crear, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const ventaId = res.data.venta.id;

      await axios.post(endpoints.factura.crear, { id_venta: ventaId }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/venta");
    } catch (err) {
      console.error("Error al registrar la venta:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Registrar Venta</h1>
        <VentaForm onSubmit={handleCreate} loading={loading} />
      </main>
    </div>
  );
}