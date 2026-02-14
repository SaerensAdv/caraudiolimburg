import { User } from "@phosphor-icons/react";
import { Link } from "wouter";

interface AuthorBoxProps {
  author: {
    firstName?: string | null;
    lastName?: string | null;
    profileImageUrl?: string | null;
  };
  showBio?: boolean;
}

export function AuthorBox({ author, showBio = true }: AuthorBoxProps) {
  const authorName = [author.firstName, author.lastName].filter(Boolean).join(" ") || "Car Audio Limburg";
  
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 mt-12" data-testid="author-box">
      <div className="flex items-start gap-4">
        {author.profileImageUrl ? (
          <img
            src={author.profileImageUrl}
            alt={authorName}
            className="w-16 h-16 object-cover border border-[#d0a760]"
          />
        ) : (
          <div className="w-16 h-16 bg-zinc-800 flex items-center justify-center border border-zinc-700">
            <User className="w-8 h-8 text-white/60" />
          </div>
        )}
        
        <div className="flex-1">
          <p className="text-[#d0a760] text-xs uppercase tracking-wider mb-1">Geschreven door</p>
          <h4 className="text-white font-medium text-lg">{authorName}</h4>
          
          {showBio && (
            <p className="text-white/60 text-sm mt-2 leading-relaxed">
              Expert in car audio installaties met jarenlange ervaring in CarPlay, Android Auto en premium audio upgrades. 
              Gespecialiseerd in OEM integraties voor BMW, Audi, Mercedes en Volkswagen.
            </p>
          )}
          
          <div className="flex items-center gap-4 mt-4">
            <Link href="/over-ons">
              <span className="text-[#d0a760] text-sm hover:underline cursor-pointer">
                Meer over ons team
              </span>
            </Link>
            <Link href="/contact">
              <span className="text-white/60 text-sm hover:text-white cursor-pointer">
                Contact opnemen
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
