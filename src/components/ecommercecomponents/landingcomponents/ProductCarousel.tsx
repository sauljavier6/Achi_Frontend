import { useQuery } from "@tanstack/react-query";
import ProductCard from "./ProductCard";
import { getProductsCatalogoBanner } from "../../../api/Ecommerce/productsApi/ProductsApi";
import { useState } from "react";

interface Category {
  ID_Category: number;
  Description: string;
};

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

export default function ProductCarousel() {
    const [page] = useState(1);
    const limit = 3;
  
  
    const { data } = useQuery({
      queryKey: ['productsbanner', page, limit],
      queryFn: () => getProductsCatalogoBanner({ page, limit }),
      placeholderData: (prev) => prev,
    });

  return (
    <main className="max-w-[1440px] mx-auto py-16 px-6 lg:px-12">
      <h2 className="text-3xl font-black uppercase tracking-tight italic mb-8">
        Novedades
      </h2>

      <div className="flex overflow-x-auto gap-6 pb-8 snap-x no-scrollbar">
        {data?.data?.map((p: ProductProps) => (
          <ProductCard key={p.Description} {...p} />
        ))}
      </div>
    </main>
  );
}
