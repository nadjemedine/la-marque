import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { ArrowRight } from 'lucide-react';

export const revalidate = 0; // Disable cache for immediate execution

async function getCategories() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6); // You can adjust the limit to show top categories

  if (error) {
    console.error('Error fetching categories for home:', error);
    return [];
  }

  return categories || [];
}

export default async function CategorySection() {
  const categories = await getCategories();

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-12 bg-background border-b border-border/50">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col items-center justify-center text-center mb-10 gap-3 relative">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Nos Catégories</h2>
          <Link 
            href="/categories" 
            className="flex text-sm font-medium text-primary hover:text-primary/80 transition-colors items-center gap-1"
          >
            Voir tout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 cards per row on mobile, more on desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/categories/${category.slug}`}
              className="group flex flex-col items-center text-center space-y-3 mt-2"
            >
              <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-sm border border-border group-hover:shadow-md transition-all duration-300 group-hover:border-primary/50">
                {category.image_url ? (
                  <img 
                    src={category.image_url} 
                    alt={category.name} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground transition-colors group-hover:bg-primary/5 group-hover:text-primary">
                    <span className="text-xs font-semibold">{category.name.substring(0, 2).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <span className="text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
