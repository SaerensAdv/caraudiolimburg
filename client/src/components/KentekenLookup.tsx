import { useState, type ChangeEvent, type KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface KentekenLookupProps {
  onResult: (data: {
    merk: string;
    model: string;
    bouwjaar: number;
    kenteken: string;
    brandstof?: string;
    kleur?: string;
  }) => void;
  className?: string;
}

export function KentekenLookup({ onResult, className = "" }: KentekenLookupProps) {
  const [plate, setPlate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ merk: string; model: string; bouwjaar: number } | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setPlate(value);
    setError(null);
    setResult(null);
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

    try {
      const response = await fetch(`/api/rdw/kenteken/${encodeURIComponent(cleanPlate)}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Kenteken niet gevonden");
        return;
      }

      setResult({ merk: data.merk, model: data.model, bouwjaar: data.bouwjaar });
      onResult({
        merk: data.merk || "",
        model: data.model || "",
        bouwjaar: data.bouwjaar || 0,
        kenteken: data.kenteken || cleanPlate,
        brandstof: data.brandstof || undefined,
        kleur: data.kleur || undefined,
      });
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

  return (
    <div className={className}>
      <div className="flex gap-2">
        <Input
          value={plate}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Kenteken (bijv. AB-123-C)"
          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-white/40 focus:border-[#d0a760] rounded-none uppercase tracking-wider font-medium"
          maxLength={10}
        />
        <Button
          type="button"
          onClick={handleLookup}
          disabled={isLoading || plate.replace(/[-\s]/g, '').length < 4}
          className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none px-4 shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="flex items-center gap-2 mt-2 text-emerald-400 text-sm">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span>{result.merk} {result.model} ({result.bouwjaar})</span>
        </div>
      )}
    </div>
  );
}
