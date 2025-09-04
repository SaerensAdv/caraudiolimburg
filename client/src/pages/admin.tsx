import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, insertBookingSchema } from "@shared/schema";
import { z } from "zod";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  ShoppingCart, 
  Calendar,
  Users,
  TrendingUp,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import type { Product, Order, Booking, QuoteRequest } from "@shared/schema";

const productFormSchema = insertProductSchema.extend({
  price: z.string().min(1, "Prijs is verplicht"),
  originalPrice: z.string().optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export default function Admin() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
  });

  // Redirect if not admin
  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'admin') {
      window.location.href = '/';
    }
  }, [isAuthenticated, user]);

  // Queries
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/admin/products"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["/api/admin/orders"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: bookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ["/api/admin/bookings"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: quoteRequests, isLoading: isLoadingQuotes } = useQuery({
    queryKey: ["/api/quote-requests"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated,
  });

  const { data: brands } = useQuery({
    queryKey: ["/api/brands"],
    enabled: isAuthenticated,
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      await apiRequest("POST", "/api/products", {
        ...data,
        price: data.price,
        originalPrice: data.originalPrice || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      toast({
        title: "Product aangemaakt",
        description: "Het product is succesvol toegevoegd.",
      });
      setIsProductDialogOpen(false);
      reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Geen toegang",
          description: "Je hebt geen toegang tot deze functie.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Fout",
        description: "Kon product niet aanmaken.",
        variant: "destructive",
      });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({
        title: "Status bijgewerkt",
        description: "De bestellingsstatus is gewijzigd.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fout",
        description: "Kon status niet bijwerken.",
        variant: "destructive",
      });
    },
  });

  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/bookings/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({
        title: "Status bijgewerkt",
        description: "De afspraakstatus is gewijzigd.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fout",
        description: "Kon status niet bijwerken.",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <div className="container px-4 mx-auto py-16">
          <Card className="bg-card border-border p-12 text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-card-foreground mb-4">Toegang geweigerd</h1>
            <p className="text-muted-foreground mb-6">
              Je moet ingelogd zijn als administrator om deze pagina te bekijken.
            </p>
            <Button onClick={() => window.location.href = '/api/login'}>
              Inloggen
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <div className="container px-4 mx-auto py-16">
          <Card className="bg-card border-border p-12 text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-card-foreground mb-4">Geen toegang</h1>
            <p className="text-muted-foreground mb-6">
              Deze pagina is alleen toegankelijk voor administrators.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Terug naar home
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const onSubmitProduct = (data: ProductFormData) => {
    createProductMutation.mutate(data);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setValue("name", product.name);
    setValue("slug", product.slug);
    setValue("description", product.description || "");
    setValue("shortDescription", product.shortDescription || "");
    setValue("price", product.price.toString());
    setValue("originalPrice", product.originalPrice?.toString() || "");
    setValue("sku", product.sku || "");
    setValue("stock", product.stock || 0);
    setValue("brandId", product.brandId || "");
    setValue("categoryId", product.categoryId || "");
    setIsProductDialogOpen(true);
  };

  // Calculate stats
  const totalProducts = products?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalBookings = bookings?.length || 0;
  const pendingQuotes = quoteRequests?.filter((q: QuoteRequest) => q.status === 'pending').length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header onCartOpen={() => setIsCartOpen(true)} />
      
      <div className="container px-4 mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Beheer je car audio webshop</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border" data-testid="stat-products">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Producten</p>
                  <p className="text-2xl font-bold text-card-foreground">{totalProducts}</p>
                </div>
                <Package className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border" data-testid="stat-orders">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bestellingen</p>
                  <p className="text-2xl font-bold text-card-foreground">{totalOrders}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border" data-testid="stat-bookings">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Afspraken</p>
                  <p className="text-2xl font-bold text-card-foreground">{totalBookings}</p>
                </div>
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border" data-testid="stat-quotes">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Offerte aanvragen</p>
                  <p className="text-2xl font-bold text-card-foreground">{pendingQuotes}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products" data-testid="tab-products">Producten</TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">Bestellingen</TabsTrigger>
            <TabsTrigger value="bookings" data-testid="tab-bookings">Afspraken</TabsTrigger>
            <TabsTrigger value="quotes" data-testid="tab-quotes">Offertes</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-foreground">Producten</h2>
              
              <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-product">
                    <Plus className="w-4 h-4 mr-2" />
                    Product toevoegen
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-card-foreground">
                      {selectedProduct ? "Product bewerken" : "Nieuw product"}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit(onSubmitProduct)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Naam</Label>
                        <Input
                          {...register("name")}
                          className="bg-input border-border"
                          data-testid="input-product-name"
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                          {...register("slug")}
                          className="bg-input border-border"
                          data-testid="input-product-slug"
                        />
                        {errors.slug && (
                          <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="shortDescription">Korte beschrijving</Label>
                      <Input
                        {...register("shortDescription")}
                        className="bg-input border-border"
                        data-testid="input-product-short-description"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Beschrijving</Label>
                      <Textarea
                        {...register("description")}
                        className="bg-input border-border"
                        rows={3}
                        data-testid="textarea-product-description"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="price">Prijs</Label>
                        <Input
                          {...register("price")}
                          type="number"
                          step="0.01"
                          className="bg-input border-border"
                          data-testid="input-product-price"
                        />
                        {errors.price && (
                          <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="originalPrice">Originele prijs</Label>
                        <Input
                          {...register("originalPrice")}
                          type="number"
                          step="0.01"
                          className="bg-input border-border"
                          data-testid="input-product-original-price"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="stock">Voorraad</Label>
                        <Input
                          {...register("stock", { valueAsNumber: true })}
                          type="number"
                          className="bg-input border-border"
                          data-testid="input-product-stock"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="categoryId">Categorie</Label>
                        <Select onValueChange={(value) => setValue("categoryId", value)}>
                          <SelectTrigger className="bg-input border-border" data-testid="select-product-category">
                            <SelectValue placeholder="Selecteer categorie" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((category: any) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="brandId">Merk</Label>
                        <Select onValueChange={(value) => setValue("brandId", value)}>
                          <SelectTrigger className="bg-input border-border" data-testid="select-product-brand">
                            <SelectValue placeholder="Selecteer merk" />
                          </SelectTrigger>
                          <SelectContent>
                            {brands?.map((brand: any) => (
                              <SelectItem key={brand.id} value={brand.id}>
                                {brand.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        {...register("sku")}
                        className="bg-input border-border"
                        data-testid="input-product-sku"
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsProductDialogOpen(false)}
                        data-testid="button-cancel-product"
                      >
                        Annuleren
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createProductMutation.isPending}
                        data-testid="button-save-product"
                      >
                        {createProductMutation.isPending ? "Opslaan..." : "Opslaan"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Naam</TableHead>
                      <TableHead>Prijs</TableHead>
                      <TableHead>Voorraad</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingProducts ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><div className="h-4 bg-muted rounded animate-pulse"></div></TableCell>
                          <TableCell><div className="h-4 bg-muted rounded animate-pulse"></div></TableCell>
                          <TableCell><div className="h-4 bg-muted rounded animate-pulse"></div></TableCell>
                          <TableCell><div className="h-4 bg-muted rounded animate-pulse"></div></TableCell>
                          <TableCell><div className="h-4 bg-muted rounded animate-pulse"></div></TableCell>
                        </TableRow>
                      ))
                    ) : products?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Nog geen producten toegevoegd
                        </TableCell>
                      </TableRow>
                    ) : (
                      products?.map((product: Product) => (
                        <TableRow key={product.id} data-testid={`product-row-${product.id}`}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>€{parseFloat(product.price).toFixed(2)}</TableCell>
                          <TableCell>{product.stock || 0}</TableCell>
                          <TableCell>
                            <Badge variant={product.isActive ? "default" : "secondary"}>
                              {product.isActive ? "Actief" : "Inactief"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditProduct(product)}
                                data-testid={`button-edit-product-${product.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-destructive"
                                data-testid={`button-delete-product-${product.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Bestellingen</h2>
            
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bestelnummer</TableHead>
                      <TableHead>Klant</TableHead>
                      <TableHead>Totaal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingOrders ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          {[...Array(6)].map((_, j) => (
                            <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse"></div></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : orders?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Nog geen bestellingen
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders?.map((order: Order) => (
                        <TableRow key={order.id} data-testid={`order-row-${order.id}`}>
                          <TableCell className="font-medium">{order.orderNumber}</TableCell>
                          <TableCell>Klant</TableCell>
                          <TableCell>€{parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                          <TableCell>
                            <Select 
                              value={order.status} 
                              onValueChange={(status) => updateOrderStatusMutation.mutate({ id: order.id, status })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Wachtend</SelectItem>
                                <SelectItem value="confirmed">Bevestigd</SelectItem>
                                <SelectItem value="processing">Verwerken</SelectItem>
                                <SelectItem value="completed">Voltooid</SelectItem>
                                <SelectItem value="cancelled">Geannuleerd</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {order.createdAt ? format(new Date(order.createdAt), "dd MMM yyyy", { locale: nl }) : "-"}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" data-testid={`button-view-order-${order.id}`}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Installatie Afspraken</h2>
            
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Klant</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Tijd</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingBookings ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          {[...Array(6)].map((_, j) => (
                            <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse"></div></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : bookings?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Nog geen afspraken
                        </TableCell>
                      </TableRow>
                    ) : (
                      bookings?.map((booking: Booking) => (
                        <TableRow key={booking.id} data-testid={`booking-row-${booking.id}`}>
                          <TableCell className="font-medium">{booking.customerName}</TableCell>
                          <TableCell>{booking.serviceType}</TableCell>
                          <TableCell>
                            {booking.scheduledDate ? format(new Date(booking.scheduledDate), "dd MMM yyyy", { locale: nl }) : "-"}
                          </TableCell>
                          <TableCell>
                            {booking.scheduledDate ? format(new Date(booking.scheduledDate), "HH:mm") : "-"}
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={booking.status || "pending"} 
                              onValueChange={(status) => updateBookingStatusMutation.mutate({ id: booking.id, status })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Wachtend</SelectItem>
                                <SelectItem value="confirmed">Bevestigd</SelectItem>
                                <SelectItem value="in-progress">Bezig</SelectItem>
                                <SelectItem value="completed">Voltooid</SelectItem>
                                <SelectItem value="cancelled">Geannuleerd</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" data-testid={`button-view-booking-${booking.id}`}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quote Requests Tab */}
          <TabsContent value="quotes" className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Offerte Aanvragen</h2>
            
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Naam</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Voertuig</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingQuotes ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          {[...Array(6)].map((_, j) => (
                            <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse"></div></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : quoteRequests?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Nog geen offerte aanvragen
                        </TableCell>
                      </TableRow>
                    ) : (
                      quoteRequests?.map((quote: QuoteRequest) => (
                        <TableRow key={quote.id} data-testid={`quote-row-${quote.id}`}>
                          <TableCell className="font-medium">{quote.firstName} {quote.lastName}</TableCell>
                          <TableCell>{quote.email}</TableCell>
                          <TableCell>{quote.vehicleMake} {quote.vehicleModel} ({quote.vehicleYear})</TableCell>
                          <TableCell>
                            <Badge variant={quote.status === 'pending' ? "secondary" : "default"}>
                              {quote.status === 'pending' ? 'Wachtend' : 'Verwerkt'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {quote.createdAt ? format(new Date(quote.createdAt), "dd MMM yyyy", { locale: nl }) : "-"}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" data-testid={`button-view-quote-${quote.id}`}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
