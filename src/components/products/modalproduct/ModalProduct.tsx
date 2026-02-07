import React, { useEffect, useRef, useState } from "react";
import styles from "./ModalProducts.module.scss";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getProductById,
  postProduct,
  updateProduct,
} from "../../../api/Post/ProductApi/ProductApi";
import { getCategory } from "../../../api/Post/CategoryApi/CategoryApi";
import { getIvaDatos } from "../../../api/Post/ivaApi/IvaApi";
import ModalCategory from "../../category/modalcategory/ModalCategory";

interface ModalProductProps {
  onClose: () => void;
  onEdit?: number | null;
}

const ModalProduct = ({ onClose, onEdit }: ModalProductProps) => {
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [products, setProducts] = useState({
    Description: "",
    ID_Category: 0,
    Code: "",
    Codesat: "",
    StockData: [
      {
        Description: "",
        Amount: 0,
        Saleprice: 0,
        Purchaseprice: 0,
      },
    ],
    Imagenes: [] as { file: File; preview: string }[],
    ID_Iva: 0,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (onEdit) {
      const fetchProduct = async () => {
        try {
          const data = await getProductById(onEdit);
          setProducts({
            Description: data.Description,
            ID_Category: data.ID_Category,
            Code: data.Code,
            Codesat: data.Codesat,
            StockData: data.Stock || [],
            Imagenes: data.Imagenes,
            ID_Iva: data.ID_Iva,
          });
        } catch (error) {
          console.error("Error cargando producto:", error);
        }
      };

      fetchProduct();
    }
  }, [onEdit]);

  const { data: categoryData } = useQuery({
    queryKey: ["category"],
    queryFn: getCategory,
  });

  const { data: ivaData } = useQuery({
    queryKey: ["iva"],
    queryFn: getIvaDatos,
  });

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: postProduct,
    onError: (error: any) => {
      toast.error(`${error.message}`, { position: "top-right" });
    },
    onSuccess: () => {
      resetForm();
      onClose();
      toast.success("Producto registrado con éxito", { position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const { mutate: updatemutate } = useMutation({
    mutationFn: updateProduct,
    onError: (error: any) => {
      toast.error(`${error.message}`, { position: "top-right" });
    },
    onSuccess: () => {
      resetForm();
      onClose();
      toast.success("Producto actualizado con éxito", {
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const addInput = () => {
    setProducts((prev) => ({
      ...prev,
      StockData: [
        ...prev.StockData,
        { Description: "", Amount: 0, Saleprice: 0, Purchaseprice: 0 },
      ],
    }));
  };

  const removeInput = () => {
    setProducts((prev) => ({
      ...prev,
      StockData:
        prev.StockData.length > 1
          ? prev.StockData.slice(0, -1)
          : prev.StockData,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (onEdit) {
      const newdata = {
        ...products,
        ID_Product: onEdit,
      };
      updatemutate(newdata);
    } else {
      mutate(products);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setProducts({
      Description: "",
      ID_Category: 0,
      Code: "",
      Codesat: "",
      StockData: [
        {
          Description: "",
          Amount: 0,
          Saleprice: 0,
          Purchaseprice: 0,
        },
      ],
      Imagenes: [],
      ID_Iva: 0,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);

    if (value === -1) {
      setOpenCategoryModal(true);
    } else {
      setProducts({ ...products, ID_Category: value });
    }
  };

  const isFormValid = () => {
    if (
      !products.Description.trim() ||
      !products.ID_Category ||
      !products.Code.trim() ||
      !products.ID_Iva
    ) {
      return false;
    }

    for (const stock of products.StockData) {
      if (
        !stock.Description.trim() ||
        stock.Amount <= 0 ||
        stock.Saleprice <= 0 ||
        stock.Purchaseprice <= 0
      ) {
        return false;
      }
    }

    return true;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      if (products.Imagenes.length + newImages.length > 5) {
        alert("Solo puedes subir 5 imágenes.");
        return;
      }

      setProducts({
        ...products,
        Imagenes: [...products.Imagenes, ...newImages],
      });
    }
  };

  const removeImage = (index: number) => {
    const updated = [...products.Imagenes];
    updated.splice(index, 1);
    setProducts({ ...products, Imagenes: updated });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-xl font-bold text-gray-800">Crear Producto</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded hover:bg-gray-100"
            >
              <img src="/icons/close.png" alt="Cerrar" className="w-5 h-5" />
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Inputs básicos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                id="Description"
                value={products.Description}
                onChange={(e) =>
                  setProducts({ ...products, Description: e.target.value })
                }
                placeholder="Nombre del producto"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
              />

              <select
                id="ID_Category"
                name="ID_Category"
                value={products.ID_Category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Selecciona categoría</option>
                {categoryData?.data?.map((cat: any) => (
                  <option key={cat.ID_Category} value={cat.ID_Category}>
                    {cat.Description}
                  </option>
                ))}
                <option
                  disabled
                  className="bg-gray-100 text-gray-500 text-sm font-medium"
                >
                  ---------------------------
                </option>
                <option value={-1} className="text-blue-600 font-semibold">
                  ➕ Crear nueva categoría
                </option>
              </select>

              <input
                type="text"
                id="Code"
                name="Code"
                value={products.Code}
                onChange={(e) =>
                  setProducts({ ...products, Code: e.target.value })
                }
                placeholder="Código del producto"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
              />

              <select
                id="Iva"
                name="ID_Iva"
                value={products.ID_Iva}
                onChange={(e) => {
                  setProducts({ ...products, ID_Iva: Number(e.target.value) });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Selecciona IVA</option>
                {ivaData?.data?.map((cat: any) => (
                  <option key={cat.ID_Iva} value={cat.ID_Iva}>
                    {cat.Description}
                  </option>
                ))}
              </select>

              {/* Input de imágenes */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                multiple
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
              />

              <input
                type="text"
                id="Codesat"
                name="Codesat"
                value={products.Codesat}
                onChange={(e) =>
                  setProducts({ ...products, Codesat: e.target.value })
                }
                placeholder="Código SAT"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Galería de imágenes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {products.Imagenes.map((img, index) => (
                <div
                  key={index}
                  className="relative w-full aspect-square border rounded-md overflow-hidden"
                >
                  <img
                    src={
                      img.preview ||
                      `${import.meta.env.VITE_API_URL_IMAGES}${img}`
                    }
                    alt={`Preview ${index}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 rounded-full hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Stock del producto */}
            <div className="space-y-4">
              {products.StockData.map((stock, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 border-t pt-2"
                >
                  <input
                    type="text"
                    value={stock.Description}
                    onChange={(e) => {
                      const newStock = [...products.StockData];
                      newStock[index].Description = e.target.value;
                      setProducts({ ...products, StockData: newStock });
                    }}
                    placeholder="Descripción"
                    className="w-full px-2 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                  />

                  <input
                    type="number"
                    value={stock.Amount === 0 ? "" : stock.Amount}
                    onChange={(e) => {
                      const newStock = [...products.StockData];
                      newStock[index].Amount = Number(e.target.value);
                      setProducts({ ...products, StockData: newStock });
                    }}
                    placeholder="Stock"
                    className="w-full px-2 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                  />

                  <input
                    type="number"
                    value={stock.Saleprice === 0 ? "" : stock.Saleprice}
                    onChange={(e) => {
                      const newStock = [...products.StockData];
                      newStock[index].Saleprice = Number(e.target.value);
                      setProducts({ ...products, StockData: newStock });
                    }}
                    placeholder="Precio venta"
                    className="w-full px-2 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                  />

                  <input
                    type="number"
                    value={stock.Purchaseprice === 0 ? "" : stock.Purchaseprice}
                    onChange={(e) => {
                      const newStock = [...products.StockData];
                      newStock[index].Purchaseprice = Number(e.target.value);
                      setProducts({ ...products, StockData: newStock });
                    }}
                    placeholder="Precio compra"
                    className="w-full px-2 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}
            </div>

            {/* Botones variantes */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                type="button"
                onClick={addInput}
                className={styles.buttonfacturar}
              >
                Añadir variante
              </button>
              <button
                type="button"
                onClick={removeInput}
                className={styles.removeButton}
              >
                Eliminar variante
              </button>
            </div>

            {/* Botón Guardar */}
            <div className="flex justify-center">
              <button
                type="submit"
                className={`${styles.buttonAgregarCliente} ${
                  !isFormValid() ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={!isFormValid()}
              >
                Guardar producto
              </button>
            </div>
          </form>
        </div>
      </div>

      {openCategoryModal && (
        <ModalCategory
          onClose={() => setOpenCategoryModal(false)}
          onCreated={(newCategoryId: number) => {
            setProducts({ ...products, ID_Category: newCategoryId });
            setOpenCategoryModal(false);
          }}
        />
      )}
    </>
  );
};

export default ModalProduct;
