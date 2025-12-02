import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import logoUrl from "@assets/Caraudiolimburg-logo_1757008375383.png";
import whiteLogoUrl from "@assets/CAL white_1758369495328.png";
import { 
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  Phone,
  MapPin,
  ArrowRight
} from "lucide-react";

interface HeaderProps {
  onCartOpen: () => void;
  logoSrc?: string;
  variant?: 'default' | 'transparent';
}

export function Header({ onCartOpen, logoSrc, variant = 'default' }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
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

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const showSolidHeader = !isTransparent || scrolled;

  const menuItems = [
    { href: "/products", label: "Producten", highlight: false },
    { href: "/apple-carplay-bmw", label: "BMW/MINI CarPlay", highlight: true },
    { href: "/about", label: "Over Ons", highlight: false },
    { href: "/contact", label: "Contact", highlight: false },
  ];

  return (
    <>
      <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${showSolidHeader ? 'bg-black/95 backdrop-blur-md border-b border-zinc-800' : 'bg-transparent border-transparent'}`}>
        <div className="container flex h-16 items-center justify-between px-4 mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 relative z-[60]" data-testid="link-home">
            <img 
              src={logoSrc || (isTransparent && !scrolled ? whiteLogoUrl : (showSolidHeader ? whiteLogoUrl : logoUrl))} 
              alt="Car Audio Limburg" 
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className={`${isTransparent ? 'text-white/90 hover:text-white' : 'text-muted-foreground hover:text-primary'} transition-colors font-medium text-sm tracking-wide`} 
                data-testid={`nav-${item.href.slice(1)}`}
              >
                {item.label}
              </Link>
            ))}
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
              <div className="hidden md:flex items-center space-x-2">
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
                className={`hidden md:flex rounded-none ${isTransparent ? 'text-white hover:text-white hover:bg-white/10 border border-white/30' : ''}`}
                onClick={() => window.location.href = '/login'}
                data-testid="button-login"
              >
                Inloggen
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              className={`md:hidden p-2 rounded-none relative z-[60] ${isTransparent || isMenuOpen ? 'text-white hover:text-white hover:bg-white/10' : ''}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Fullscreen Mobile Menu */}
      <div 
        className={`fixed inset-0 z-[55] md:hidden transition-all duration-500 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        data-testid="mobile-menu"
      >
        {/* Background with subtle audio wave pattern */}
        <div className="absolute inset-0 bg-black">
          {/* Animated gradient background */}
          <div className="absolute inset-0 opacity-30">
            <div 
              className="absolute bottom-0 left-0 right-0 h-64"
              style={{
                background: 'radial-gradient(ellipse at bottom, rgba(208,167,96,0.15) 0%, transparent 70%)',
              }}
            />
          </div>
          
          {/* Decorative lines */}
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#d0a760]/20 to-transparent" />
          <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#d0a760]/10 to-transparent" />
        </div>

        {/* Menu Content */}
        <div className="relative h-full flex flex-col justify-between pt-24 pb-8 px-8">
          {/* Navigation Links */}
          <nav className="flex-1 flex flex-col justify-center">
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <Link 
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  data-testid={`mobile-nav-${item.href.slice(1)}`}
                >
                  <div 
                    className={`group flex items-center justify-between py-4 border-b border-white/10 transition-all duration-500 ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
                    style={{ transitionDelay: `${150 + index * 75}ms` }}
                  >
                    <span className={`text-3xl font-light tracking-wide transition-colors ${item.highlight ? 'text-[#d0a760]' : 'text-white group-hover:text-[#d0a760]'}`}>
                      {item.label}
                    </span>
                    <ArrowRight className={`w-6 h-6 transition-all duration-300 ${item.highlight ? 'text-[#d0a760]' : 'text-white/40 group-hover:text-[#d0a760]'} group-hover:translate-x-2`} />
                  </div>
                </Link>
              ))}
            </div>

            {/* Account Section */}
            <div 
              className={`mt-8 pt-6 border-t border-white/20 transition-all duration-500 ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
              style={{ transitionDelay: '450ms' }}
            >
              {isAuthenticated ? (
                <div className="space-y-3">
                  <Link href="/my-account" onClick={() => setIsMenuOpen(false)}>
                    <div className="flex items-center gap-3 text-white/70 hover:text-white transition-colors py-2">
                      <User className="w-5 h-5" />
                      <span className="text-lg">Mijn Account</span>
                    </div>
                  </Link>
                  {user?.role === 'admin' && (
                    <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                      <div className="flex items-center gap-3 text-white/70 hover:text-white transition-colors py-2">
                        <span className="text-lg">Admin Dashboard</span>
                      </div>
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      window.location.href = '/api/auth/logout';
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 text-white/70 hover:text-white transition-colors py-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-lg">Uitloggen</span>
                  </button>
                </div>
              ) : (
                <Button 
                  className="w-full bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none py-6 text-lg font-medium"
                  onClick={() => {
                    window.location.href = '/login';
                    setIsMenuOpen(false);
                  }}
                >
                  Inloggen / Registreren
                </Button>
              )}
            </div>
          </nav>

          {/* Footer Contact Info */}
          <div 
            className={`transition-all duration-500 ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
            style={{ transitionDelay: '550ms' }}
          >
            <div className="space-y-3 text-white/50 text-sm">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#d0a760]" />
                <a href="tel:0852733625" className="hover:text-white transition-colors">
                  085-27 33 625
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#d0a760]" />
                <span>Sittard, Limburg</span>
              </div>
            </div>
            
            {/* Gold accent line */}
            <div className="mt-6 h-0.5 w-16 bg-gradient-to-r from-[#d0a760] to-transparent" />
          </div>
        </div>
      </div>
    </>
  );
}
