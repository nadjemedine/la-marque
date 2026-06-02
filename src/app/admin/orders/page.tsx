'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { MoreVertical, CheckCircle, Package } from 'lucide-react';

type Order = {
  id: string;
  full_name: string;
  phone_number: string;
  wilaya: string;
  commune: string;
  address: string;
  total_amount: number;
  status: string;
  created_at: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (!error) {
      fetchOrders();
    } else {
      alert("Erreur lors de la mise à jour du statut");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En Attente';
      case 'confirmed': return 'Confirmée';
      case 'shipped': return 'Expédiée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Commandes</h1>
        <p className="text-muted-foreground mt-1">Gérez les commandes et expéditions (Paiement à la livraison).</p>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-secondary/50 text-muted-foreground text-sm uppercase border-b border-border">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Client</th>
                <th className="p-4 font-medium">Téléphone</th>
                <th className="p-4 font-medium">Wilaya / Commune</th>
                <th className="p-4 font-medium line-clamp-1">Montant</th>
                <th className="p-4 font-medium">Statut</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">Chargement des commandes...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">Aucune commande trouvée.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-4 text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 font-medium text-foreground">{order.full_name}</td>
                    <td className="p-4">{order.phone_number}</td>
                    <td className="p-4 max-w-[220px]">
                      <span className="font-medium">{order.wilaya}</span> <br/>
                      <span className="text-muted-foreground text-xs">{order.commune}</span> <br/>
                      <span className="text-muted-foreground text-xs leading-tight block mt-1">{order.address}</span>
                    </td>
                    <td className="p-4 font-bold">{order.total_amount} DZD</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 flex items-center justify-center w-fit rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        value={order.status}
                        className="bg-secondary/50 border border-border text-sm font-medium rounded-lg p-2 outline-none cursor-pointer hover:bg-secondary transition-colors max-w-[140px]"
                      >
                        <option value="pending">En Attente</option>
                        <option value="confirmed">Confirmée</option>
                        <option value="shipped">Expédiée</option>
                        <option value="delivered">Livrée</option>
                        <option value="cancelled">Annulée</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
