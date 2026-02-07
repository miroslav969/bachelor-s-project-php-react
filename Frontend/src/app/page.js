'use client';
import PromoSlider from '../components/PromoSlider';
import ProductSection from "../components/ProductSection";
import {products} from "@/lib/products";
import LastViewed from "@/components/LastViewed";

const HomePage = () => {

  return (
      <div className="min-h-screen bg-white">
        <main className="container mx-auto px-4 py-8">
            <PromoSlider />
            <ProductSection title="Вам может понравиться" products={products} limit={8}  />
            <div className="grid grid-cols-2 my-8">
                <img src="/assets/news/news1.png" alt="news"/>
                <img src="/assets/news/news2.png" alt="news"/>
            </div>
            <LastViewed/>
        </main>
      </div>
  );
};

export default HomePage;