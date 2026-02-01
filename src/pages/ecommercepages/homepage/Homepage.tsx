import Hero from "../../../components/ecommercecomponents/landingcomponents/Hero";
import ProductCarousel from "../../../components/ecommercecomponents/landingcomponents/ProductCarousel";
import PromoBanner from "../../../components/ecommercecomponents/landingcomponents/PromoBanner";
import SportsGrid from "../../../components/ecommercecomponents/landingcomponents/SportsGrid";

function HomePage() {
  return (
    <div className="min-h-screen w-full bg-white overflow-x-hidden">
      <Hero />
      <ProductCarousel />
      <SportsGrid />
      <PromoBanner />
    </div>
  );
}

export default HomePage;
