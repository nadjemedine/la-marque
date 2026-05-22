'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Box, LogOut, Tags, LayoutTemplate } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
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

  return (
    <div className="flex h-screen bg-secondary overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-background border-r border-border flex-col shrink-0">
        <div className="h-20 flex items-center px-8 border-b border-border">
          <Link href="/admin" className="text-xl font-bold uppercase tracking-wider">
            La Marque <span className="text-primary">Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <Link 
            href="/admin" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              pathname === '/admin' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Tableau de bord
          </Link>
          <Link 
            href="/admin/orders" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              pathname === '/admin/orders' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            Commandes
          </Link>
          <Link 
            href="/admin/products" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              pathname === '/admin/products' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <Box className="w-5 h-5" />
            Produits
          </Link>
          <Link 
            href="/admin/categories" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              pathname === '/admin/categories' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <Tags className="w-5 h-5" />
            Catégories
          </Link>
          <Link 
            href="/admin/hero" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              pathname === '/admin/hero' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <LayoutTemplate className="w-5 h-5" />
            Hero Section
          </Link>
        </nav>

        <div className="p-4 border-t border-border">
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
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-background border-t border-border flex justify-around items-center p-4 z-50">
        <Link href="/admin" className={`p-2 rounded-lg ${pathname === '/admin' ? 'text-primary' : 'text-muted-foreground'}`}>
          <LayoutDashboard className="w-6 h-6" />
        </Link>
        <Link href="/admin/orders" className={`p-2 rounded-lg ${pathname === '/admin/orders' ? 'text-primary' : 'text-muted-foreground'}`}>
          <ShoppingBag className="w-6 h-6" />
        </Link>
        <Link href="/admin/products" className={`p-2 rounded-lg ${pathname === '/admin/products' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Box className="w-6 h-6" />
        </Link>
        <Link href="/admin/categories" className={`p-2 rounded-lg ${pathname === '/admin/categories' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Tags className="w-6 h-6" />
        </Link>
        <Link href="/admin/hero" className={`p-2 rounded-lg ${pathname === '/admin/hero' ? 'text-primary' : 'text-muted-foreground'}`}>
          <LayoutTemplate className="w-6 h-6" />
        </Link>
        <button onClick={handleLogout} className="p-2 rounded-lg text-destructive">
          <LogOut className="w-6 h-6" />
        </button>
      </nav>
    </div>
  );
}
