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
  Description,
  Category,
  Stock,
  ImagenProduct,
}: ProductProps) {
  const title = Description;
  const image = ImagenProduct[0]?.Imagen;
  const price = Stock[0]?.Saleprice;
  const category = Category?.Description;

  return (
    <div className="min-w-[320px] lg:min-w-[400px] flex-none group snap-start">
      <div className="relative h-56 w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-no-repeat bg-center bg-contain"
          style={{
            backgroundImage: `url("${import.meta.env.VITE_API_URL_IMAGES}${image}")`,
          }}
        />
      </div>

      <div className="mt-4 flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-[#9a4c52] text-sm">{category}</p>
        </div>
        <p className="font-black text-lg text-primary">{price}</p>
      </div>
    </div>
  );
}
