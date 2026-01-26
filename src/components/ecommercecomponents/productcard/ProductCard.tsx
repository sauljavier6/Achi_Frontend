import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

export default function ProductCard({ product }: { product: ProductProps }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Detalles del producto:", product);
    navigate(`/detalles/${product?.ID_Product}`);
  };


  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % product?.ImagenProduct?.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + product?.ImagenProduct?.length) % product?.ImagenProduct?.length);
  };

return (
    <div  onClick={handleDetailsClick} className="group p-4 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer w-full">
      <div className="relative">
        <img
          src={`${import.meta.env.VITE_API_URL_IMAGES}${
            product?.ImagenProduct?.[currentIndex]?.Imagen ?? "/no-image.png"
          }`}
          alt={product.Description}
          className="w-full h-48 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
        />

        {/* Botones para cambiar imagen */}
        {product?.ImagenProduct?.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute top-1/2 left-2 -translate-y-1/2 hover:bg-black/15 text-white p-1 rounded-full transition"
            >
              <img
                src="/icons/flechaabajo.png"
                className="w-6 h-6 rotate-90"
                alt="izquierda"
              />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute top-1/2 right-2 -translate-y-1/2 hover:bg-black/15 text-white p-1 rounded-full transition"
            >
              <img
                src="/icons/flechaabajo.png"
                className="w-6 h-6 -rotate-90"
                alt="derecha"
              />
            </button>
          </>
        )}
      </div>


      <h2 className="text-lg font-semibold text-gray-800 mb-2">{product?.Description}</h2>
      <p className="text-sm text-gray-500">{product?.Category?.Description ?? "Sin categoría"}</p>
      
      <div className="mt-4">
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-semibold">
                {product?.Stock[0]?.Description ?? "Sin descripción"}
              </p>
              <p className="text-base font-bold text-green-600">
                ${product?.Stock[0]?.Saleprice ?? "N/A"}
              </p>
            </div>

            <p
              className={`text-xs px-2 py-1 rounded-full ${
                product?.Stock[0]?.Amount && product?.Stock[0]?.Amount > 0
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {product?.Stock[0]?.Amount && product?.Stock[0]?.Amount > 0 ? "En stock" : "Agotado"}
            </p>
          </div>
      </div>


    </div>
  );
}