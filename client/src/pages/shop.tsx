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
import { Search, Filter, X } from "lucide-react";
import type { Product, Category, Brand, VehicleMake } from "@shared/schema";

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
                        {categories && Array.isArray(categories) && categories.map((category: Category) => (
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
                        {brands && Array.isArray(brands) && brands.map((brand: Brand) => (
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
                        {vehicleMakes && Array.isArray(vehicleMakes) && vehicleMakes.map((make: VehicleMake) => (
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
                        {vehicleModels && Array.isArray(vehicleModels) && vehicleModels.map((model: any) => (
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
            {products ? `${products.length} producten gevonden` : "Laden..."}
          </p>
        </div>

        {/* Products Grid */}
        {isLoadingProducts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 animate-pulse" data-testid={`skeleton-product-${i}`}>
                <div className="aspect-square bg-muted rounded-xl mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border p-12 text-center" data-testid="no-products">
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
