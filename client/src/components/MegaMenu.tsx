import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Category, Brand, VehicleMake } from "@shared/schema";
import { Car } from "lucide-react";
import { 
  Monitor, 
  Speaker, 
  Zap, 
  Settings, 
  Camera, 
  Wrench,
  ChevronRight,
  ArrowRight,
  Sparkles
} from "lucide-react";
import bmwCarplayImage from "@assets/bmw-carplay-1.jpg";

interface MegaMenuProps {
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
  isTransparent?: boolean;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "multimedia-navigatie": Monitor,
  "speakers-subwoofers": Speaker,
  "versterkers-dsp": Zap,
  "oem-upgrades": Settings,
  "cameras-veiligheid": Camera,
  "installatie-accessoires": Wrench,
};

const brandColors: Record<string, string> = {
  "acv": "#6b7280",
  "alpine": "#1e40af",
  "audison": "#dc2626",
  "blackvue": "#1f2937",
  "blaupunkt": "#2563eb",
  "boxmore": "#78716c",
  "carvision": "#0891b2",
  "car-audio-limburg": "#d0a760",
  "focal": "#f59e0b",
  "gcc": "#4ade80",
  "hertz": "#059669",
  "kenwood": "#7c3aed",
  "pioneer": "#ea580c",
  "stp": "#ef4444",
};

