import React, { useEffect, useRef, useState } from "react";
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
import { getSubCategory } from "../../../api/Post/SubCategoryApi/SubCategoryApi";
import ModalSubCategory from "../../subcategory/modalsubcategory/ModalSubCategory";

interface ModalProductProps {
  onClose: () => void;
  onEdit?: number | null;
}
type CategoryOption = { ID_Category: number; Description: string };
type SubCategoryOption = { ID_SubCategory: number; Description: string };
type IvaOption = { ID_Iva: number; Description: string };

const ModalProduct = ({ onClose, onEdit }: ModalProductProps) => {
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [openSubCategoryModal, setOpenSubCategoryModal] = useState(false);
  const [products, setProducts] = useState({
    Description: "",
    ID_Category: 0,
    ID_SubCategory: 0,
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
    State: true,
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
            ID_SubCategory: data.ID_SubCategory,
            Code: data.Code,
            Codesat: data.Codesat,
            StockData: data.Stock || [],
            Imagenes: data.Imagenes,
            ID_Iva: data.ID_Iva,
            State: data.State ?? true,
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

  const { data: subcategoryData } = useQuery({
    queryKey: ["subcategory"],
    queryFn: getSubCategory,
  });

  const { data: ivaData } = useQuery({
    queryKey: ["iva"],
    queryFn: getIvaDatos,
  });

  const queryClient = useQueryClient();

  const { mutate, isPending: isCreating } = useMutation({
    mutationFn: postProduct,
    onError: (error: Error) => {
      toast.error(`${error.message}`, { position: "top-right" });
    },
    onSuccess: () => {
      resetForm();
      onClose();
      toast.success("Producto creado correctamente", { position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const { mutate: updatemutate, isPending: isUpdating } = useMutation({
    mutationFn: updateProduct,
    onError: (error: Error) => {
      toast.error(`${error.message}`, { position: "top-right" });
    },
    onSuccess: () => {
      resetForm();
      onClose();
      toast.success("Producto actualizado correctamente", {
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
      ID_SubCategory: 0,
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
      State: true,
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
      <div className="fixed inset-0 z-50 flex items-stretch justify-center overflow-hidden bg-black/50 p-0 sm:items-center sm:p-3">
        <div className="flex h-[100dvh] max-h-[100dvh] w-full max-w-4xl flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[94vh] sm:rounded-2xl">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
            <div><p className="text-sm font-semibold text-[#c70063]">Catálogo</p><h2 className="text-xl font-bold text-slate-900">{onEdit ? "Editar producto" : "Nuevo producto"}</h2><p className="text-sm text-slate-500">Completa los datos generales y sus presentaciones.</p></div>
            <button
              onClick={handleClose}
              className="shrink-0 rounded-xl p-2 hover:bg-slate-100"
            >
              <img src="/icons/close.png" alt="Cerrar" className="w-5 h-5" />
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
            {/* Inputs básicos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="min-w-0 text-xs font-semibold text-slate-500">Nombre del producto
              <input
                type="text"
                id="Description"
                value={products.Description}
                onChange={(e) =>
                  setProducts({ ...products, Description: e.target.value })
                }
                placeholder="Nombre del producto"
                aria-label="Nombre del producto"
                required
                className="mt-1 min-h-11 min-w-0 w-full rounded-xl border border-slate-300 px-4 py-2 text-base font-normal text-slate-900 outline-none focus:border-[#c70063] focus:ring-2 focus:ring-[#c70063]/10"
              />
              </label>

              <label className="min-w-0 text-xs font-semibold text-slate-500">Estado
              <select aria-label="Estado del producto" value={products.State ? "true" : "false"} onChange={(e) => setProducts({ ...products, State: e.target.value === "true" })} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-base font-normal text-slate-900 outline-none transition focus:border-[#c70063] focus:ring-2 focus:ring-[#c70063]/10">
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
              </label>

              <label className="min-w-0 text-xs font-semibold text-slate-500">Categoría
              <select
                id="ID_Category"
                name="ID_Category"
                value={products.ID_Category}
                onChange={handleChange}
                aria-label="Categoría"
                required
                className="mt-1 min-h-11 min-w-0 w-full rounded-xl border border-slate-300 px-4 py-2 text-base font-normal text-slate-900 outline-none focus:border-[#c70063] focus:ring-2 focus:ring-[#c70063]/10"
              >
                <option value="">Selecciona categoría</option>
                {categoryData?.data?.map((cat: CategoryOption) => (
                  <option key={cat.ID_Category} value={cat.ID_Category}>
                    {cat.Description}
                  </option>
                ))}
                <option disabled>---------------------------</option>
                <option value={-1}>➕ Crear nueva categoría</option>
              </select>
              </label>

              <label className="min-w-0 text-xs font-semibold text-slate-500">Subcategoría
              <select aria-label="Subcategoría"
                id="ID_SubCategory"
                name="ID_SubCategory"
                value={products.ID_SubCategory}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value === -1) {
                    setOpenSubCategoryModal(true);
                    return;
                  }
                  setProducts({ ...products, ID_SubCategory: value });
                }}
                className="mt-1 min-h-11 min-w-0 w-full rounded-xl border border-slate-300 px-4 py-2 text-base font-normal text-slate-900 outline-none focus:border-[#c70063] focus:ring-2 focus:ring-[#c70063]/10"
              >
                <option value="">Selecciona subcategoría</option>
                {subcategoryData?.data?.map((cat: SubCategoryOption) => (
                  <option key={cat.ID_SubCategory} value={cat.ID_SubCategory}>
                    {cat.Description}
                  </option>
                ))}
                <option disabled>---------------------------</option>
                <option value={-1}>➕ Crear nueva subcategoría</option>
              </select>
              </label>

              <label className="min-w-0 text-xs font-semibold text-slate-500">Código interno o de barras
              <input
                type="text"
                id="Code"
                name="Code"
                aria-label="Código del producto"
                required
                value={products.Code}
                onChange={(e) =>
                  setProducts({ ...products, Code: e.target.value })
                }
                placeholder="Código del producto"
                className="mt-1 min-h-11 min-w-0 w-full rounded-xl border border-slate-300 px-4 py-2 text-base font-normal text-slate-900 outline-none focus:border-[#c70063] focus:ring-2 focus:ring-[#c70063]/10"
              />
              </label>

              <label className="min-w-0 text-xs font-semibold text-slate-500">IVA aplicable
              <select
                id="Iva"
                name="ID_Iva"
                aria-label="IVA"
                required
                value={products.ID_Iva}
                onChange={(e) =>
                  setProducts({ ...products, ID_Iva: Number(e.target.value) })
                }
                className="mt-1 min-h-11 min-w-0 w-full rounded-xl border border-slate-300 px-4 py-2 text-base font-normal text-slate-900 outline-none focus:border-[#c70063] focus:ring-2 focus:ring-[#c70063]/10"
              >
                <option value="">Selecciona IVA</option>
                {ivaData?.data?.map((iva: IvaOption) => (
                  <option key={iva.ID_Iva} value={iva.ID_Iva}>
                    {iva.Description}
                  </option>
                ))}
              </select>
              </label>

              <label className="min-w-0 text-xs font-semibold text-slate-500">Clave de producto SAT
              <input
                type="text"
                id="Codesat"
                name="Codesat"
                aria-label="Código SAT"
                value={products.Codesat}
                onChange={(e) =>
                  setProducts({ ...products, Codesat: e.target.value })
                }
                placeholder="Código SAT"
                className="mt-1 min-h-11 min-w-0 w-full rounded-xl border border-slate-300 px-4 py-2 text-base font-normal text-slate-900 outline-none focus:border-[#c70063] focus:ring-2 focus:ring-[#c70063]/10"
              />
              </label>

              <label className="min-w-0 text-xs font-semibold text-slate-500">Imágenes del producto
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                multiple
                aria-label="Imágenes del producto"
                className="mt-1 min-h-11 min-w-0 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-normal text-slate-700 outline-none focus:border-[#c70063] focus:ring-2 focus:ring-[#c70063]/10"
              />
              </label>
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
                  className="grid min-w-0 grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-[#c70063] sm:col-span-2 lg:col-span-4">Presentación {index + 1}</p>
                  <label className="min-w-0 text-xs font-semibold text-slate-500">Nombre o medida
                  <input
                    type="text"
                    value={stock.Description}
                    onChange={(e) => {
                      const newStock = [...products.StockData];
                      newStock[index].Description = e.target.value;
                      setProducts({ ...products, StockData: newStock });
                    }}
                    placeholder="Descripción"
                    className="mt-1 min-h-11 min-w-0 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base font-normal text-slate-900 outline-none focus:border-[#c70063] focus:ring-2 focus:ring-[#c70063]/10"
                  />
                  </label>

                  <label className="min-w-0 text-xs font-semibold text-slate-500">Existencias
                  <input
                    type="number"
                    value={stock.Amount === 0 ? "" : stock.Amount}
                    onChange={(e) => {
                      const newStock = [...products.StockData];
                      newStock[index].Amount = Number(e.target.value);
                      setProducts({ ...products, StockData: newStock });
                    }}
                    placeholder="Stock"
                    className="mt-1 min-h-11 min-w-0 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base font-normal text-slate-900 outline-none focus:border-[#c70063] focus:ring-2 focus:ring-[#c70063]/10"
                  />
                  </label>

                  <label className="min-w-0 text-xs font-semibold text-slate-500">Precio de venta (IVA incluido)
                  <input
                    type="number"
                    value={stock.Saleprice === 0 ? "" : stock.Saleprice}
                    onChange={(e) => {
                      const newStock = [...products.StockData];
                      newStock[index].Saleprice = Number(e.target.value);
                      setProducts({ ...products, StockData: newStock });
                    }}
                    placeholder="Precio de venta (IVA incluido)"
                    aria-label="Precio de venta con IVA incluido"
                    className="mt-1 min-h-11 min-w-0 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base font-normal text-slate-900 outline-none focus:border-[#c70063] focus:ring-2 focus:ring-[#c70063]/10"
                  />
                  </label>

                  <label className="min-w-0 text-xs font-semibold text-slate-500">Precio de compra
                  <input
                    type="number"
                    value={stock.Purchaseprice === 0 ? "" : stock.Purchaseprice}
                    onChange={(e) => {
                      const newStock = [...products.StockData];
                      newStock[index].Purchaseprice = Number(e.target.value);
                      setProducts({ ...products, StockData: newStock });
                    }}
                    placeholder="Precio compra"
                    className="mt-1 min-h-11 min-w-0 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base font-normal text-slate-900 outline-none focus:border-[#c70063] focus:ring-2 focus:ring-[#c70063]/10"
                  />
                  </label>
                </div>
              ))}
            </div>

            {/* Botones variantes */}
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={addInput}
                className="min-h-11 w-full rounded-xl border border-[#007782]/30 bg-white px-4 py-2.5 font-bold text-[#007782] hover:bg-[#007782]/5 sm:w-auto"
              >
                Añadir variante
              </button>
              <button
                type="button"
                onClick={removeInput}
                disabled={products.StockData.length <= 1}
                className="min-h-11 w-full rounded-xl border border-red-200 bg-white px-4 py-2.5 font-bold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                Eliminar variante
              </button>
            </div>

            {/* Botón Guardar */}
            <div className="flex justify-center border-t border-slate-200 pt-5">
              <button
                type="submit"
                className={`min-h-12 rounded-xl bg-[#c70063] px-8 py-3 font-bold text-white hover:bg-[#a90054] ${
                  !isFormValid() ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={!isFormValid() || isCreating || isUpdating}
              >
                {isCreating || isUpdating ? "Guardando…" : onEdit ? "Actualizar producto" : "Crear producto"}
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

      {openSubCategoryModal && (
        <ModalSubCategory
          onClose={() => setOpenSubCategoryModal(false)}
          onCreated={(newSubCategoryId: number) => {
            setProducts({ ...products, ID_SubCategory: newSubCategoryId });
            setOpenSubCategoryModal(false);
          }}
        />
      )}
    </>
  );
};

export default ModalProduct;
