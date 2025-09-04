import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { 
  Package, 
  Calendar, 
  FileText, 
  User, 
  Phone,
  Mail,
  MapPin,
  Clock,
  Euro,
  Car,
  CheckCircle,
  AlertCircle,
  Download
} from "lucide-react";
import type { Order, Booking } from "@shared/schema";

export default function CustomerPortal() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Inloggen vereist",
        description: "U wordt doorgestuurd naar de inlogpagina...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch user's orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/my-orders"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Fetch user's bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/my-bookings"],
    enabled: isAuthenticated,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "processing":
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "pending":
      case "pending_scheduling":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "processing":
      case "confirmed":
        return <Clock className="h-4 w-4" />;
      case "pending":
      case "pending_scheduling":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Header onCartClick={() => setIsCartOpen(true)} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="flex-grow">
        {/* Header */}
        <section className="bg-gradient-to-r from-gray-50 to-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welkom terug, {user?.firstName || 'klant'}!
                </h1>
                <p className="text-xl text-gray-600">
                  Bekijk uw bestellingen, afspraken en accountgegevens
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Klant sinds</p>
                <p className="font-semibold text-gray-900">
                  {user?.createdAt && format(new Date(user.createdAt), "MMMM yyyy", { locale: nl })}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs defaultValue="orders" className="space-y-8">
              <TabsList className="grid w-full lg:w-auto lg:inline-grid lg:grid-cols-4">
                <TabsTrigger value="orders" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Bestellingen
                </TabsTrigger>
                <TabsTrigger value="bookings" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Afspraken
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Account
                </TabsTrigger>
                <TabsTrigger value="support" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Support
                </TabsTrigger>
              </TabsList>

              {/* Orders Tab */}
              <TabsContent value="orders" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-[#d0a760]" />
                      Mijn Bestellingen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ordersLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                      </div>
                    ) : orders && orders.length > 0 ? (
                      <div className="space-y-4">
                        {orders.map((order: Order) => (
                          <Card key={order.id} className="border border-gray-200">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h3 className="font-semibold text-lg">
                                    Bestelling #{order.orderNumber}
                                  </h3>
                                  <p className="text-gray-600">
                                    {format(new Date(order.createdAt), "d MMMM yyyy", { locale: nl })}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <Badge className={getStatusColor(order.status)}>
                                    {getStatusIcon(order.status)}
                                    <span className="ml-1 capitalize">{order.status}</span>
                                  </Badge>
                                  <p className="text-lg font-semibold text-gray-900 mt-1">
                                    €{order.totalAmount}
                                  </p>
                                </div>
                              </div>
                              
                              {order.notes && (
                                <div className="mb-4">
                                  <p className="text-sm text-gray-600">{order.notes}</p>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  data-testid={`button-view-order-${order.id}`}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Details bekijken
                                </Button>
                                {order.status === "delivered" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    data-testid={`button-download-invoice-${order.id}`}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Factuur downloaden
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Nog geen bestellingen
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Ontdek onze premium car audio producten en plaats uw eerste bestelling.
                        </p>
                        <Button
                          className="bg-[#d0a760] hover:bg-[#b8954e]"
                          data-testid="button-shop-now"
                        >
                          Bekijk producten
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Bookings Tab */}
              <TabsContent value="bookings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-[#d0a760]" />
                      Mijn Afspraken
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bookingsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                      </div>
                    ) : bookings && bookings.length > 0 ? (
                      <div className="space-y-4">
                        {bookings.map((booking: Booking) => (
                          <Card key={booking.id} className="border border-gray-200">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h3 className="font-semibold text-lg">
                                    {booking.serviceType === "installation" ? "Installatie" : booking.serviceType}
                                  </h3>
                                  <p className="text-gray-600">
                                    {format(new Date(booking.scheduledDate), "d MMMM yyyy 'om' HH:mm", { locale: nl })}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <Badge className={getStatusColor(booking.status)}>
                                    {getStatusIcon(booking.status)}
                                    <span className="ml-1 capitalize">{booking.status}</span>
                                  </Badge>
                                  {booking.totalCost && (
                                    <p className="text-lg font-semibold text-gray-900 mt-1">
                                      €{booking.totalCost}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Voertuig</p>
                                  <p className="text-gray-600">
                                    {booking.vehicleMake} {booking.vehicleModel} ({booking.vehicleYear})
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Duur</p>
                                  <p className="text-gray-600">{booking.duration} uur</p>
                                </div>
                              </div>

                              {booking.notes && (
                                <div className="mb-4">
                                  <p className="text-sm font-medium text-gray-900">Opmerkingen</p>
                                  <p className="text-sm text-gray-600">{booking.notes}</p>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  data-testid={`button-reschedule-${booking.id}`}
                                >
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Verzetten
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  data-testid={`button-contact-about-${booking.id}`}
                                >
                                  <Phone className="h-4 w-4 mr-2" />
                                  Contact
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Nog geen afspraken
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Boek een installatie-afspraak bij uw volgende bestelling.
                        </p>
                        <Button
                          className="bg-[#d0a760] hover:bg-[#b8954e]"
                          data-testid="button-book-appointment"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Afspraak maken
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Account Tab */}
              <TabsContent value="account" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-[#d0a760]" />
                      Accountgegevens
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Persoonlijke informatie</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{user?.firstName} {user?.lastName}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{user?.email}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Account instellingen</h3>
                        <div className="space-y-3">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            data-testid="button-edit-profile"
                          >
                            <User className="h-4 w-4 mr-2" />
                            Profiel bewerken
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            data-testid="button-change-password"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Wachtwoord wijzigen
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Support Tab */}
              <TabsContent value="support" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[#d0a760]" />
                      Hulp & Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Heeft u vragen?</h3>
                        <p className="text-gray-600">
                          Ons team staat klaar om u te helpen met al uw vragen over 
                          bestellingen, installaties en producten.
                        </p>
                        <div className="space-y-3">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            data-testid="button-contact-support"
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Bel ons: 047 563 63 63
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            data-testid="button-email-support"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            E-mail: info@caraudiolimburg.shop
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Handige links</h3>
                        <div className="space-y-3">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            data-testid="button-faq"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Veelgestelde vragen
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            data-testid="button-warranty"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Garantie informatie
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            data-testid="button-terms"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Algemene voorwaarden
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}