import Hero from '@/components/home/Hero';
import CategorySection from '@/components/home/CategorySection';
import ProductGrid from '@/components/home/ProductGrid';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <CategorySection />
      <ProductGrid />
    </div>
  );
}
