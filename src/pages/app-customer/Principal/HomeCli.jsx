import Navbar from "../../../components/NavbarCli";
import ImageSlider from "../../../components/Sliderimg";

export default function Homecli() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <ImageSlider />

      {/* Sección de servicios */}
      <section id="servicios" className="p-8 mt-8">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Servicios Gratuitos</h2>
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Servicio icon="🩸" nombre="Toma de glucosa" nota="Tira reactiva Q5.00" />
          <Servicio icon="🌡️" nombre="Toma de temperatura" />
          <Servicio icon="💓" nombre="Presión arterial" />
          <Servicio icon="🫁" nombre="Medición de oxígeno" />
        </ul>
      </section>
          <footer className="bg-blue-700 text-white text-center py-4">
        © {new Date().getFullYear()} Farmacia Antigua. Todos los derechos reservados.
      </footer>
    </div>
  );

}

function Servicio({ icon, nombre, nota }) {
  return (
    <li className="bg-white p-4 rounded shadow text-center">
      <div className="text-4xl mb-2">{icon}</div>
      <h3 className="font-semibold">{nombre}</h3>
      {nota && <p className="text-sm text-gray-500">{nota}</p>}
    </li>
  );
}