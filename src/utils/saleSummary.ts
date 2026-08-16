import { useState, type Dispatch, type SetStateAction } from "react";

export interface SummaryProduct {
  price: unknown;
  quantity: unknown;
  iva: unknown;
}

export const numericValue = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value ?? "").replace(/[$,\s]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const taxRate = (value: unknown) => {
  const parsed = numericValue(value);
  return parsed > 1 ? parsed / 100 : parsed;
};

export const lineTotal = (product: SummaryProduct) => numericValue(product.price) * numericValue(product.quantity);

export const calculateSaleSummary = (products: SummaryProduct[]) => products.reduce(
  (summary, product) => {
    const quantity = numericValue(product.quantity);
    const gross = lineTotal(product);
    const rate = taxRate(product.iva);
    const subtotal = rate > 0 ? gross / (1 + rate) : gross;
    const tax = gross - subtotal;
    return {
      itemCount: summary.itemCount + quantity,
      subtotal: summary.subtotal + subtotal,
      iva: summary.iva + tax,
      total: summary.total + gross,
    };
  },
  { itemCount: 0, subtotal: 0, iva: 0, total: 0 },
);

export const useSaleProducts = <Product extends SummaryProduct>() => {
  const [cart, setCart] = useState(() => ({
    products: [] as Product[],
    summary: calculateSaleSummary([]),
  }));

  const setProducts: Dispatch<SetStateAction<Product[]>> = (update) => {
    setCart((current) => {
      const products = typeof update === "function"
        ? update(current.products)
        : update;
      return { products, summary: calculateSaleSummary(products) };
    });
  };

  return [cart.products, setProducts, cart.summary] as const;
};
