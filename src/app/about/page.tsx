import { Store, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tighter">
            L'élégance à la portée de tous avec <span className="text-primary italic">La Marque</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Née de la passion pour la mode et le raffinement, La Marque est votre destination ultime pour les vêtements et accessoires de la plus haute qualité. Nous sélectionnons nos produits avec un soin extrême pour vous offrir une expérience d'achat incomparable.
          </p>
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          <div className="bg-card p-8 rounded-3xl border border-border shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Qualité Premium</h3>
            <p className="text-muted-foreground">Chaque article est rigoureusement sélectionné pour répondre aux plus hauts standards de l'industrie.</p>
          </div>
          
          <div className="bg-card p-8 rounded-3xl border border-border shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Achat Sécurisé</h3>
            <p className="text-muted-foreground">Commandez en toute tranquillité. Payez uniquement à la livraison (COD) ou via nos méthodes sécurisées.</p>
          </div>

          <div className="bg-card p-8 rounded-3xl border border-border shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Truck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Livraison Rapide</h3>
            <p className="text-muted-foreground">Nous assurons la livraison vers les 58 wilayas d'Algérie dans les plus brefs délais possibles.</p>
          </div>

          <div className="bg-card p-8 rounded-3xl border border-border shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Store className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Client Roi</h3>
            <p className="text-muted-foreground">Notre service client est à votre écoute 7j/7 pour garantir votre entière satisfaction à chaque étape.</p>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-secondary/30 rounded-3xl overflow-hidden border border-border">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-12 md:p-20 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Notre Histoire</h2>
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  Ce qui a commencé comme une simple idée entre passionnés de mode est rapidement devenu l'une des boutiques en ligne les plus en vue. Nous avons remarqué un manque de vêtements alliant style moderne, haute qualité et prix accessible.
                </p>
                <p>
                  C'est ainsi qu'est née <strong>La Marque</strong>. Plus qu'une simple boutique, c'est un style de vie. Notre mission est de vous aider à exprimer votre personnalité à travers des collections uniques et intemporelles.
                </p>
              </div>
              <div className="mt-8">
                <Link 
                  href="/categories" 
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95"
                >
                  Découvrir les Collections
                </Link>
              </div>
            </div>
            <div className="relative h-96 lg:h-auto min-h-[400px]">
              <img 
                src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e07?q=80&w=2670&auto=format&fit=crop" 
                alt="Intérieur de magasin moderne" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