export function MegaMenu({ isOpen, onMouseEnter, onMouseLeave, onClose, isTransparent }: MegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    staleTime: 5 * 60 * 1000,
  });

  const { data: brands = [], isLoading: isLoadingBrands } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
    staleTime: 5 * 60 * 1000,
  });

  const { data: vehicleMakes = [], isLoading: isLoadingVehicleMakes } = useQuery<VehicleMake[]>({
    queryKey: ["/api/vehicle-makes"],
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;
  
  if (typeof document === 'undefined') return null;

  const isLoading = isLoadingCategories || isLoadingBrands;

  return createPortal(
    <div
      ref={menuRef}
      className={`fixed inset-0 top-16 w-full h-[calc(100vh-64px)] bg-black/60 backdrop-blur-xl z-40 transition-all duration-300 ease-out overflow-y-auto ${
        isAnimating 
          ? "opacity-100" 
          : "opacity-0 pointer-events-none"
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="menu"
      aria-label="Producten navigatiemenu"
    >
      <nav className="container mx-auto px-4 py-6 sm:px-6 md:py-8 lg:px-8 lg:py-10 max-w-[1280px]" aria-label="Product categorieën en merken">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* Column 1: Categories */}
          <div className="lg:col-span-4">
            <h3 className="text-[#d0a760] text-xs font-semibold tracking-widest uppercase mb-5 flex items-center gap-2">
              <span className="w-8 h-px bg-[#d0a760]/50" />
              Categorieën
            </h3>
            <ul className="space-y-1" role="menu" aria-label="Product categorieën">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <li key={i} className="py-2.5 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-zinc-800 animate-pulse" />
                      <div className="h-4 bg-zinc-800 w-32 animate-pulse" />
                    </div>
                  </li>
                ))
              ) : (
                categories.map((category) => {
                  const IconComponent = categoryIcons[category.slug] || Settings;
                  return (
                    <li key={category.id} role="none">
                      <Link
                        href={`/webshop?category=${category.slug}`}
                        className="flex items-center gap-3 py-2.5 px-3 text-white/80 hover:text-white hover:bg-white/5 transition-all duration-200 group"
                        role="menuitem"
                        onClick={onClose}
                        data-testid={`megamenu-category-${category.slug}`}
                      >
                        <IconComponent className="w-5 h-5 text-[#d0a760]/70 group-hover:text-[#d0a760] transition-colors" />
                        <span className="text-sm font-medium">{category.name}</span>
                        <ChevronRight className="w-4 h-4 ml-auto opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0 transition-all duration-200" />
                      </Link>
                    </li>
                  );
                })
              )}
            </ul>
            
            <div className="mt-6 pt-4 border-t border-white/10">
              <Link
                href="/webshop"
                className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-[#d0a760] transition-colors group"
                onClick={onClose}
                data-testid="megamenu-all-products"
              >
                Bekijk alle producten
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Column 2: Brands */}
          <div className="lg:col-span-4">
            <h3 className="text-[#d0a760] text-xs font-semibold tracking-widest uppercase mb-5 flex items-center gap-2">
              <span className="w-8 h-px bg-[#d0a760]/50" />
              Topmerken
            </h3>
            <ul className="grid grid-cols-2 gap-2" role="menu" aria-label="Productmerken">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <li key={i} className="py-3 px-4">
                    <div className="h-5 bg-zinc-800 w-20 animate-pulse" />
                  </li>
                ))
              ) : (
                brands.map((brand) => {
                  const brandColor = brandColors[brand.slug.toLowerCase()] || "#d0a760";
                  return (
                    <li key={brand.id} role="none">
                      <Link
                        href={`/webshop?brand=${brand.slug}`}
                        className="flex items-center gap-3 py-3 px-4 text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 group"
                        role="menuitem"
                        onClick={onClose}
                        data-testid={`megamenu-brand-${brand.slug}`}
                      >
                        <span 
                          className="w-2 h-2 transition-transform group-hover:scale-125"
                          style={{ backgroundColor: brandColor }}
                        />
                        <span className="text-sm font-medium">{brand.name}</span>
                      </Link>
                    </li>
                  );
                })
              )}
            </ul>
            
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-xs text-white/40">
                Officiële dealer van premium car audio merken
              </p>
            </div>
          </div>

          {/* Column 3: Featured CTA */}
          <div className="md:col-span-2 lg:col-span-4">
            <h3 className="text-[#d0a760] text-xs font-semibold tracking-widest uppercase mb-5 flex items-center gap-2">
              <span className="w-8 h-px bg-[#d0a760]/50" />
              Uitgelicht
            </h3>
            
            <Link
              href="/apple-carplay-voor-uw-bmw"
              className="group block relative overflow-hidden border border-white/10 hover:border-[#d0a760]/50 transition-all duration-300"
              onClick={onClose}
              data-testid="megamenu-featured-bmw-carplay"
              role="menuitem"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img 
                  src={bmwCarplayImage} 
                  alt="BMW CarPlay Activatie" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[#d0a760]" />
                    <span className="text-[#d0a760] text-xs font-semibold tracking-wider uppercase">
                      Populair
                    </span>
                  </div>
                  <h4 className="text-white text-lg font-semibold mb-1">
                    BMW & MINI CarPlay
                  </h4>
                  <p className="text-white/60 text-sm mb-3">
                    Activeer Apple CarPlay in je BMW of MINI
                  </p>
                  <span className="inline-flex items-center gap-2 text-[#d0a760] text-sm font-medium group-hover:gap-3 transition-all">
                    Meer informatie
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>

            <div className="mt-4 p-4 bg-gradient-to-br from-[#d0a760]/10 to-transparent border border-[#d0a760]/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#d0a760]/20 flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-5 h-5 text-[#d0a760]" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-medium mb-1">
                    Vakkundige Installatie
                  </h4>
                  <p className="text-white/50 text-xs">
                    Al onze producten kunnen professioneel worden ingebouwd
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Car Brands Section */}
        <div className="mt-6 md:mt-8 lg:mt-10 pt-6 md:pt-8 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <Car className="w-5 h-5 text-[#d0a760]" />
            <h3 className="text-[#d0a760] text-xs font-semibold tracking-widest uppercase">
              Automerken
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-[#d0a760]/30 to-transparent" />
          </div>
          
          {/* Mobile: horizontal scroll, Desktop: wrap */}
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory lg:flex-wrap lg:overflow-x-visible lg:pb-0 lg:gap-4 scrollbar-hide">
            {isLoadingVehicleMakes ? (
              [...Array(12)].map((_, i) => (
                <div key={i} className="w-16 h-10 bg-zinc-800/50 animate-pulse shrink-0" />
              ))
            ) : (
              vehicleMakes.map((make) => (
                <Link
                  key={make.id}
                  href={`/webshop?make=${make.slug}`}
                  onClick={onClose}
                  className="shrink-0 snap-start px-3 py-2 md:px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#d0a760]/30 transition-all duration-200 group"
                  data-testid={`megamenu-car-brand-${make.slug}`}
                >
                  <span className="text-white/70 group-hover:text-white text-xs md:text-sm font-medium transition-colors whitespace-nowrap">
                    {make.name}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d0a760]/30 to-transparent" />
    </div>,
    document.body
  );
}
