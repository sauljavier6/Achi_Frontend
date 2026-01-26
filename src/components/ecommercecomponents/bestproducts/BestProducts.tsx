import { useState } from "react";
import ProductCard from "../productcard/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { getProductsBestProduct } from "../../../api/Ecommerce/productsApi/ProductsApi";


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


const BestProducts = () => {
  const [page] = useState(2);
  const limit = 4;


  const { data, isLoading } = useQuery({
    queryKey: ['productsbanner', page, limit],
    queryFn: () => getProductsBestProduct({ page, limit }),
    placeholderData: (prev) => prev,
  });

  if (isLoading) {
    return <h2 className="text-2xl text-center p-10">Cargando las mejores ofertas...</h2>;
  }

  return (
    <div className="w-full p-2">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Las mejores ofertas</h2>
        <p className="text-gray-600 text-center">¿Buscas calidad al mejor precio? Descubre nuestras ofertas exclusivas y ahorra en grande</p>
        <p className="text-gray-600 text-center mb-6">con nuestra amplia gama de productos</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data?.data?.map((product: ProductProps) => (
          <div key={product.ID_Product} className="relative">
            <img
              src="/icons/oferta.svg"
              alt="Oferta"
              className="absolute top-0 left-0 w-16 animate-bounce z-10"
            />
            <ProductCard product={product} />
          </div>
        ))} 
        </div>
    </div>

    
  );
};

export default BestProducts;