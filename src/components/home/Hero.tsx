'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function Hero() {
  const [heroSettings, setHeroSettings] = useState<{
    title: string;
    subtitle: string | null;
    button_text: string;
    button_link: string;
    image_url: string | null;
    is_active: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHero = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await supabase.from('hero_settings').select('*').limit(1).single();
      if (data) {
        setHeroSettings(data);
      }
      setLoading(false);
    };
    fetchHero();
  }, []);

  if (loading) {
    return <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center bg-secondary/20 animate-pulse"></section>;
  }

  // Si l'admin a désactivé le Hero
  if (heroSettings && !heroSettings.is_active) {
    return null;
  }

  const title = heroSettings?.title || "Élégance &\nConfort";
  const subtitle = heroSettings?.subtitle || "Découvrez notre nouvelle collection de vêtements conçus pour votre bien-être. Livraison disponible dans les 58 wilayas d'Algérie avec paiement à la réception.";
  const btnText = heroSettings?.button_text || "Découvrir maintenant";
  const btnLink = heroSettings?.button_link || "/categories";
  
  // Utiliser l'image de Supabase ou le placeholder d'origine
  const bgImage = heroSettings?.image_url 
    ? `url('${heroSettings.image_url}')` 
    : `url('https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop')`;

  return (
    <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background with an aesthetic gradient or image placeholder */}
      <div className="absolute inset-0 bg-secondary/50">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
        {/* Dynamic Hero Image */}
        <div 
          className="absolute right-0 top-0 h-full w-[60%] bg-cover bg-center" 
          style={{ backgroundImage: bgImage }}
        />
      </div>

      <div className="container px-6 max-w-7xl relative z-20 flex flex-col items-start justify-center h-full">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-2xl mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150 whitespace-pre-wrap">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 whitespace-pre-wrap">
          {subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
          <Link 
            href={btnLink} 
            className="flex items-center justify-center gap-2 bg-foreground text-background px-8 py-4 rounded-full font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
          >
            {btnText}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
