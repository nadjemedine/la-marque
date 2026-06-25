'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';
import { ShoppingCart, Loader2, ChevronLeft, ChevronRight, Check, ArrowLeft, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RelatedProducts from '@/components/product/RelatedProducts';

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  images: string[];
  category: string;
  sizes: string[];
  colors: string[];
  color_images?: Record<string, string>;
  in_stock: boolean;
};

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  
  const addItem = useCartStore((state) => state.addItem);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchProduct = async () => {
      // Fetch by ID (fallback for old links) or Slug
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug);
      
      let query = supabase.from('products').select('*');
      
      if (isUuid) {
        query = query.eq('id', slug);
      } else {
        query = query.eq('slug', slug);
      }

      const { data, error } = await query.single();

      if (!error && data) {
        setProduct(data);
        // Default selection
        if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
        if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [slug, supabase]);

  const images = product?.images?.length ? product.images : (product?.image_url ? [product.image_url] : []);

  const nextImage = () => setActiveImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setActiveImage((prev) => (prev - 1 + images.length) % images.length);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity
    });
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
        <Link href="/" className="text-primary hover:underline">Retour à l&apos;accueil</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-4 pb-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-6">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary border border-border group">
              {images.length > 0 ? (
                <Image 
                  src={images[activeImage]} 
                  alt={product.name}
                  fill
                  priority
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No images
                </div>
              )}
              
              {images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-primary-foreground"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-primary-foreground"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`relative w-20 aspect-square rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImage === index ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Detail */}
          <div className="flex flex-col">
            <div className="mb-8">
              <span className="text-primary font-medium text-sm tracking-widest uppercase mb-2 block">
                {product.category || 'Collection'}
              </span>
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              <p className="text-2xl font-semibold text-foreground">{product.price} DZD</p>
            </div>

            <div className="prose prose-sm text-muted-foreground mb-10">
              <p>{product.description || "Aucune description disponible pour ce produit."}</p>
            </div>

            <div className="space-y-8 mb-10">
              {/* Size Selector */}
              {product.sizes?.length > 0 && (
                <div className="space-y-3">
                  <span className="text-sm font-medium">Taille</span>
                  <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`shrink-0 min-w-[48px] h-12 flex items-center justify-center rounded-lg border-2 font-medium transition-all ${
                          selectedSize === size
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {product.colors?.length > 0 && (
                <div className="space-y-3">
                  <span className="text-sm font-medium">Couleur</span>
                  <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color);
                          if (product.color_images && product.color_images[color]) {
                            const imgUrl = product.color_images[color];
                            const idx = images.indexOf(imgUrl);
                            if (idx !== -1) setActiveImage(idx);
                          }
                        }}
                        className={`shrink-0 px-4 h-11 flex items-center justify-center rounded-full border-2 text-sm font-medium transition-all ${
                          selectedColor === color
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quantité</span>
                <div className="flex items-center border border-border rounded-lg bg-background">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-secondary transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-secondary transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={handleBuyNow}
                  disabled={!product.in_stock}
                  className="flex-1 py-4 rounded-xl font-semibold transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Commander
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                  className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 font-semibold transition-all duration-300 ${
                    added 
                      ? 'bg-green-600 text-white' 
                      : 'bg-foreground text-background hover:bg-foreground/90'
                  } disabled:opacity-50`}
                >
                  {added ? (
                    <>
                      <Check className="w-5 h-5" /> Ajouté au panier
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" /> Ajouter au panier
                    </>
                  )}
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Livraison dans 58 wilayas
                </div>
                <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Paiement à la réception
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Related Products Section */}
        {product && product.category && (
          <RelatedProducts currentProductId={product.id} category={product.category} />
        )}
      </div>
    </div>
  );
}
