import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { nl } from "date-fns/locale";

interface Service {
  id: string;
  name: string;
  duration: string;
  price: string;
}

const services: Service[] = [
  { id: "radio", name: "Autoradio Installatie", duration: "2-3 uur", price: "vanaf €89" },
  { id: "speakers", name: "Speaker Upgrade", duration: "3-4 uur", price: "vanaf €129" },
  { id: "complete", name: "Complete Audio Systeem", duration: "6-8 uur", price: "vanaf €299" },
  { id: "custom", name: "Custom Offerte", duration: "Op maat gemaakt", price: "systeem" },
];

export function BookingCalendar() {
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { toast } = useToast();

  const { data: availableSlots } = useQuery({
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

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(""); // Reset time when date changes
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
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Service Selection */}
            <div>
              <h3 className="text-xl font-semibold text-card-foreground mb-6">Selecteer Service</h3>
              
              <RadioGroup value={selectedService} onValueChange={setSelectedService} className="space-y-3">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center space-x-3 p-4 border border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={service.id} id={service.id} data-testid={`radio-service-${service.id}`} />
                    <Label htmlFor={service.id} className="flex-1 cursor-pointer">
                      <p className="font-medium text-card-foreground">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{service.duration} • {service.price}</p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Calendar */}
            <div>
              <h3 className="text-xl font-semibold text-card-foreground mb-6">Beschikbare Tijden</h3>
              
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-card-foreground" data-testid="calendar-month">
                  {format(currentMonth, "MMMM yyyy", { locale: nl })}
                </h4>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    data-testid="button-previous-month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    data-testid="button-next-month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((day) => (
                  <div key={day} className="text-center text-sm text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
                
                {monthDays.map((date) => {
                  const isSelected = selectedDate && isSameDay(date, selectedDate);
                  const isToday = isSameDay(date, new Date());
                  const isPast = date < new Date();
                  
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => !isPast && handleDateSelect(date)}
                      disabled={isPast}
                      className={`text-center p-2 rounded-lg transition-colors ${
                        isPast
                          ? "text-muted-foreground cursor-not-allowed"
                          : isSelected
                          ? "bg-primary text-primary-foreground"
                          : isToday
                          ? "bg-secondary text-foreground font-medium"
                          : "bg-muted hover:bg-primary hover:text-primary-foreground"
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
                <div className="space-y-2" data-testid="time-slots">
                  <h4 className="font-medium text-card-foreground mb-3">
                    Beschikbare tijden - {format(selectedDate, "d MMMM", { locale: nl })}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots?.map((time: string) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                        className="justify-center"
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
                  className="w-full mt-6"
                  size="lg"
                  disabled={bookingMutation.isPending}
                  data-testid="button-confirm-booking"
                >
                  {bookingMutation.isPending ? "Bezig met boeken..." : "Bevestig Afspraak"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
