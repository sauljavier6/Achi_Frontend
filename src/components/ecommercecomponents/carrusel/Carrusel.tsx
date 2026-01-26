import { useState, useEffect } from 'react';

const images = [
  '/carrusel/medicare.jpg',
  '/carrusel/medicare.jpg',
];

function Carousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
    <div className="relative w-full h-[500px] overflow-hidden p-6">
      {/* Las imágenes del carrusel */}
      {images.map((src, index) => (
        <img
          key={index}
          src={src}
          alt={`Slide ${index + 1}`}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
            current === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* Botón izquierdo */}
      <button
        onClick={() => setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
      >
        <img src="/icons/flechasinfondo.png" alt="flechaabajo" className='h-4 w-4 rotate-90'/>
      </button>

      {/* Botón derecho */}
      <button
        onClick={() => setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
      >
        <img src="/icons/flechasinfondo.png" alt="flechaabajo" className='h-4 w-4 rotate-270'/>
      </button>

      {/* Botones de navegación inferior */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <img src="/icons/circulo-negro.png" alt="circulo" 
          className="h-4 w-4 rounded-full bg-gradient-to-br from-gray-700 to-black shadow-md hover:from-black hover:to-gray-900 hover:shadow-lg transition duration-300"
          key={index}
          onClick={() => setCurrent(index)}/>
        ))}
      </div>
    </div>
    </>
  );
}

export default Carousel;
