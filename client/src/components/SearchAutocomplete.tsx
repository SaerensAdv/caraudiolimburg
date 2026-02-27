import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MagnifyingGlass, SpinnerGap } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";

interface AutocompleteProduct {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  price: string;
}

interface AutocompleteCategory {
  id: string;
  name: string;
  slug: string;
}

interface AutocompleteBrand {
  id: string;
  name: string;
  slug: string;
}

interface AutocompleteResults {
  products: AutocompleteProduct[];
  categories: AutocompleteCategory[];
  brands: AutocompleteBrand[];
}

interface SearchAutocompleteProps {
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
}

export function SearchAutocomplete({ variant = 'desktop', onNavigate }: SearchAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = useQuery<AutocompleteResults>({
    queryKey: ["/api/search/autocomplete", { q: debouncedQuery }],
    enabled: debouncedQuery.length >= 2,
    staleTime: 30 * 1000,
  });

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  type FlatItem =
    | { type: 'product'; item: AutocompleteProduct }
    | { type: 'category'; item: AutocompleteCategory }
    | { type: 'brand'; item: AutocompleteBrand };

  const flatItems: FlatItem[] = [];
  if (results) {
    for (const p of results.products) flatItems.push({ type: 'product', item: p });
    for (const c of results.categories) flatItems.push({ type: 'category', item: c });
    for (const b of results.brands) flatItems.push({ type: 'brand', item: b });
  }

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [debouncedQuery, results]);

  const selectItem = useCallback((fi: FlatItem) => {
    setIsOpen(false);
    setQuery("");
    if (fi.type === 'product') {
      navigate(`/webshop/${fi.item.slug}`);
    } else if (fi.type === 'category') {
      navigate(`/webshop?category=${fi.item.slug}`);
    } else {
      navigate(`/webshop?brand=${fi.item.slug}`);
    }
    onNavigate?.();
  }, [navigate, onNavigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) setIsOpen(true);
      if (flatItems.length > 0) {
        setHighlightedIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) setIsOpen(true);
      if (flatItems.length > 0) {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < flatItems.length) {
        selectItem(flatItems[highlightedIndex]);
      } else if (query.trim()) {
        setIsOpen(false);
        navigate(`/webshop?search=${encodeURIComponent(query.trim())}`);
        onNavigate?.();
      }
    }
  };

  const handleProductClick = (slug: string) => {
    setIsOpen(false);
    setQuery("");
    navigate(`/webshop/${slug}`);
    onNavigate?.();
  };

  const handleCategoryClick = (slug: string) => {
    setIsOpen(false);
    setQuery("");
    navigate(`/webshop?category=${slug}`);
    onNavigate?.();
  };

  const handleBrandClick = (slug: string) => {
    setIsOpen(false);
    setQuery("");
    navigate(`/webshop?brand=${slug}`);
    onNavigate?.();
  };

  const hasResults = results && (
    results.products.length > 0 ||
    results.categories.length > 0 ||
    results.brands.length > 0
  );

  const showDropdown = isOpen && debouncedQuery.length >= 2;

  const isMobile = variant === 'mobile';

  return (
    <div 
      ref={containerRef} 
      className={`relative ${isMobile ? 'w-full' : 'w-64'}`}
      data-testid="search-autocomplete"
    >
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Zoeken..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className={`pl-9 pr-4 bg-black/80 border-white/20 text-white placeholder:text-white/50 focus:border-[#d0a760] focus:ring-[#d0a760]/20 rounded-none ${isMobile ? 'h-12 text-base' : 'h-9 text-sm'}`}
          data-testid="search-input"
        />
        {isLoading && debouncedQuery.length >= 2 && (
          <SpinnerGap className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 animate-spin" data-testid="search-loading" />
        )}
      </div>

      {showDropdown && (
        <div 
          className="absolute top-full left-0 right-0 mt-1 bg-black/95 backdrop-blur-xl border border-white/20 shadow-xl z-50 max-h-[60vh] overflow-y-auto overscroll-contain"
          data-testid="search-dropdown"
        >
          {isLoading ? (
            <div className="p-4 text-center text-white/50" data-testid="search-loading-state">
              <SpinnerGap className="w-5 h-5 animate-spin mx-auto" />
            </div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-white/50" data-testid="search-no-results">
              Geen resultaten
            </div>
          ) : (
            (() => {
              let idx = 0;
              return (
                <div className="py-2" role="listbox">
                  {results.products.length > 0 && (
                    <div data-testid="search-products-section">
                      <div className="px-3 py-1.5 text-xs font-medium text-white/40 uppercase tracking-wider">
                        Producten
                      </div>
                      {results.products.map((product) => {
                        const itemIdx = idx++;
                        return (
                          <button
                            key={product.id}
                            onClick={() => handleProductClick(product.slug)}
                            onMouseEnter={() => setHighlightedIndex(itemIdx)}
                            className={`w-full flex items-center gap-3 px-3 py-2 transition-colors text-left ${highlightedIndex === itemIdx ? 'bg-white/15' : 'hover:bg-white/10'}`}
                            role="option"
                            aria-selected={highlightedIndex === itemIdx}
                            data-testid={`search-product-${product.id}`}
                          >
                            <div className="w-10 h-10 bg-white flex-shrink-0 overflow-hidden">
                              {product.imageUrl ? (
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.name}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/20">
                                  <MagnifyingGlass className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-white text-sm truncate">{product.name}</div>
                              <div className="text-[#d0a760] text-xs">€{parseFloat(product.price).toFixed(2)}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {results.categories.length > 0 && (
                    <div data-testid="search-categories-section">
                      <div className="px-3 py-1.5 text-xs font-medium text-white/40 uppercase tracking-wider mt-2">
                        Categorieën
                      </div>
                      {results.categories.map((category) => {
                        const itemIdx = idx++;
                        return (
                          <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category.slug)}
                            onMouseEnter={() => setHighlightedIndex(itemIdx)}
                            className={`w-full text-left px-3 py-2 transition-colors text-white text-sm ${highlightedIndex === itemIdx ? 'bg-white/15' : 'hover:bg-white/10'}`}
                            role="option"
                            aria-selected={highlightedIndex === itemIdx}
                            data-testid={`search-category-${category.id}`}
                          >
                            {category.name}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {results.brands.length > 0 && (
                    <div data-testid="search-brands-section">
                      <div className="px-3 py-1.5 text-xs font-medium text-white/40 uppercase tracking-wider mt-2">
                        Merken
                      </div>
                      {results.brands.map((brand) => {
                        const itemIdx = idx++;
                        return (
                          <button
                            key={brand.id}
                            onClick={() => handleBrandClick(brand.slug)}
                            onMouseEnter={() => setHighlightedIndex(itemIdx)}
                            className={`w-full text-left px-3 py-2 transition-colors text-white text-sm ${highlightedIndex === itemIdx ? 'bg-white/15' : 'hover:bg-white/10'}`}
                            role="option"
                            aria-selected={highlightedIndex === itemIdx}
                            data-testid={`search-brand-${brand.id}`}
                          >
                            {brand.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      )}
    </div>
  );
}