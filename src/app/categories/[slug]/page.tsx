'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';
import { ShoppingCart, Loader2, ArrowLeft } from 'lucide-react';
import { useCartStore } from '@/lib/store';

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string;
  images: string[];
  category: string;
  in_stock: boolean;
};

export default function CategoryDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      setLoading(true);

      // Fetch Category Name
      const { data: catData } = await supabase
        .from('categories')
        .select('name')
        .eq('slug', slug)
        .single();

      if (catData) {
        setCategoryName(catData.name);
        
        // Fetch products by category name
        const { data: prodData } = await supabase
          .from('products')
          .select('*')
          .eq('category', catData.name)
          .eq('in_stock', true)
          .order('created_at', { ascending: false });

        if (prodData) {
          setProducts(prodData);
        }
      }
      setLoading(false);
    };

    fetchCategoryAndProducts();
  }, [slug, supabase]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    addItem({ 
      id: product.id, 
      name: product.name, 
      price: product.price, 
      image: product.image_url, 
      quantity: 1 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!categoryName) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Catégorie non trouvée</h1>
        <Link href="/categories" className="text-primary hover:underline">
          Retour aux catégories
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="mb-10">
          <Link href="/categories" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour aux catégories
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {categoryName}
          </h1>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.slug || product.id}`} className="group cursor-pointer">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl mb-4 bg-secondary">
                  <Image 
                    src={product.image_url || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=600'} 
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10 text-white"></div>
                  <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                    <button 
                      onClick={(e) => handleAddToCart(e, product)}
                      className="w-full flex items-center justify-center gap-2 bg-background/90 backdrop-blur-sm text-foreground py-3 rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm"
                    >
                      <ShoppingCart className="w-4 h-4" /> Ajouter au panier
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1 px-1">
                  <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                  <span className="text-primary font-medium">{product.price} DZD</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-card rounded-3xl border border-border">
            <p className="text-xl text-muted-foreground">Aucun produit dans cette catégorie pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
