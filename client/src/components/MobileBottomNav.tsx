import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useGuestCart } from "@/lib/guestCart";
import { Home, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function MobileBottomNav() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
  });

  const { getItemCount: getGuestCartCount } = useGuestCart();

  const cartItemCount = isAuthenticated
    ? (Array.isArray(cartItems) ? cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0) : 0)
    : getGuestCartCount();

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  const hideOnPaths = ["/admin", "/checkout", "/order-confirmation", "/booking"];
  const hideOnProductDetail = location.startsWith("/webshop/") && location !== "/webshop";
  if (hideOnPaths.some((p) => location.startsWith(p)) || hideOnProductDetail) return null;

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
    },
    {
      href: "/webshop",
      label: "Shop",
      icon: ShoppingBag,
    },
    {
      href: "/cart",
      label: "Cart",
      icon: ShoppingCart,
      badge: cartItemCount > 0 ? cartItemCount : null,
    },
    {
      href: isAuthenticated ? "/my-account" : "/login",
      label: "Account",
      icon: User,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 min-h-[52px] flex items-center justify-around"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobiele navigatie"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <Link key={item.href} href={item.href}>
            <div
              className={`flex flex-col items-center justify-center min-h-[52px] px-4 relative transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0a760] focus-visible:ring-offset-1 focus-visible:ring-offset-black ${
                active ? "text-[#d0a760]" : "text-white/50 hover:text-white/80"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {/* Top border glow for active state */}
              {active && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#d0a760]/50 blur-sm" />
              )}

              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">{item.label}</span>

              {/* Cart badge */}
              {item.badge !== null && item.badge !== undefined && (
                <Badge className="absolute -top-1 -right-1 bg-[#d0a760] text-black text-[9px] w-5 h-5 flex items-center justify-center p-0 rounded-full">
                  {item.badge}
                </Badge>
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
