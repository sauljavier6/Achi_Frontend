

const WePage = () => {
  return (
    <section className="max-w-3xl mx-auto my-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center mb-4">Sobre Nosotros</h1>
      <p className="text-gray-700 mb-6 text-justify">
        Bienvenidos a <span className="font-semibold">Medicare TJ</span>, tu clínica de confianza en
        Tijuana. Nos dedicamos a proporcionar atención médica de calidad, accesible y personalizada,
        con un enfoque cálido y profesional en cada una de nuestras consultas.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Nuestra Misión</h2>
          <p className="text-gray-600">
            Brindar atención de salud confiable y humana, combinando tecnología avanzada con un trato
            cercano, para que te sientas acompañado y bien cuidado en cada visita.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Nuestra Visión</h2>
          <p className="text-gray-600">
            Ser reconocidos como la mejor alternativa en cuidado médico local, donde cada paciente
            encuentre seguridad, confianza y resultados integrales.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Lo que nos distingue</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li>Atención totalmente personalizada</li>
          <li>Profesionales dedicados y capacitados</li>
          <li>Infraestructura médica moderna y segura</li>
          <li>Valores de ética, cercanía y responsabilidad</li>
        </ul>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">¿Por qué elegirnos?</h2>
        <p className="text-gray-600">
          Medicare TJ está a tu lado cuando más lo necesitas: desde consultas generales hasta
          tratamientos especializados, siempre con honestidad, sensibilidad y pasión por servir.
        </p>
      </div>
    </section>
  );
};

export default WePage;
