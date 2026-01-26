import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../../../api/Ecommerce/productsApi/ProductsApi";
import { useCart } from "../../../context/CartContext";

interface Category {
  ID_Category: number;
  Description: string;
};

interface Iva {
  ID_Iva: number;
  Description: string;
  Iva: number;
};

interface Stock {
  ID_Stock: number;
  Amount: number;
  Description: string;
  Saleprice: number;
  Purchaseprice: number;
} 

interface Imagenes {
  ID_Image: number;
  Imagen: string;
} 

interface Product {
  ID_Product: number;
  Description: string;
  Code: string;
  Category: Category;
  Stock: Stock[];
  Iva: Iva;
  ImagenProduct: Imagenes[];
}

interface CartItem {
  ID_Product: number;
  Description: string;
  ID_Stock: number;
  StockDescription: string;
  Saleprice: number;
  Quantity: number;
  Iva: number;  
  Imagen?: string;
}

  export default function Page() {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [selectedSize, setSelectedSize] = useState<Stock | null>(null);
    const [mainImage, setMainImage] = useState<string>("");
    const { state, addItem } = useCart();

    useEffect(() => {
      const fetchProduct = async () => {  
        try {
          if (!id) return;
          const numericId = Number(id);
          
          const data = await getProductById(numericId);
          setProduct(data);
          setMainImage(data.ImagenProduct[0].Imagen)
          if (data.Stock.length > 0) {
            setSelectedSize(data.Stock[0]);
          }   
        } catch (error) {
          console.error("Error fetching product:", error);
        }
      };
      fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
      console.log("Adding to cart:");

      if (product && selectedSize) {
        const cartItem: CartItem = {
          ID_Product: product.ID_Product,
          Description: product.Description,
          ID_Stock: selectedSize.ID_Stock,
          StockDescription: selectedSize.Description,
          Saleprice: selectedSize.Saleprice,
          Quantity: 1,
          Iva: product.Iva.Iva,
          Imagen: product.ImagenProduct?.[0].Imagen || "default-image.jpg",
        };

        console.log("cartItem", cartItem);
        addItem(cartItem);
      }
    };

    if (!product) {
      return <p className="text-center mt-10">Loading products...</p>;
    }

    const outOfStock = !selectedSize;

    const quantityInCart = state.items.find(
      item => item.ID_Product === product.ID_Product &&
              item.ID_Stock === selectedSize?.ID_Stock
    )?.Quantity || 0;


    return (
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="flex flex-col">
            <img
              src={`${import.meta.env.VITE_API_URL_IMAGES}${mainImage}`}
              alt={product.Description}
              width={600}
              height={600}
              className="rounded-lg w-full object-cover border"
            />

            {/* Miniaturas */}
            <div className="flex gap-4 mt-4">
              {product.ImagenProduct.map((img, index) => (
                <img
                  key={index}
                  src={`${import.meta.env.VITE_API_URL_IMAGES}${img.Imagen}`}
                  alt={`Miniatura ${index}`}
                  width={100}
                  height={100}
                  className={`rounded-lg border cursor-pointer hover:opacity-80 ${
                    img.Imagen === mainImage ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setMainImage(img.Imagen)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4">{product.Description}</h1>
              
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {product?.Stock.map((item) => (
                  <button
                    key={item.Description}
                    onClick={() => setSelectedSize(item)}
                    className={`flex items-center gap-2 px-4 py-2 rounded border transition ${
                      selectedSize?.Description === item.Description
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                    } ${item.Amount === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={item.Amount === 0}
                  >
                    <span className="text-sm text-black">{item.Description}</span>
                    <span className="text-sm text-black">({item.Amount})</span>
                    <span className="text-sm text-black">
                      ${item.Saleprice}
                    </span>
                  </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className={`mt-6 px-6 py-3 rounded-lg transition w-fit ${
                selectedSize?.Amount === 0 || outOfStock ||  quantityInCart >= selectedSize?.Amount
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              disabled={selectedSize?.Amount === 0 || outOfStock ||  quantityInCart >= selectedSize?.Amount}
            >
              {selectedSize?.Amount === 0 ? "Sin stock" : `Agregar (${quantityInCart})`} 🛒
            </button>

          </div>
        </div>
      </div>
    );
  }
