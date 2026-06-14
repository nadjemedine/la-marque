import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-secondary/30 mt-auto border-t border-border">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-bold tracking-wider uppercase inline-block mb-4">
              Mounlek Collection
            </Link>
            <p className="text-muted-foreground w-full max-w-md">
              L'excellence à l'algérienne. Des pièces soigneusement choisies pour un style intemporel et moderne. La qualité d'abord, livrée chez vous dans les 58 wilayas.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 uppercase tracking-wider text-sm">Navigation</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Accueil</Link></li>
              <li><Link href="/categories" className="text-muted-foreground hover:text-primary transition-colors">Catégories</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">À Propos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 uppercase tracking-wider text-sm">Aide & Contact</h4>
            <ul className="space-y-3">
              <li className="text-muted-foreground">Paiement à la livraison</li>
              <li className="text-muted-foreground">Livraison 58 wilayas</li>
              <li className="text-muted-foreground">Support 24/7</li>
            </ul>
          </div>

        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Mounlek Collection - Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
