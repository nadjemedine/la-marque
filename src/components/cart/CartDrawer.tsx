'use client';

import { useCartStore } from '@/lib/store';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCartStore();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-background shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" /> 
            Panier ({totalItems()})
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
              <ShoppingBag className="w-12 h-12 opacity-20" />
              <p>Votre panier est vide</p>
              <button 
                onClick={onClose}
                className="mt-4 text-primary hover:underline"
              >
                Continuer vos achats
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4">
                  <div className="relative w-24 h-32 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      fill 
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-sm line-clamp-2">{item.name}</h3>
                      <button 
                        onClick={() => removeItem(item.id, item.size, item.color)}
                        className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                      {item.size && <p>Taille: {item.size}</p>}
                      {item.color && <p>Couleur: {item.color}</p>}
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center border border-border rounded-md">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                          className="p-1.5 hover:bg-secondary"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                          className="p-1.5 hover:bg-secondary"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-semibold">{item.price * item.quantity} DZD</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-6 bg-background">
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted-foreground">Sous-total</span>
              <span className="text-xl font-bold">{totalPrice()} DZD</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Les frais de livraison seront calculés à l&apos;étape suivante.
            </p>
            <Link 
              href="/checkout" 
              onClick={onClose}
              className="w-full flex justify-center items-center py-4 rounded-xl bg-foreground text-background font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Commander
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
