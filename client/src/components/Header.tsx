import { useState } from "react";
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
}

export function Header({ onCartOpen }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const { data: cartItems } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const cartItemCount = cartItems?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3" data-testid="link-home">
          <img 
            src={logoUrl} 
            alt="Car Audio Limburg" 
            className="h-12 w-auto"
          />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-foreground hover:text-primary transition-colors font-medium" data-testid="nav-home">
            Home
          </Link>
          <Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors font-medium" data-testid="nav-shop">
            Shop
          </Link>
          <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors font-medium" data-testid="nav-about">
            Over ons
          </Link>
          <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors font-medium" data-testid="nav-faq">
            FAQ
          </Link>
          <Link href="/apple-carplay-bmw" className="text-muted-foreground hover:text-primary transition-colors font-medium" data-testid="nav-carplay">
            BMW/MINI CarPlay
          </Link>
          <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors font-medium" data-testid="nav-contact">
            Contact
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="p-2" data-testid="button-search">
            <Search className="w-5 h-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 relative" 
            onClick={onCartOpen}
            data-testid="button-cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 flex items-center justify-center p-0" data-testid="badge-cart-count">
                {cartItemCount}
              </Badge>
            )}
          </Button>

          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <Link href="/my-account">
                <Button variant="ghost" size="sm" data-testid="button-my-account">
                  <User className="w-4 h-4 mr-2" />
                  Mijn Account
                </Button>
              </Link>
              {user?.role === 'admin' && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" data-testid="button-admin">
                    Admin
                  </Button>
                </Link>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2"
                onClick={() => window.location.href = '/api/auth/logout'}
                data-testid="button-logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/login'}
              data-testid="button-login"
            >
              Inloggen
            </Button>
          )}

          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-card border-t border-border shadow-lg" data-testid="mobile-menu">
          <nav className="container px-4 py-6 space-y-3">
            <Link 
              href="/" 
              className="flex items-center text-card-foreground hover:text-primary transition-colors font-medium py-2 px-3 rounded-lg hover:bg-primary/10" 
              data-testid="mobile-nav-home"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/shop" 
              className="flex items-center text-card-foreground hover:text-primary transition-colors font-medium py-2 px-3 rounded-lg hover:bg-primary/10" 
              data-testid="mobile-nav-shop"
              onClick={() => setIsMenuOpen(false)}
            >
              Shop
            </Link>
            <Link 
              href="/about" 
              className="flex items-center text-card-foreground hover:text-primary transition-colors font-medium py-2 px-3 rounded-lg hover:bg-primary/10" 
              data-testid="mobile-nav-about"
              onClick={() => setIsMenuOpen(false)}
            >
              Over ons
            </Link>
            <Link 
              href="/faq" 
              className="flex items-center text-card-foreground hover:text-primary transition-colors font-medium py-2 px-3 rounded-lg hover:bg-primary/10" 
              data-testid="mobile-nav-faq"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <Link 
              href="/apple-carplay-bmw" 
              className="flex items-center text-primary hover:text-primary/80 transition-colors font-semibold py-2 px-3 rounded-lg bg-primary/10" 
              data-testid="mobile-nav-carplay"
              onClick={() => setIsMenuOpen(false)}
            >
              🚗 BMW/MINI CarPlay
            </Link>
            <Link 
              href="/contact" 
              className="flex items-center text-card-foreground hover:text-primary transition-colors font-medium py-2 px-3 rounded-lg hover:bg-primary/10" 
              data-testid="mobile-nav-contact"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            
            <div className="border-t border-border pt-4 mt-4">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link 
                    href="/my-account" 
                    className="flex items-center text-card-foreground hover:text-primary transition-colors font-medium py-2 px-3 rounded-lg hover:bg-primary/10"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Mijn Account
                  </Link>
                  {user?.role === 'admin' && (
                    <Link 
                      href="/admin" 
                      className="flex items-center text-card-foreground hover:text-primary transition-colors font-medium py-2 px-3 rounded-lg hover:bg-primary/10"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <button 
                    className="flex items-center text-card-foreground hover:text-primary transition-colors font-medium py-2 px-3 rounded-lg hover:bg-primary/10 w-full text-left"
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
                  className="w-full" 
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
