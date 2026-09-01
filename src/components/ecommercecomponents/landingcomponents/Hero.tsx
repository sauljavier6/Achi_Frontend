//import { useNavigate, Link } from "react-router-dom";
import { Heart, Home, MessageCircle, Search, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getProductsByDescription } from "../../../api/Ecommerce/productsApi/ProductsApi";
import { useEffect, useRef, useState } from "react";

interface ImagenProduct {
  ID_ImagenProduct: number;
  ID_Product: number;
  Imagen: string;
}

export interface Product {
  ID_Product: number;
  Description: string;
  Code: string;
  Codesat: string;
  ID_Category: number;
  ID_Iva: number;
  State: boolean;
  ImagenProduct: ImagenProduct[];
  Price?: number;
}

export default function Hero() {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);

  const goHome = () => {
    if (window.location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  const goSearch = () => {
    setOpen(true);
  };

  const goCart = () => {
    navigate("/carrito");
  };

  const searchProducts = async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    try {
      const data = await getProductsByDescription(term);
      setResults(data);
    } catch (err) {
      console.error(err);
      setResults([]);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const goToProduct = (id: number) => {
    navigate(`/detalles/${id}`);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <>
      {/* HERO */}
      <div className="bg-background text-on-background font-body-md selection:bg-primary-container selection:text-on-primary-container">
        <main className="md:pt-20">
          <section className="relative flex min-h-[650px] items-center overflow-hidden md:min-h-[760px] lg:h-[850px]">
            {/* imagen fondo */}
            <div className="absolute inset-0 z-0">
              <img
                className="
                  h-full w-full object-cover
                  object-center
                  sm:object-[center_-50px]
                  md:object-[center_-120px]
                  lg:object-[center_-200px]
                "
                data-alt="A premium lifestyle photograph..."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSuZ-Y36Bf1ONkI_IuPXDdv1ZaiY0zGUoMxmgC4ZgTSLQJsS2OGc1TdjQNhzV-O1iruZI_ArjlWSyDPs45WSgoAvO0rkoJpQsE6lMz1lJ8a0ypJYRKKG2753BPW0s-KNrICgM9vtAQ_raDxPBFTfM84MXbUGdWOBsBj3LgG_eguYfwZvF40rX2IJ7y2XmbttuOIXmQJ_bJ246jML951jQeJ7C6w2_zuHLQhJ1EjgQkxtfeQg2ipqTh9e-GRkYL6iFXSowQXDKn3EA"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent"></div>
            </div>

            {/* contenido */}
            <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 md:px-10 lg:px-16">
              <div className="max-w-xl lg:max-w-2xl text-center lg:text-left">
                <span className="mb-5 inline-block rounded-full bg-primary-container px-4 py-2 text-sm shadow-sm md:text-base">
                  Comodidad superior para cada pata
                </span>

                <h1
                  className="
                    mb-6
                    text-4xl
                    font-bold
                    leading-tight
                    text-primary
                    sm:text-5xl
                    md:text-6xl
                    lg:text-display-lg
                  "
                >
                  Mejora el estilo de vida de tu mascota con una elegancia
                  vibrante.
                </h1>

                <p
                  className="
                    mb-8
                    max-w-lg
                    text-base
                    leading-relaxed
                    text-on-surface-variant
                    md:text-lg
                  "
                >
                  Descubre nuestra cuidada colección de accesorios artesanales
                  diseñados para mascotas modernas y sus dueños con estilo.
                </p>

                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                  <Link
                    to="/productos"
                    className="
                    inline-flex
                    items-center
                    justify-center
                    rounded-full
                    bg-primary-fixed
                    px-8
                    py-4
                    shadow-xl
                    transition-all
                    hover:bg-primary-fixed-dim
                    active:scale-95
                    md:px-10
                    md:py-5
                  "
                  >
                    Descubre la nueva colección
                  </Link>

                  <Link
                    to="/nosotros"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      rounded-full
                      border-2 border-primary
                      bg-surface/60
                      px-8 py-4
                      text-primary
                      backdrop-blur-md
                      transition-all
                      hover:bg-primary/5
                      active:scale-95
                      md:px-10 md:py-5
                    "
                  >
                    Nuestra historia
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="section-spacing page-container">
            <div className="mb-8 flex flex-col gap-4 text-center md:mb-12 md:flex-row md:items-end md:justify-between md:text-left">
              <div>
                <h2 className="text-2xl font-bold leading-tight text-primary sm:text-3xl">
                  Comprar por Categoría
                </h2>

                <p className="mx-auto mt-2 max-w-[280px] text-sm text-black/60 sm:max-w-none sm:text-base md:mx-0">
                  Selecciones para tus queridas compañeras.
                </p>
              </div>

              <Link
                to="/productos"
                className="mx-auto inline-flex items-center justify-center gap-1 rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary transition-all hover:gap-2 md:mx-0 md:bg-transparent md:px-0 md:py-0 md:text-base"
              >
                Ver todas las categorías →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
              <Link
                to="/productos?mascota=perros"
                className="group relative h-80 overflow-hidden rounded-[32px] bg-primary md:col-span-8"
              >
                <img
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2mxNZHsmAAaXin98YcIbGhGxguuaWAFsa50hfsShbyWR7w-_L-fOrIPAh3KB9V2iqqrcvo_THiMNAH4XIvBcvZstojggeoybW9WizKBGVxkUPIr7p0CCrb3ivVZaR8krPYvKN9z2F-cZ0QdzBT7YdQ_KZr5qMUowqseco4RZXNB8EL1m5WZOQtzRPbU9we9qgQ-G9wEtspgdLFdTQDaLod4Y0Y8Kxe4HD7UKB9DuoxbdRKvlbPfETX9JqrPBZLrE0qFAf2lbj7QI"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent transition group-hover:from-primary/90" />

                <div className="absolute bottom-8 left-8 text-white">
                  <h3 className="text-3xl font-bold">Perros</h3>
                  <p className="mb-6">Collares, correas y camas</p>

                  <span className="inline-flex rounded-full bg-white px-8 py-3 font-semibold text-primary transition group-hover:scale-105">
                    Explorar
                  </span>
                </div>
              </Link>

              <Link
                to="/productos?mascota=gatos"
                className="group relative h-80 overflow-hidden rounded-[32px] bg-secondary md:col-span-4"
              >
                <img
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0dXXgqZdbJoaqb6X21HXwV0KG_bE7aCljMEld5uWY0ZBds9Iajl0-6Vo41jsBuvk4k6x8n2nnrIRlf1U6QrnnSipxpGal6fPEheMDzty24BA6jxSUAJBa37nkI0-2-cVuU_iWPCT2m3QSjifAqT5AT-hhKMmaWRFDJX_cJ4DBjl-MHFtUHsbER_uZRjGj1xanFFmhiqjDKZGTtIcD-5kVCDLsNdB1AQyEwZl-EFjkpI9zSPEJsEilkhcArMUac7aZHd_ZChaog4Q"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/70 to-transparent" />
                <div className="absolute bottom-8 left-8 text-white">
                  <h3 className="text-3xl font-bold">Gatos</h3>
                  <p className="mb-6">Juguetes & Rincones Acogedores</p>
                  <button className="rounded-full bg-white px-8 py-3 font-semibold text-secondary">
                    Explorar
                  </button>
                </div>
              </Link>

              <Link
                to="/productos?mascota=aves"
                className="group relative h-80 overflow-hidden rounded-[32px] bg-tertiary md:col-span-4"
              >
                <img
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGrCkO4VS-9Taxho71hFCyZZSQ-SIaYD33o_eRgnMerB3NEcBTMGgAg5rSVvvupgMw6D6hvkPXAdwXhnEI9mKbmyRGKkUl2Djhw57CoR1WHwrJlh8vUB8lIk6sx-NWgwOA2KB5Jx_4d1RdVFHgVr-KQ5tj4B6sq8UBG8Of-BvVDvnHbJrHZVZ0CrccK3C61scsYIYwvMO40yFQWHzk3jjYokXqa9Iolze4ftrbxwuG6gpKf400OBethQaUgS8wMkJtaNvJDK0EB30"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-tertiary/70 to-transparent" />
                <div className="absolute bottom-8 left-8 text-white">
                  <h3 className="text-3xl font-bold">Aves</h3>
                  <p className="mb-6">Ramas Artesanales</p>
                  <button className="rounded-full bg-white px-8 py-3 font-semibold text-tertiary">
                    Explorar
                  </button>
                </div>
              </Link>

              <div className="relative h-80 overflow-hidden rounded-[32px] bg-primary md:col-span-8">
                <div className="relative z-10 flex h-full max-w-md flex-col justify-center p-8 text-white md:p-12">
                  <h3 className="mb-2 text-3xl font-bold">
                    Descubre todo nuestro catálogo
                  </h3>
                  <p className="mb-8 text-white/80">
                    Explora todos nuestros productos para perros, gatos y aves.
                    Encuentra accesorios, juguetes, alimento y mucho más para
                    consentir a tu mascota.
                  </p>
                  <Link
                    to="/productos"
                    className="w-fit rounded-full bg-white px-8 py-3 font-semibold text-primary transition hover:bg-gray-100"
                  >
                    Ver todo
                  </Link>
                </div>

                <img
                  className="absolute right-0 top-0 h-full w-full object-cover opacity-30 md:w-1/2 md:opacity-100"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvRC9Wv5h036B4-os1btHW9KduONtkiGAPtw_KNmK_g5eHf5yMeKQQAD9ZYTPpcECUhvR4ODhuJj6_izuK8ng9Anr-D_rMkWKWeOiMER6sJVWiRsWdtlTapjKGU2g567KDOo5PsI_U2bv9hXY3YBePWuE51CLPMtrHsuvwWD4_9TVJ936pOG_SO2rsXyvg3wvsoJQnTOwlUTZHPyx9ILV67KQOY8tw5udbfh6o3ySPHAE8w2hIbDam2cdEYYmhj6CZmW3FekNdn54"
                />
              </div>
            </div>
          </section>

          <section className="bg-surface-container-low py-24">
            <div className="mx-auto max-w-7xl px-6">
              <div className="mb-16 text-center">
                <h2 className="font-display-lg text-primary">
                  Todo para tu mascota
                </h2>

                <p className="mx-auto mt-3 max-w-2xl text-on-surface-variant">
                  En Hachi Veterinaria encontrarás accesorios para paseo, descanso,
                  alimentación, transporte y cuidado diario de perros y gatos.
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {/* Paseo */}
                <div className="group overflow-hidden rounded-3xl bg-white shadow-md transition hover:shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80"
                    alt="Perro con collar"
                    className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-primary">
                      Paseo
                    </h3>

                    <p className="mt-2 text-sm text-on-surface-variant">
                      Collares, pecheras, correas y accesorios para salir con
                      seguridad y estilo.
                    </p>
                  </div>
                </div>

                {/* Alimentación */}
                <div className="group overflow-hidden rounded-3xl bg-white shadow-md transition hover:shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1583512603806-077998240c7a?auto=format&fit=crop&w=900&q=80"
                    alt="Perro comiendo"
                    className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-primary">
                      Alimentación
                    </h3>

                    <p className="mt-2 text-sm text-on-surface-variant">
                      Platos, bebederos y accesorios para que cada comida sea
                      una experiencia cómoda.
                    </p>
                  </div>
                </div>

                {/* Cuidado */}
                <div className="group overflow-hidden rounded-3xl bg-white shadow-md transition hover:shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=900&q=80"
                    alt="Cepillando perro"
                    className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-primary">
                      Cuidado
                    </h3>

                    <p className="mt-2 text-sm text-on-surface-variant">
                      Cepillos, peines y accesorios para mantener a tu mascota
                      sana y feliz.
                    </p>
                  </div>
                </div>

                {/* Diversión */}
                <div className="group overflow-hidden rounded-3xl bg-white shadow-md transition hover:shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80"
                    alt="Perro jugando"
                    className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-primary">
                      Diversión
                    </h3>

                    <p className="mt-2 text-sm text-on-surface-variant">
                      Juguetes y accesorios que estimulan la actividad física y
                      el entretenimiento.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-14 text-center">
                <Link
                  to="/productos"
                  className="inline-flex rounded-full bg-primary px-8 py-4 font-semibold text-white transition hover:scale-105 hover:shadow-lg"
                >
                  Ver catálogo completo
                </Link>
              </div>
            </div>
          </section>

          <section className="py-14 px-4 md:py-24 md:px-10 xl:px-16">
            <div className="mx-auto max-w-[1700px]">
              <div className="relative overflow-hidden rounded-[28px] bg-primary-container shadow-xl p-6 md:p-16 lg:p-24">
                <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-primary/20 blur-[100px] translate-x-24 -translate-y-20" />
                <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-secondary/10 blur-[100px] -translate-x-24 translate-y-20" />

                <div className="relative z-10 grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                  {/* Texto */}
                  <div className="text-center lg:text-left">
                    <span className="mb-5 inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-on-primary-container">
                      Atención personalizada
                    </span>

                    <h2 className="mb-5 text-3xl font-bold text-on-primary-container md:font-display-lg">
                      ¿Buscas el accesorio perfecto para tu mascota?
                    </h2>

                    <p className="mb-8 text-base leading-relaxed text-on-primary-container md:font-body-lg">
                      Nuestro equipo puede ayudarte a encontrar la mejor opción
                      para perros y gatos. Escríbenos por WhatsApp y recibe
                      atención rápida, recomendaciones y cotizaciones sin
                      compromiso.
                    </p>

                    <a
                      href="https://wa.me/526647828882?text=Hola,%20me%20gustaría%20recibir%20información%20sobre%20los%20productos%20de%20Hachi%20Veterinaria."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 rounded-full bg-[#25D366] px-8 py-5 text-lg font-semibold text-white shadow-xl transition-all hover:scale-105 hover:bg-[#1ebe5d]"
                    >
                      <MessageCircle size={24} />
                      Enviar WhatsApp
                    </a>

                    <p className="mt-6 text-sm text-on-primary-container/70">
                      📱 Respuesta rápida • Atención personalizada •
                      Cotizaciones sin compromiso
                    </p>
                  </div>

                  {/* Imágenes */}
                  <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    <div className="aspect-square overflow-hidden rounded-3xl shadow-2xl rotate-3 transition-transform duration-500 hover:rotate-0">
                      <img
                        className="h-full w-full object-cover"
                        src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80"
                        alt="Perro feliz"
                      />
                    </div>

                    <div className="aspect-square overflow-hidden rounded-3xl shadow-2xl -rotate-3 translate-y-10 transition-transform duration-500 hover:rotate-0">
                      <img
                        className="h-full w-full object-cover"
                        src="https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=900&q=80"
                        alt="Gato"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-8 rounded-full border border-white/20 bg-primary px-8 py-4 shadow-2xl md:hidden">
          <button
            onClick={goHome}
            className="flex flex-col items-center text-on-primary"
          >
            <Home size={22} fill="currentColor" />
          </button>

          <button
            onClick={goSearch}
            className="flex flex-col items-center text-on-primary/70 hover:text-on-primary"
          >
            <Search size={22} />
          </button>

          <button
            onClick={goCart}
            className="flex flex-col items-center text-on-primary/70 hover:text-on-primary"
          >
            <ShoppingCart size={22} />
          </button>

          <button
            disabled
            className="flex cursor-not-allowed flex-col items-center text-on-primary/40"
          >
            <Heart size={22} />
          </button>
        </div>

        {open && (
          <div className="fixed inset-0 z-[999] bg-black/50 px-4 pt-20 backdrop-blur-sm md:hidden">
            <div className="mx-auto max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="flex items-center border-b border-gray-100 px-4 py-4">
                <Search size={22} className="shrink-0 text-gray-500" />

                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="ml-3 flex-1 bg-transparent text-base text-gray-800 outline-none placeholder:text-gray-400"
                  type="text"
                />

                <button
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                    setResults([]);
                  }}
                  className="ml-3 rounded-full px-2 text-2xl text-gray-400 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              {query.trim() && results.length === 0 && (
                <div className="p-6 text-center text-sm text-gray-500">
                  No se encontraron productos.
                </div>
              )}

              {results.length > 0 && (
                <ul className="max-h-[420px] overflow-y-auto p-2">
                  {results.map((item) => (
                    <li
                      key={item.ID_Product}
                      onClick={() => goToProduct(item.ID_Product)}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl p-3 transition hover:bg-gray-100"
                    >
                      <img
                        src={
                          item.ImagenProduct?.[0]?.Imagen
                            ? `${import.meta.env.VITE_API_URL_IMAGES}${item.ImagenProduct[0].Imagen}`
                            : "/no-image.png"
                        }
                        alt={item.Description}
                        className="h-14 w-14 shrink-0 rounded-xl border object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-semibold text-gray-800">
                          {item.Description}
                        </p>

                        {item.Price && (
                          <span className="text-xs font-medium text-gray-500">
                            ${item.Price}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
