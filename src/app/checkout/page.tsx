'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store';
import { WILAYAS, SHIPPING_FEES } from '@/lib/wilayas';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    wilaya: WILAYAS[0].name,
    commune: '',
    address: '',
  });

  // Basic calculation for shipping fee (could be enhanced based on Wilaya)
  const shippingFee = SHIPPING_FEES.default_nord; 
  const totalAmount = totalPrice() + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Client-side UUID generation for order id (to avoid RLS Select restrictions)
      const orderId = crypto.randomUUID();

      // Create Order
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          full_name: formData.fullName,
          phone_number: formData.phoneNumber,
          wilaya: formData.wilaya,
          commune: formData.commune,
          address: formData.address,
          total_amount: totalAmount,
          status: 'pending'
        });

      if (orderError) {
        console.error("Orders Error:", orderError);
        throw orderError;
      }

      // Create Order Items
      const orderItems = items.map((item) => ({
        order_id: orderId,
        product_id: item.id && item.id.length > 20 ? item.id : null, // Ensure valid UUID or null
        quantity: item.quantity,
        size: item.size || null,
        color: item.color || null,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error("Order Items Error:", itemsError);
        throw itemsError;
      }

      // Success
      clearCart();
      router.push('/thank-you');

    } catch (err) {
      console.error("Error submitting order:", err);
      alert("Une erreur s'est produite lors de la validation de la commande.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 pt-4 pb-12 lg:pb-24 max-w-7xl">
      <div className="mb-8">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Retour
        </button>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold mb-10">Validation de Commande</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Form Section */}
        <div className="flex-1 lg:max-w-2xl">
          <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border">
            <h2 className="text-xl font-semibold mb-6">Détails de Livraison (Paiement à la réception)</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-medium">Nom Complet</label>
                  <input required type="text" id="fullName" className="w-full p-3 rounded-lg border border-input bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50" 
                    value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phoneNumber" className="text-sm font-medium">Numéro de Téléphone</label>
                  <input required type="tel" id="phoneNumber" className="w-full p-3 rounded-lg border border-input bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50" 
                    value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="wilaya" className="text-sm font-medium">Wilaya</label>
                  <select required id="wilaya" className="w-full p-3 rounded-lg border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={formData.wilaya} onChange={(e) => setFormData({...formData, wilaya: e.target.value})}>
                    {WILAYAS.map(w => (
                      <option key={w.id} value={w.name}>{w.id} - {w.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="commune" className="text-sm font-medium">Commune</label>
                  <input required type="text" id="commune" className="w-full p-3 rounded-lg border border-input bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50" 
                    value={formData.commune} onChange={(e) => setFormData({...formData, commune: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium">Adresse Complète</label>
                <textarea required id="address" rows={3} className="w-full p-3 rounded-lg border border-input bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50" 
                  value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading || items.length === 0}
                className="w-full py-4 mt-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Traitement...' : 'Confirmer la commande'}
              </button>

            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-secondary/50 p-6 rounded-2xl sticky top-32">
            <h2 className="text-lg font-semibold mb-6">Récapitulatif de la Commande</h2>
            
            {items.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">Votre panier est vide</p>
            ) : (
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <div className="w-16 h-20 bg-background rounded-md overflow-hidden flex-shrink-0 relative">
                       <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">Qté: {item.quantity}</p>
                    </div>
                    <div className="font-semibold text-sm">
                      {item.price * item.quantity} DZD
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="font-medium">{totalPrice()} DZD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Livraison</span>
                <span className="font-medium">{shippingFee} DZD</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-border pt-4 mt-2">
                <span>Total</span>
                <span className="text-primary">{totalAmount} DZD</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
