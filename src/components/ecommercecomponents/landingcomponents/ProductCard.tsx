import { useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingCart } from "react-icons/fa";

interface Category {
  ID_Category: number;
  Description: string;
}

interface Stock {
  ID_Stock: number;
  Amount: number;
  Description: string;
  Saleprice: number;
  Purchaseprice: number;
}

interface Imagenes {
  ID_ImagenProduct: number;
  Imagen: string;
}

interface ProductProps {
  ID_Product: number;
  Description: string;
  Code: string;
  Category: Category;
  Stock: Stock[];
  ImagenProduct: Imagenes[];
}

export default function ProductCard({
  ID_Product,
  Description,
  Category,
  Stock,
  ImagenProduct,
}: ProductProps) {
  const navigate = useNavigate();

  const title = Description;
  const image = ImagenProduct?.[0]?.Imagen;
  const price = Stock?.[0]?.Saleprice ?? 0;
  const category = Category?.Description ?? "Producto";

  const goToDetails = () => {
    navigate(`/detalles/${ID_Product}`);
  };

  return (
    <article
      onClick={goToDetails}
      className="group relative cursor-pointer overflow-hidden rounded-[32px] bg-white shadow-[0_10px_30px_rgba(182,0,89,0.10)] transition-transform hover:-translate-y-1"
    >
      <div className="relative aspect-[5/4] overflow-hidden bg-primary-container">
        <img
          src={
            image
              ? `${import.meta.env.VITE_API_URL_IMAGES}${image}`
              : "/no-image.png"
          }
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            // aquí luego puedes agregar a favoritos
          }}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-primary backdrop-blur-md transition-colors hover:bg-primary hover:text-white"
        >
          <FaHeart size={17} />
        </button>
      </div>

      <div className="p-5 md:p-6">
        <span className="mb-3 inline-block rounded-full bg-secondary-container/40 px-3 py-1 text-xs font-bold text-secondary">
          {category}
        </span>

        <h3 className="line-clamp-2 min-h-[56px] text-xl font-bold leading-tight text-on-surface">
          {title}
        </h3>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-2xl font-extrabold text-primary">
            ${Number(price).toFixed(2)}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/detalles/${ID_Product}`);
            }}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-fixed text-on-primary-fixed transition-transform active:scale-90"
          >
            <FaShoppingCart size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}