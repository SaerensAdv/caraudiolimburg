import { useState } from "react";
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

export function VehicleSelector() {
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [, setLocation] = useLocation();

  const { data: vehicleMakes } = useQuery({
    queryKey: ["/api/vehicle-makes"],
  });

  const { data: vehicleModels } = useQuery({
    queryKey: ["/api/vehicle-models", selectedMake],
    enabled: !!selectedMake,
  });

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (selectedMake) searchParams.set("vehicleMakeId", selectedMake);
    if (selectedModel) searchParams.set("vehicleModelId", selectedModel);
    if (selectedYear) searchParams.set("vehicleYear", selectedYear);
    
    setLocation(`/shop?${searchParams.toString()}`);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <Card className="bg-card border-border max-w-3xl mx-auto" data-testid="vehicle-selector">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-card-foreground">Vind producten voor jouw voertuig</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select value={selectedMake} onValueChange={setSelectedMake}>
            <SelectTrigger className="bg-input border-border" data-testid="select-vehicle-make">
              <SelectValue placeholder="Selecteer merk" />
            </SelectTrigger>
            <SelectContent>
              {vehicleMakes?.map((make: any) => (
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
              {vehicleModels?.map((model: any) => (
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
            data-testid="button-search-products"
          >
            Zoek producten
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
