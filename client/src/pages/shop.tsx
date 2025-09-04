import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Search, Filter, X, ChevronDown, Grid, Car, Volume2, Settings, ChevronRight } from "lucide-react";
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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all-categories");
  const [selectedBrand, setSelectedBrand] = useState("all-brands");
  const [selectedMake, setSelectedMake] = useState("all-makes");
  const [selectedModel, setSelectedModel] = useState("all-models");
  const [selectedYear, setSelectedYear] = useState("all-years");
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);

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
  };

  const activeFiltersCount = [
    search,
    selectedCategory && !selectedCategory.startsWith('all-') ? selectedCategory : '',
    selectedBrand && !selectedBrand.startsWith('all-') ? selectedBrand : '',
    selectedMake && !selectedMake.startsWith('all-') ? selectedMake : '',
    selectedModel && !selectedModel.startsWith('all-') ? selectedModel : '',
    selectedYear && !selectedYear.startsWith('all-') ? selectedYear : ''
  ].filter(Boolean).length;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-background">
      <Header onCartOpen={() => setIsCartOpen(true)} />
      
      <div className="container px-4 mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Car Audio Shop</h1>
          <p className="text-lg text-muted-foreground">
            Ontdek ons complete assortiment premium car audio producten
          </p>
        </div>

        {/* Fancy Navigation Dropdown */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Categories Mega Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12 px-6 border-border hover:bg-accent" data-testid="dropdown-categories">
                  <Grid className="w-4 h-4 mr-2" />
                  Categorieën
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-4" align="start">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <DropdownMenuLabel>Audio Systemen</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {categories && (categories as Category[]).slice(0, 4).map((category: Category) => (
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
                    {categories && (categories as Category[]).slice(4, 8).map((category: Category) => (
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
                  {brands && (brands as Brand[]).slice(0, 8).map((brand: Brand) => (
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
                  {vehicleMakes && (vehicleMakes as VehicleMake[]).slice(0, 12).map((make: VehicleMake) => (
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

            {/* Quick Actions */}
            <div className="ml-auto flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSortBy("price-asc")} data-testid="button-sort-price">
                Laagste Prijs
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSortBy("featured")} data-testid="button-sort-featured">
                Uitgelicht
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Zoek producten..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-input border-border"
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
                    <label className="text-sm font-medium text-foreground mb-2 block">Categorie</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="bg-input border-border" data-testid="select-category">
                        <SelectValue placeholder="Alle categorieën" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-categories">Alle categorieën</SelectItem>
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
                    <label className="text-sm font-medium text-foreground mb-2 block">Merk</label>
                    <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                      <SelectTrigger className="bg-input border-border" data-testid="select-brand">
                        <SelectValue placeholder="Alle merken" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-brands">Alle merken</SelectItem>
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
                    <label className="text-sm font-medium text-foreground mb-2 block">Voertuigmerk</label>
                    <Select value={selectedMake} onValueChange={setSelectedMake}>
                      <SelectTrigger className="bg-input border-border" data-testid="select-vehicle-make">
                        <SelectValue placeholder="Alle merken" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-makes">Alle merken</SelectItem>
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
                    <label className="text-sm font-medium text-foreground mb-2 block">Model</label>
                    <Select value={selectedModel} onValueChange={setSelectedModel} disabled={!selectedMake}>
                      <SelectTrigger className="bg-input border-border" data-testid="select-vehicle-model">
                        <SelectValue placeholder="Alle modellen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-models">Alle modellen</SelectItem>
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
                    <label className="text-sm font-medium text-foreground mb-2 block">Bouwjaar</label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="bg-input border-border" data-testid="select-year">
                        <SelectValue placeholder="Alle jaren" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-years">Alle jaren</SelectItem>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Sorteren</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="bg-input border-border" data-testid="select-sort">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Naam A-Z</SelectItem>
                        <SelectItem value="price-low">Prijs laag-hoog</SelectItem>
                        <SelectItem value="price-high">Prijs hoog-laag</SelectItem>
                        <SelectItem value="newest">Nieuwste eerst</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-muted-foreground" data-testid="results-count">
            {products ? `${(products as Product[]).length} producten gevonden` : "Laden..."}
          </p>
        </div>

        {/* Products Grid */}
        {isLoadingProducts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductAudioSkeleton key={i} data-testid={`skeleton-product-${i}`} />
            ))}
          </div>
        ) : products && (products as Product[]).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(products as Product[]).map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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
