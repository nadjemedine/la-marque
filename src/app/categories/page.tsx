import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export const revalidate = 60; // Revalidate every 60 seconds

async function getCategories() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return categories || [];
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
          </Link>
        </div>

        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Nos Catégories</h1>
          <p className="text-lg text-muted-foreground">
            Explorez notre vaste sélection de vêtements et accessoires, soigneusement triés par catégorie pour simplifier votre expérience d'achat.
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href={`/categories/${category.slug}`}
                className="group relative h-80 rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-xl transition-all duration-300"
              >
                {/* Background Image / Placeholder */}
                {category.image_url ? (
                  <img 
                    src={category.image_url} 
                    alt={category.name} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-500" />
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h2 className="text-3xl font-bold mb-2">{category.name}</h2>
                  {category.description && (
                    <p className="text-white/80 text-sm line-clamp-2 mb-4">
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm font-semibold opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Découvrir <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-card rounded-3xl border border-border">
            <h3 className="text-2xl font-bold mb-4">Aucune catégorie pour le moment</h3>
            <p className="text-muted-foreground">
              Les catégories apparaîtront ici une fois qu'elles auront été ajoutées.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
