'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Box, Clock, ShieldCheck } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Simple Auth Check
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/admin/login');
        return;
      }

      try {
        const [ordersRes, pendingOrdersRes, productsRes, revenueRes] = await Promise.all([
          supabase.from('orders').select('id', { count: 'exact' }),
          supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'pending'),
          supabase.from('products').select('id', { count: 'exact' }),
          supabase.from('orders').select('total_amount').neq('status', 'cancelled')
        ]);

        const totalRevenue = revenueRes.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

        setStats({
          totalOrders: ordersRes.count || 0,
          pendingOrders: pendingOrdersRes.count || 0,
          totalProducts: productsRes.count || 0,
          totalRevenue,
        });
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (loading) {
    return <div className="p-8">Chargement des données...</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Vue d'ensemble</h1>
        <p className="text-muted-foreground mt-1">Bienvenue sur votre tableau de bord d'administration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Commandes Totales</h3>
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <ShoppingBag className="w-5 h-5" />
              </div>
           </div>
           <div className="text-3xl font-bold">{stats.totalOrders}</div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Commandes Annulées</h3>
              <div className="p-2 bg-chart-4/10 text-chart-4 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
           </div>
           <div className="text-3xl font-bold">{stats.pendingOrders}</div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Produits en Magasin</h3>
              <div className="p-2 bg-chart-2/10 text-chart-2 rounded-lg">
                <Box className="w-5 h-5" />
              </div>
           </div>
           <div className="text-3xl font-bold">{stats.totalProducts}</div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Bénéfice Total</h3>
              <div className="p-2 bg-chart-1/10 text-chart-1 rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
           </div>
           <div className="text-xl font-bold text-chart-1">{stats.totalRevenue.toLocaleString('fr-DZ')} DZD</div>
        </div>
      </div>
    </div>
  );
}
