import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertQuoteRequestSchema } from "@shared/schema";
import { z } from "zod";

const quoteFormSchema = insertQuoteRequestSchema.extend({
  vehicleYear: z.number().min(1990).max(new Date().getFullYear() + 1),
});

type QuoteFormData = z.infer<typeof quoteFormSchema>;

export function QuoteForm() {
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
  });

  const createQuoteMutation = useMutation({
    mutationFn: async (data: QuoteFormData) => {
      await apiRequest("POST", "/api/quote-requests", data);
    },
    onSuccess: () => {
      toast({
        title: "Offerte aanvraag verzonden",
        description: "We nemen binnen 24 uur contact met je op.",
      });
      reset();
    },
    onError: (error) => {
      toast({
        title: "Fout bij verzenden",
        description: "Probeer het later opnieuw.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QuoteFormData) => {
    createQuoteMutation.mutate(data);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <Card className="bg-card border-border" data-testid="quote-form">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-card-foreground mb-4">Vraag een offerte aan</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              {...register("firstName")}
              placeholder="Voornaam"
              className="bg-input border-border"
              data-testid="input-first-name"
            />
            <Input
              {...register("lastName")}
              placeholder="Achternaam"
              className="bg-input border-border"
              data-testid="input-last-name"
            />
          </div>
          
          <Input
            {...register("email")}
            type="email"
            placeholder="E-mailadres"
            className="bg-input border-border"
            data-testid="input-email"
          />
          
          <Input
            {...register("phone")}
            type="tel"
            placeholder="Telefoonnummer"
            className="bg-input border-border"
            data-testid="input-phone"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              {...register("vehicleMake")}
              placeholder="Voertuigmerk"
              className="bg-input border-border"
              data-testid="input-vehicle-make"
            />
            <Input
              {...register("vehicleModel")}
              placeholder="Model"
              className="bg-input border-border"
              data-testid="input-vehicle-model"
            />
            <Select onValueChange={(value) => setValue("vehicleYear", parseInt(value))}>
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
          </div>
          
          <Textarea
            {...register("description")}
            placeholder="Beschrijf je wensen (optioneel)"
            rows={3}
            className="bg-input border-border"
            data-testid="textarea-description"
          />
          
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={createQuoteMutation.isPending}
            data-testid="button-submit-quote"
          >
            {createQuoteMutation.isPending ? "Verzenden..." : "Gratis Offerte Aanvragen"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
