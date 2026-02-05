import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch, Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CartSidebar } from "@/components/CartSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { BreadcrumbSchema } from "@/components/StructuredData";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X, ChevronDown, Grid, Car, Volume2, Settings, ChevronRight, LayoutGrid, List, SlidersHorizontal, ArrowLeft, ShoppingCart, Home as HomeIcon, Package } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import type { Product, Category, Brand, VehicleMake } from "@shared/schema";
import { ProductAudioSkeleton } from "@/components/AudioSkeletons";
import { ScrollReveal, StaggerContainer, StaggerItem, ParallaxSection } from "@/components/ScrollAnimations";

export default function Shop() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all-categories");
  const [selectedBrand, setSelectedBrand] = useState("all-brands");
  const [selectedMake, setSelectedMake] = useState("all-makes");
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const [location, navigate] = useLocation();
  const searchString = useSearch();

  useEffect(() => {
    const params = new URLSearchParams(searchString || '');
    const categoryParam = params.get('category');
    const brandParam = params.get('brand');
    
    // Always update state based on URL params (including resetting when empty)
    setSelectedCategory(categoryParam || 'all-categories');
    setSelectedBrand(brandParam || 'all-brands');
  }, [searchString]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: brands } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
  });

  // Convert slug to ID for API queries
  const selectedCategoryId = useMemo(() => {
    if (selectedCategory === 'all-categories' || !categories) return '';
    // Check if it's a slug or ID
    const bySlug = (categories as Category[]).find(c => c.slug === selectedCategory);
    if (bySlug) return bySlug.id;
    // Maybe it's already an ID
    const byId = (categories as Category[]).find(c => c.id === selectedCategory);
    return byId?.id || '';
  }, [selectedCategory, categories]);

  const selectedBrandId = useMemo(() => {
    if (selectedBrand === 'all-brands' || !brands) return '';
    // Check if it's a slug or ID
    const bySlug = (brands as Brand[]).find(b => b.slug === selectedBrand);
    if (bySlug) return bySlug.id;
    // Maybe it's already an ID
    const byId = (brands as Brand[]).find(b => b.id === selectedBrand);
    return byId?.id || '';
  }, [selectedBrand, brands]);

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products", {
      search,
      categoryId: selectedCategoryId,
      brandId: selectedBrandId,
      vehicleMakeId: selectedMake.startsWith('all-') ? '' : selectedMake,
      limit: 50,
    }],
  });

  const { data: vehicleMakes } = useQuery<VehicleMake[]>({
    queryKey: ["/api/vehicle-makes"],
  });

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all-categories");
    setSelectedBrand("all-brands");
    setSelectedMake("all-makes");
    setPriceRange([0, 5000]);
    setInStockOnly(false);
    setSortBy("name");
  };

  const isPriceRangeModified = priceRange[0] !== 0 || priceRange[1] !== 5000;
  
  const activeFiltersCount = [
    search,
    selectedCategory && !selectedCategory.startsWith('all-') ? selectedCategory : '',
    selectedBrand && !selectedBrand.startsWith('all-') ? selectedBrand : '',
    selectedMake && !selectedMake.startsWith('all-') ? selectedMake : '',
    isPriceRangeModified ? 'price' : '',
    inStockOnly ? 'stock' : '',
    sortBy !== 'name' ? 'sort' : ''
  ].filter(Boolean).length;

  const sortProducts = (products: Product[]) => {
    if (!products) return [];
    
    const filtered = products.filter((product) => {
      const price = parseFloat(product.price);
      const priceInRange = price >= priceRange[0] && price <= priceRange[1];
      const stockOk = !inStockOnly || product.stock === undefined || product.stock === null || product.stock > 0;
      return priceInRange && stockOk;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'featured':
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
  };

  const sortedProducts = sortProducts(products as Product[] || []);

  const activeCategoryName = useMemo(() => {
    if (selectedCategory === 'all-categories' || !categories) return null;
    // Try matching by slug first, then by ID
    const bySlug = (categories as Category[]).find(c => c.slug === selectedCategory);
    if (bySlug) return bySlug.name;
    const byId = (categories as Category[]).find(c => c.id === selectedCategory);
    return byId?.name || null;
  }, [selectedCategory, categories]);

  const activeBrandName = useMemo(() => {
    if (selectedBrand === 'all-brands' || !brands) return null;
    // Try matching by slug first, then by ID
    const bySlug = (brands as Brand[]).find(b => b.slug === selectedBrand);
    if (bySlug) return bySlug.name;
    const byId = (brands as Brand[]).find(b => b.id === selectedBrand);
    return byId?.name || null;
  }, [selectedBrand, brands]);

  const seoTitle = useMemo(() => {
    if (activeCategoryName && activeBrandName) {
      return `${activeBrandName} ${activeCategoryName} | Producten`;
    } else if (activeCategoryName) {
      return `${activeCategoryName} | Producten`;
    } else if (activeBrandName) {
      return `${activeBrandName} Producten`;
    }
    return "Car Audio Webshop | Alpine, Audison, Focal, Hertz";
  }, [activeCategoryName, activeBrandName]);

  const seoDescription = useMemo(() => {
    if (activeCategoryName && activeBrandName) {
      return `Ontdek ${activeBrandName} ${activeCategoryName.toLowerCase()} bij Car Audio Limburg. Vakkundig advies en professionele installatie van premium car audio.`;
    } else if (activeCategoryName) {
      return `Bekijk ons assortiment ${activeCategoryName.toLowerCase()}. Premium kwaliteit met vakkundige installatie bij Car Audio Limburg.`;
    } else if (activeBrandName) {
      return `Ontdek het complete ${activeBrandName} assortiment bij Car Audio Limburg. Vakkundig advies en professionele installatie.`;
    }
    return "Bekijk ons complete assortiment car audio producten. Premium speakers, versterkers, head units en accessoires van topmerken Alpine, Audison, Focal en Hertz.";
  }, [activeCategoryName, activeBrandName]);

  const breadcrumbItems = useMemo(() => {
    const items = [
      { name: "Home", url: "/" },
      { name: "Producten", url: "/webshop" }
    ];
    if (activeCategoryName) {
      items.push({ name: activeCategoryName, url: `/webshop?category=${selectedCategory}` });
    }
    if (activeBrandName) {
      items.push({ name: activeBrandName, url: `/webshop?brand=${selectedBrand}` });
    }
    return items;
  }, [activeCategoryName, activeBrandName, selectedCategory, selectedBrand]);

  const categoryIcons: Record<string, React.ReactNode> = {
    speakers: <Volume2 className="w-6 h-6" />,
    amplifiers: <Settings className="w-6 h-6" />,
    headunits: <Car className="w-6 h-6" />,
    accessories: <Grid className="w-6 h-6" />,
  };

  return (
    <div className="min-h-screen bg-black" id="main-content">
      <SEO 
        title={seoTitle}
        description={seoDescription}
        canonical="/webshop"
        keywords="car audio, speakers, versterkers, head units, Alpine, Audison, Focal, Hertz"
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      
      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header onCartOpen={() => setIsCartOpen(true)} />
      </div>
      
      {/* Mobile App Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-b border-white/10 safe-area-top">
        <div className="flex items-center justify-between px-4 h-14">
          <button 
            onClick={() => navigate("/")}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 hover:bg-white/10 transition-colors active:scale-95"
            data-testid="mobile-home-button"
            aria-label="Ga naar homepage"
          >
            <HomeIcon className="w-5 h-5 text-white" />
          </button>
          
          <h1 className="text-white font-semibold">Shop</h1>
          
          <div className="flex items-center">
            <button 
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/10 transition-colors active:scale-95"
              data-testid="mobile-search-toggle"
              aria-label={mobileSearchOpen ? "Sluit zoeken" : "Open zoeken"}
              aria-expanded={mobileSearchOpen}
            >
              <Search className={`w-5 h-5 ${mobileSearchOpen ? 'text-[#d0a760]' : 'text-white'}`} />
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 hover:bg-white/10 transition-colors active:scale-95"
              data-testid="mobile-cart-button"
              aria-label="Open winkelwagen"
            >
              <ShoppingCart className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        
        {/* Mobile Search Bar (expandable) */}
        {mobileSearchOpen && (
          <div className="px-4 pb-3 animate-in slide-in-from-top-2 duration-200">
            <div className="relative group/msearch">
              <div className="absolute inset-0 bg-[#d0a760]/10 blur-lg opacity-0 group-focus-within/msearch:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within/msearch:text-[#d0a760] transition-colors" aria-hidden="true" />
                <Input
                  type="text"
                  placeholder="Zoek producten, merken..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-11 pl-10 pr-10 bg-white/5 border-white/15 text-white placeholder:text-white/40 rounded-none text-sm focus:border-[#d0a760] focus:ring-1 focus:ring-[#d0a760]/30 transition-all"
                  data-testid="mobile-search-input"
                  aria-label="Zoek producten voor jouw auto"
                  autoFocus
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label="Wis zoekopdracht"
                  >
                    <X className="w-4 h-4 text-white/60" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* Breadcrumb Navigation */}
      <nav className="bg-black pt-16 md:pt-20 pb-4" aria-label="Breadcrumb" data-testid="breadcrumb-nav">
        <div className="container mx-auto px-4">
          <Breadcrumb>
            <BreadcrumbList className="text-white/60">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="hover:text-[#d0a760] transition-colors" data-testid="breadcrumb-home">
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/40" />
              <BreadcrumbItem>
                {activeCategoryName || activeBrandName ? (
                  <BreadcrumbLink asChild>
                    <Link href="/webshop" className="hover:text-[#d0a760] transition-colors" data-testid="breadcrumb-products">
                      Producten
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="text-white" data-testid="breadcrumb-products-current">Producten</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {activeCategoryName && (
                <>
                  <BreadcrumbSeparator className="text-white/40" />
                  <BreadcrumbItem>
                    {activeBrandName ? (
                      <BreadcrumbLink asChild>
                        <Link 
                          href={`/webshop?category=${selectedCategory}`} 
                          className="hover:text-[#d0a760] transition-colors"
                          data-testid="breadcrumb-category"
                        >
                          {activeCategoryName}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="text-white" data-testid="breadcrumb-category-current">
                        {activeCategoryName}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </>
              )}
              {activeBrandName && (
                <>
                  <BreadcrumbSeparator className="text-white/40" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-white" data-testid="breadcrumb-brand-current">
                      {activeBrandName}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </nav>

      {/* Premium Hero Section */}
      <section className="relative bg-black pt-14 md:pt-24 pb-12 md:pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-[#d0a760]/5 rounded-full blur-[120px] -translate-y-1/2" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#d0a760]/3 rounded-full blur-[100px]" />
        </div>

        {/* Audio wave decorations */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-20">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-1 bg-gradient-to-r from-[#d0a760] to-transparent animate-audio-bar"
              style={{
                width: `${40 + Math.random() * 60}px`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-20">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-1 bg-gradient-to-l from-[#d0a760] to-transparent animate-audio-bar"
              style={{
                width: `${40 + Math.random() * 60}px`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal animation="fade-up">
            {/* Desktop Hero Content */}
            <div className="hidden md:block text-center max-w-4xl mx-auto">
              <Badge className="bg-[#d0a760]/10 text-[#d0a760] border-[#d0a760]/20 px-4 py-1.5 mb-6 rounded-none">
                <Volume2 className="w-3 h-3 mr-2" />
                Met passie geselecteerd voor jou
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                Vind de perfecte upgrade{" "}
                <span className="text-[#d0a760]">voor jouw auto</span>
              </h1>
              
              <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10">
                Wij nemen je graag mee in ons vakkundig geselecteerde assortiment. Van premium speakers tot complete audiosystemen — altijd met oog voor kwaliteit.
              </p>

              {/* Search Bar - Premium styled */}
              <div className="max-w-xl mx-auto relative group/search">
                <div className="absolute inset-0 bg-gradient-to-r from-[#d0a760]/20 via-[#d0a760]/10 to-[#d0a760]/20 blur-xl opacity-0 group-focus-within/search:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within/search:text-[#d0a760] transition-colors duration-300" />
                  <Input
                    type="text"
                    placeholder="Zoek op productnaam, merk of automerk..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-14 pl-12 pr-12 bg-white/5 border-white/20 text-white placeholder:text-white/40 rounded-none focus:border-[#d0a760] focus:ring-2 focus:ring-[#d0a760]/20 focus:bg-white/[0.07] transition-all duration-300"
                    data-testid="input-product-search"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white transition-colors"
                      aria-label="Wis zoekopdracht"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Mobile Hero Content - Compact */}
            <div className="md:hidden text-center pt-4">
              <h1 className="text-2xl font-bold text-white mb-2">
                Voor jouw <span className="text-[#d0a760]">auto</span>
              </h1>
              <p className="text-sm text-white/50">
                {sortedProducts.length} producten met passie geselecteerd
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Filters Bar - Black Section */}
      <aside className="bg-black py-4 md:py-6 border-y border-white/10 sticky top-14 md:top-16 z-40" aria-label="Product filters">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left side - Filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white rounded-none"
                data-testid="button-toggle-filters"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 bg-[#d0a760] text-black rounded-none">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              {/* Quick filter badges */}
              <div className="hidden md:flex items-center gap-2">
                <Badge 
                  variant={sortBy === "featured" ? "default" : "outline"} 
                  className={`cursor-pointer rounded-none transition-colors ${
                    sortBy === "featured" 
                      ? 'bg-[#d0a760] text-black' 
                      : 'border-white/20 text-white/60 hover:text-white hover:border-[#d0a760]'
                  }`}
                  onClick={() => setSortBy(sortBy === "featured" ? "name" : "featured")}
                  data-testid="badge-filter-featured"
                >
                  Uitgelicht
                </Badge>
                <Badge 
                  variant={sortBy === "newest" ? "default" : "outline"} 
                  className={`cursor-pointer rounded-none transition-colors ${
                    sortBy === "newest" 
                      ? 'bg-[#d0a760] text-black' 
                      : 'border-white/20 text-white/60 hover:text-white hover:border-[#d0a760]'
                  }`}
                  onClick={() => setSortBy(sortBy === "newest" ? "name" : "newest")}
                  data-testid="badge-filter-newest"
                >
                  Nieuwste
                </Badge>
                <Badge 
                  variant={sortBy === "price-low" ? "default" : "outline"} 
                  className={`cursor-pointer rounded-none transition-colors ${
                    sortBy === "price-low" 
                      ? 'bg-[#d0a760] text-black' 
                      : 'border-white/20 text-white/60 hover:text-white hover:border-[#d0a760]'
                  }`}
                  onClick={() => setSortBy(sortBy === "price-low" ? "name" : "price-low")}
                  data-testid="badge-filter-price"
                >
                  Beste Prijs
                </Badge>
              </div>

              {activeFiltersCount > 0 && (
                <Button 
                  variant="ghost" 
                  onClick={clearFilters} 
                  className="text-white/40 hover:text-white hover:bg-white/10 rounded-none"
                  data-testid="button-clear-filters"
                >
                  <X className="w-4 h-4 mr-1" />
                  Wis filters
                </Button>
              )}
            </div>

            {/* Right side - View mode and results */}
            <div className="flex items-center gap-4">
              <span className="text-white/40 text-sm hidden sm:block" data-testid="results-count">
                {sortedProducts.length} producten
              </span>
              
              <div className="flex bg-white/5 border border-white/10">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[#d0a760] text-black' : 'text-white/60 hover:text-white'}`}
                  data-testid="button-view-grid"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-[#d0a760] text-black' : 'text-white/60 hover:text-white'}`}
                  data-testid="button-view-list"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-white/10 animate-in slide-in-from-top-2 duration-300">
              {/* Filter Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                {/* Category */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#d0a760] uppercase tracking-wider flex items-center gap-2">
                    <Grid className="w-3.5 h-3.5" />
                    Categorie
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-white/5 border-white/15 text-white rounded-none h-11 hover:border-[#d0a760]/50 transition-colors" data-testid="select-category">
                      <SelectValue placeholder="Alle categorieën" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      <SelectItem value="all-categories" className="text-white hover:bg-[#d0a760]/10 focus:bg-[#d0a760]/10">Alle categorieën</SelectItem>
                      {categories && Array.isArray(categories) && (categories as Category[]).map((category: Category) => (
                        <SelectItem key={category.id} value={category.id} className="text-white hover:bg-[#d0a760]/10 focus:bg-[#d0a760]/10">
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Brand */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#d0a760] uppercase tracking-wider flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5" />
                    Merk
                  </label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger className="bg-white/5 border-white/15 text-white rounded-none h-11 hover:border-[#d0a760]/50 transition-colors" data-testid="select-brand">
                      <SelectValue placeholder="Alle merken" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      <SelectItem value="all-brands" className="text-white hover:bg-[#d0a760]/10 focus:bg-[#d0a760]/10">Alle merken</SelectItem>
                      {brands && Array.isArray(brands) && (brands as Brand[]).map((brand: Brand) => (
                        <SelectItem key={brand.id} value={brand.id} className="text-white hover:bg-[#d0a760]/10 focus:bg-[#d0a760]/10">
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Vehicle Make */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#d0a760] uppercase tracking-wider flex items-center gap-2">
                    <Car className="w-3.5 h-3.5" />
                    Automerk
                  </label>
                  <Select value={selectedMake} onValueChange={setSelectedMake}>
                    <SelectTrigger className="bg-white/5 border-white/15 text-white rounded-none h-11 hover:border-[#d0a760]/50 transition-colors" data-testid="select-vehicle-make">
                      <SelectValue placeholder="Alle merken" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      <SelectItem value="all-makes" className="text-white hover:bg-[#d0a760]/10 focus:bg-[#d0a760]/10">Alle merken</SelectItem>
                      {vehicleMakes && Array.isArray(vehicleMakes) && (vehicleMakes as VehicleMake[]).map((make: VehicleMake) => (
                        <SelectItem key={make.id} value={make.id} className="text-white hover:bg-[#d0a760]/10 focus:bg-[#d0a760]/10">
                          {make.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#d0a760] uppercase tracking-wider flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5" />
                    Sorteren
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-white/5 border-white/15 text-white rounded-none h-11 hover:border-[#d0a760]/50 transition-colors" data-testid="select-sort">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      <SelectItem value="name" className="text-white hover:bg-[#d0a760]/10 focus:bg-[#d0a760]/10">Naam A-Z</SelectItem>
                      <SelectItem value="price-low" className="text-white hover:bg-[#d0a760]/10 focus:bg-[#d0a760]/10">Prijs laag-hoog</SelectItem>
                      <SelectItem value="price-high" className="text-white hover:bg-[#d0a760]/10 focus:bg-[#d0a760]/10">Prijs hoog-laag</SelectItem>
                      <SelectItem value="newest" className="text-white hover:bg-[#d0a760]/10 focus:bg-[#d0a760]/10">Nieuwste eerst</SelectItem>
                      <SelectItem value="featured" className="text-white hover:bg-[#d0a760]/10 focus:bg-[#d0a760]/10">Uitgelicht eerst</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Second row of filters */}
              <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price Range Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[#d0a760] uppercase tracking-wider">
                      Prijsbereik
                    </label>
                    <span className="text-sm text-white font-medium">
                      €{priceRange[0].toLocaleString('nl-NL')} - €{priceRange[1].toLocaleString('nl-NL')}
                    </span>
                  </div>
                  <div className="px-1">
                    <Slider
                      value={priceRange}
                      min={0}
                      max={5000}
                      step={50}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      className="w-full"
                      data-testid="slider-price-range"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/30">
                    <span>€0</span>
                    <span>€2.500</span>
                    <span>€5.000</span>
                  </div>
                </div>

                {/* In Stock Only */}
                <div className="flex items-center">
                  <label
                    htmlFor="in-stock-only"
                    className="flex items-center gap-3 cursor-pointer group/stock p-3 -m-3 hover:bg-white/5 transition-colors"
                  >
                    <Checkbox
                      id="in-stock-only"
                      checked={inStockOnly}
                      onCheckedChange={(checked) => setInStockOnly(checked === true)}
                      className="border-white/30 data-[state=checked]:bg-[#d0a760] data-[state=checked]:border-[#d0a760] w-5 h-5"
                      data-testid="checkbox-in-stock"
                    />
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#d0a760]" />
                      <span className="text-sm text-white/80 group-hover/stock:text-white transition-colors">
                        Alleen producten op voorraad
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Products Grid - Dark Section */}
      <main className="bg-zinc-950 py-16" role="main">
        <div className="container mx-auto px-4">
          {isLoadingProducts ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6"
              : "space-y-4"
            }>
              {[...Array(8)].map((_, i) => (
                <ProductAudioSkeleton key={i} data-testid={`skeleton-product-${i}`} />
              ))}
            </div>
          ) : sortedProducts && sortedProducts.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {sortedProducts.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedProducts.map((product: Product) => (
                  <div key={product.id}>
                    <article 
                      className="bg-zinc-900 border border-zinc-800 hover:border-[#d0a760]/30 transition-all duration-300 group"
                      data-testid={`product-article-${product.id}`}
                    >
                      <div className="flex flex-col sm:flex-row">
                        {/* Product Image */}
                        <div className="w-full sm:w-56 h-56 sm:h-auto bg-zinc-800 flex-shrink-0 relative overflow-hidden">
                          <img 
                            src={product.images?.[0] || '/placeholder.png'} 
                            alt={product.name}
                            width={224}
                            height={224}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                          />
                          {product.originalPrice && (
                            <Badge className="absolute top-3 left-3 bg-[#d0a760] text-black rounded-none">
                              -{Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)}%
                            </Badge>
                          )}
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-[#d0a760] transition-colors">
                                <a href={`/webshop/${product.slug}`}>{product.name}</a>
                              </h2>
                              {product.shortDescription && (
                                <p className="text-white/50 mb-3 line-clamp-2">
                                  {product.shortDescription}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-white mb-1">
                                €{parseFloat(product.price).toFixed(0)}
                              </div>
                              {product.originalPrice && (
                                <div className="text-sm text-white/40 line-through">
                                  €{parseFloat(product.originalPrice).toFixed(0)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm">
                              <span className={product.stock && product.stock > 0 ? "text-green-500" : "text-orange-500"}>
                                {product.stock && product.stock > 0 ? "Op voorraad" : "Op aanvraag"}
                              </span>
                              {product.isFeatured && (
                                <Badge className="bg-[#d0a760]/10 text-[#d0a760] border-[#d0a760]/20 rounded-none">
                                  Uitgelicht
                                </Badge>
                              )}
                            </div>
                            <Button 
                              asChild 
                              className="bg-white text-black hover:bg-[#d0a760] rounded-none"
                            >
                              <a href={`/webshop/${product.slug}`}>
                                Bekijk Product
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-24">
              <div className="max-w-md mx-auto">
                {/* Visual feedback icon */}
                <div className="mb-8 relative">
                  <div className="w-24 h-24 mx-auto bg-zinc-900 border border-zinc-800 flex items-center justify-center relative overflow-hidden">
                    <Search className="w-10 h-10 text-white/20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#d0a760]/10 to-transparent" />
                  </div>
                  {/* Audio wave animation below icon */}
                  <div className="flex items-end justify-center gap-1 h-8 mt-4 opacity-60">
                    {[...Array(7)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-gradient-to-t from-[#d0a760]/40 to-[#d0a760] rounded-sm"
                        style={{
                          height: `${8 + Math.sin(i * 0.8) * 12}px`,
                          animation: `pulse 1.5s ease-in-out ${i * 0.15}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <h3 className="text-2xl font-semibold text-white mb-3">
                  {search ? `Geen resultaten voor "${search}"` : "Geen producten gevonden"}
                </h3>
                <p className="text-white/50 mb-8 leading-relaxed">
                  {search 
                    ? "Probeer een andere zoekterm of pas je filters aan. Wij helpen je graag bij het vinden van de perfecte audio."
                    : "Pas je filters aan om producten te zien die bij jouw wensen passen."
                  }
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={clearFilters} 
                    className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none px-6"
                    data-testid="button-clear-filters-empty"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Alle filters wissen
                  </Button>
                  <Button 
                    asChild
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 rounded-none px-6"
                  >
                    <a href="/contact">
                      Hulp nodig? Neem contact op
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CTA Section - White */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-up">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                Wij denken graag met je mee
              </h2>
              <p className="text-lg text-black/60 mb-8 max-w-2xl mx-auto">
                Met onze passie voor auto's en muziek helpen we je vakkundig bij het samenstellen van de perfecte audio-upgrade voor jouw wensen. Persoonlijk advies, zonder verplichtingen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild
                  className="bg-black text-white hover:bg-[#d0a760] hover:text-black rounded-none px-8 py-6 text-lg"
                >
                  <a href="/contact">Vraag vrijblijvend advies</a>
                </Button>
                <Button 
                  asChild
                  variant="outline"
                  className="border-black text-black hover:bg-black hover:text-white rounded-none px-8 py-6 text-lg"
                >
                  <a href="/booking">Bezoek onze showroom</a>
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer - Desktop only */}
      <div className="hidden md:block">
        <Footer />
      </div>
      
      {/* Mobile Bottom Spacer for potential future bottom nav */}
      <div className="md:hidden h-4 safe-area-bottom" />
      
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
