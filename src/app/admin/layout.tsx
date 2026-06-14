'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Box, LogOut, Tags, LayoutTemplate, Menu, X, Store, Settings } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isLoginPage = pathname === '/admin/login';

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  const NavLinks = () => (
    <>
      <Link 
        href="/admin" 
        onClick={() => setMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
          pathname === '/admin' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        Tableau de bord
      </Link>
      <Link 
        href="/admin/orders" 
        onClick={() => setMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
          pathname === '/admin/orders' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
      >
        <ShoppingBag className="w-5 h-5" />
        Commandes
      </Link>
      <Link 
        href="/admin/products" 
        onClick={() => setMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
          pathname === '/admin/products' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
      >
        <Box className="w-5 h-5" />
        Produits
      </Link>
      <Link 
        href="/admin/categories" 
        onClick={() => setMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
          pathname === '/admin/categories' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
      >
        <Tags className="w-5 h-5" />
        Catégories
      </Link>
      <Link 
        href="/admin/hero" 
        onClick={() => setMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
          pathname === '/admin/hero' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
      >
        <LayoutTemplate className="w-5 h-5" />
        Hero Section
      </Link>
      <Link 
        href="/admin/settings" 
        onClick={() => setMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
          pathname === '/admin/settings' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
      >
        <Settings className="w-5 h-5" />
        Paramètres
      </Link>
    </>
  );

  return (
    <div className="flex h-screen bg-secondary overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-background border-r border-border flex-col shrink-0">
        <div className="h-20 flex items-center px-8 border-b border-border">
          <Link href="/admin" className="text-xl font-bold uppercase tracking-wider">
            Mounlek Collection <span className="text-primary">Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <NavLinks />
        </nav>

        <div className="p-4 border-t border-border flex flex-col gap-2">
          <Link 
            href="/"
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <Store className="w-5 h-5" />
            Retour au magasin
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-background border-b border-border flex items-center justify-between px-4 shrink-0">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
            title="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <span className="font-bold uppercase tracking-wider text-sm">
            Mounlek Collection <span className="text-primary">Admin</span>
          </span>
          
          {/* Spacer to keep center alignment visually balanced if we don't have a right icon */}
          <div className="w-10"></div>
        </header>

        <main className="flex-1 overflow-y-auto w-full pb-6 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer like ChatGPT */}
      <div 
        className={`fixed top-0 left-0 h-full w-[80%] max-w-sm bg-background shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-border shrink-0">
          <span className="font-bold text-lg tracking-wider uppercase text-primary">Menu</span>
          <button 
            onClick={() => setMobileMenuOpen(false)} 
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground bg-background rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <NavLinks />
        </nav>

        <div className="p-4 border-t border-border flex flex-col gap-2 shrink-0">
          <Link 
            href="/"
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <Store className="w-5 h-5" />
            Retour au magasin
          </Link>
          <button 
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}
