import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { endpoints } from "../config/api";



export async function iniciarPago(id_cliente, cliente_email) {
  try {
    const res = await axios.post(endpoints.stripe.crear_sesion, {
      id_cliente,
      cliente_email,
      
    });


  window.location.href = res.data.url;
  } catch (err) {
    console.error("Error al iniciar pago:", err);
    alert("No se pudo iniciar el pago.");
  }
}
