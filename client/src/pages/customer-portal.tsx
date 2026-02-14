import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
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
  Download,
  ChevronDown,
  ChevronRight,
  Settings,
  LogOut,
  Shield,
  CreditCard,
  Truck,
  ExternalLink,
  HelpCircle,
  MessageCircle,
  ArrowRight,
  Heart,
  Trash2,
  X,
  Edit,
  Send
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Order, Booking, Product, Wishlist, OrderItem } from "@shared/schema";

export default function CustomerPortal() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();

  // Order details state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);

  // Booking modify/cancel state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isBookingEditOpen, setIsBookingEditOpen] = useState(false);
  const [isBookingCancelOpen, setIsBookingCancelOpen] = useState(false);
  const [bookingEditDate, setBookingEditDate] = useState<Date | undefined>();
  const [bookingEditNotes, setBookingEditNotes] = useState("");

  // Profile edit state
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [profileFirstName, setProfileFirstName] = useState("");
  const [profileLastName, setProfileLastName] = useState("");

  // Support form state
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");

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

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/my-orders"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/my-bookings"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: wishlistItems, isLoading: wishlistLoading } = useQuery<(Wishlist & { product: Product })[]>({
    queryKey: ["/api/wishlist"],
    enabled: isAuthenticated,
    retry: false,
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("DELETE", `/api/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Verwijderd uit favorieten",
        description: "Het product is verwijderd uit je favorieten.",
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Kon product niet verwijderen uit favorieten.",
        variant: "destructive",
      });
    },
  });

  // Order details query
  const { data: orderDetails, isLoading: orderDetailsLoading } = useQuery<{
    order: Order;
    items: (OrderItem & { product: { id: string; name: string; price: string; images: string[] } })[];
  }>({
    queryKey: ['/api/orders', selectedOrderId],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${selectedOrderId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch order details');
      return res.json();
    },
    enabled: !!selectedOrderId && isOrderDetailOpen,
  });

  // Booking update mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ bookingId, updates }: { bookingId: string; updates: { scheduledDate?: string; notes?: string } }) => {
      await apiRequest("PATCH", `/api/bookings/${bookingId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-bookings"] });
      setIsBookingEditOpen(false);
      toast({ title: "Afspraak bijgewerkt", description: "Je afspraak is succesvol aangepast." });
    },
    onError: () => {
      toast({ title: "Fout", description: "Kon afspraak niet bijwerken.", variant: "destructive" });
    },
  });

  // Booking cancel mutation
  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      await apiRequest("PATCH", `/api/bookings/${bookingId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-bookings"] });
      setIsBookingCancelOpen(false);
      toast({ title: "Afspraak geannuleerd", description: "Je afspraak is geannuleerd." });
    },
    onError: () => {
      toast({ title: "Fout", description: "Kon afspraak niet annuleren.", variant: "destructive" });
    },
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: { firstName?: string; lastName?: string }) => {
      await apiRequest("PATCH", "/api/users/profile", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsProfileEditOpen(false);
      toast({ title: "Profiel bijgewerkt", description: "Je gegevens zijn opgeslagen." });
    },
    onError: () => {
      toast({ title: "Fout", description: "Kon profiel niet bijwerken.", variant: "destructive" });
    },
  });

  // Support contact mutation
  const submitSupportMutation = useMutation({
    mutationFn: async (data: { subject: string; message: string }) => {
      await apiRequest("POST", "/api/support-contact", data);
    },
    onSuccess: () => {
      setSupportSubject("");
      setSupportMessage("");
      toast({ title: "Bericht verzonden", description: "We nemen zo snel mogelijk contact met je op." });
    },
    onError: () => {
      toast({ title: "Fout", description: "Kon bericht niet verzenden.", variant: "destructive" });
    },
  });

  // Helper functions
  const openOrderDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsOrderDetailOpen(true);
  };

  const openBookingEdit = (booking: Booking) => {
    setSelectedBooking(booking);
    setBookingEditDate(new Date(booking.scheduledDate));
    setBookingEditNotes(booking.notes || "");
    setIsBookingEditOpen(true);
  };

  const openBookingCancel = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsBookingCancelOpen(true);
  };

  const openProfileEdit = () => {
    setProfileFirstName(user?.firstName || "");
    setProfileLastName(user?.lastName || "");
    setIsProfileEditOpen(true);
  };

  const handleBookingUpdate = () => {
    if (!selectedBooking || !bookingEditDate) return;
    updateBookingMutation.mutate({
      bookingId: selectedBooking.id,
      updates: {
        scheduledDate: bookingEditDate.toISOString(),
        notes: bookingEditNotes,
      },
    });
  };

  const handleProfileUpdate = () => {
    updateProfileMutation.mutate({
      firstName: profileFirstName,
      lastName: profileLastName,
    });
  };

  const handleSupportSubmit = () => {
    if (!supportSubject || !supportMessage) {
      toast({ title: "Fout", description: "Vul alle velden in.", variant: "destructive" });
      return;
    }
    submitSupportMutation.mutate({ subject: supportSubject, message: supportMessage });
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#d0a760] border-t-transparent rounded-none" style={{ borderRadius: 0 }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getStatusColor = (status: string | null) => {
    if (!status) return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    switch (status) {
      case "completed":
      case "delivered":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "processing":
      case "confirmed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "pending":
      case "pending_scheduling":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "shipped":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    }
  };

  const getStatusLabel = (status: string | null) => {
    if (!status) return "-";
    const labels: Record<string, string> = {
      pending: "In afwachting",
      processing: "In verwerking",
      confirmed: "Bevestigd",
      shipped: "Verzonden",
      delivered: "Afgeleverd",
      completed: "Voltooid",
      cancelled: "Geannuleerd",
      pending_scheduling: "Inplannen",
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string | null) => {
    if (!status) return <Package className="h-3.5 w-3.5" />;
    switch (status) {
      case "completed":
      case "delivered":
        return <CheckCircle className="h-3.5 w-3.5" />;
      case "processing":
      case "confirmed":
        return <Clock className="h-3.5 w-3.5" />;
      case "pending":
      case "pending_scheduling":
        return <AlertCircle className="h-3.5 w-3.5" />;
      case "shipped":
        return <Truck className="h-3.5 w-3.5" />;
      default:
        return <Package className="h-3.5 w-3.5" />;
    }
  };

  const accountStats = {
    totalOrders: orders?.length || 0,
    totalBookings: bookings?.length || 0,
    memberSince: user?.createdAt ? format(new Date(user.createdAt), "MMMM yyyy", { locale: nl }) : "-",
  };

  return (
    <div className="min-h-screen bg-black">
      <Header onCartOpen={() => setIsCartOpen(true)} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="pt-20">
        {/* Account Header */}
        <section className="bg-zinc-950 border-b border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                  <User className="w-8 h-8 md:w-10 md:h-10 text-[#d0a760]" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-light text-white mb-1">
                    Welkom, <span className="text-[#d0a760]">{user?.firstName || 'klant'}</span>
                  </h1>
                  <p className="text-zinc-400 text-sm md:text-base">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 md:gap-6">
                <div className="bg-zinc-900/50 border border-zinc-800 px-4 py-3 min-w-[100px]">
                  <p className="text-[#d0a760] text-2xl font-light">{accountStats.totalOrders}</p>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider">Bestellingen</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 px-4 py-3 min-w-[100px]">
                  <p className="text-[#d0a760] text-2xl font-light">{accountStats.totalBookings}</p>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider">Afspraken</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 px-4 py-3 min-w-[100px] hidden sm:block">
                  <p className="text-white text-sm font-light">{accountStats.memberSince}</p>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider">Klant sinds</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation & Content */}
        <section className="bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Navigation - Desktop */}
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <nav className="sticky top-28 space-y-1">
                  <button
                    onClick={() => setActiveTab("orders")}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                      activeTab === "orders"
                        ? "bg-zinc-900 border-l-2 border-[#d0a760] text-white"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                    }`}
                    data-testid="nav-orders"
                  >
                    <Package className="w-5 h-5" />
                    <span>Bestellingen</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("bookings")}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                      activeTab === "bookings"
                        ? "bg-zinc-900 border-l-2 border-[#d0a760] text-white"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                    }`}
                    data-testid="nav-bookings"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Afspraken</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("favorites")}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                      activeTab === "favorites"
                        ? "bg-zinc-900 border-l-2 border-[#d0a760] text-white"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                    }`}
                    data-testid="nav-favorites"
                  >
                    <Heart className="w-5 h-5" />
                    <span>Favorieten</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("account")}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                      activeTab === "account"
                        ? "bg-zinc-900 border-l-2 border-[#d0a760] text-white"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                    }`}
                    data-testid="nav-account"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Account</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("support")}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                      activeTab === "support"
                        ? "bg-zinc-900 border-l-2 border-[#d0a760] text-white"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                    }`}
                    data-testid="nav-support"
                  >
                    <HelpCircle className="w-5 h-5" />
                    <span>Support</span>
                  </button>

                  <Separator className="bg-zinc-800 my-4" />

                  <a
                    href="/api/logout"
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-zinc-500 hover:text-red-400 hover:bg-zinc-900/50 transition-all"
                    data-testid="nav-logout"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Uitloggen</span>
                  </a>
                </nav>
              </aside>

              {/* Mobile Tabs */}
              <div className="lg:hidden">
                <div className="flex overflow-x-auto gap-1 bg-zinc-900 p-1 -mx-4 px-4 scrollbar-hide">
                  <button
                    onClick={() => setActiveTab("orders")}
                    className={`flex items-center gap-2 px-4 py-2.5 whitespace-nowrap transition-all ${
                      activeTab === "orders"
                        ? "bg-[#d0a760] text-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                    data-testid="mobile-nav-orders"
                  >
                    <Package className="w-4 h-4" />
                    <span className="text-sm">Bestellingen</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("bookings")}
                    className={`flex items-center gap-2 px-4 py-2.5 whitespace-nowrap transition-all ${
                      activeTab === "bookings"
                        ? "bg-[#d0a760] text-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                    data-testid="mobile-nav-bookings"
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Afspraken</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("favorites")}
                    className={`flex items-center gap-2 px-4 py-2.5 whitespace-nowrap transition-all ${
                      activeTab === "favorites"
                        ? "bg-[#d0a760] text-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                    data-testid="mobile-nav-favorites"
                  >
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">Favorieten</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("account")}
                    className={`flex items-center gap-2 px-4 py-2.5 whitespace-nowrap transition-all ${
                      activeTab === "account"
                        ? "bg-[#d0a760] text-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                    data-testid="mobile-nav-account"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Account</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("support")}
                    className={`flex items-center gap-2 px-4 py-2.5 whitespace-nowrap transition-all ${
                      activeTab === "support"
                        ? "bg-[#d0a760] text-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                    data-testid="mobile-nav-support"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span className="text-sm">Support</span>
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Orders Tab */}
                {activeTab === "orders" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl md:text-2xl font-light text-white flex items-center gap-3">
                        <Package className="w-6 h-6 text-[#d0a760]" />
                        Mijn Bestellingen
                      </h2>
                      <Link href="/webshop">
                        <Button 
                          className="bg-[#d0a760] text-black hover:bg-[#b8954e] rounded-none text-sm"
                          data-testid="button-new-order"
                        >
                          <span className="hidden sm:inline">Nieuwe bestelling</span>
                          <ArrowRight className="w-4 h-4 sm:ml-2" />
                        </Button>
                      </Link>
                    </div>

                    {ordersLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <div className="w-6 h-6 border-2 border-[#d0a760] border-t-transparent animate-spin" />
                      </div>
                    ) : orders && orders.length > 0 ? (
                      <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-zinc-950 border border-zinc-800 overflow-hidden">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                                <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Bestelling</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Datum</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                                <th className="text-right px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Totaal</th>
                                <th className="text-right px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Acties</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orders.map((order: Order) => (
                                <tr 
                                  key={order.id} 
                                  className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors group"
                                >
                                  <td className="px-6 py-4">
                                    <span className="text-white font-medium">#{order.orderNumber}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-zinc-400">
                                      {order.createdAt ? format(new Date(order.createdAt), "d MMM yyyy", { locale: nl }) : "-"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <Badge className={`${getStatusColor(order.status)} border rounded-none px-2 py-1 text-xs font-medium`}>
                                      {getStatusIcon(order.status)}
                                      <span className="ml-1.5">{getStatusLabel(order.status)}</span>
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <span className="text-[#d0a760] font-medium">€{order.total}</span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-none h-8 px-3"
                                        data-testid={`button-view-order-${order.id}`}
                                        onClick={() => openOrderDetails(order.id)}
                                      >
                                        <FileText className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-zinc-400 hover:text-[#d0a760] hover:bg-zinc-800 rounded-none h-8 px-3"
                                        data-testid={`button-download-invoice-${order.id}`}
                                        onClick={() => window.open(`/api/orders/${order.id}/invoice`, '_blank')}
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                          {orders.map((order: Order) => (
                            <Collapsible
                              key={order.id}
                              open={expandedOrders.has(order.id)}
                              onOpenChange={() => toggleOrderExpand(order.id)}
                            >
                              <div className="bg-zinc-950 border border-zinc-800">
                                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center">
                                      <Package className="w-5 h-5 text-[#d0a760]" />
                                    </div>
                                    <div className="text-left">
                                      <p className="text-white font-medium">#{order.orderNumber}</p>
                                      <p className="text-zinc-500 text-sm">
                                        {order.createdAt ? format(new Date(order.createdAt), "d MMM yyyy", { locale: nl }) : "-"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[#d0a760] font-medium">€{order.total}</span>
                                    <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform ${expandedOrders.has(order.id) ? 'rotate-180' : ''}`} />
                                  </div>
                                </CollapsibleTrigger>
                                
                                <CollapsibleContent>
                                  <div className="px-4 pb-4 pt-0 space-y-4 border-t border-zinc-800">
                                    <div className="flex items-center justify-between pt-4">
                                      <span className="text-zinc-500 text-sm">Status</span>
                                      <Badge className={`${getStatusColor(order.status)} border rounded-none px-2 py-1 text-xs font-medium`}>
                                        {getStatusIcon(order.status)}
                                        <span className="ml-1.5">{getStatusLabel(order.status)}</span>
                                      </Badge>
                                    </div>

                                    {order.notes && (
                                      <div>
                                        <span className="text-zinc-500 text-sm">Opmerkingen</span>
                                        <p className="text-zinc-300 text-sm mt-1">{order.notes}</p>
                                      </div>
                                    )}

                                    <div className="flex gap-2 pt-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-[#d0a760] rounded-none"
                                        data-testid={`button-view-order-mobile-${order.id}`}
                                        onClick={() => openOrderDetails(order.id)}
                                      >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Details
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-[#d0a760] hover:border-[#d0a760] rounded-none"
                                        data-testid={`button-download-invoice-mobile-${order.id}`}
                                        onClick={() => window.open(`/api/orders/${order.id}/invoice`, '_blank')}
                                      >
                                        <Download className="h-4 w-4 mr-2" />
                                        Factuur
                                      </Button>
                                    </div>
                                  </div>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="bg-zinc-950 border border-zinc-800 py-16 px-8 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 bg-zinc-900 flex items-center justify-center">
                          <Package className="w-10 h-10 text-zinc-600" />
                        </div>
                        <h3 className="text-xl font-light text-white mb-2">
                          Nog geen bestellingen
                        </h3>
                        <p className="text-zinc-500 mb-6 max-w-md mx-auto">
                          Ontdek onze premium car audio producten en plaats uw eerste bestelling.
                        </p>
                        <Link href="/webshop">
                          <Button
                            className="bg-[#d0a760] text-black hover:bg-[#b8954e] rounded-none px-8"
                            data-testid="button-shop-now"
                          >
                            Bekijk producten
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Bookings Tab */}
                {activeTab === "bookings" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl md:text-2xl font-light text-white flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-[#d0a760]" />
                        Mijn Afspraken
                      </h2>
                      <Link href="/contact">
                        <Button 
                          className="bg-[#d0a760] text-black hover:bg-[#b8954e] rounded-none text-sm"
                          data-testid="button-new-booking"
                        >
                          <span className="hidden sm:inline">Contact opnemen</span>
                          <Calendar className="w-4 h-4 sm:ml-2" />
                        </Button>
                      </Link>
                    </div>

                    {bookingsLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <div className="w-6 h-6 border-2 border-[#d0a760] border-t-transparent animate-spin" />
                      </div>
                    ) : bookings && bookings.length > 0 ? (
                      <div className="grid gap-4">
                        {bookings.map((booking: Booking) => (
                          <div 
                            key={booking.id} 
                            className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors"
                          >
                            <div className="p-4 md:p-6">
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                <div className="flex items-start gap-4">
                                  <div className="w-12 h-12 bg-zinc-900 flex items-center justify-center flex-shrink-0">
                                    <Car className="w-6 h-6 text-[#d0a760]" />
                                  </div>
                                  <div>
                                    <h3 className="text-white font-medium text-lg">
                                      {booking.serviceType === "installation" ? "Installatie" : booking.serviceType}
                                    </h3>
                                    <p className="text-zinc-400 mt-0.5">
                                      {booking.vehicleMake} {booking.vehicleModel} ({booking.vehicleYear})
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 ml-16 md:ml-0">
                                  <Badge className={`${getStatusColor(booking.status)} border rounded-none px-2 py-1 text-xs font-medium`}>
                                    {getStatusIcon(booking.status)}
                                    <span className="ml-1.5">{getStatusLabel(booking.status)}</span>
                                  </Badge>
                                  {booking.totalCost && (
                                    <span className="text-[#d0a760] font-medium">€{booking.totalCost}</span>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-zinc-800">
                                <div>
                                  <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Datum</p>
                                  <p className="text-white">
                                    {booking.scheduledDate ? format(new Date(booking.scheduledDate), "d MMM yyyy", { locale: nl }) : "-"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Tijd</p>
                                  <p className="text-white">
                                    {booking.scheduledDate ? format(new Date(booking.scheduledDate), "HH:mm", { locale: nl }) : "-"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Duur</p>
                                  <p className="text-white">{booking.duration} uur</p>
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                  <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Auto</p>
                                  <p className="text-white">{booking.vehicleModel || "-"}</p>
                                </div>
                              </div>

                              {booking.notes && (
                                <div className="pt-4 border-t border-zinc-800">
                                  <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Opmerkingen</p>
                                  <p className="text-zinc-300 text-sm">{booking.notes}</p>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-800 mt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-[#d0a760] rounded-none"
                                  data-testid={`button-reschedule-${booking.id}`}
                                  onClick={() => openBookingEdit(booking)}
                                  disabled={booking.status === "cancelled"}
                                >
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Verzetten
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-red-400 hover:border-red-400 rounded-none"
                                  data-testid={`button-cancel-booking-${booking.id}`}
                                  onClick={() => openBookingCancel(booking)}
                                  disabled={booking.status === "cancelled"}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Annuleren
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-[#d0a760] rounded-none"
                                  data-testid={`button-contact-about-${booking.id}`}
                                >
                                  <Phone className="h-4 w-4 mr-2" />
                                  Contact
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-zinc-950 border border-zinc-800 py-16 px-8 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 bg-zinc-900 flex items-center justify-center">
                          <Calendar className="w-10 h-10 text-zinc-600" />
                        </div>
                        <h3 className="text-xl font-light text-white mb-2">
                          Nog geen afspraken
                        </h3>
                        <p className="text-zinc-500 mb-6 max-w-md mx-auto">
                          Boek een installatie-afspraak voor professionele montage van uw audio systeem.
                        </p>
                        <Link href="/contact">
                          <Button
                            className="bg-[#d0a760] text-black hover:bg-[#b8954e] rounded-none px-8"
                            data-testid="button-book-appointment"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Contact opnemen
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Favorites Tab */}
                {activeTab === "favorites" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl md:text-2xl font-light text-white flex items-center gap-3">
                        <Heart className="w-6 h-6 text-[#d0a760]" />
                        Mijn Favorieten
                      </h2>
                      <Link href="/webshop">
                        <Button 
                          className="bg-[#d0a760] text-black hover:bg-[#b8954e] rounded-none text-sm"
                          data-testid="button-browse-products"
                        >
                          <span className="hidden sm:inline">Producten bekijken</span>
                          <ArrowRight className="w-4 h-4 sm:ml-2" />
                        </Button>
                      </Link>
                    </div>

                    {wishlistLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <div className="w-6 h-6 border-2 border-[#d0a760] border-t-transparent animate-spin" />
                      </div>
                    ) : wishlistItems && wishlistItems.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlistItems.map((item) => (
                          <div 
                            key={item.id} 
                            className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors group"
                            data-testid={`wishlist-item-${item.productId}`}
                          >
                            <Link href={`/webshop/${item.product.slug}`}>
                              <div className="aspect-square bg-zinc-900 flex items-center justify-center p-6 relative overflow-hidden">
                                <img 
                                  src={item.product.images?.[item.product.primaryImageIndex || 0] || '/caraudiolimburg-logo.png'} 
                                  alt={item.product.name}
                                  className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                  onError={(e) => {
                                    e.currentTarget.src = '/caraudiolimburg-logo.png';
                                  }}
                                />
                              </div>
                            </Link>
                            <div className="p-4">
                              <Link href={`/webshop/${item.product.slug}`}>
                                <h3 className="text-white font-medium mb-2 group-hover:text-[#d0a760] transition-colors cursor-pointer line-clamp-2" data-testid={`wishlist-product-name-${item.productId}`}>
                                  {item.product.name}
                                </h3>
                              </Link>
                              <p className="text-white/50 text-sm mb-3 line-clamp-2">
                                {item.product.shortDescription || '\u00A0'}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-semibold text-[#d0a760]" data-testid={`wishlist-product-price-${item.productId}`}>
                                  €{parseFloat(item.product.price).toFixed(0)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFromWishlistMutation.mutate(item.productId)}
                                  disabled={removeFromWishlistMutation.isPending}
                                  className="text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-none"
                                  data-testid={`remove-from-wishlist-${item.productId}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-zinc-950 border border-zinc-800 py-16 px-8 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 bg-zinc-900 flex items-center justify-center">
                          <Heart className="w-10 h-10 text-zinc-600" />
                        </div>
                        <h3 className="text-xl font-light text-white mb-2" data-testid="empty-wishlist-message">
                          Je hebt nog geen favorieten
                        </h3>
                        <p className="text-zinc-500 mb-6 max-w-md mx-auto">
                          Voeg producten toe aan je favorieten om ze later gemakkelijk terug te vinden.
                        </p>
                        <Link href="/webshop">
                          <Button
                            className="bg-[#d0a760] text-black hover:bg-[#b8954e] rounded-none px-8"
                            data-testid="button-browse-shop"
                          >
                            Bekijk producten
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Account Tab */}
                {activeTab === "account" && (
                  <div className="space-y-6">
                    <h2 className="text-xl md:text-2xl font-light text-white flex items-center gap-3">
                      <Settings className="w-6 h-6 text-[#d0a760]" />
                      Account Instellingen
                    </h2>

                    <div className="grid gap-6">
                      {/* Personal Info */}
                      <div className="bg-zinc-950 border border-zinc-800">
                        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                          <h3 className="text-white font-medium flex items-center gap-2">
                            <User className="w-4 h-4 text-[#d0a760]" />
                            Persoonlijke Gegevens
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#d0a760] hover:text-[#b8954e] hover:bg-zinc-900 rounded-none"
                            data-testid="button-edit-profile"
                            onClick={openProfileEdit}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Bewerken
                          </Button>
                        </div>
                        <div className="p-6 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Naam</p>
                              <p className="text-white">{user?.firstName} {user?.lastName}</p>
                            </div>
                            <div>
                              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">E-mail</p>
                              <p className="text-white">{user?.email}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Security */}
                      <div className="bg-zinc-950 border border-zinc-800">
                        <div className="px-6 py-4 border-b border-zinc-800">
                          <h3 className="text-white font-medium flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[#d0a760]" />
                            Beveiliging
                          </h3>
                        </div>
                        <div className="p-6 space-y-4">
                          <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                            <div>
                              <p className="text-white">Wachtwoord</p>
                              <p className="text-zinc-500 text-sm">Laatst gewijzigd: onbekend</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-[#d0a760] rounded-none"
                              data-testid="button-change-password"
                            >
                              Wijzigen
                            </Button>
                          </div>
                          <div className="flex items-center justify-between py-3">
                            <div>
                              <p className="text-white">Twee-factor authenticatie</p>
                              <p className="text-zinc-500 text-sm">Verhoog de beveiliging van uw account</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-[#d0a760] rounded-none"
                              data-testid="button-enable-2fa"
                            >
                              Inschakelen
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Saved Addresses */}
                      <div className="bg-zinc-950 border border-zinc-800">
                        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                          <h3 className="text-white font-medium flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#d0a760]" />
                            Opgeslagen Adressen
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#d0a760] hover:text-[#b8954e] hover:bg-zinc-900 rounded-none"
                            data-testid="button-add-address"
                          >
                            + Toevoegen
                          </Button>
                        </div>
                        <div className="p-6">
                          <div className="text-center py-8">
                            <MapPin className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                            <p className="text-zinc-500">Geen opgeslagen adressen</p>
                            <p className="text-zinc-600 text-sm">Voeg een adres toe voor sneller afrekenen</p>
                          </div>
                        </div>
                      </div>

                      {/* Payment Methods */}
                      <div className="bg-zinc-950 border border-zinc-800">
                        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                          <h3 className="text-white font-medium flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#d0a760]" />
                            Betaalmethoden
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#d0a760] hover:text-[#b8954e] hover:bg-zinc-900 rounded-none"
                            data-testid="button-add-payment"
                          >
                            + Toevoegen
                          </Button>
                        </div>
                        <div className="p-6">
                          <div className="text-center py-8">
                            <CreditCard className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                            <p className="text-zinc-500">Geen opgeslagen betaalmethoden</p>
                            <p className="text-zinc-600 text-sm">Betaalmethoden worden veilig opgeslagen</p>
                          </div>
                        </div>
                      </div>

                      {/* Danger Zone */}
                      <div className="bg-zinc-950 border border-red-900/50">
                        <div className="px-6 py-4 border-b border-red-900/50">
                          <h3 className="text-red-400 font-medium">Gevarenzone</h3>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white">Account verwijderen</p>
                              <p className="text-zinc-500 text-sm">Verwijder uw account en alle bijbehorende gegevens permanent</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-transparent border-red-900 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-none"
                              data-testid="button-delete-account"
                            >
                              Verwijderen
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Support Tab */}
                {activeTab === "support" && (
                  <div className="space-y-6">
                    <h2 className="text-xl md:text-2xl font-light text-white flex items-center gap-3">
                      <HelpCircle className="w-6 h-6 text-[#d0a760]" />
                      Hulp & Support
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Contact Options */}
                      <div className="bg-zinc-950 border border-zinc-800">
                        <div className="px-6 py-4 border-b border-zinc-800">
                          <h3 className="text-white font-medium">Neem contact op</h3>
                        </div>
                        <div className="p-6 space-y-4">
                          <a 
                            href="tel:+32475636363"
                            className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800 hover:border-[#d0a760] transition-colors group"
                            data-testid="link-call-support"
                          >
                            <div className="w-12 h-12 bg-zinc-800 group-hover:bg-[#d0a760]/10 flex items-center justify-center transition-colors">
                              <Phone className="w-5 h-5 text-[#d0a760]" />
                            </div>
                            <div>
                              <p className="text-white font-medium">Bel ons</p>
                              <p className="text-[#d0a760]">047 563 63 63</p>
                            </div>
                          </a>

                          <a 
                            href="mailto:info@caraudiolimburg.shop"
                            className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800 hover:border-[#d0a760] transition-colors group"
                            data-testid="link-email-support"
                          >
                            <div className="w-12 h-12 bg-zinc-800 group-hover:bg-[#d0a760]/10 flex items-center justify-center transition-colors">
                              <Mail className="w-5 h-5 text-[#d0a760]" />
                            </div>
                            <div>
                              <p className="text-white font-medium">E-mail</p>
                              <p className="text-[#d0a760]">info@caraudiolimburg.shop</p>
                            </div>
                          </a>

                        </div>
                      </div>

                      {/* Inline Support Form */}
                      <div className="bg-zinc-950 border border-zinc-800">
                        <div className="px-6 py-4 border-b border-zinc-800">
                          <h3 className="text-white font-medium flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-[#d0a760]" />
                            Stuur een bericht
                          </h3>
                        </div>
                        <div className="p-6 space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="support-subject" className="text-zinc-400">Onderwerp</Label>
                            <Select value={supportSubject} onValueChange={setSupportSubject}>
                              <SelectTrigger 
                                className="bg-zinc-900 border-zinc-700 text-white rounded-none" 
                                data-testid="select-support-subject"
                              >
                                <SelectValue placeholder="Selecteer een onderwerp" />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-900 border-zinc-700">
                                <SelectItem value="order">Vraag over bestelling</SelectItem>
                                <SelectItem value="booking">Vraag over afspraak</SelectItem>
                                <SelectItem value="product">Vraag over product</SelectItem>
                                <SelectItem value="installation">Installatie vraag</SelectItem>
                                <SelectItem value="return">Retour verzoek</SelectItem>
                                <SelectItem value="other">Anders</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="support-message" className="text-zinc-400">Bericht</Label>
                            <Textarea
                              id="support-message"
                              value={supportMessage}
                              onChange={(e) => setSupportMessage(e.target.value)}
                              placeholder="Beschrijf je vraag of probleem..."
                              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 rounded-none min-h-[120px]"
                              data-testid="textarea-support-message"
                            />
                          </div>
                          <Button
                            onClick={handleSupportSubmit}
                            disabled={submitSupportMutation.isPending || !supportSubject || !supportMessage}
                            className="w-full bg-[#d0a760] text-black hover:bg-[#b8954e] rounded-none"
                            data-testid="button-submit-support"
                          >
                            {submitSupportMutation.isPending ? (
                              <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin mr-2" />
                            ) : (
                              <Send className="h-4 w-4 mr-2" />
                            )}
                            Verstuur bericht
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Quick Links */}
                      <div className="bg-zinc-950 border border-zinc-800">
                        <div className="px-6 py-4 border-b border-zinc-800">
                          <h3 className="text-white font-medium">Snelle links</h3>
                        </div>
                        <div className="p-6 space-y-2">
                          <Link href="/veelgestelde-vragen">
                            <div 
                              className="flex items-center justify-between p-4 hover:bg-zinc-900 transition-colors group cursor-pointer"
                              data-testid="link-faq"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-zinc-500 group-hover:text-[#d0a760] transition-colors" />
                                <span className="text-zinc-300 group-hover:text-white transition-colors">Veelgestelde vragen</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-[#d0a760] transition-colors" />
                            </div>
                          </Link>

                          <div 
                            className="flex items-center justify-between p-4 hover:bg-zinc-900 transition-colors group cursor-pointer"
                            data-testid="link-warranty"
                          >
                            <div className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-zinc-500 group-hover:text-[#d0a760] transition-colors" />
                              <span className="text-zinc-300 group-hover:text-white transition-colors">Garantie informatie</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-[#d0a760] transition-colors" />
                          </div>

                          <div 
                            className="flex items-center justify-between p-4 hover:bg-zinc-900 transition-colors group cursor-pointer"
                            data-testid="link-returns"
                          >
                            <div className="flex items-center gap-3">
                              <Package className="w-5 h-5 text-zinc-500 group-hover:text-[#d0a760] transition-colors" />
                              <span className="text-zinc-300 group-hover:text-white transition-colors">Retourneren</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-[#d0a760] transition-colors" />
                          </div>

                          <div 
                            className="flex items-center justify-between p-4 hover:bg-zinc-900 transition-colors group cursor-pointer"
                            data-testid="link-terms"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-zinc-500 group-hover:text-[#d0a760] transition-colors" />
                              <span className="text-zinc-300 group-hover:text-white transition-colors">Algemene voorwaarden</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-[#d0a760] transition-colors" />
                          </div>

                          <div 
                            className="flex items-center justify-between p-4 hover:bg-zinc-900 transition-colors group cursor-pointer"
                            data-testid="link-privacy"
                          >
                            <div className="flex items-center gap-3">
                              <Shield className="w-5 h-5 text-zinc-500 group-hover:text-[#d0a760] transition-colors" />
                              <span className="text-zinc-300 group-hover:text-white transition-colors">Privacy beleid</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-[#d0a760] transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Visit Us */}
                    <div className="bg-zinc-950 border border-zinc-800">
                      <div className="px-6 py-4 border-b border-zinc-800">
                        <h3 className="text-white font-medium flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#d0a760]" />
                          Bezoek onze showroom
                        </h3>
                      </div>
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <p className="text-white">Car Audio Limburg</p>
                            <p className="text-zinc-400">Dr. Nolenslaan 157-C (Hal 3)</p>
                            <p className="text-zinc-400">6136 GM Sittard, Nederland</p>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-zinc-500 text-sm">Openingstijden</p>
                            <p className="text-white">Ma-Vr: 09:00 - 17:00</p>
                            <p className="text-white">Za: 09:00 - 13:00</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Order Details Dialog */}
        <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-light flex items-center gap-2">
                <Package className="w-5 h-5 text-[#d0a760]" />
                Bestelgegevens {orderDetails?.order?.orderNumber && `#${orderDetails.order.orderNumber}`}
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Bekijk de details van je bestelling
              </DialogDescription>
            </DialogHeader>
            
            <>
              {orderDetailsLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-[#d0a760] border-t-transparent animate-spin" />
                </div>
              )}
              {!orderDetailsLoading && orderDetails && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800">
                    <span className="text-zinc-400">Status</span>
                    <Badge className={`${getStatusColor(orderDetails.order.status)} border rounded-none px-2 py-1 text-xs font-medium`}>
                      {getStatusIcon(orderDetails.order.status)}
                      <span className="ml-1.5">{getStatusLabel(orderDetails.order.status)}</span>
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#d0a760]" />
                      Producten
                    </h4>
                    <div className="space-y-2">
                      {orderDetails.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800" data-testid={`order-item-${index}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-zinc-800 flex items-center justify-center">
                              {item.product?.images?.[0] ? (
                                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-6 h-6 text-zinc-600" />
                              )}
                            </div>
                            <div>
                              <p className="text-white">{item.product?.name || 'Product'}</p>
                              <p className="text-zinc-500 text-sm">Aantal: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="text-[#d0a760] font-medium">€{parseFloat(item.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {(() => {
                    const addr = orderDetails.order.shippingAddress as any;
                    if (!addr) return null;
                    return (
                      <div>
                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#d0a760]" />
                          Verzendadres
                        </h4>
                        <div className="p-4 bg-zinc-900 border border-zinc-800">
                          <div>
                            <p className="text-white">{addr.firstName} {addr.lastName}</p>
                            <p className="text-zinc-400">{addr.address}</p>
                            <p className="text-zinc-400">{addr.postalCode} {addr.city}</p>
                            <p className="text-zinc-400">{addr.country || 'Nederland'}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })() as any}

                  <div className="flex items-center justify-between p-4 bg-zinc-900 border border-[#d0a760]/30">
                    <span className="text-white font-medium">Totaal</span>
                    <span className="text-[#d0a760] text-xl font-medium">€{parseFloat(orderDetails.order.total).toFixed(2)}</span>
                  </div>
                </div>
              )}
              {!orderDetailsLoading && !orderDetails && (
                <p className="text-zinc-400 text-center py-8">Bestelling niet gevonden</p>
              )}
            </>

            <DialogFooter>
              <Button
                onClick={() => setIsOrderDetailOpen(false)}
                className="bg-zinc-800 text-white hover:bg-zinc-700 rounded-none"
                data-testid="button-close-order-dialog"
              >
                Sluiten
              </Button>
              {orderDetails && (
                <Button
                  onClick={() => window.open(`/api/orders/${orderDetails.order.id}/invoice`, '_blank')}
                  className="bg-[#d0a760] text-black hover:bg-[#b8954e] rounded-none"
                  data-testid="button-download-invoice-dialog"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download factuur
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Booking Edit Dialog */}
        <Dialog open={isBookingEditOpen} onOpenChange={setIsBookingEditOpen}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-light flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#d0a760]" />
                Afspraak verzetten
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Kies een nieuwe datum voor je afspraak
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-400">Nieuwe datum</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800 rounded-none"
                      data-testid="button-select-date"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {bookingEditDate ? format(bookingEditDate, "d MMMM yyyy", { locale: nl }) : "Selecteer datum"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-700">
                    <CalendarComponent
                      mode="single"
                      selected={bookingEditDate}
                      onSelect={setBookingEditDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400">Opmerkingen</Label>
                <Textarea
                  value={bookingEditNotes}
                  onChange={(e) => setBookingEditNotes(e.target.value)}
                  placeholder="Extra opmerkingen..."
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 rounded-none"
                  data-testid="textarea-booking-notes"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={() => setIsBookingEditOpen(false)}
                variant="outline"
                className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-none"
                data-testid="button-cancel-booking-edit"
              >
                Annuleren
              </Button>
              <Button
                onClick={handleBookingUpdate}
                disabled={updateBookingMutation.isPending || !bookingEditDate}
                className="bg-[#d0a760] text-black hover:bg-[#b8954e] rounded-none"
                data-testid="button-save-booking"
              >
                {updateBookingMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin mr-2" />
                ) : null}
                Opslaan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Booking Cancel Confirmation */}
        <AlertDialog open={isBookingCancelOpen} onOpenChange={setIsBookingCancelOpen}>
          <AlertDialogContent className="bg-zinc-950 border-zinc-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Afspraak annuleren</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                Weet je zeker dat je deze afspraak wilt annuleren? Dit kan niet ongedaan worden gemaakt.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-none"
                data-testid="button-cancel-cancel"
              >
                Terug
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedBooking && cancelBookingMutation.mutate(selectedBooking.id)}
                className="bg-red-600 text-white hover:bg-red-700 rounded-none"
                data-testid="button-confirm-cancel"
              >
                {cancelBookingMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin mr-2" />
                ) : null}
                Annuleren
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Profile Edit Dialog */}
        <Dialog open={isProfileEditOpen} onOpenChange={setIsProfileEditOpen}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-light flex items-center gap-2">
                <User className="w-5 h-5 text-[#d0a760]" />
                Profiel bewerken
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Pas je persoonlijke gegevens aan
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-400">Voornaam</Label>
                <Input
                  value={profileFirstName}
                  onChange={(e) => setProfileFirstName(e.target.value)}
                  placeholder="Voornaam"
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 rounded-none"
                  data-testid="input-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Achternaam</Label>
                <Input
                  value={profileLastName}
                  onChange={(e) => setProfileLastName(e.target.value)}
                  placeholder="Achternaam"
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 rounded-none"
                  data-testid="input-last-name"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={() => setIsProfileEditOpen(false)}
                variant="outline"
                className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-none"
                data-testid="button-cancel-profile-edit"
              >
                Annuleren
              </Button>
              <Button
                onClick={handleProfileUpdate}
                disabled={updateProfileMutation.isPending}
                className="bg-[#d0a760] text-black hover:bg-[#b8954e] rounded-none"
                data-testid="button-save-profile"
              >
                {updateProfileMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin mr-2" />
                ) : null}
                Opslaan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
}
