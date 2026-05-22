'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import ProductCard, { Product } from '@/components/home/ProductCard';
import { Loader2 } from 'lucide-react';

interface RelatedProductsProps {
  currentProductId: string;
  category: string;
}

export default function RelatedProducts({ currentProductId, category }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        if (!category) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category', category)
          .neq('id', currentProductId)
          .limit(4);

        if (error) {
          console.error('Error fetching related products:', error);
        } else if (data) {
          setProducts(data);
        }
      } catch (err) {
        console.error('Unexpected error fetching related products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [category, currentProductId, supabase]);

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null; // Return nothing if no related products
  }

  return (
    <div className="py-16 mt-12 border-t border-border">
      <h2 className="text-2xl font-bold mb-8">Produits Similaires</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
