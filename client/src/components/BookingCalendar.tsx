import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CaretLeft, CaretRight, Car, Wrench, Trophy, Users, CheckCircle, Clock, WarningCircle, CalendarCheck, SpinnerGap } from "@phosphor-icons/react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from "date-fns";
import { nl } from "date-fns/locale";

interface Service {
  id: string;
  name: string;
  duration: string;
  price: string;
  icon: typeof Car;
}

const services: Service[] = [
  { id: "radio", name: "Autoradio Installatie", duration: "2-3 uur", price: "vanaf €89", icon: Car },
  { id: "speakers", name: "Speaker Upgrade", duration: "3-4 uur", price: "vanaf €129", icon: Wrench },
  { id: "complete", name: "Complete Audio Systeem", duration: "6-8 uur", price: "vanaf €299", icon: Trophy },
  { id: "custom", name: "Custom Offerte", duration: "Op maat gemaakt", price: "systeem", icon: Users },
];

export function BookingCalendar() {
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { toast } = useToast();

  const { data: availableSlots } = useQuery<string[]>({
    queryKey: ["/api/available-slots", selectedDate ? format(selectedDate, "yyyy-MM-dd") : "", selectedService],
    enabled: !!selectedDate && !!selectedService,
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/bookings", data);
    },
    onSuccess: () => {
      toast({
        title: "✓ Afspraak succesvol geboekt!",
        description: (
          <div className="flex flex-col gap-1">
            <p>Je installatie-afspraak is bevestigd.</p>
            <p className="text-xs text-muted-foreground">Je ontvangt een bevestiging per e-mail met alle details.</p>
          </div>
        ),
      });
      setSelectedService("");
      setSelectedDate(null);
      setSelectedTime("");
    },
    onError: () => {
      toast({
        title: "⚠ Fout bij boeken",
        description: (
          <div className="flex flex-col gap-1">
            <p>Er ging iets mis. Probeer het later opnieuw.</p>
            <a href="tel:0852733625" className="text-[#d0a760] hover:underline font-medium">
              Of bel ons: 085 - 27 33 625
            </a>
          </div>
        ),
        variant: "destructive",
      });
    },
  });

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const firstDayOfMonth = getDay(startOfMonth(currentMonth));
  const emptyDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime("");
  };

  const handleBooking = () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      toast({
        title: "Incomplete gegevens",
        description: "Selecteer een service, datum en tijd.",
        variant: "destructive",
      });
      return;
    }

    const bookingDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(":").map(Number);
    bookingDateTime.setHours(hours, minutes);

    bookingMutation.mutate({
      serviceType: selectedService,
      scheduledDate: bookingDateTime.toISOString(),
      duration: selectedService === "complete" ? 8 : selectedService === "speakers" ? 4 : 3,
      status: "pending",
    });
  };

  const getStepStatus = (step: number) => {
    if (step === 1) return selectedService ? "complete" : "current";
    if (step === 2) return selectedDate ? "complete" : selectedService ? "current" : "pending";
    if (step === 3) return selectedTime ? "complete" : (selectedDate && selectedService) ? "current" : "pending";
    return "pending";
  };

  const selectedServiceData = services.find(s => s.id === selectedService);

  return (
    <div className="max-w-4xl mx-auto" data-testid="booking-calendar">
      <div className="bg-black border border-zinc-800">
        {/* Step Indicators */}
        <div className="border-b border-zinc-800 p-4 md:p-6">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[
              { step: 1, label: "Service", icon: Car },
              { step: 2, label: "Datum", icon: CalendarCheck },
              { step: 3, label: "Tijd", icon: Clock }
            ].map(({ step, label, icon: Icon }, index) => {
              const status = getStepStatus(step);
              return (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 flex items-center justify-center border-2 transition-all duration-300 ${
                      status === "complete" 
                        ? "bg-[#d0a760] border-[#d0a760] text-black" 
                        : status === "current"
                        ? "border-[#d0a760] text-[#d0a760] bg-[#d0a760]/10"
                        : "border-zinc-700 text-zinc-600 bg-zinc-900"
                    }`}>
                      {status === "complete" ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${
                      status === "complete" || status === "current" 
                        ? "text-white" 
                        : "text-zinc-600"
                    }`}>
                      {label}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className={`w-12 md:w-20 h-0.5 mx-2 transition-all duration-300 ${
                      getStepStatus(step + 1) === "complete" || getStepStatus(step + 1) === "current"
                        ? "bg-[#d0a760]"
                        : "bg-zinc-800"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Service Selection */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#d0a760] text-black text-sm flex items-center justify-center font-bold">1</span>
                Selecteer Service
              </h3>
              <p className="text-white/50 text-sm mb-6">Kies de service die je wilt boeken</p>
              
              <RadioGroup value={selectedService} onValueChange={setSelectedService} className="space-y-3">
                {services.map((service) => {
                  const Icon = service.icon;
                  const isSelected = selectedService === service.id;
                  return (
                    <div 
                      key={service.id} 
                      className={`flex items-center gap-4 p-4 border cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? "border-[#d0a760] bg-[#d0a760]/10" 
                          : "border-zinc-800 hover:border-zinc-700 bg-zinc-950"
                      }`}
                    >
                      <RadioGroupItem 
                        value={service.id} 
                        id={service.id} 
                        data-testid={`radio-service-${service.id}`}
                        className="border-zinc-600 data-[state=checked]:border-[#d0a760] data-[state=checked]:bg-[#d0a760]"
                      />
                      <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "bg-[#d0a760]/20" : "bg-zinc-900"
                      }`}>
                        <Icon className={`w-5 h-5 ${isSelected ? "text-[#d0a760]" : "text-white/60"}`} />
                      </div>
                      <Label htmlFor={service.id} className="flex-1 cursor-pointer">
                        <p className="font-medium text-white">{service.name}</p>
                        <p className="text-sm text-white/50">{service.duration} • {service.price}</p>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Calendar */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#d0a760] text-black text-sm flex items-center justify-center font-bold">2</span>
                Kies Datum & Tijd
              </h3>
              <p className="text-white/50 text-sm mb-6">Selecteer wanneer je langs wilt komen</p>
              
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-white capitalize" data-testid="calendar-month">
                  {format(currentMonth, "MMMM yyyy", { locale: nl })}
                </h4>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="text-white/60 hover:text-white hover:bg-zinc-800 rounded-none w-8 h-8 p-0"
                    data-testid="button-previous-month"
                  >
                    <CaretLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="text-white/60 hover:text-white hover:bg-zinc-800 rounded-none w-8 h-8 p-0"
                    data-testid="button-next-month"
                  >
                    <CaretRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((day) => (
                  <div key={day} className="text-center text-xs text-white/40 p-2 font-medium">
                    {day}
                  </div>
                ))}
                
                {[...Array(emptyDays)].map((_, i) => (
                  <div key={`empty-${i}`} className="p-2" />
                ))}
                
                {monthDays.map((date) => {
                  const isSelected = selectedDate && isSameDay(date, selectedDate);
                  const isToday = isSameDay(date, new Date());
                  const isPast = date < new Date() && !isToday;
                  
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => !isPast && handleDateSelect(date)}
                      disabled={isPast}
                      className={`text-center p-2 text-sm transition-all duration-150 ${
                        isPast
                          ? "text-white/20 cursor-not-allowed"
                          : isSelected
                          ? "bg-[#d0a760] text-black font-medium"
                          : isToday
                          ? "bg-zinc-800 text-[#d0a760] font-medium border border-[#d0a760]/50"
                          : "text-white/80 bg-zinc-900 hover:bg-[#d0a760]/20 hover:text-[#d0a760]"
                      }`}
                      data-testid={`calendar-day-${format(date, "yyyy-MM-dd")}`}
                    >
                      {format(date, "d")}
                    </button>
                  );
                })}
              </div>

              {/* Time Slots */}
              {selectedDate && selectedService && (
                <div className="space-y-3 mt-6" data-testid="time-slots">
                  <h4 className="font-medium text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#d0a760] text-black text-xs flex items-center justify-center font-bold">3</span>
                    Tijden voor {format(selectedDate, "d MMMM", { locale: nl })}
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {(availableSlots && availableSlots.length > 0 ? availableSlots : ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"]).map((time: string) => (
                      <Button
                        key={time}
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                        className={`justify-center transition-all duration-200 rounded-none h-11 ${
                          selectedTime === time 
                            ? "bg-[#d0a760] text-black hover:bg-[#d0a760]/90 ring-2 ring-[#d0a760]/50" 
                            : "bg-zinc-900 text-white/80 hover:bg-[#d0a760]/20 hover:text-[#d0a760] hover:border-[#d0a760]/50 border border-zinc-800"
                        }`}
                        data-testid={`button-time-${time}`}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking Summary */}
              {selectedService && selectedDate && selectedTime && (
                <div className="mt-8 space-y-4">
                  <div className="bg-zinc-900 border border-zinc-800 p-4">
                    <h4 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#d0a760]" />
                      Overzicht van je boeking
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                        <span className="text-white/60 text-sm">Service</span>
                        <span className="text-white font-medium">{selectedServiceData?.name}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                        <span className="text-white/60 text-sm">Datum</span>
                        <span className="text-white font-medium">{format(selectedDate, "d MMMM yyyy", { locale: nl })}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                        <span className="text-white/60 text-sm">Tijd</span>
                        <span className="text-white font-medium">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-white/60 text-sm">Geschatte duur</span>
                        <span className="text-[#d0a760] font-medium">{selectedServiceData?.duration}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleBooking}
                    className="w-full bg-[#d0a760] text-black hover:bg-[#b8954e] rounded-none py-6 font-medium transition-all duration-300 group disabled:opacity-70"
                    size="lg"
                    disabled={bookingMutation.isPending}
                    data-testid="button-confirm-booking"
                  >
                    {bookingMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <SpinnerGap className="w-5 h-5 animate-spin" />
                        Bezig met boeken...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <CalendarCheck className="w-5 h-5 transition-transform group-hover:scale-110" />
                        Bevestig Afspraak
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
