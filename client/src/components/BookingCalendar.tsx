import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ChevronLeft, ChevronRight, Car, Wrench, Award, Users } from "lucide-react";
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
  { id: "complete", name: "Complete Audio Systeem", duration: "6-8 uur", price: "vanaf €299", icon: Award },
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
        title: "Afspraak geboekt",
        description: "Je installatie-afspraak is bevestigd. Je ontvangt een bevestiging per email.",
      });
    },
    onError: () => {
      toast({
        title: "Fout bij boeken",
        description: "Probeer het later opnieuw.",
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

  return (
    <div className="max-w-4xl mx-auto" data-testid="booking-calendar">
      <div className="bg-black border border-zinc-800">
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Service Selection */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-6">Selecteer Service</h3>
              
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
              <h3 className="text-xl font-semibold text-white mb-6">Kies Datum & Tijd</h3>
              
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
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="text-white/60 hover:text-white hover:bg-zinc-800 rounded-none w-8 h-8 p-0"
                    data-testid="button-next-month"
                  >
                    <ChevronRight className="w-4 h-4" />
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
                  <h4 className="font-medium text-white">
                    Tijden voor {format(selectedDate, "d MMMM", { locale: nl })}
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {(availableSlots && availableSlots.length > 0 ? availableSlots : ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"]).map((time: string) => (
                      <Button
                        key={time}
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                        className={`justify-center transition-all duration-150 rounded-none ${
                          selectedTime === time 
                            ? "bg-[#d0a760] text-black hover:bg-[#d0a760]/90" 
                            : "bg-zinc-900 text-white/80 hover:bg-zinc-800 hover:text-white border border-zinc-800"
                        }`}
                        data-testid={`button-time-${time}`}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {selectedService && selectedDate && selectedTime && (
                <Button 
                  onClick={handleBooking}
                  className="w-full mt-8 bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none py-6 font-medium"
                  size="lg"
                  disabled={bookingMutation.isPending}
                  data-testid="button-confirm-booking"
                >
                  {bookingMutation.isPending ? "Bezig met boeken..." : "Bevestig Afspraak"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
