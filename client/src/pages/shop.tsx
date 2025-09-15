import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CartSidebar } from "@/components/CartSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X, ChevronDown, Grid, Car, Volume2, Settings, ChevronRight, List, LayoutGrid, Euro } from "lucide-react";
import type { Product, Category, Brand, VehicleMake } from "@shared/schema";
import { ProductAudioSkeleton, AudioLoadingSpinner } from "@/components/AudioSkeletons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Shop() {
  const { t } = useTranslation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all-categories");
  const [selectedBrand, setSelectedBrand] = useState("all-brands");
  const [selectedMake, setSelectedMake] = useState("all-makes");
  const [selectedModel, setSelectedModel] = useState("all-models");
  const [selectedYear, setSelectedYear] = useState("all-years");
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);

  // Get URL search params
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products", {
      search,
      categoryId: selectedCategory.startsWith('all-') ? '' : selectedCategory,
      brandId: selectedBrand.startsWith('all-') ? '' : selectedBrand,
      vehicleMakeId: selectedMake.startsWith('all-') ? '' : selectedMake,
      vehicleModelId: selectedModel.startsWith('all-') ? '' : selectedModel,
      vehicleYear: selectedYear && !selectedYear.startsWith('all-') ? parseInt(selectedYear) : undefined,
      limit: 50,
    }],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: brands } = useQuery({
    queryKey: ["/api/brands"],
  });

  const { data: vehicleMakes } = useQuery({
    queryKey: ["/api/vehicle-makes"],
  });

  const { data: vehicleModels } = useQuery({
    queryKey: ["/api/vehicle-models", selectedMake],
    enabled: !!selectedMake,
  });

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all-categories");
    setSelectedBrand("all-brands");
    setSelectedMake("all-makes");
    setSelectedModel("all-models");
    setSelectedYear("all-years");
    setPriceRange([0, 2000]);
    setSortBy("name");
  };

  const activeFiltersCount = [
    search,
    selectedCategory && !selectedCategory.startsWith('all-') ? selectedCategory : '',
    selectedBrand && !selectedBrand.startsWith('all-') ? selectedBrand : '',
    selectedMake && !selectedMake.startsWith('all-') ? selectedMake : '',
    selectedModel && !selectedModel.startsWith('all-') ? selectedModel : '',
    selectedYear && !selectedYear.startsWith('all-') ? selectedYear : '',
    (priceRange[0] > 0 || priceRange[1] < 2000) ? 'price' : '',
    sortBy !== 'name' ? 'sort' : ''
  ].filter(Boolean).length;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  // Client-side sorting function
  const sortProducts = (products: Product[]) => {
    if (!products) return [];
    
    const filtered = products.filter((product) => {
      const price = parseFloat(product.price);
      return price >= priceRange[0] && price <= priceRange[1];
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

  // Apply sorting and filtering to products
  const sortedProducts = sortProducts(products as Product[] || []);

  return (
    <div className="min-h-screen bg-background">
      <Header onCartOpen={() => setIsCartOpen(true)} />
      
      <div className="container px-4 mx-auto py-8">
        {/* Hero Section */}
        <div className="mb-8 md:mb-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">{t('shop.title')}</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('shop.subtitle')}
            </p>
          </div>

          {/* Featured Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card 
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border hover:border-primary/50"
              onClick={() => {
                const speakerCategory = categories?.find((c: Category) => c.name.toLowerCase().includes('speaker'));
                if (speakerCategory) {
                  setSelectedCategory(speakerCategory.id);
                }
                setShowFilters(false);
              }}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  <Volume2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{t('shop.categories.speakers')}</h3>
                <p className="text-sm text-muted-foreground">{t('shop.categoryDescriptions.speakers')}</p>
              </CardContent>
            </Card>

            <Card 
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border hover:border-primary/50"
              onClick={() => {
                const ampCategory = categories?.find((c: Category) => c.name.toLowerCase().includes('amplif'));
                if (ampCategory) {
                  setSelectedCategory(ampCategory.id);
                }
                setShowFilters(false);
              }}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{t('shop.categories.amplifiers')}</h3>
                <p className="text-sm text-muted-foreground">{t('shop.categoryDescriptions.amplifiers')}</p>
              </CardContent>
            </Card>

            <Card 
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border hover:border-primary/50"
              onClick={() => {
                const headUnitCategory = categories?.find((c: Category) => c.name.toLowerCase().includes('head'));
                if (headUnitCategory) {
                  setSelectedCategory(headUnitCategory.id);
                }
                setShowFilters(false);
              }}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{t('shop.categories.headUnits')}</h3>
                <p className="text-sm text-muted-foreground">{t('shop.categoryDescriptions.headUnits')}</p>
              </CardContent>
            </Card>

            <Card 
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border hover:border-primary/50"
              onClick={() => {
                const accessCategory = categories?.find((c: Category) => c.name.toLowerCase().includes('access'));
                if (accessCategory) {
                  setSelectedCategory(accessCategory.id);
                }
                setShowFilters(false);
              }}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  <Grid className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{t('shop.categories.accessories')}</h3>
                <p className="text-sm text-muted-foreground">{t('shop.categoryDescriptions.accessories')}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Fancy Navigation Dropdown */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 mb-4 md:mb-6">
            {/* Categories Mega Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12 px-6 border-border hover:bg-accent" data-testid="dropdown-categories">
                  <Grid className="w-4 h-4 mr-2" />
                  {t('nav.categories')}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-4" align="start">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <DropdownMenuLabel>Audio Systemen</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {categories && Array.isArray(categories) && (categories as Category[]).slice(0, 4).map((category: Category) => (
                      <DropdownMenuItem 
                        key={category.id}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setShowFilters(false);
                        }}
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        {category.name}
                      </DropdownMenuItem>
                    ))}
                  </div>
                  <div>
                    <DropdownMenuLabel>Accessoires</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {categories && Array.isArray(categories) && (categories as Category[]).slice(4, 8).map((category: Category) => (
                      <DropdownMenuItem 
                        key={category.id}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setShowFilters(false);
                        }}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        {category.name}
                      </DropdownMenuItem>
                    ))}
                  </div>
                </div>
                <DropdownMenuSeparator className="my-4" />
                <DropdownMenuItem 
                  className="cursor-pointer font-medium"
                  onClick={() => setSelectedCategory("all-categories")}
                >
                  Alle categorieën bekijken
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Brands Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12 px-6 border-border hover:bg-accent" data-testid="dropdown-brands">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Merken
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-4" align="start">
                <DropdownMenuLabel>Premium Merken</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="grid grid-cols-2 gap-2">
                  {brands && Array.isArray(brands) && (brands as Brand[]).slice(0, 8).map((brand: Brand) => (
                    <DropdownMenuItem 
                      key={brand.id}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedBrand(brand.id);
                        setShowFilters(false);
                      }}
                    >
                      {brand.name}
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator className="my-4" />
                <DropdownMenuItem 
                  className="cursor-pointer font-medium"
                  onClick={() => setSelectedBrand("all-brands")}
                >
                  Alle merken
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Vehicle Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12 px-6 border-border hover:bg-accent" data-testid="dropdown-vehicles">
                  <Car className="w-4 h-4 mr-2" />
                  Voor Mijn Auto
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-4" align="start">
                <DropdownMenuLabel>Populaire Merken</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="grid grid-cols-3 gap-2">
                  {vehicleMakes && Array.isArray(vehicleMakes) && (vehicleMakes as VehicleMake[]).slice(0, 12).map((make: VehicleMake) => (
                    <DropdownMenuItem 
                      key={make.id}
                      className="cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedMake(make.id);
                        setShowFilters(false);
                      }}
                    >
                      {make.name}
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator className="my-4" />
                <DropdownMenuItem 
                  className="cursor-pointer font-medium"
                  onClick={() => setSelectedMake("all-makes")}
                >
                  Alle automerken
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Quick Action Filters */}
            <div className="ml-auto flex flex-wrap gap-2">
              <Badge 
                variant={sortBy === "newest" ? "default" : "outline"} 
                className="cursor-pointer hover:bg-primary/10 transition-colors px-3 py-1"
                onClick={() => setSortBy("newest")}
                data-testid="badge-filter-newest"
              >
                Nieuwste
              </Badge>
              <Badge 
                variant={sortBy === "featured" ? "default" : "outline"} 
                className="cursor-pointer hover:bg-primary/10 transition-colors px-3 py-1"
                onClick={() => setSortBy("featured")}
                data-testid="badge-filter-featured"
              >
                Uitgelicht
              </Badge>
              <Badge 
                variant={sortBy === "price-low" ? "default" : "outline"} 
                className="cursor-pointer hover:bg-primary/10 transition-colors px-3 py-1"
                onClick={() => setSortBy("price-low")}
                data-testid="badge-filter-sale"
              >
                Beste Prijs
              </Badge>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 md:mb-8 space-y-3 md:space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Zoek producten..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-input border-border h-11 md:h-10"
              data-testid="input-product-search"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-border"
              data-testid="button-toggle-filters"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {activeFiltersCount > 0 && (
              <Button variant="ghost" onClick={clearFilters} data-testid="button-clear-filters">
                <X className="w-4 h-4 mr-2" />
                Wis filters
              </Button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="bg-card border-border" data-testid="filters-panel">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">{t('shop.filters.category')}</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="bg-input border-border" data-testid="select-category">
                        <SelectValue placeholder="Alle categorieën" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-categories">{t('shop.placeholders.allCategories')}</SelectItem>
                        {categories && Array.isArray(categories) && (categories as Category[]).map((category: Category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Brand Filter */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">{t('shop.filters.brand')}</label>
                    <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                      <SelectTrigger className="bg-input border-border" data-testid="select-brand">
                        <SelectValue placeholder="Alle merken" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-brands">{t('shop.placeholders.allBrands')}</SelectItem>
                        {brands && Array.isArray(brands) && (brands as Brand[]).map((brand: Brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Vehicle Make Filter */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">{t('shop.filters.vehicleMake')}</label>
                    <Select value={selectedMake} onValueChange={setSelectedMake}>
                      <SelectTrigger className="bg-input border-border" data-testid="select-vehicle-make">
                        <SelectValue placeholder="Alle merken" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-makes">{t('shop.placeholders.allMakes')}</SelectItem>
                        {vehicleMakes && Array.isArray(vehicleMakes) && (vehicleMakes as VehicleMake[]).map((make: VehicleMake) => (
                          <SelectItem key={make.id} value={make.id}>
                            {make.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Vehicle Model Filter */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">{t('shop.filters.model')}</label>
                    <Select value={selectedModel} onValueChange={setSelectedModel} disabled={!selectedMake}>
                      <SelectTrigger className="bg-input border-border" data-testid="select-vehicle-model">
                        <SelectValue placeholder="Alle modellen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-models">{t('shop.placeholders.allModels')}</SelectItem>
                        {vehicleModels && Array.isArray(vehicleModels) && (vehicleModels as any[]).map((model: any) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Year Filter */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">{t('shop.filters.year')}</label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="bg-input border-border" data-testid="select-year">
                        <SelectValue placeholder="Alle jaren" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-years">{t('shop.placeholders.allYears')}</SelectItem>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range Filter */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium text-foreground flex items-center">
                        <Euro className="w-4 h-4 mr-1" />
                        {t('shop.filters.priceRange')}
                      </label>
                      <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                        €{priceRange[0]} - €{priceRange[1]}
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Min Price Slider */}
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Minimum: €{priceRange[0]}</label>
                        <input
                          type="range"
                          min="0"
                          max="2000"
                          step="50"
                          value={priceRange[0]}
                          onChange={(e) => {
                            const newMin = parseInt(e.target.value);
                            if (newMin <= priceRange[1]) {
                              setPriceRange([newMin, priceRange[1]]);
                            }
                          }}
                          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer range-slider"
                          data-testid="slider-min-price"
                        />
                      </div>
                      
                      {/* Max Price Slider */}
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Maximum: €{priceRange[1]}</label>
                        <input
                          type="range"
                          min="0"
                          max="2000"
                          step="50"
                          value={priceRange[1]}
                          onChange={(e) => {
                            const newMax = parseInt(e.target.value);
                            if (newMax >= priceRange[0]) {
                              setPriceRange([priceRange[0], newMax]);
                            }
                          }}
                          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer range-slider"
                          data-testid="slider-max-price"
                        />
                      </div>
                      
                      <div className="flex justify-between text-xs text-muted-foreground pt-1">
                        <span>€0</span>
                        <span>€500</span>
                        <span>€1000</span>
                        <span>€1500</span>
                        <span>€2000+</span>
                      </div>
                    </div>
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">{t('shop.filters.sort')}</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="bg-input border-border" data-testid="select-sort">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">{t('shop.sorting.name')}</SelectItem>
                        <SelectItem value="price-low">{t('shop.sorting.priceLow')}</SelectItem>
                        <SelectItem value="price-high">{t('shop.sorting.priceHigh')}</SelectItem>
                        <SelectItem value="newest">{t('shop.sorting.newest')}</SelectItem>
                        <SelectItem value="featured">{t('shop.sorting.featured')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Header with View Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground" data-testid="results-count">
            {products ? `${sortedProducts.length} producten gevonden` : "Laden..."}
          </p>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground hidden sm:block">Weergave:</span>
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-3 rounded-md"
                onClick={() => setViewMode('grid')}
                data-testid="button-view-grid"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="ml-1 hidden sm:inline">Grid</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-3 rounded-md"
                onClick={() => setViewMode('list')}
                data-testid="button-view-list"
              >
                <List className="w-4 h-4" />
                <span className="ml-1 hidden sm:inline">List</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Products Display */}
        {isLoadingProducts ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            : "space-y-4"
          }>
            {[...Array(8)].map((_, i) => (
              <ProductAudioSkeleton key={i} data-testid={`skeleton-product-${i}`} />
            ))}
          </div>
        ) : sortedProducts && sortedProducts.length > 0 ? (
          viewMode === 'grid' ? (
            // Grid View
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {sortedProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            // List View
            <div className="space-y-4">
              {sortedProducts.map((product: Product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-border">
                  <div className="flex flex-col sm:flex-row">
                    {/* Product Image */}
                    <div className="w-full sm:w-48 h-48 sm:h-auto bg-cover bg-center flex-shrink-0"
                         style={{ backgroundImage: `url(${product.images?.[0] || '/api/placeholder/300/200'})` }}>
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                            <a href={`/product/${product.slug}`}>{product.name}</a>
                          </h3>
                          {product.shortDescription && (
                            <p className="text-muted-foreground mb-3 line-clamp-2">
                              {product.shortDescription}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-foreground mb-1">
                            €{parseFloat(product.price).toFixed(0)}
                          </div>
                          {product.originalPrice && (
                            <div className="text-sm text-muted-foreground line-through">
                              €{parseFloat(product.originalPrice).toFixed(0)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className={product.stock && product.stock > 0 ? "text-green-600" : "text-red-600"}>
                            {product.stock && product.stock > 0 ? "Op voorraad" : "Uitverkocht"}
                          </span>
                          {product.isFeatured && (
                            <Badge variant="secondary">Uitgelicht</Badge>
                          )}
                        </div>
                        <Button asChild className="bg-primary hover:bg-primary/90">
                          <a href={`/product/${product.slug}`}>
                            Bekijk Product
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : (
          <Card className="bg-card border-border p-12 text-center" data-testid="no-products">
            <div className="mb-6">
              <AudioLoadingSpinner size="lg" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">Geen producten gevonden</h3>
            <p className="text-muted-foreground mb-4">
              Probeer je zoekopdracht aan te passen of verwijder enkele filters.
            </p>
            <Button onClick={clearFilters} data-testid="button-clear-filters-empty">
              Wis alle filters
            </Button>
          </Card>
        )}
      </div>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
