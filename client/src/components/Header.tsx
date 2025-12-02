import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import logoUrl from "@assets/Caraudiolimburg-logo_1757008375383.png";
import { 
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut
} from "lucide-react";

interface HeaderProps {
  onCartOpen: () => void;
  logoSrc?: string;
  variant?: 'default' | 'transparent';
}

import whiteLogoUrl from "@assets/CAL white_1758369495328.png";

export function Header({ onCartOpen, logoSrc, variant = 'default' }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const cartItemCount = Array.isArray(cartItems) 
    ? cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0) 
    : 0;

  const isTransparent = variant === 'transparent';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = () => {
        setScrolled(window.scrollY > 100);
      };
      handleScroll();
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const showSolidHeader = !isTransparent || scrolled;

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${showSolidHeader ? 'bg-black/95 backdrop-blur-md border-b border-zinc-800' : 'bg-transparent border-transparent'}`}>
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3" data-testid="link-home">
          <img 
            src={logoSrc || (isTransparent && !scrolled ? whiteLogoUrl : (showSolidHeader ? whiteLogoUrl : logoUrl))} 
            alt="Car Audio Limburg" 
            className="h-12 w-auto"
          />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/products" className={`${isTransparent ? 'text-white/90 hover:text-white' : 'text-muted-foreground hover:text-primary'} transition-colors font-medium text-sm tracking-wide`} data-testid="nav-products">
            Producten
          </Link>
          <Link href="/apple-carplay-bmw" className={`${isTransparent ? 'text-white/90 hover:text-white' : 'text-muted-foreground hover:text-primary'} transition-colors font-medium text-sm tracking-wide`} data-testid="nav-carplay">
            BMW/MINI CarPlay
          </Link>
          <Link href="/about" className={`${isTransparent ? 'text-white/90 hover:text-white' : 'text-muted-foreground hover:text-primary'} transition-colors font-medium text-sm tracking-wide`} data-testid="nav-about">
            Over Ons
          </Link>
          <Link href="/contact" className={`${isTransparent ? 'text-white/90 hover:text-white' : 'text-muted-foreground hover:text-primary'} transition-colors font-medium text-sm tracking-wide`} data-testid="nav-contact">
            Contact
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`p-2 relative rounded-none ${isTransparent ? 'text-white hover:text-white hover:bg-white/10' : ''}`}
            onClick={onCartOpen}
            data-testid="button-cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-[#d0a760] text-black text-xs w-5 h-5 flex items-center justify-center p-0 rounded-none" data-testid="badge-cart-count">
                {cartItemCount}
              </Badge>
            )}
          </Button>

          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <Link href="/my-account">
                <Button variant="ghost" size="sm" className={`rounded-none ${isTransparent ? 'text-white hover:text-white hover:bg-white/10' : ''}`} data-testid="button-my-account">
                  <User className="w-4 h-4 mr-2" />
                  Account
                </Button>
              </Link>
              {user?.role === 'admin' && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className={`rounded-none ${isTransparent ? 'text-white hover:text-white hover:bg-white/10' : ''}`} data-testid="button-admin">
                    Admin
                  </Button>
                </Link>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className={`p-2 rounded-none ${isTransparent ? 'text-white hover:text-white hover:bg-white/10' : ''}`}
                onClick={() => window.location.href = '/api/auth/logout'}
                data-testid="button-logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <Button 
              variant={isTransparent ? "ghost" : "outline"}
              size="sm"
              className={`rounded-none ${isTransparent ? 'text-white hover:text-white hover:bg-white/10 border border-white/30' : ''}`}
              onClick={() => window.location.href = '/login'}
              data-testid="button-login"
            >
              Inloggen
            </Button>
          )}

          <Button 
            variant="ghost" 
            size="sm" 
            className={`md:hidden p-2 rounded-none ${isTransparent ? 'text-white hover:text-white hover:bg-white/10' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={`md:hidden ${isTransparent ? 'bg-black/95 backdrop-blur-md' : 'bg-card border-t border-border'} shadow-lg`} data-testid="mobile-menu">
          <nav className="container px-4 py-6 space-y-3">
            <Link 
              href="/products" 
              className={`flex items-center ${isTransparent ? 'text-white hover:text-[#d0a760]' : 'text-card-foreground hover:text-primary'} transition-colors font-medium py-2 px-3 hover:bg-white/5`} 
              data-testid="mobile-nav-products"
              onClick={() => setIsMenuOpen(false)}
            >
              Producten
            </Link>
            <Link 
              href="/apple-carplay-bmw" 
              className={`flex items-center ${isTransparent ? 'text-[#d0a760]' : 'text-primary'} transition-colors font-semibold py-2 px-3 ${isTransparent ? 'bg-[#d0a760]/10' : 'bg-primary/10'}`} 
              data-testid="mobile-nav-carplay"
              onClick={() => setIsMenuOpen(false)}
            >
              BMW/MINI CarPlay
            </Link>
            <Link 
              href="/about" 
              className={`flex items-center ${isTransparent ? 'text-white hover:text-[#d0a760]' : 'text-card-foreground hover:text-primary'} transition-colors font-medium py-2 px-3 hover:bg-white/5`} 
              data-testid="mobile-nav-about"
              onClick={() => setIsMenuOpen(false)}
            >
              Over Ons
            </Link>
            <Link 
              href="/contact" 
              className={`flex items-center ${isTransparent ? 'text-white hover:text-[#d0a760]' : 'text-card-foreground hover:text-primary'} transition-colors font-medium py-2 px-3 hover:bg-white/5`} 
              data-testid="mobile-nav-contact"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            
            <div className={`border-t ${isTransparent ? 'border-white/20' : 'border-border'} pt-4 mt-4`}>
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link 
                    href="/my-account" 
                    className={`flex items-center ${isTransparent ? 'text-white hover:text-[#d0a760]' : 'text-card-foreground hover:text-primary'} transition-colors font-medium py-2 px-3 hover:bg-white/5`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Mijn Account
                  </Link>
                  {user?.role === 'admin' && (
                    <Link 
                      href="/admin" 
                      className={`flex items-center ${isTransparent ? 'text-white hover:text-[#d0a760]' : 'text-card-foreground hover:text-primary'} transition-colors font-medium py-2 px-3 hover:bg-white/5`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <button 
                    className={`flex items-center ${isTransparent ? 'text-white hover:text-[#d0a760]' : 'text-card-foreground hover:text-primary'} transition-colors font-medium py-2 px-3 hover:bg-white/5 w-full text-left`}
                    onClick={() => {
                      window.location.href = '/api/auth/logout';
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Uitloggen
                  </button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className={`w-full rounded-none ${isTransparent ? 'border-white/30 text-white hover:bg-white/10' : ''}`}
                  onClick={() => {
                    window.location.href = '/login';
                    setIsMenuOpen(false);
                  }}
                >
                  Inloggen
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
