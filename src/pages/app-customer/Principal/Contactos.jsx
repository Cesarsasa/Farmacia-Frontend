import Navbar from "../../../components/NavbarCli";

export default function Contactocli() {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Navbar />
<section className="flex flex-col md:flex-row p-8 mt-8 gap-6 flex-grow items-center">
  {/* Imagen a la izquierda */}
  <div className="md:w-1/2 flex justify-center items-center">
    <img
      src="https://s2-valor.glbimg.com/Agv-6BQGPugtcCnsfb5OpFvj0Nw=/1200x/smart/filters:cover():strip_icc()/i.s3.glbimg.com/v1/AUTH_63b422c2caee4269b8b34177e8876b93/internal_photos/bs/2022/X/k/3ExfB6TeqDjiKACaNBMw/gettyimages-610573018.jpg"
      alt="Farmacia contacto"
      className="rounded shadow-md max-w-full h-auto"
    />
  </div>

  {/* Información a la derecha */}
  <div className="md:w-1/2 flex flex-col justify-center">
    <h2 className="text-2xl font-bold mb-4 text-blue-700">Contáctanos</h2>
    <p className="mb-4 text-gray-700">
      Si tienes dudas, sugerencias o necesitas asistencia, puedes comunicarte con nosotros por los siguientes medios:
    </p>
    <ul className="space-y-4">
      <li>
        <strong>📞 Teléfono:</strong> <span className="text-gray-600">+502 1234 5678</span>
      </li>
      <li>
        <strong>📧 Correo electrónico:</strong> <span className="text-gray-600">farmaplus@gmail.com</span>
      </li>
      <li>
        <strong>📍 Dirección:</strong> <span className="text-gray-600">Antigua Guatemala</span>
      </li>
      <li>
        <strong>⏰ Horario:</strong> <span className="text-gray-600">Lunes a sábado, 8:00 AM - 6:00 PM</span>
      </li>
    </ul>
  </div>
</section>


      {/* Footer */}
      <footer className="bg-blue-700 text-white text-center py-4">
        © {new Date().getFullYear()} Farmacia Antigua. Todos los derechos reservados.
      </footer>
    </div>
  );
}