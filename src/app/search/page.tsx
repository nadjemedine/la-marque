'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2 } from 'lucide-react';
import ProductCard from '@/components/home/ProductCard';

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

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
      let dbQuery = supabase
        .from('products')
        .select('*')
        .eq('in_stock', true)
        .order('created_at', { ascending: false });

      if (query) {
        // Search in product name using text search or ilike
        dbQuery = dbQuery.ilike('name', `%${query}%`);
      }

      const { data, error } = await dbQuery;

      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [query, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section className="py-12 bg-background min-h-[60vh]">
      <div className="container mx-auto px-6 max-w-7xl">
        <h1 className="text-3xl font-bold mb-8">
          {query ? `Résultats pour "${query}"` : 'Tous les produits'}
        </h1>
        
        {products.length === 0 ? (
          <div className="text-center py-20 bg-secondary/50 rounded-xl">
            <p className="text-muted-foreground text-lg mb-4">Aucun produit trouvé pour la recherche &quot;{query}&quot;</p>
            <p className="text-sm text-muted-foreground">Essayez avec d&apos;autres mots clés.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen pt-24 bg-background">
      <Suspense fallback={
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  );
}
