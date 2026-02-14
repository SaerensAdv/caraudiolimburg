import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Car, SpinnerGap } from "@phosphor-icons/react";
import type { VehicleMake, VehicleModel } from "@shared/schema";

interface VehicleSelection {
  makeId: string;
  makeName: string;
  modelId: string;
  modelName: string;
  year: number;
}

interface VehicleHeroSelectorProps {
  onVehicleSelect?: (selection: VehicleSelection) => void;
}

export function VehicleHeroSelector({ onVehicleSelect }: VehicleHeroSelectorProps) {
  const [selectedMakeId, setSelectedMakeId] = useState<string>("");
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 25 }, (_, i) => currentYear - i);

  const { data: vehicleMakes, isLoading: isLoadingMakes } = useQuery<VehicleMake[]>({
    queryKey: ["/api/vehicle-makes"],
  });

  const { data: vehicleModels, isLoading: isLoadingModels } = useQuery<VehicleModel[]>({
    queryKey: [`/api/vehicle-models/${selectedMakeId}`],
    enabled: !!selectedMakeId,
  });

  useEffect(() => {
    setSelectedModelId("");
  }, [selectedMakeId]);

  const handleSearch = () => {
    if (selectedMakeId && selectedModelId && selectedYear) {
      const makeName = vehicleMakes?.find(m => m.id === selectedMakeId)?.name || "";
      const modelName = vehicleModels?.find(m => m.id === selectedModelId)?.name || "";
      setIsAnimating(true);
      setTimeout(() => {
        onVehicleSelect?.({
          makeId: selectedMakeId,
          makeName,
          modelId: selectedModelId,
          modelName,
          year: parseInt(selectedYear),
        });
        const recommendationsSection = document.getElementById('vehicle-recommendations');
        if (recommendationsSection) {
          recommendationsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  };

  const isComplete = selectedMakeId && selectedModelId && selectedYear;

  return (
    <div className={`transition-all duration-500 ${isAnimating ? 'scale-95 opacity-80' : ''}`}>
      <div className="flex items-center gap-2 mb-4">
        <Car className="w-5 h-5 text-[#d0a760]" />
        <span className="text-white/80 text-sm font-medium tracking-wide uppercase">Selecteer je auto</span>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={selectedMakeId} onValueChange={setSelectedMakeId}>
          <SelectTrigger 
            className="w-full sm:w-44 bg-white/10 backdrop-blur-sm border-white/20 text-white rounded-none h-12 focus:border-[#d0a760] hover:bg-white/15 transition-colors"
            data-testid="select-hero-vehicle-make"
          >
            {isLoadingMakes ? (
              <SpinnerGap className="w-4 h-4 animate-spin" />
            ) : (
              <SelectValue placeholder="Merk" />
            )}
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700 rounded-none max-h-64">
            {vehicleMakes?.map((make) => (
              <SelectItem 
                key={make.id} 
                value={make.id} 
                className="text-white hover:bg-[#d0a760]/20 focus:bg-[#d0a760]/20 cursor-pointer"
              >
                {make.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedModelId} onValueChange={setSelectedModelId} disabled={!selectedMakeId}>
          <SelectTrigger 
            className="w-full sm:w-44 bg-white/10 backdrop-blur-sm border-white/20 text-white rounded-none h-12 focus:border-[#d0a760] hover:bg-white/15 transition-colors disabled:opacity-50"
            data-testid="select-hero-vehicle-model"
          >
            {isLoadingModels ? (
              <SpinnerGap className="w-4 h-4 animate-spin" />
            ) : (
              <SelectValue placeholder="Model" />
            )}
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700 rounded-none max-h-64">
            {vehicleModels?.map((model) => (
              <SelectItem 
                key={model.id} 
                value={model.id} 
                className="text-white hover:bg-[#d0a760]/20 focus:bg-[#d0a760]/20 cursor-pointer"
              >
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedYear} onValueChange={setSelectedYear} disabled={!selectedModelId}>
          <SelectTrigger 
            className="w-full sm:w-32 bg-white/10 backdrop-blur-sm border-white/20 text-white rounded-none h-12 focus:border-[#d0a760] hover:bg-white/15 transition-colors disabled:opacity-50"
            data-testid="select-hero-vehicle-year"
          >
            <SelectValue placeholder="Jaar" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700 rounded-none max-h-64">
            {years.map((year) => (
              <SelectItem 
                key={year} 
                value={year.toString()} 
                className="text-white hover:bg-[#d0a760]/20 focus:bg-[#d0a760]/20 cursor-pointer"
              >
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleSearch}
          disabled={!isComplete}
          className={`h-12 px-6 rounded-none transition-all duration-300 ${
            isComplete 
              ? 'bg-[#d0a760] text-black hover:bg-[#d0a760]/90' 
              : 'bg-white/10 text-white/50 cursor-not-allowed'
          }`}
          data-testid="button-hero-search-vehicle"
        >
          Bekijk opties
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
