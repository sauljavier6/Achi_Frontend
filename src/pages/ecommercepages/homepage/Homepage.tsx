import BannerBar from "../../../components/ecommercecomponents/bannerbar/BannerBar";
import BestProducts from "../../../components/ecommercecomponents/bestproducts/BestProducts";
import Carousel from "../../../components/ecommercecomponents/carrusel/Carrusel";
import CatalogoBanner from "../../../components/ecommercecomponents/catalogobanner/CatalogoBanner";

function HomePage() {
  return (
    <div>
      <Carousel />
      <BannerBar />
      <BestProducts />
      <CatalogoBanner />
    </div>
  );
}


export default HomePage;
