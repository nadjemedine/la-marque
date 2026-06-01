'use client';

import Link from 'next/link';
import { Home, Grid, Search, ShoppingCart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import CartDrawer from '@/components/cart/CartDrawer';

export default function BottomNav() {
  const pathname = usePathname();
  const totalItems = useCartStore((state) => state.totalItems());
  const [mounted, setMounted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 w-full bg-background border-t border-border z-40 pb-safe">
        <div className="flex items-center justify-around p-3">
          <Link 
            href="/" 
            className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Accueil</span>
          </Link>
          
          <Link 
            href="/categories" 
            className={`flex flex-col items-center gap-1 ${isActive('/categories') ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Grid className="w-5 h-5" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Catégories</span>
          </Link>

          <button 
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center gap-1 text-muted-foreground relative"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Panier</span>
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
