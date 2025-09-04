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
          <Link href="/booking" className="text-muted-foreground hover:text-primary transition-colors font-medium" data-testid="nav-installation">
            Installatie
          </Link>
          <a href="#brands" className="text-muted-foreground hover:text-primary transition-colors font-medium" data-testid="nav-brands">
            Merken
          </a>
          <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors font-medium" data-testid="nav-contact">
            Contact
          </a>
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
              {user?.role === 'admin' && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" data-testid="button-admin">
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" className="p-2" data-testid="button-profile">
                <User className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2"
                onClick={() => window.location.href = '/api/logout'}
                data-testid="button-logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/api/login'}
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
        <div className="md:hidden bg-card border-t border-border" data-testid="mobile-menu">
          <nav className="container px-4 py-4 space-y-4">
            <Link href="/" className="block text-card-foreground hover:text-primary transition-colors font-medium" data-testid="mobile-nav-home">
              Home
            </Link>
            <Link href="/shop" className="block text-card-foreground hover:text-primary transition-colors font-medium" data-testid="mobile-nav-shop">
              Shop
            </Link>
            <Link href="/booking" className="block text-card-foreground hover:text-primary transition-colors font-medium" data-testid="mobile-nav-installation">
              Installatie
            </Link>
            <a href="#brands" className="block text-card-foreground hover:text-primary transition-colors font-medium" data-testid="mobile-nav-brands">
              Merken
            </a>
            <a href="#contact" className="block text-card-foreground hover:text-primary transition-colors font-medium" data-testid="mobile-nav-contact">
              Contact
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
