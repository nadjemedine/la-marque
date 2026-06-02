import Link from 'next/link';

export default function ThankYouPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full bg-card p-10 rounded-3xl shadow-lg border border-border text-center">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-foreground">Commande Confirmée !</h1>
        
        <p className="text-muted-foreground mb-8 text-lg">
          Merci pour votre achat ! Notre équipe vous contactera dans les plus brefs délais pour confirmer vos informations de livraison.
        </p>

        <div className="flex flex-col gap-4">
          <Link 
            href="/"
            className="w-full py-4 px-6 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Retourner à l'accueil
          </Link>
          <Link 
            href="/categories"
            className="w-full py-4 px-6 bg-transparent border-2 border-border text-foreground font-semibold rounded-xl hover:bg-secondary transition-colors"
          >
            Continuer vos achats
          </Link>
        </div>
      </div>
    </div>
  );
}
