import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { MagnifyingGlass } from "@phosphor-icons/react";
import type { VehicleMake, VehicleModel } from "@shared/schema";

export function VehicleSelector() {
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [, setLocation] = useLocation();

  const { data: vehicleMakes = [] } = useQuery<VehicleMake[]>({
    queryKey: ["/api/vehicle-makes"],
  });

  const { data: vehicleModels = [] } = useQuery<VehicleModel[]>({
    queryKey: ["/api/vehicle-models", selectedMake],
    enabled: !!selectedMake,
  });

  useEffect(() => {
    setSelectedModel("");
  }, [selectedMake]);

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (selectedMake) searchParams.set("vehicleMakeId", selectedMake);
    if (selectedModel) searchParams.set("vehicleModelId", selectedModel);
    if (selectedYear) searchParams.set("vehicleYear", selectedYear);
    
    setLocation(`/webshop?${searchParams.toString()}`);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <Card className="bg-card border-border max-w-3xl mx-auto" data-testid="vehicle-selector">
      <CardContent className="p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-card-foreground">Vind producten voor jouw voertuig</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Select value={selectedMake} onValueChange={setSelectedMake}>
            <SelectTrigger className="bg-input border-border" data-testid="select-vehicle-make">
              <SelectValue placeholder="Selecteer merk" />
            </SelectTrigger>
            <SelectContent>
              {vehicleMakes.map((make) => (
                <SelectItem key={make.id} value={make.id}>
                  {make.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedModel} onValueChange={setSelectedModel} disabled={!selectedMake}>
            <SelectTrigger className="bg-input border-border" data-testid="select-vehicle-model">
              <SelectValue placeholder="Selecteer model" />
            </SelectTrigger>
            <SelectContent>
              {vehicleModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="bg-input border-border" data-testid="select-vehicle-year">
              <SelectValue placeholder="Bouwjaar" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={handleSearch}
            disabled={!selectedMake}
            className="w-full sm:col-span-2 lg:col-span-1"
            data-testid="button-search-products"
          >
            <MagnifyingGlass className="w-4 h-4 mr-2" />
            Zoek producten
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
