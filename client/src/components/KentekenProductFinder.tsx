import { useState, type ChangeEvent, type KeyboardEvent } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Car, MagnifyingGlass, ArrowRight, CheckCircle, SpinnerGap, WarningCircle, Info } from "@phosphor-icons/react";
import type { VehicleModel } from "@shared/schema";

interface KentekenMatchResult {
  vehicle: {
    kenteken: string;
    merk: string;
    model: string;
    bouwjaar: number;
    brandstof?: string;
    kleur?: string;
  };
  match: {
    makeId: string | null;
    makeName: string | null;
    modelId: string | null;
    modelName: string | null;
    confidence: 'exact' | 'partial' | 'make_only' | 'none';
  };
  productCount: number;
  modelSpecificCount: number;
  makeCompatibleCount: number;
  shopUrl: string;
}

interface KentekenProductFinderProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export function KentekenProductFinder({ className = "", variant = "compact" }: KentekenProductFinderProps) {
  const [plate, setPlate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<KentekenMatchResult | null>(null);
  const [selectedModelOverride, setSelectedModelOverride] = useState<string>("");
  const [, setLocation] = useLocation();

  const { data: vehicleModels = [], isLoading: modelsLoading } = useQuery<VehicleModel[]>({
    queryKey: [`/api/vehicle-models/${result?.match?.makeId}?all=true`],
    enabled: !!result?.match?.makeId && (result?.match?.confidence === 'make_only' || result?.match?.confidence === 'partial'),
  });

  const formatKenteken = (raw: string): string => {
    const clean = raw.replace(/[^A-Z0-9]/g, '');
    if (clean.length === 0) return '';

    const patterns = [
      /^([A-Z]{2})(\d{2})(\d{2})$/,
      /^(\d{2})(\d{2})([A-Z]{2})$/,
      /^(\d{2})([A-Z]{2})(\d{2})$/,
      /^([A-Z]{2})(\d{2})([A-Z]{2})$/,
      /^([A-Z]{2})([A-Z]{2})(\d{2})$/,
      /^(\d{2})([A-Z]{2})([A-Z]{2})$/,
      /^(\d{2})([A-Z]{3})(\d{1})$/,
      /^(\d{1})([A-Z]{3})(\d{2})$/,
      /^([A-Z]{2})(\d{3})([A-Z]{1})$/,
      /^([A-Z]{1})(\d{3})([A-Z]{2})$/,
      /^([A-Z]{3})(\d{2})([A-Z]{1})$/,
      /^([A-Z]{1})(\d{2})([A-Z]{3})$/,
      /^(\d{1})([A-Z]{2})(\d{3})$/,
      /^(\d{3})([A-Z]{2})(\d{1})$/,
    ];

    for (const pattern of patterns) {
      const match = clean.match(pattern);
      if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
      }
    }

    return clean;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    const clean = value.replace(/[^A-Z0-9]/g, '');

    if (clean.length >= 5) {
      setPlate(formatKenteken(clean));
    } else {
      setPlate(clean);
    }

    setError(null);
    setResult(null);
    setSelectedModelOverride("");
  };

