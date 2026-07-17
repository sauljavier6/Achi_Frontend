
import Footer from "../components/ecommercecomponents/landingcomponents/Footer";
import { Outlet } from "react-router-dom";
import Header from "../components/ecommercecomponents/landingcomponents/Header";

export default function EcommerceLayout() {
  return (
    <div>
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
