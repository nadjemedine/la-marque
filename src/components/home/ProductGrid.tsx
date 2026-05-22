'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from './ProductCard';
import { useCartStore } from '@/lib/store';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string;
  images: string[];
  category: string;
  in_stock: boolean;
  sizes?: string[];
  colors?: string[];
};

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('in_stock', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [supabase]);

  // handleAddToCart is now inside ProductCard

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Aucun produit disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <section className="py-20 bg-background" id="products">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Notre Sélection</h2>
          <p className="text-muted-foreground w-full max-w-2xl mx-auto">
            Des pièces soigneusement choisies pour un style intemporel et moderne.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
