import { useState } from "react";
import ProductCard from "../productcard/ProductCard";
import { getProductsCatalogoBanner } from "../../../api/Ecommerce/productsApi/ProductsApi";
import { useQuery } from "@tanstack/react-query";

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


const marcas = [
  {
    Id: 1,
    Descripcion: "Pfizer",
    Imagen: "/carruselmarcas/Pfizer.jpg",
  },
  {
    Id: 2,
    Descripcion: "Bayer",
    Imagen: "/carruselmarcas/Bayer.jpg",
  },
  {
    Id: 3,
    Descripcion: "Novartis",
    Imagen: "/carruselmarcas/Novartis.jpg",
  },
  {
    Id: 4,
    Descripcion: "Sanofi",
    Imagen: "/carruselmarcas/Sanofi.png",
  },
  {
    Id: 5,
    Descripcion: "Roche",
    Imagen: "/carruselmarcas/Roche.jpeg",
  },
  {
    Id: 6,
    Descripcion: "GSK",
    Imagen: "/carruselmarcas/GSK.jpg",
  },
];


function CatalogoBanner() {
  const [page] = useState(1);
  const limit = 4;


  const { data, isLoading } = useQuery({
    queryKey: ['productsbanner', page, limit],
    queryFn: () => getProductsCatalogoBanner({ page, limit }),
    placeholderData: (prev) => prev,
  });

  if (isLoading) {
    return <h2 className="text-2xl text-center p-10">Cargando las mejores ofertas...</h2>;
  }
  
  return (   
    <div>
        <div className="bg-white dark:bg-gray-800 p-6 shadow-md flex flex-wrap gap-4 justify-between text-gray-800 dark:text-white mb-4">
        <div className="flex-1 min-w-[150px] flex flex-col items-center text-center">
            <img src="/icons/farmacia.png" alt="Farmacia" className="w-12 h-12 mb-2" />
            <p className="font-semibold text-sm">Directo de las Farmacias</p>
        </div>
        <div className="flex-1 min-w-[150px] flex flex-col items-center text-center">
            <img src="/icons/medicamento.png" alt="Medicamento" className="w-12 h-12 mb-2" />
            <p><span className="font-bold text-blue-600">+14,000</span> Productos</p>
        </div>
        <div className="flex-1 min-w-[150px] flex flex-col items-center text-center">
            <img src="/icons/etiqueta.png" alt="Promocion" className="w-12 h-12 mb-2" />
            <p className="font-semibold">Super Promos</p>
        </div>
        <div className="flex-1 min-w-[150px] flex flex-col items-center text-center">
            <img src="/icons/camion.png" alt="Camion" className="w-12 h-12 mb-2" />
            <p className="font-semibold">Envíos a Domicilio</p>
        </div>
        </div>

        <div className="w-full p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data?.data?.map((product: ProductProps) => (
                <ProductCard key={product.ID_Product} product={product} />
            ))}
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 shadow-md flex flex-wrap gap-4 justify-between text-gray-800 dark:text-white mt-4">
          {marcas.map((marca) => (
            <img
              key={marca.Id}
              src={marca.Imagen}
              alt={marca.Descripcion}
              title={marca.Descripcion}
              className="w-28 h-auto object-contain mx-2"
            />
          ))}
        </div>
    </div>
  );
}

export default CatalogoBanner;

