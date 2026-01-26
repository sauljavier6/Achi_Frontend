// Interface para el envío desde frontend
interface StockInput {
  Description: string;
  Amount: number;
  Saleprice: number;
  Purchaseprice: number;
  State?: boolean;
}

interface ProductImage {
  file: File;
  preview: string;
}

interface ProductInput {
  ID_Product?: number;
  Description: string;
  ID_Category: number;
  Code: string;
  Codesat: string;
  State?: boolean;
  ID_Iva: number;
  StockData: StockInput[];
  Imagenes: ProductImage[]; 
}

const token = localStorage.getItem('token')

export const getProducts = async ({ page = 1, limit = 10, searchTerm='' }) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/product?page=${page}&limit=${limit}&searchTerm=${searchTerm}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });

  if (!res.ok) throw new Error('Error al obtener productos');
  return await res.json(); // Retorna: { data, pagination, message }
};


export const postProduct = async (productData: ProductInput) => {
  console.log('productData',productData)
  const formData = new FormData();

  // datos normales
  formData.append("Code", productData.Code);
  formData.append("Codesat", productData.Codesat);
  formData.append("Description", productData.Description);
  formData.append("ID_Category", productData.ID_Category.toString());
  formData.append("StockData", JSON.stringify(productData.StockData));
  formData.append("ID_Iva", JSON.stringify(productData.ID_Iva));

  // imágenes
  productData.Imagenes.forEach((imgObj: ProductImage ) => {
    formData.append("Imagenes", imgObj.file);
  });

  const res = await fetch(`${import.meta.env.VITE_API_URL}/product`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al crear producto');
  }

  return await res.json();
};


export const deleteMultipleProducts = async (ids: number[]) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/product`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ids }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al eliminar productos');
  }

  return await res.json();
};


export const getProductById = async (id: number) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/product/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  if (!res.ok) {
    throw new Error('No se pudo obtener el producto');
  }

  return await res.json();
};

export const updateProduct = async (productData: ProductInput) => {
  console.log('productData',productData)
  const formData = new FormData();

  // datos normales
  if (productData.ID_Product !== undefined) {
    formData.append("ID_Product", productData.ID_Product.toString());
  }
  formData.append("Code", productData.Code);
  formData.append("Codesat", productData.Codesat);
  formData.append("Description", productData.Description);
  formData.append("ID_Category", productData.ID_Category.toString());
  formData.append("StockData", JSON.stringify(productData.StockData));
  formData.append("ID_Iva", JSON.stringify(productData.ID_Iva));
  formData.append("State", productData.State ? "true" : "false");

  // imágenes (solo si hay nuevas imágenes)
  productData.Imagenes.forEach((imgObj: ProductImage) => {
    if (imgObj.file) {
      formData.append("Imagenes", imgObj.file);
    }
  });

  // imágenes existentes a conservar (las que ya estaban en el producto)
  productData.Imagenes
    .filter((img: ProductImage) => typeof img === "string") // solo nombres de imagen existentes
    .forEach((imgName: string) => formData.append("ExistingImages[]", imgName));

  
  const res = await fetch(`${import.meta.env.VITE_API_URL}/product`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al actualizar producto');
  }

  return await res.json();
};


export const searchProducts = async (query: string) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/product/search?q=${query}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error('Error al buscar productos');
  return await res.json();
};

