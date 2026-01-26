import { useQuery } from "@tanstack/react-query";
import {
  getSaleById,
  pathStateWebSale,
  printRemision,
} from "../../../api/Post/SaleApi/SaleApi";
import { toast } from "react-toastify";

export interface ClienteInfo {
  ID_User: number;
  Name: string;
  Email: {
    ID_Email: number;
    Description: string;
  };
  Phone: {
    ID_Phone: number;
    Description: string;
  };
}

export interface ProductInfo {
  ID_Product: number;
  Description: string;
  ID_Category: number;
  Code: string;
  ID_Iva: number;
  SalePrice: string;
  PurchasePrice: string;
}

export interface StockInfo {
  ID_Stock: number;
  Description: string;
  Amount: number;
  Saleprice: string;
  Purchaseprice: string;
}

export interface SaleProduct {
  ID_SaleProduct: number;
  ID_Sale: number;
  ID_Product: number;
  ID_Stock: number;
  Quantity: number;
  Product: ProductInfo;
  Stock: StockInfo;
  State: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StateInfo {
  ID_State: number;
  Description: string;
  State: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSale {
  ID_PaymentSale: number;
  ID_Sale: number;
  Amount: string;
  Method: string;
  State: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Venta {
  ID_Sale: number;
  ID_User: number;
  ID_Operador: number;
  ID_State: number;
  Cliente: ClienteInfo;
  Facturacion: null;
  SaleProduct: SaleProduct[];
  PaymentSale: PaymentSale[];
  State: StateInfo;
  Subtotal: string;
  Iva: string;
  Total: string;
  Balance_Total: string;
  StateSale: boolean;
  StateWeb: boolean;
  Batch: string;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  sale: number | null;
}

const SalesDetailComponent = ({ sale }: Props) => {
  const { data, error } = useQuery({
    queryKey: ["salewebbyid", sale],
    queryFn: () => getSaleById(sale!),
    placeholderData: (prev) => prev,
    enabled: sale !== null,
  });

  const handlePrintRemision = () => {
    printRemision(sale!);
  };

  const handleCompletar = async () => {
    const resp = await pathStateWebSale(sale!);

    if (resp.success) {
      toast.success("Venta completada");
    } else {
      toast.error("No se pudo completar la venta");
    }
  };

  if (error)
    return (
      <p className="text-center text-gray-600">
        No hay información de la venta.
      </p>
    );

  return (
    <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-4xl mx-auto mt-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Atender Venta #{data?.ID_Sale}
      </h2>

      {/* Datos del cliente */}
      <section className="bg-gray-100 p-4 rounded-md mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">
          Datos del Cliente
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          <p>
            <span className="font-semibold">Nombre:</span> {data?.Cliente?.Name}
          </p>
          <p>
            <span className="font-semibold">Email:</span>{" "}
            {data?.Cliente?.Email?.Description}
          </p>
          <p>
            <span className="font-semibold">Teléfono:</span>{" "}
            {data?.Cliente?.Phone?.Description}
          </p>
        </div>
      </section>

      {/* Datos generales */}
      <section className="bg-gray-100 p-4 rounded-md mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">
          Datos de la Venta
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          <p>
            <span className="font-semibold">Fecha:</span> {data?.createdAt}
          </p>
          <p>
            <span className="font-semibold">Total:</span> ${data?.Total}
          </p>
          <p>
            <span className="font-semibold">Estado:</span>{" "}
            {data?.StateWeb ? "Pendiente" : "Completada"}
          </p>
        </div>
      </section>

      {/* Productos */}
      <section className="bg-gray-100 p-4 rounded-md mb-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Productos</h3>

        <div className="overflow-x-auto">
          <table className="w-full table-auto border rounded-md">
            <thead className="bg-gray-200 text-gray-800 text-sm">
              <tr>
                <th className="px-3 py-2 text-left">Producto</th>
                <th className="px-3 py-2 text-center">Cantidad</th>
                <th className="px-3 py-2 text-center">Precio</th>
                <th className="px-3 py-2 text-right">Importe</th>
              </tr>
            </thead>
            <tbody>
              {data?.SaleProduct?.map((item: SaleProduct) => (
                <tr
                  key={item.ID_SaleProduct}
                  className="border-b last:border-none text-sm bg-white"
                >
                  <td className="px-3 py-2">
                    {item.Product.Description} {item.Stock.Description}
                  </td>
                  <td className="px-3 py-2 text-center">{item.Quantity}</td>
                  <td className="px-3 py-2 text-center">
                    ${item.Stock.Saleprice}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold">
                    $
                    {(item.Quantity * parseFloat(item.Stock.Saleprice)).toFixed(
                      2
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* BOTONES */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
        <button
          onClick={handlePrintRemision}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm shadow transition"
        >
          Remisión
        </button>

        <button
          onClick={handleCompletar}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-sm shadow transition"
        >
          Completar
        </button>
      </div>
    </div>
  );
};

export default SalesDetailComponent;
