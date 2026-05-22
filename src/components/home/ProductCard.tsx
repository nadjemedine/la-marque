'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store';

export type Product = {
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

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || '');
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ 
      id: product.id, 
      name: product.name, 
      price: product.price, 
      image: product.image_url, 
      size: selectedSize,
      color: selectedColor,
      quantity: 1 
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="group flex flex-col bg-background">
      <Link href={`/product/${product.slug || product.id}`} className="relative aspect-[3/4] overflow-hidden rounded-xl mb-3 bg-secondary block">
        <Image 
          src={product.image_url || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=600'} 
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10 text-white"></div>
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
          <button 
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 bg-background/90 backdrop-blur-sm text-foreground py-2.5 rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm text-sm"
          >
            <ShoppingCart className="w-4 h-4" /> {added ? 'Ajouté' : 'Ajouter'}
          </button>
        </div>
      </Link>
      
      <div className="flex flex-col gap-1.5 px-1 flex-1">
        <Link href={`/product/${product.slug || product.id}`}>
          <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-1 hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        <span className="text-primary font-bold text-sm sm:text-base">{product.price} DZD</span>
        
        {/* Variants Selection */}
        {((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) && (
          <div className="flex flex-col gap-2 mt-2">
            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-1">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={(e) => { e.preventDefault(); setSelectedSize(size); }}
                    className={`shrink-0 w-6 h-6 sm:w-8 sm:h-8 text-[10px] sm:text-xs flex items-center justify-center rounded-md border font-medium transition-colors ${
                      selectedSize === size
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background text-foreground border-border hover:border-foreground'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
            
            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-1">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={(e) => { e.preventDefault(); setSelectedColor(color); }}
                    className={`shrink-0 px-2 py-1 text-[10px] sm:text-xs rounded-full border transition-all ${
                      selectedColor === color
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
