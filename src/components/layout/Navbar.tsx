'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import CartDrawer from '@/components/cart/CartDrawer';
import { createBrowserClient } from '@supabase/ssr';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const totalItems = useCartStore((state) => state.totalItems());
  const [mounted, setMounted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'pages' | 'categories'>('pages');
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await supabase.from('categories').select('id, name, slug');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setMobileSearchOpen(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header 
        className={`fixed top-0 w-full z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-background/80 backdrop-blur-md border-b border-border shadow-sm py-4' 
            : 'bg-transparent py-6'
        }`}
      >
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 -ml-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="text-xl md:text-2xl font-bold tracking-wider uppercase flex-1 text-center md:text-left whitespace-nowrap">
            la marque.
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center font-medium text-sm tracking-wide">
            <Link href="/" className="hover:text-primary transition-colors">ACCUEIL</Link>
            <Link href="/categories" className="hover:text-primary transition-colors">CATÉGORIES</Link>
            <Link href="/about" className="hover:text-primary transition-colors">À PROPOS</Link>
          </nav>

          <div className="flex items-center gap-4 flex-1 justify-end">
            <form onSubmit={handleSearch} className="hidden md:flex items-center bg-secondary rounded-full px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <button type="submit" className="text-muted-foreground mr-2 hover:text-foreground">
                <Search className="w-4 h-4" />
              </button>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..." 
                className="bg-transparent border-none outline-none text-sm w-32 focus:w-48 transition-all duration-300 text-foreground placeholder:text-muted-foreground"
              />
            </form>
            <button 
              className="md:hidden p-2 hover:text-primary transition-colors"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2 hover:text-primary transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      </header>

      {/* Mobile Search Overlay */}
      <div className={`fixed z-40 md:hidden overflow-hidden transition-all duration-300 bg-background border-b border-border w-full left-0 ${mobileSearchOpen ? 'top-[73px] max-h-20 py-4 px-6 opacity-100' : 'top-[73px] max-h-0 py-0 opacity-0'}`}>
        <form onSubmit={handleSearch} className="flex items-center bg-secondary rounded-full px-4 py-2">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un produit..." 
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
          />
          <button type="submit" className="text-muted-foreground hover:text-foreground">
            <Search className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div 
        className={`fixed top-0 left-0 h-full w-[80%] max-w-sm bg-background shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex justify-between items-center bg-secondary/30">
          <span className="font-bold text-lg tracking-wider uppercase">Menu</span>
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-muted-foreground hover:text-foreground bg-background rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex border-b border-border">
          <button 
            onClick={() => setActiveTab('pages')}
            className={`flex-1 py-4 text-sm font-semibold tracking-wider uppercase transition-colors ${activeTab === 'pages' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Pages
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-4 text-sm font-semibold tracking-wider uppercase transition-colors ${activeTab === 'categories' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Catégories
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {activeTab === 'pages' ? (
            <nav className="flex flex-col p-6 gap-6 text-lg font-medium text-foreground">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors">ACCUEIL</Link>
              <Link href="/categories" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors">TOUTES LES CATÉGORIES</Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors">À PROPOS</Link>
            </nav>
          ) : (
            <nav className="flex flex-col p-6 gap-6 text-lg font-medium text-foreground">
              {categories.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={`/categories/${cat.slug}`} 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="hover:text-primary transition-colors"
                >
                  {cat.name.toUpperCase()}
                </Link>
              ))}
              {categories.length === 0 && (
                <span className="text-muted-foreground text-sm">Aucune catégorie disponible.</span>
              )}
            </nav>
          )}
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
