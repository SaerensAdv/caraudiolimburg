import { FileText, Calendar, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface BlogCTAProps {
  variant: 'quote' | 'booking';
  title?: string;
  description?: string;
}

const defaultContent = {
  quote: {
    title: "Gratis Offerte Aanvragen",
    description: "Ontvang een vrijblijvende offerte voor uw CarPlay of Android Auto installatie. Onze experts adviseren u graag over de beste oplossing voor uw auto.",
    icon: FileText,
    link: "/offerte",
    buttonText: "Offerte Aanvragen"
  },
  booking: {
    title: "Afspraak Maken",
    description: "Plan een afspraak met onze experts voor persoonlijk advies. Wij demonstreren de mogelijkheden in onze showroom.",
    icon: Calendar,
    link: "/afspraak-maken",
    buttonText: "Afspraak Plannen"
  }
};

export function BlogCTA({ variant, title, description }: BlogCTAProps) {
  const content = defaultContent[variant];
  const Icon = content.icon;
  
  return (
    <div className="bg-zinc-900 border border-[#d0a760]/30 p-8 my-8" data-testid={`blog-cta-${variant}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex-shrink-0">
          <div className="w-14 h-14 bg-[#d0a760]/10 flex items-center justify-center border border-[#d0a760]/30">
            <Icon className="w-7 h-7 text-[#d0a760]" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-white text-xl font-medium mb-2">
            {title || content.title}
          </h3>
          <p className="text-white/60 text-sm leading-relaxed">
            {description || content.description}
          </p>
        </div>
        
        <div className="flex-shrink-0 w-full md:w-auto">
          <Link href={content.link}>
            <Button 
              className="w-full md:w-auto bg-[#d0a760] hover:bg-[#c49a50] text-black font-medium px-6 py-3 rounded-none"
              data-testid={`button-cta-${variant}`}
            >
              {content.buttonText}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function BlogRelatedProducts({ 
  products 
}: { 
  products: Array<{ name: string; slug: string; price?: number }> 
}) {
  if (!products || products.length === 0) return null;
  
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-6 my-8" data-testid="blog-related-products">
      <h3 className="text-[#d0a760] text-sm uppercase tracking-wider mb-4">Gerelateerde Producten</h3>
      <div className="space-y-3">
        {products.map((product, index) => (
          <Link key={index} href={`/product/${product.slug}`}>
            <div className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 px-2 -mx-2 cursor-pointer transition-colors">
              <span className="text-white text-sm">{product.name}</span>
              {product.price && (
                <span className="text-[#d0a760] text-sm font-medium">€{product.price.toFixed(2)}</span>
              )}
              <ArrowRight className="w-4 h-4 text-white/40" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BlogExternalLink({ 
  href, 
  children 
}: { 
  href: string; 
  children: React.ReactNode 
}) {
  return (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#d0a760] hover:underline inline-flex items-center gap-1"
      data-testid="external-link"
    >
      {children}
      <ArrowRight className="w-3 h-3" />
    </a>
  );
}