  const handleLookup = async () => {
    const cleanPlate = plate.replace(/[-\s]/g, '');
    if (!cleanPlate || cleanPlate.length < 4) {
      setError("Voer een geldig kenteken in");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setSelectedModelOverride("");

    try {
      const response = await fetch(`/api/rdw/kenteken/${encodeURIComponent(cleanPlate)}/match`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Kenteken niet gevonden");
        return;
      }

      setResult(data);
    } catch {
      setError("Fout bij ophalen voertuiggegevens");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLookup();
    }
  };

  const handleViewProducts = () => {
    if (!result) return;

    if (selectedModelOverride && result.match.makeId) {
      const params = new URLSearchParams();
      params.set('vehicleMakeId', result.match.makeId);
      params.set('vehicleModelId', selectedModelOverride);
      if (result.vehicle.bouwjaar) params.set('vehicleYear', result.vehicle.bouwjaar.toString());
      setLocation(`/webshop?${params.toString()}`);
    } else {
      setLocation(result.shopUrl);
    }
  };

  const isCompact = variant === 'compact';

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <MagnifyingGlass className="w-4 h-4 text-[#d0a760]" />
        <span className="text-white/80 text-sm font-medium tracking-wide uppercase">Zoek op kenteken</span>
      </div>

      <div className="flex gap-2">
        <Input
          value={plate}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Bijv. AB-123-C"
          className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/40 focus:border-[#d0a760] rounded-none uppercase tracking-wider font-medium h-12"
          maxLength={10}
        />
        <Button
          type="button"
          onClick={handleLookup}
          disabled={isLoading || plate.replace(/[-\s]/g, '').length < 4}
          className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none px-5 h-12 shrink-0"
        >
          {isLoading ? (
            <SpinnerGap className="h-4 w-4 animate-spin" />
          ) : (
            <MagnifyingGlass className="h-4 w-4" />
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-3 text-red-400 text-sm">
          <WarningCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <Card className="mt-4 bg-white/5 backdrop-blur-sm border-white/10 rounded-none">
          <CardContent className={isCompact ? "p-4" : "p-6"}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#d0a760]/10 flex items-center justify-center">
                <Car className="w-5 h-5 text-[#d0a760]" />
              </div>
              <div>
                <p className="text-white font-medium">
                  {result.vehicle.merk} {result.vehicle.model}
                </p>
                <p className="text-white/50 text-sm">
                  {result.vehicle.bouwjaar}{result.vehicle.brandstof ? ` • ${result.vehicle.brandstof}` : ''}{result.vehicle.kleur ? ` • ${result.vehicle.kleur}` : ''}
                </p>
              </div>
            </div>

            {result.match.confidence !== 'none' && result.productCount > 0 ? (
              <div>
                <div className="flex flex-col gap-1.5 mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="text-emerald-400 text-sm font-medium">
                      {result.productCount} product{result.productCount !== 1 ? 'en' : ''} gevonden
                    </span>
                  </div>
                  {result.modelSpecificCount > 0 && result.makeCompatibleCount > 0 && (
                    <p className="text-white/50 text-xs ml-6">
                      {result.modelSpecificCount} specifiek voor {result.match.modelName || result.vehicle.model}
                      {' • '}
                      {result.makeCompatibleCount} passend voor {result.match.makeName || result.vehicle.merk}
                    </p>
                  )}
                </div>

                {(result.match.confidence === 'make_only' || result.match.confidence === 'partial') && (
                  <div className="mb-3">
                    <div className="flex items-start gap-2 mb-2">
                      <Info className="h-3.5 w-3.5 text-[#d0a760] shrink-0 mt-0.5" />
                      <span className="text-white/60 text-xs">
                        {result.match.confidence === 'make_only'
                          ? `We hebben producten gevonden voor ${result.match.makeName}. Selecteer hieronder je exacte model voor nauwkeurigere resultaten.`
                          : `We hebben je auto herkend als ${result.match.makeName} ${result.match.modelName}. Selecteer een ander model als dit niet klopt.`
                        }
                      </span>
                    </div>
                    <Select value={selectedModelOverride} onValueChange={setSelectedModelOverride} disabled={modelsLoading}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-none h-10 focus:border-[#d0a760]">
                        <SelectValue placeholder={modelsLoading ? "Laden..." : (result.match.modelName || "Selecteer model")} />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-700 rounded-none max-h-64">
                        {vehicleModels.map((model) => (
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
                  </div>
                )}

                <Button
                  onClick={handleViewProducts}
                  className="w-full bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none h-11 font-medium"
                >
                  Bekijk producten
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : result.match.confidence !== 'none' && result.productCount === 0 ? (
              <div>
                <p className="text-white/60 text-sm mb-3">
                  We hebben je auto herkend, maar er zijn momenteel geen specifieke producten beschikbaar. Bekijk ons volledige assortiment.
                </p>
                <Button
                  onClick={() => setLocation('/webshop')}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 rounded-none h-11"
                >
                  Bekijk volledig assortiment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-white/60 text-sm mb-3">
                  Helaas hebben we nog geen specifieke producten voor jouw auto. Bekijk ons volledige assortiment of neem contact op.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setLocation('/webshop')}
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10 rounded-none h-11"
                  >
                    Assortiment
                  </Button>
                  <Button
                    onClick={() => setLocation('/contact')}
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10 rounded-none h-11"
                  >
                    Contact
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
