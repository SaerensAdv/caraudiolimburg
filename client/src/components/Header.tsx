import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { MegaMenu } from "@/components/MegaMenu";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import logoUrl from "@assets/Caraudiolimburg-logo_1757008375383.png";
import whiteLogoUrl from "@assets/CAL white_1758369495328.png";
import type { Category, Brand } from "@shared/schema";
import { 
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  Phone,
  MapPin,
  ArrowRight,
  ChevronDown,
  Grid3X3,
  Tag
} from "lucide-react";

interface HeaderProps {
  onCartOpen: () => void;
  logoSrc?: string;
  variant?: 'default' | 'transparent';
}

export function Header({ onCartOpen, logoSrc, variant = 'default' }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [brandsExpanded, setBrandsExpanded] = useState(false);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isAuthenticated, user } = useAuth();

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    staleTime: 5 * 60 * 1000,
  });

  const { data: brands = [], isLoading: isLoadingBrands } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
    staleTime: 5 * 60 * 1000,
  });

  const handleMegaMenuEnter = () => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }
    setIsMegaMenuOpen(true);
  };

  const handleMegaMenuLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (megaMenuTimeoutRef.current) {
        clearTimeout(megaMenuTimeoutRef.current);
      }
    };
  }, []);

  // Close mega menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMegaMenuOpen) {
        setIsMegaMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMegaMenuOpen]);

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

  const showSolidHeader = !isTransparent || scrolled || isMegaMenuOpen;

  const menuItems = [
    { href: "/products", label: "Producten", highlight: false },
    { href: "/apple-carplay-bmw", label: "BMW/MINI CarPlay", highlight: true },
    { href: "/blog", label: "Kenniscentrum", highlight: false },
    { href: "/studio", label: "Studio", highlight: false },
    { href: "/about", label: "Over Ons", highlight: false },
    { href: "/faq", label: "FAQ", highlight: false },
    { href: "/contact", label: "Contact", highlight: false },
  ];

  const mobileMenuItems = [
    { href: "/apple-carplay-bmw", label: "BMW/MINI CarPlay", highlight: true },
    { href: "/blog", label: "Kenniscentrum", highlight: false },
    { href: "/studio", label: "Studio", highlight: false },
    { href: "/about", label: "Over Ons", highlight: false },
    { href: "/faq", label: "FAQ", highlight: false },
    { href: "/contact", label: "Contact", highlight: false },
  ];

  const handleMobileMenuClose = () => {
    setIsMenuOpen(false);
    setCategoriesExpanded(false);
    setBrandsExpanded(false);
  };

  return (
    <>
      <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${showSolidHeader ? `bg-black/60 backdrop-blur-xl ${isMegaMenuOpen ? '' : 'border-b border-white/10'}` : 'bg-transparent border-transparent'}`}>
        <div className="container flex h-16 items-center justify-between px-4 mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 relative z-[60]" data-testid="link-home">
            <img 
              src={logoSrc || (isTransparent && !scrolled ? whiteLogoUrl : (showSolidHeader ? whiteLogoUrl : logoUrl))} 
              alt="Car Audio Limburg" 
              className="h-8 sm:h-10 md:h-12 w-auto max-w-[160px] sm:max-w-[200px] md:max-w-none object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" aria-label="Hoofdnavigatie">
            {menuItems.map((item) => {
              if (item.href === "/products") {
                return (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={handleMegaMenuEnter}
                    onMouseLeave={handleMegaMenuLeave}
                  >
                    <button
                      className={`relative flex items-center gap-1 ${isTransparent ? 'text-white/90 hover:text-white' : 'text-muted-foreground hover:text-[#d0a760]'} transition-all duration-300 font-medium text-sm tracking-wide group`}
                      aria-expanded={isMegaMenuOpen}
                      aria-haspopup="true"
                      onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setIsMegaMenuOpen(!isMegaMenuOpen);
                        } else if (e.key === 'Escape' && isMegaMenuOpen) {
                          setIsMegaMenuOpen(false);
                        }
                      }}
                      data-testid="nav-products-trigger"
                    >
                      {item.label}
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
                      <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-[#d0a760] origin-right group-hover:origin-left transition-transform duration-300 ease-out ${isMegaMenuOpen ? 'scale-x-100 origin-left' : 'scale-x-0 group-hover:scale-x-100'}`} />
                    </button>
                  </div>
                );
              }
              
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`relative ${isTransparent ? 'text-white/90 hover:text-white' : 'text-muted-foreground hover:text-[#d0a760]'} transition-all duration-300 font-medium text-sm tracking-wide group`} 
                  data-testid={`nav-${item.href.slice(1)}`}
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#d0a760] origin-right group-hover:origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                </Link>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Desktop Search */}
            <div className="hidden md:block">
              <SearchAutocomplete variant="desktop" />
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              className={`p-2 relative rounded-none group/cart ${isTransparent ? 'text-white hover:text-white hover:bg-white/10' : ''}`}
              onClick={onCartOpen}
              data-testid="button-cart"
            >
              <ShoppingCart className="w-5 h-5 transition-transform duration-300 group-hover/cart:scale-110" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-[#d0a760] text-black text-xs w-5 h-5 flex items-center justify-center p-0 rounded-none" data-testid="badge-cart-count">
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/my-account">
                  <Button variant="ghost" size="sm" className={`rounded-none group/account ${isTransparent ? 'text-white hover:text-white hover:bg-white/10' : ''}`} data-testid="button-my-account">
                    <User className="w-4 h-4 mr-2 transition-transform duration-300 group-hover/account:scale-110" />
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
                  className={`p-2 rounded-none group/logout ${isTransparent ? 'text-white hover:text-white hover:bg-white/10' : ''}`}
                  onClick={() => window.location.href = '/api/auth/logout'}
                  data-testid="button-logout"
                >
                  <LogOut className="w-5 h-5 transition-transform duration-300 group-hover/logout:translate-x-0.5" />
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
              {isMenuOpen ? <X className="w-6 h-6 transition-transform duration-300 rotate-0 hover:rotate-90" /> : <Menu className="w-6 h-6 transition-transform duration-300" />}
            </Button>
          </div>
        </div>

        {/* Mega Menu - Full Width Dropdown */}
        <MegaMenu 
          isOpen={isMegaMenuOpen}
          onMouseEnter={handleMegaMenuEnter}
          onMouseLeave={handleMegaMenuLeave}
          onClose={() => setIsMegaMenuOpen(false)}
          isTransparent={isTransparent}
        />
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
        <div className="relative h-full flex flex-col justify-between pt-24 pb-8 px-8 overflow-y-auto">
          {/* Mobile Search */}
          <div className="mb-6">
            <SearchAutocomplete variant="mobile" onNavigate={handleMobileMenuClose} />
          </div>

          {/* Navigation Links */}
          <nav className="flex-1" aria-label="Mobiele navigatie">
            <div className="space-y-1">
              {/* Categories Accordion */}
              <div 
                className={`transition-all duration-500 ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
                style={{ transitionDelay: '150ms' }}
              >
                <button
                  onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                  className="w-full flex items-center justify-between py-4 border-b border-white/10 group"
                  aria-expanded={categoriesExpanded}
                  aria-controls="mobile-categories-list"
                  data-testid="mobile-accordion-categories"
                >
                  <div className="flex items-center gap-3">
                    <Grid3X3 className="w-5 h-5 text-[#d0a760]" />
                    <span className="text-2xl font-light tracking-wide text-white group-hover:text-[#d0a760] transition-colors">
                      Shop Categorieën
                    </span>
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 text-white/60 transition-transform duration-300 ${categoriesExpanded ? 'rotate-180' : ''}`} 
                  />
                </button>
                <div 
                  id="mobile-categories-list"
                  className={`overflow-hidden transition-all duration-300 ease-out ${categoriesExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                  role="region"
                  aria-labelledby="mobile-accordion-categories"
                >
                  <div className="py-2 pl-8 space-y-1">
                    {isLoadingCategories ? (
                      [...Array(6)].map((_, i) => (
                        <div key={i} className="py-2">
                          <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
                        </div>
                      ))
                    ) : (
                      categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/products?category=${category.slug}`}
                          onClick={handleMobileMenuClose}
                          className="block py-2.5 text-white/70 hover:text-[#d0a760] transition-colors text-lg"
                          data-testid={`mobile-category-${category.slug}`}
                        >
                          {category.name}
                        </Link>
                      ))
                    )}
                    <Link
                      href="/products"
                      onClick={handleMobileMenuClose}
                      className="block py-2.5 text-[#d0a760] hover:text-[#d0a760]/80 transition-colors text-lg font-medium"
                      data-testid="mobile-all-products"
                    >
                      Alle producten →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Brands Accordion */}
              <div 
                className={`transition-all duration-500 ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
                style={{ transitionDelay: '225ms' }}
              >
                <button
                  onClick={() => setBrandsExpanded(!brandsExpanded)}
                  className="w-full flex items-center justify-between py-4 border-b border-white/10 group"
                  aria-expanded={brandsExpanded}
                  aria-controls="mobile-brands-list"
                  data-testid="mobile-accordion-brands"
                >
                  <div className="flex items-center gap-3">
                    <Tag className="w-5 h-5 text-[#d0a760]" />
                    <span className="text-2xl font-light tracking-wide text-white group-hover:text-[#d0a760] transition-colors">
                      Shop Merken
                    </span>
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 text-white/60 transition-transform duration-300 ${brandsExpanded ? 'rotate-180' : ''}`} 
                  />
                </button>
                <div 
                  id="mobile-brands-list"
                  className={`overflow-hidden transition-all duration-300 ease-out ${brandsExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                  role="region"
                  aria-labelledby="mobile-accordion-brands"
                >
                  <div className="py-2 pl-8 space-y-1">
                    {isLoadingBrands ? (
                      [...Array(6)].map((_, i) => (
                        <div key={i} className="py-2">
                          <div className="h-5 w-24 bg-white/10 rounded animate-pulse" />
                        </div>
                      ))
                    ) : (
                      brands.map((brand) => (
                        <Link
                          key={brand.id}
                          href={`/products?brand=${brand.slug}`}
                          onClick={handleMobileMenuClose}
                          className="block py-2.5 text-white/70 hover:text-[#d0a760] transition-colors text-lg"
                          data-testid={`mobile-brand-${brand.slug}`}
                        >
                          {brand.name}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Other Menu Items */}
              {mobileMenuItems.map((item, index) => (
                <Link 
                  key={item.href}
                  href={item.href}
                  onClick={handleMobileMenuClose}
                  data-testid={`mobile-nav-${item.href.slice(1)}`}
                >
                  <div 
                    className={`group flex items-center justify-between py-4 border-b border-white/10 transition-all duration-500 ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
                    style={{ transitionDelay: `${300 + index * 75}ms` }}
                  >
                    <span className={`text-2xl font-light tracking-wide transition-colors ${item.highlight ? 'text-[#d0a760]' : 'text-white group-hover:text-[#d0a760]'}`}>
                      {item.label}
                    </span>
                    <ArrowRight className={`w-5 h-5 transition-all duration-300 ${item.highlight ? 'text-[#d0a760]' : 'text-white/40 group-hover:text-[#d0a760]'} group-hover:translate-x-2`} />
                  </div>
                </Link>
              ))}
            </div>

            {/* Account Section */}
            <div 
              className={`mt-8 pt-6 border-t border-white/20 transition-all duration-500 ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
              style={{ transitionDelay: '600ms' }}
            >
              {isAuthenticated ? (
                <div className="space-y-3">
                  <Link href="/my-account" onClick={handleMobileMenuClose}>
                    <div className="flex items-center gap-3 text-white/70 hover:text-white transition-colors py-2">
                      <User className="w-5 h-5" />
                      <span className="text-lg">Mijn Account</span>
                    </div>
                  </Link>
                  {user?.role === 'admin' && (
                    <Link href="/admin" onClick={handleMobileMenuClose}>
                      <div className="flex items-center gap-3 text-white/70 hover:text-white transition-colors py-2">
                        <span className="text-lg">Admin Dashboard</span>
                      </div>
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      window.location.href = '/api/auth/logout';
                      handleMobileMenuClose();
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
                    handleMobileMenuClose();
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
            style={{ transitionDelay: '700ms' }}
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
