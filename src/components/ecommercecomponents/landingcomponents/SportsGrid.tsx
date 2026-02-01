export default function SportsGrid() {
  const categories = [
    {
      id: 1,
      title: "Playeras",
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: 2,
      title: "Tenis",
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: 3,
      title: "Pantalones",
      image:
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: 4,
      title: "Abrigos",
      image:
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
    },
  ];

  return (
    <section className="max-w-[1440px] mx-auto py-16 px-6 lg:px-12">
      <h2 className="text-3xl font-black uppercase tracking-tight italic mb-8">
        Explorar por Categoria
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((c) => (
          <div
            key={c.id}
            className="relative group h-[500px] overflow-hidden rounded-xl bg-black"
          >
            <div
              className="absolute inset-0 bg-cover bg-center opacity-70 transition-transform duration-1000 group-hover:scale-105"
              style={{ backgroundImage: `url(${c.image})` }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="text-white text-2xl font-black uppercase italic">
                {c.title}
              </h3>
              <span className="text-white text-sm font-bold underline underline-offset-4 mt-2 block opacity-0 group-hover:opacity-100 transition-opacity">
                Ver productos
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
