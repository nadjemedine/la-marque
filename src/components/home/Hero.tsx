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
    text_color: 'white' | 'black';
    title_size: number;
    subtitle_size: number;
    button_size: number;
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
  
  const imageUrl = heroSettings?.image_url || null;
  const isWhite = (heroSettings?.text_color || 'white') === 'white';
  const txtCls = isWhite ? 'text-white' : 'text-black';
  const subtitleCls = isWhite ? 'text-white/80' : 'text-black/70';
  const btnCls = isWhite
    ? 'bg-white text-black hover:bg-white/90 shadow-md'
    : 'bg-black text-white hover:bg-black/90 shadow-md';
  const titleSize = heroSettings?.title_size || 64;
  const subtitleSize = heroSettings?.subtitle_size || 20;
  const buttonSize = heroSettings?.button_size || 16;

  return (
    <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background image or fallback color */}
      <div className="absolute inset-0 bg-secondary/50">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Hero background"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>

      <div className="container px-6 max-w-7xl relative z-20 flex flex-col items-start justify-center h-full">
        <h1
          className={`font-bold tracking-tight ${txtCls} max-w-2xl mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150 whitespace-pre-wrap`}
          style={{ fontSize: `${titleSize}px` }}
        >
          {title}
        </h1>
        <p
          className={`font-bold ${subtitleCls} max-w-xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 whitespace-pre-wrap`}
          style={{ fontSize: `${subtitleSize}px` }}
        >
          {subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
          <Link 
            href={btnLink} 
            className={`flex items-center justify-center gap-2 ${btnCls} px-8 py-4 rounded-full font-bold transition-all duration-300 hover:scale-105`}
            style={{ fontSize: `${buttonSize}px` }}
          >
            {btnText}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
