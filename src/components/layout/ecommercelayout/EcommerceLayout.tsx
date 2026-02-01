
import Footer from "../../ecommercecomponents/landingcomponents/Footer";
import { Outlet } from "react-router-dom";
import Header from "../../ecommercecomponents/landingcomponents/Header";

export default function EcommerceLayout() {
  return (
    <div>
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
