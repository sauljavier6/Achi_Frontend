import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../components/layout/poslayout/AdminLayout";

import DashboardPage from "../pages/Dashboard";
import ProductsPage from "../pages/productpage/ProductsPage";

import ProtectedRoute from "./ProtectedRoute";
import SalesPage from "../pages/salespage/SalesPage";
import QuotesPage from "../pages/quotespage/QuotesPage";
import CustomersPage from "../pages/customerspage/CustomersPage";
import CajasPage from "../pages/cajaspage/CajasPage";
import ComprasPage from "../pages/compraspage/ComprasPage";
import SuppliersPage from "../pages/supplierspage/SuppliersPage";
import FacturasPage from "../pages/facturaspage/FacturasPage";
import HomePage from "../pages/ecommercepages/homepage/Homepage";
import EcommerceLayout from "../components/layout/ecommercelayout/EcommerceLayout";

import EProductsPage from "../pages/ecommercepages/productpage/ProductPage";
import CartPage from "../pages/ecommercepages/cartpage/CartPage";
import ProductDetails from "../pages/ecommercepages/productdetails/ProductDetails";
import AuthPage from "../pages/authpage/AuthPage";
import AuthLayout from "../components/layout/AuthLayout";
import PaymentPage from "../pages/paymentpage/PaymentPage";
import QuotesCart from "../components/ecommercecomponents/quotescart/QuotesCart";
import WePage from "../pages/ecommercepages/wepage/WePage";
import SalesWebPage from "../pages/saleswebpage/SalesWebPage";
import FacturacionPage from "../pages/facturacionpage/FacturacionPage";
import RoleRoute from "./RoleRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<AuthLayout />}>
        <Route index element={<AuthPage />} />
      </Route>

      <Route path="/" element={<EcommerceLayout />}>
        <Route index element={<HomePage />} />
        <Route path="productos" element={<EProductsPage />} />
        <Route path="carrito" element={<CartPage />} />
        <Route path="detalles/:id" element={<ProductDetails />} />
        <Route path="stripe" element={<PaymentPage />} />
        <Route path="cotizaciones" element={<QuotesCart />} />
        <Route path="nosotros" element={<WePage />} />
      </Route>

      {/* Rutas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/pos" element={<AdminLayout />}>
        
          {/* Admin + Trabajador */}
          <Route element={<RoleRoute allow={["Administrador", "Trabajador"]} />} >
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="productos" element={<ProductsPage />} />
            <Route path="ventas" element={<SalesPage />} />
            <Route path="cotizaciones" element={<QuotesPage />} />
            <Route path="clientes" element={<CustomersPage />} />
            <Route path="cajas" element={<CajasPage />} />
            <Route path="compras" element={<ComprasPage />} />
            <Route path="proveedores" element={<SuppliersPage />} />
            <Route path="facturas" element={<FacturasPage />} />
            <Route path="facturacion" element={<FacturacionPage />} />
            <Route path="pedidos" element={<SalesWebPage />} />
          </Route>
        </Route>
      </Route>

      {/* Redirección */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default AppRoutes;
