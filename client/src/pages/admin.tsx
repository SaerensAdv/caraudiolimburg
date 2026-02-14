import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";
import { 
  Plus, 
  PencilSimple, 
  Trash, 
  Package, 
  ShoppingCart, 
  CalendarBlank,
  Users,
  TrendUp,
  Eye,
  UploadSimple,
  DownloadSimple,
  X,
  Star,
  ImageSquare,
  Gear,
  SquaresFour,
  FileText,
  List,
  SignOut,
  CaretRight,
  CaretDown,
  CurrencyEur,
  ChartBar,
  House,
  Car
} from "@phosphor-icons/react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import type { Product, Order, Booking, QuoteRequest, User, BlogPost, BlogCategory, VehicleMake, VehicleModel, SiteSettings } from "@shared/schema";
import { Link } from "wouter";

import logoImage from "@assets/CAL white_1758369495328.png";

const productFormSchema = insertProductSchema.extend({
  price: z.string().min(1, "Prijs is verplicht"),
  originalPrice: z.string().optional(),
  installationPrice: z.string().optional(),
  features: z.array(z.string()).optional(),
  specifications: z.record(z.string(), z.any()).optional(),
  images: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
  overviewContent: z.string().optional(),
  boxContent: z.array(z.string()).optional(),
  downloads: z.array(z.object({ name: z.string(), url: z.string() })).optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

type AdminSection = 'dashboard' | 'products' | 'orders' | 'bookings' | 'quotes' | 'users' | 'blog' | 'portfolio' | 'settings';

interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: string | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleYear: string | null;
  category: string | null;
  images: string[];
  featuredImage: string | null;
  components: string[];
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

function TeamleaderSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: teamleaderStatus, isLoading: isLoadingTlStatus } = useQuery<{ connected: boolean; expiresAt?: string }>({
    queryKey: ["/api/teamleader/status"],
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/teamleader/auth-url', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to get auth URL');
      const data = await res.json();
      return data.url;
    },
    onSuccess: (url: string) => {
      window.open(url, '_blank');
    },
    onError: () => {
      toast({ title: "Fout", description: "Kon de autorisatie-URL niet ophalen.", variant: "destructive" });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/teamleader/disconnect");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teamleader/status"] });
      toast({ title: "Ontkoppeld", description: "Teamleader Focus is ontkoppeld." });
    },
    onError: () => {
      toast({ title: "Fout", description: "Kon niet ontkoppelen.", variant: "destructive" });
    },
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-6 mt-6">
      <h2 className="text-lg font-semibold text-white">Integraties</h2>

      <div className="flex items-center justify-between p-4 bg-zinc-800">
        <div className="flex-1">
          <Label className="text-white text-base">Teamleader Focus</Label>
          <p className="text-sm text-zinc-400 mt-1">
            Synchroniseer contactformulieren en offerteaanvragen automatisch naar Teamleader Focus CRM.
          </p>
          <div className="mt-2 flex items-center gap-2">
            {isLoadingTlStatus ? (
              <span className="text-xs text-zinc-500">Laden...</span>
            ) : teamleaderStatus?.connected ? (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-green-400">Verbonden</span>
                {teamleaderStatus.expiresAt && (
                  <span className="text-xs text-zinc-500 ml-2">
                    Token geldig tot: {new Date(teamleaderStatus.expiresAt).toLocaleDateString('nl-NL')}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-zinc-500" />
                <span className="text-xs text-zinc-400">Niet verbonden</span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          {teamleaderStatus?.connected ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => disconnectMutation.mutate()}
              disabled={disconnectMutation.isPending}
            >
              {disconnectMutation.isPending ? "Bezig..." : "Ontkoppelen"}
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90"
              onClick={() => connectMutation.mutate()}
              disabled={connectMutation.isPending}
            >
              {connectMutation.isPending ? "Bezig..." : "Koppelen"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [specifications, setSpecifications] = useState<Record<string, any>>({});
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [productFormTab, setProductFormTab] = useState('algemeen');
  const [editingSpecKey, setEditingSpecKey] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('');
  const [productBrandFilter, setProductBrandFilter] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [hasVariations, setHasVariations] = useState(false);
  const [productVariations, setProductVariations] = useState<Array<{id?: string; label: string; price: string; originalPrice?: string; stock: number; sku?: string; sortOrder: number; specifications?: Record<string, string>}>>([]);
  const [newVariationLabel, setNewVariationLabel] = useState('');
  const [newVariationPrice, setNewVariationPrice] = useState('');
  const [newVariationStock, setNewVariationStock] = useState(0);
  const [newVariationSku, setNewVariationSku] = useState('');
  const [newVariationSpecs, setNewVariationSpecs] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [overviewContent, setOverviewContent] = useState('');
  const [boxContent, setBoxContent] = useState<string[]>([]);
  const [newBoxItem, setNewBoxItem] = useState('');
  const [downloads, setDownloads] = useState<{name: string, url: string}[]>([]);
  const [newDownloadName, setNewDownloadName] = useState('');
  const [newDownloadUrl, setNewDownloadUrl] = useState('');
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
  });

  const isFeatured = watch("isFeatured");
  const canHaveInstallation = watch("canHaveInstallation");

  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'admin') {
      window.location.href = '/';
    }
  }, [isAuthenticated, user]);

  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery<Booking[]>({
    queryKey: ["/api/admin/bookings"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: quoteRequests = [], isLoading: isLoadingQuotes } = useQuery<QuoteRequest[]>({
    queryKey: ["/api/quote-requests"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated,
  });

  const { data: brands = [] } = useQuery<any[]>({
    queryKey: ["/api/brands"],
    enabled: isAuthenticated,
  });

  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  // Blog queries
  const { data: blogPosts = [], isLoading: isLoadingBlogPosts } = useQuery<BlogPost[]>({
    queryKey: ["/api/admin/blog/posts"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: blogCategories = [] } = useQuery<BlogCategory[]>({
    queryKey: ["/api/blog/categories"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  // Blog state
  const [isBlogPostDialogOpen, setIsBlogPostDialogOpen] = useState(false);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [isBlogCategoryDialogOpen, setIsBlogCategoryDialogOpen] = useState(false);
  const [selectedBlogCategory, setSelectedBlogCategory] = useState<BlogCategory | null>(null);
  
  // Blog post form state
  const [blogPostTitle, setBlogPostTitle] = useState('');
  const [blogPostSlug, setBlogPostSlug] = useState('');
  const [blogPostExcerpt, setBlogPostExcerpt] = useState('');
  const [blogPostContent, setBlogPostContent] = useState('');
  const [blogPostFeaturedImage, setBlogPostFeaturedImage] = useState('');
  const [blogPostMetaDescription, setBlogPostMetaDescription] = useState('');
  const [blogPostCategoryId, setBlogPostCategoryId] = useState('');
  const [blogPostStatus, setBlogPostStatus] = useState<'draft' | 'published'>('draft');
  const [blogPostIsFeatured, setBlogPostIsFeatured] = useState(false);
  
  // Blog category form state
  const [blogCategoryName, setBlogCategoryName] = useState('');
  const [blogCategorySlug, setBlogCategorySlug] = useState('');
  const [blogCategoryDescription, setBlogCategoryDescription] = useState('');

  // Portfolio queries
  const { data: portfolioProjects = [], isLoading: isLoadingPortfolio } = useQuery<PortfolioProject[]>({
    queryKey: ["/api/admin/portfolio"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  // Site Settings
  const { data: siteSettings } = useQuery<SiteSettings>({
    queryKey: ["/api/site-settings"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const updateSiteSettingsMutation = useMutation({
    mutationFn: async (data: { installationServiceEnabled: boolean }) => {
      await apiRequest("PUT", "/api/admin/site-settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
      toast({
        title: "Instellingen opgeslagen",
        description: "De site-instellingen zijn bijgewerkt.",
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Kon instellingen niet opslaan.",
        variant: "destructive",
      });
    },
  });

  // Portfolio state
  const [isPortfolioDialogOpen, setIsPortfolioDialogOpen] = useState(false);
  const [selectedPortfolioProject, setSelectedPortfolioProject] = useState<PortfolioProject | null>(null);
  
  // Portfolio form state
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioSlug, setPortfolioSlug] = useState('');
  const [portfolioShortDescription, setPortfolioShortDescription] = useState('');
  const [portfolioFullDescription, setPortfolioFullDescription] = useState('');
  const [portfolioVehicleMake, setPortfolioVehicleMake] = useState('');
  const [portfolioVehicleModel, setPortfolioVehicleModel] = useState('');
  const [portfolioVehicleYear, setPortfolioVehicleYear] = useState('');
  const [portfolioCategory, setPortfolioCategory] = useState('');
  const [portfolioFeaturedImage, setPortfolioFeaturedImage] = useState('');
  const [portfolioImages, setPortfolioImages] = useState('');
  const [portfolioComponents, setPortfolioComponents] = useState('');
  const [portfolioIsFeatured, setPortfolioIsFeatured] = useState(false);
  const [portfolioIsPublished, setPortfolioIsPublished] = useState(false);

  // Vehicle compatibility state
  const [vehicleCompatibility, setVehicleCompatibility] = useState<{makeId: string, modelId?: string}[]>([]);
  const [expandedMakes, setExpandedMakes] = useState<Set<string>>(new Set());
  const [vehicleCompatibilityOpen, setVehicleCompatibilityOpen] = useState(false);

  // Vehicle data queries (admin sees all makes/models, not just ones with products)
  const { data: vehicleMakes = [] } = useQuery<VehicleMake[]>({
    queryKey: ["/api/vehicle-makes?all=true"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: vehicleModels = [] } = useQuery<VehicleModel[]>({
    queryKey: ["/api/vehicle-models?all=true"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const filteredProducts = useMemo(() => {
    return products.filter((product: Product) => {
      const matchesSearch = productSearch === '' || 
        product.name.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCategory = productCategoryFilter === '' || 
        product.categoryId === productCategoryFilter;
      const matchesBrand = productBrandFilter === '' || 
        product.brandId === productBrandFilter;
      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [products, productSearch, productCategoryFilter, productBrandFilter]);

  const orderStatusData = useMemo(() => {
    const statusCounts: Record<string, number> = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    orders.forEach((order: Order) => {
      const status = order.status || 'pending';
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });
    return [
      { name: 'In afwachting', value: statusCounts.pending, status: 'pending' },
      { name: 'Verwerking', value: statusCounts.processing, status: 'processing' },
      { name: 'Verzonden', value: statusCounts.shipped, status: 'shipped' },
      { name: 'Geleverd', value: statusCounts.delivered, status: 'delivered' },
      { name: 'Geannuleerd', value: statusCounts.cancelled, status: 'cancelled' },
    ];
  }, [orders]);

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData & { hasVariations?: boolean; videoUrl?: string; overviewContent?: string; boxContent?: string[]; downloads?: {name: string, url: string}[] }) => {
      const payload = {
        ...data,
        price: data.price,
        originalPrice: data.originalPrice || null,
        installationPrice: data.installationPrice || null,
        images: productImages,
        features,
        specifications,
        hasVariations: data.hasVariations || false,
        videoUrl: data.videoUrl || null,
        overviewContent: data.overviewContent || null,
        boxContent: data.boxContent || null,
        downloads: data.downloads || null,
      };
      const response = await apiRequest("POST", "/api/products", payload);
      const newProduct = await response.json();
      
      if (vehicleCompatibility.length > 0 && newProduct.id) {
        await apiRequest("POST", `/api/products/${newProduct.id}/compatibility`, {
          compatibility: vehicleCompatibility
        });
      }
      
      if (data.hasVariations && productVariations.length > 0 && newProduct.id) {
        for (const variation of productVariations) {
          await apiRequest("POST", `/api/products/${newProduct.id}/variations`, {
            label: variation.label,
            price: variation.price,
            originalPrice: variation.originalPrice || null,
            stock: variation.stock,
            sku: variation.sku || null,
            sortOrder: variation.sortOrder,
            specifications: variation.specifications || null
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      toast({
        title: "Product aangemaakt",
        description: "Het product is succesvol toegevoegd.",
      });
      setIsProductDialogOpen(false);
      reset();
      setProductImages([]);
      setFeatures([]);
      setSpecifications({});
      setPrimaryImageIndex(0);
      setSelectedProduct(null);
      setVehicleCompatibility([]);
      setVehicleCompatibilityOpen(false);
      setHasVariations(false);
      setProductVariations([]);
      setVideoUrl('');
      setOverviewContent('');
      setBoxContent([]);
      setDownloads([]);
      setNewBoxItem('');
      setNewDownloadName('');
      setNewDownloadUrl('');
      setNewImageUrl('');
      setProductFormTab('algemeen');
      setEditingSpecKey(null);
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

  const updateProductMutation = useMutation({
    mutationFn: async (data: ProductFormData & { hasVariations?: boolean; videoUrl?: string; overviewContent?: string; boxContent?: string[]; downloads?: {name: string, url: string}[] }) => {
      if (!selectedProduct) return;
      
      const imagesToUse = productImages.length > 0 ? productImages : (selectedProduct.images || []);
      const validPrimaryImageIndex = imagesToUse.length > 0 ? 
        Math.min(Math.max(0, primaryImageIndex), imagesToUse.length - 1) : 0;
      
      const payload = {
        ...data,
        price: data.price,
        originalPrice: data.originalPrice || null,
        installationPrice: data.installationPrice || null,
        images: imagesToUse,
        primaryImageIndex: validPrimaryImageIndex,
        features,
        specifications,
        hasVariations: data.hasVariations || false,
        videoUrl: data.videoUrl || null,
        overviewContent: data.overviewContent || null,
        boxContent: data.boxContent || null,
        downloads: data.downloads || null,
      };
      await apiRequest("PUT", `/api/products/${selectedProduct.id}`, payload);
      
      await apiRequest("POST", `/api/products/${selectedProduct.id}/compatibility`, {
        compatibility: vehicleCompatibility
      });
      
      if (data.hasVariations) {
        const existingVariationIds = productVariations.filter(v => v.id).map(v => v.id);
        
        const existingVariationsResponse = await fetch(`/api/products/${selectedProduct.id}/variations`, {
          credentials: 'include'
        });
        if (existingVariationsResponse.ok) {
          const existingVariations = await existingVariationsResponse.json();
          for (const existingVar of existingVariations) {
            if (!existingVariationIds.includes(existingVar.id)) {
              await apiRequest("DELETE", `/api/products/${selectedProduct.id}/variations/${existingVar.id}`);
            }
          }
        }
        
        for (const variation of productVariations) {
          if (variation.id) {
            await apiRequest("PUT", `/api/products/${selectedProduct.id}/variations/${variation.id}`, {
              label: variation.label,
              price: variation.price,
              originalPrice: variation.originalPrice || null,
              stock: variation.stock,
              sku: variation.sku || null,
              sortOrder: variation.sortOrder,
              specifications: variation.specifications || null
            });
          } else {
            await apiRequest("POST", `/api/products/${selectedProduct.id}/variations`, {
              label: variation.label,
              price: variation.price,
              originalPrice: variation.originalPrice || null,
              stock: variation.stock,
              sku: variation.sku || null,
              sortOrder: variation.sortOrder,
              specifications: variation.specifications || null
            });
          }
        }
      } else {
        const existingVariationsResponse = await fetch(`/api/products/${selectedProduct.id}/variations`, {
          credentials: 'include'
        });
        if (existingVariationsResponse.ok) {
          const existingVariations = await existingVariationsResponse.json();
          for (const existingVar of existingVariations) {
            await apiRequest("DELETE", `/api/products/${selectedProduct.id}/variations/${existingVar.id}`);
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      toast({
        title: "Product bijgewerkt",
        description: "Het product is succesvol gewijzigd.",
      });
      setIsProductDialogOpen(false);
      reset();
      setProductImages([]);
      setFeatures([]);
      setSpecifications({});
      setPrimaryImageIndex(0);
      setSelectedProduct(null);
      setVehicleCompatibility([]);
      setVehicleCompatibilityOpen(false);
      setHasVariations(false);
      setProductVariations([]);
      setVideoUrl('');
      setOverviewContent('');
      setBoxContent([]);
      setDownloads([]);
      setNewBoxItem('');
      setNewDownloadName('');
      setNewDownloadUrl('');
      setNewImageUrl('');
      setProductFormTab('algemeen');
      setEditingSpecKey(null);
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
        description: "Kon product niet bijwerken.",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("DELETE", `/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      toast({
        title: "Product verwijderd",
        description: "Het product is succesvol verwijderd.",
      });
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
        description: "Kon product niet verwijderen.",
        variant: "destructive",
      });
    },
  });

  const handleBulkUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('csvFile', selectedFile);

      const response = await fetch('/api/admin/products/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Bulk upload voltooid",
          description: `${result.successCount} producten toegevoegd, ${result.errorCount} fouten.`,
        });
        
        queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
        setSelectedFile(null);
      } else {
        toast({
          title: "Upload mislukt",
          description: result.message || "Er is een fout opgetreden tijdens de upload.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upload fout",
        description: "Er is een onbekende fout opgetreden.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleOptimizeImages = async () => {
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/admin/products/optimize-images', {
        method: 'POST',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Afbeeldingen geoptimaliseerd",
          description: `${result.processed} producten geoptimaliseerd, ${result.skipped} overgeslagen.`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      } else {
        toast({
          title: "Optimalisatie mislukt",
          description: result.message || "Er is een fout opgetreden.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Optimalisatie fout",
        description: "Er is een onbekende fout opgetreden.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

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
    onError: () => {
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
    onError: () => {
      toast({
        title: "Fout",
        description: "Kon status niet bijwerken.",
        variant: "destructive",
      });
    },
  });

  // Blog post mutations
  const createBlogPostMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/blog/posts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog/posts"] });
      toast({
        title: "Blogpost aangemaakt",
        description: "De blogpost is succesvol toegevoegd.",
      });
      resetBlogPostForm();
      setIsBlogPostDialogOpen(false);
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
        description: "Kon blogpost niet aanmaken.",
        variant: "destructive",
      });
    },
  });

  const updateBlogPostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PATCH", `/api/admin/blog/posts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog/posts"] });
      toast({
        title: "Blogpost bijgewerkt",
        description: "De blogpost is succesvol gewijzigd.",
      });
      resetBlogPostForm();
      setIsBlogPostDialogOpen(false);
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
        description: "Kon blogpost niet bijwerken.",
        variant: "destructive",
      });
    },
  });

  const deleteBlogPostMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/blog/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog/posts"] });
      toast({
        title: "Blogpost verwijderd",
        description: "De blogpost is succesvol verwijderd.",
      });
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
        description: "Kon blogpost niet verwijderen.",
        variant: "destructive",
      });
    },
  });

  // Blog category mutations
  const createBlogCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/blog/categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/categories"] });
      toast({
        title: "Categorie aangemaakt",
        description: "De blog categorie is succesvol toegevoegd.",
      });
      resetBlogCategoryForm();
      setIsBlogCategoryDialogOpen(false);
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
        description: "Kon categorie niet aanmaken.",
        variant: "destructive",
      });
    },
  });

  const updateBlogCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PATCH", `/api/admin/blog/categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/categories"] });
      toast({
        title: "Categorie bijgewerkt",
        description: "De blog categorie is succesvol gewijzigd.",
      });
      resetBlogCategoryForm();
      setIsBlogCategoryDialogOpen(false);
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
        description: "Kon categorie niet bijwerken.",
        variant: "destructive",
      });
    },
  });

  const deleteBlogCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/blog/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/categories"] });
      toast({
        title: "Categorie verwijderd",
        description: "De blog categorie is succesvol verwijderd.",
      });
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
        description: "Kon categorie niet verwijderen.",
        variant: "destructive",
      });
    },
  });

  // Blog helper functions
  const resetBlogPostForm = () => {
    setBlogPostTitle('');
    setBlogPostSlug('');
    setBlogPostExcerpt('');
    setBlogPostContent('');
    setBlogPostFeaturedImage('');
    setBlogPostMetaDescription('');
    setBlogPostCategoryId('');
    setBlogPostStatus('draft');
    setBlogPostIsFeatured(false);
    setSelectedBlogPost(null);
  };

  const resetBlogCategoryForm = () => {
    setBlogCategoryName('');
    setBlogCategorySlug('');
    setBlogCategoryDescription('');
    setSelectedBlogCategory(null);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleEditBlogPost = (post: BlogPost) => {
    setSelectedBlogPost(post);
    setBlogPostTitle(post.title);
    setBlogPostSlug(post.slug);
    setBlogPostExcerpt(post.excerpt || '');
    setBlogPostContent(post.content);
    setBlogPostFeaturedImage(post.featuredImage || '');
    setBlogPostMetaDescription(post.metaDescription || '');
    setBlogPostCategoryId(post.categoryId || '');
    setBlogPostStatus(post.status || 'draft');
    setBlogPostIsFeatured(post.isFeatured || false);
    setIsBlogPostDialogOpen(true);
  };

  const handleDeleteBlogPost = (post: BlogPost) => {
    if (window.confirm(`Weet je zeker dat je "${post.title}" wilt verwijderen?`)) {
      deleteBlogPostMutation.mutate(post.id);
    }
  };

  const handleEditBlogCategory = (category: BlogCategory) => {
    setSelectedBlogCategory(category);
    setBlogCategoryName(category.name);
    setBlogCategorySlug(category.slug);
    setBlogCategoryDescription(category.description || '');
    setIsBlogCategoryDialogOpen(true);
  };

  const handleDeleteBlogCategory = (category: BlogCategory) => {
    if (window.confirm(`Weet je zeker dat je de categorie "${category.name}" wilt verwijderen?`)) {
      deleteBlogCategoryMutation.mutate(category.id);
    }
  };

  const handleSaveBlogPost = () => {
    const postData = {
      title: blogPostTitle,
      slug: blogPostSlug || generateSlug(blogPostTitle),
      excerpt: blogPostExcerpt || null,
      content: blogPostContent,
      featuredImage: blogPostFeaturedImage || null,
      metaDescription: blogPostMetaDescription || null,
      categoryId: blogPostCategoryId || null,
      status: blogPostStatus,
      isFeatured: blogPostIsFeatured,
      publishedAt: blogPostStatus === 'published' ? new Date().toISOString() : null,
    };

    if (selectedBlogPost) {
      updateBlogPostMutation.mutate({ id: selectedBlogPost.id, data: postData });
    } else {
      createBlogPostMutation.mutate(postData);
    }
  };

  const handleSaveBlogCategory = () => {
    const categoryData = {
      name: blogCategoryName,
      slug: blogCategorySlug || generateSlug(blogCategoryName),
      description: blogCategoryDescription || null,
    };

    if (selectedBlogCategory) {
      updateBlogCategoryMutation.mutate({ id: selectedBlogCategory.id, data: categoryData });
    } else {
      createBlogCategoryMutation.mutate(categoryData);
    }
  };

  // Portfolio mutations
  const createPortfolioMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/portfolio", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio"] });
      toast({
        title: "Project aangemaakt",
        description: "Het portfolio project is succesvol toegevoegd.",
      });
      resetPortfolioForm();
      setIsPortfolioDialogOpen(false);
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
        description: "Kon project niet aanmaken.",
        variant: "destructive",
      });
    },
  });

  const updatePortfolioMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PUT", `/api/admin/portfolio/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio"] });
      toast({
        title: "Project bijgewerkt",
        description: "Het portfolio project is succesvol gewijzigd.",
      });
      resetPortfolioForm();
      setIsPortfolioDialogOpen(false);
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
        description: "Kon project niet bijwerken.",
        variant: "destructive",
      });
    },
  });

  const deletePortfolioMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/portfolio/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio"] });
      toast({
        title: "Project verwijderd",
        description: "Het portfolio project is succesvol verwijderd.",
      });
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
        description: "Kon project niet verwijderen.",
        variant: "destructive",
      });
    },
  });

  // Portfolio helper functions
  const resetPortfolioForm = () => {
    setPortfolioTitle('');
    setPortfolioSlug('');
    setPortfolioShortDescription('');
    setPortfolioFullDescription('');
    setPortfolioVehicleMake('');
    setPortfolioVehicleModel('');
    setPortfolioVehicleYear('');
    setPortfolioCategory('');
    setPortfolioFeaturedImage('');
    setPortfolioImages('');
    setPortfolioComponents('');
    setPortfolioIsFeatured(false);
    setPortfolioIsPublished(false);
    setSelectedPortfolioProject(null);
  };

  const handleEditPortfolioProject = (project: PortfolioProject) => {
    setSelectedPortfolioProject(project);
    setPortfolioTitle(project.title);
    setPortfolioSlug(project.slug);
    setPortfolioShortDescription(project.shortDescription || '');
    setPortfolioFullDescription(project.fullDescription || '');
    setPortfolioVehicleMake(project.vehicleMake || '');
    setPortfolioVehicleModel(project.vehicleModel || '');
    setPortfolioVehicleYear(project.vehicleYear || '');
    setPortfolioCategory(project.category || '');
    setPortfolioFeaturedImage(project.featuredImage || '');
    setPortfolioImages(project.images?.join(', ') || '');
    setPortfolioComponents(project.components?.join(', ') || '');
    setPortfolioIsFeatured(project.isFeatured || false);
    setPortfolioIsPublished(project.isPublished || false);
    setIsPortfolioDialogOpen(true);
  };

  const handleDeletePortfolioProject = (project: PortfolioProject) => {
    if (window.confirm(`Weet je zeker dat je "${project.title}" wilt verwijderen?`)) {
      deletePortfolioMutation.mutate(project.id);
    }
  };

  const handleSavePortfolioProject = () => {
    const projectData = {
      title: portfolioTitle,
      slug: portfolioSlug || generateSlug(portfolioTitle),
      shortDescription: portfolioShortDescription || null,
      fullDescription: portfolioFullDescription || null,
      vehicleMake: portfolioVehicleMake || null,
      vehicleModel: portfolioVehicleModel || null,
      vehicleYear: portfolioVehicleYear || null,
      category: portfolioCategory || null,
      featuredImage: portfolioFeaturedImage || null,
      images: portfolioImages ? portfolioImages.split(',').map(s => s.trim()).filter(Boolean) : [],
      components: portfolioComponents ? portfolioComponents.split(',').map(s => s.trim()).filter(Boolean) : [],
      isFeatured: portfolioIsFeatured,
      isPublished: portfolioIsPublished,
      publishedAt: portfolioIsPublished ? new Date().toISOString() : null,
    };

    if (selectedPortfolioProject) {
      updatePortfolioMutation.mutate({ id: selectedPortfolioProject.id, data: projectData });
    } else {
      createPortfolioMutation.mutate(projectData);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name}: ${response.status}`);
        }

        const result = await response.json();
        return result.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setProductImages([...productImages, ...uploadedUrls]);

      toast({
        title: "Afbeeldingen geüpload",
        description: `${uploadedUrls.length} afbeelding(en) succesvol geüpload.`,
      });
    } catch (error: any) {
      toast({
        title: "Upload mislukt",
        description: `Er is een fout opgetreden: ${error?.message || "Onbekende fout"}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Access denied screens with premium styling
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 p-12 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-zinc-800 border border-[#d0a760] flex items-center justify-center mx-auto mb-6">
            <SignOut className="w-8 h-8 text-[#d0a760]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Toegang geweigerd</h1>
          <p className="text-zinc-400 mb-8">
            Je moet ingelogd zijn als administrator om deze pagina te bekijken.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none px-8 py-3"
            data-testid="button-login"
          >
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 p-12 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-zinc-800 border border-red-500/50 flex items-center justify-center mx-auto mb-6">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Geen toegang</h1>
          <p className="text-zinc-400 mb-8">
            Deze pagina is alleen toegankelijk voor administrators.
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-zinc-800 text-white hover:bg-zinc-700 rounded-none px-8 py-3 border border-zinc-700"
            data-testid="button-back-home"
          >
            Terug naar home
          </Button>
        </div>
      </div>
    );
  }

  const onSubmitProduct = (data: ProductFormData) => {
    const submitData = {
      ...data,
      images: productImages,
      primaryImageIndex,
      features,
      specifications,
      price: data.price,
      originalPrice: data.originalPrice || undefined,
      installationPrice: data.installationPrice || undefined,
      hasVariations,
      videoUrl: videoUrl || undefined,
      overviewContent: overviewContent || undefined,
      boxContent: boxContent.length > 0 ? boxContent : undefined,
      downloads: downloads.length > 0 ? downloads : undefined,
    };
    
    if (selectedProduct) {
      updateProductMutation.mutate(submitData);
    } else {
      createProductMutation.mutate(submitData);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    if (window.confirm(`Weet je zeker dat je "${product.name}" wilt verwijderen?`)) {
      deleteProductMutation.mutate(product.id);
    }
  };

  const handleEditProduct = async (product: Product) => {
    setSelectedProduct(product);
    setValue("name", product.name);
    setValue("slug", product.slug);
    setValue("description", product.description || "");
    setValue("shortDescription", product.shortDescription || "");
    setValue("price", product.price.toString());
    setValue("originalPrice", product.originalPrice?.toString() || "");
    setValue("installationPrice", product.installationPrice?.toString() || "");
    setValue("sku", product.sku || "");
    setValue("stock", product.stock || 0);
    setValue("brandId", product.brandId || "");
    setValue("categoryId", product.categoryId || "");
    setValue("upsellCategoryId", product.upsellCategoryId || "");
    setValue("isFeatured", product.isFeatured || false);
    setValue("canHaveInstallation", product.canHaveInstallation || false);
    
    const existingImages = product.images || [];
    setProductImages([...existingImages]);
    setPrimaryImageIndex(product.primaryImageIndex || 0);
    setFeatures(Array.isArray(product.features) ? [...product.features] : []);
    setSpecifications(product.specifications ? {...product.specifications} : {});
    
    setVideoUrl(product.videoUrl || '');
    setOverviewContent(product.overviewContent || '');
    setBoxContent(Array.isArray(product.boxContent) ? [...product.boxContent as string[]] : []);
    setDownloads(Array.isArray(product.downloads) ? [...product.downloads as {name: string, url: string}[]] : []);
    
    setHasVariations(product.hasVariations || false);
    
    if (product.hasVariations) {
      try {
        const variationsResponse = await fetch(`/api/products/${product.id}/variations`, {
          credentials: 'include'
        });
        if (variationsResponse.ok) {
          const variations = await variationsResponse.json();
          setProductVariations(variations.map((v: any) => ({
            id: v.id,
            label: v.label,
            price: v.price?.toString() || '0',
            originalPrice: v.originalPrice?.toString() || undefined,
            stock: v.stock || 0,
            sku: v.sku || undefined,
            sortOrder: v.sortOrder || 0,
            specifications: v.specifications || undefined
          })));
        } else {
          setProductVariations([]);
        }
      } catch {
        setProductVariations([]);
      }
    } else {
      setProductVariations([]);
    }
    
    try {
      const response = await fetch(`/api/products/${product.id}/compatibility`, {
        credentials: 'include'
      });
      if (response.ok) {
        const compatibility = await response.json();
        setVehicleCompatibility(compatibility.map((c: any) => ({
          makeId: c.makeId,
          modelId: c.modelId || undefined
        })));
      } else {
        setVehicleCompatibility([]);
      }
    } catch {
      setVehicleCompatibility([]);
    }
    
    setIsProductDialogOpen(true);
  };

  // Calculate stats
  const totalProducts = products?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalBookings = bookings?.length || 0;
  const pendingQuotes = quoteRequests?.filter((q: QuoteRequest) => q.status === 'pending').length || 0;
  const totalRevenue = orders?.reduce((sum: number, order: Order) => sum + parseFloat(order.total || '0'), 0) || 0;

  const navItems = [
    { id: 'dashboard' as AdminSection, label: 'Dashboard', icon: SquaresFour },
    { id: 'products' as AdminSection, label: 'Producten', icon: Package },
    { id: 'orders' as AdminSection, label: 'Bestellingen', icon: ShoppingCart },
    { id: 'bookings' as AdminSection, label: 'Afspraken', icon: CalendarBlank },
    { id: 'quotes' as AdminSection, label: 'Offertes', icon: FileText },
    { id: 'users' as AdminSection, label: 'Gebruikers', icon: Users },
    { id: 'blog' as AdminSection, label: 'Blog', icon: FileText },
    { id: 'portfolio' as AdminSection, label: 'Portfolio', icon: Car },
    { id: 'settings' as AdminSection, label: 'Instellingen', icon: Gear },
  ];

  return (
    <div className="min-h-screen bg-black flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-zinc-950 border-r border-zinc-800 fixed h-full z-40">
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800">
          <Link href="/">
            <img 
              src={logoImage} 
              alt="Car Audio Limburg" 
              className="h-8 w-auto"
              data-testid="admin-logo"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                activeSection === item.id
                  ? 'bg-[#d0a760]/10 text-[#d0a760] border-l-2 border-[#d0a760]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
              data-testid={`nav-${item.id}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {activeSection === item.id && (
                <CaretRight className="w-4 h-4 ml-auto" />
              )}
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 bg-[#d0a760]/20 border border-[#d0a760]/50 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#d0a760]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName || user?.email?.split('@')[0] || 'Admin'}
              </p>
              <p className="text-xs text-zinc-500">Administrator</p>
            </div>
          </div>
          <Link href="/">
            <Button 
              variant="ghost" 
              className="w-full mt-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-none justify-start"
              data-testid="button-back-to-site"
            >
              <House className="w-4 h-4 mr-2" />
              Terug naar site
            </Button>
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-zinc-950 border-b border-zinc-800 z-50">
        <div className="flex items-center justify-between p-4">
          <Link href="/">
            <img 
              src={logoImage} 
              alt="Car Audio Limburg" 
              className="h-6 w-auto"
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-zinc-400 hover:text-white"
            data-testid="button-toggle-menu"
          >
            <List className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/80 z-50"
          onClick={() => setSidebarOpen(false)}
        >
          <div 
            className="absolute right-0 top-0 bottom-0 w-72 bg-zinc-950 border-l border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <span className="text-white font-semibold">Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                    activeSection === item.id
                      ? 'bg-[#d0a760]/10 text-[#d0a760]'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 z-40 safe-area-bottom">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex flex-col items-center gap-1 py-2 px-3 ${
                activeSection === item.id
                  ? 'text-[#d0a760]'
                  : 'text-zinc-500'
              }`}
              data-testid={`mobile-nav-${item.id}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label.slice(0, 6)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 pb-20 lg:pb-0">
        <div className="p-4 md:p-6 lg:p-8">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" data-testid="text-dashboard-title">
                  Dashboard
                </h1>
                <p className="text-zinc-400">Overzicht van je Car Audio Limburg webshop</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 p-4 md:p-6" data-testid="stat-card-products">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-zinc-400 uppercase tracking-wider">Producten</p>
                      <p className="text-2xl md:text-3xl font-bold text-white mt-2">{totalProducts}</p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#d0a760]/10 border border-[#d0a760]/30 flex items-center justify-center">
                      <Package className="w-5 h-5 md:w-6 md:h-6 text-[#d0a760]" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <span className="text-xs text-zinc-500">Actief in catalogus</span>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-4 md:p-6" data-testid="stat-card-orders">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-zinc-400 uppercase tracking-wider">Bestellingen</p>
                      <p className="text-2xl md:text-3xl font-bold text-white mt-2">{totalOrders}</p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#d0a760]/10 border border-[#d0a760]/30 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-[#d0a760]" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <span className="text-xs text-zinc-500">Totaal verwerkt</span>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-4 md:p-6" data-testid="stat-card-revenue">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-zinc-400 uppercase tracking-wider">Omzet</p>
                      <p className="text-2xl md:text-3xl font-bold text-[#d0a760] mt-2">
                        €{totalRevenue.toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#d0a760]/10 border border-[#d0a760]/30 flex items-center justify-center">
                      <CurrencyEur className="w-5 h-5 md:w-6 md:h-6 text-[#d0a760]" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <span className="text-xs text-[#d0a760]">+12% vs vorige maand</span>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-4 md:p-6" data-testid="stat-card-bookings">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-zinc-400 uppercase tracking-wider">Afspraken</p>
                      <p className="text-2xl md:text-3xl font-bold text-white mt-2">{totalBookings}</p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#d0a760]/10 border border-[#d0a760]/30 flex items-center justify-center">
                      <CalendarBlank className="w-5 h-5 md:w-6 md:h-6 text-[#d0a760]" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <span className="text-xs text-zinc-500">Installaties gepland</span>
                  </div>
                </div>
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 p-6" data-testid="stat-card-quotes">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Offerte Aanvragen</h3>
                    <Badge className="bg-[#d0a760]/20 text-[#d0a760] hover:bg-[#d0a760]/30 rounded-none">
                      {pendingQuotes} wachtend
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-2 bg-zinc-800">
                        <div 
                          className="h-full bg-[#d0a760]" 
                          style={{ width: `${pendingQuotes > 0 ? Math.min((pendingQuotes / quoteRequests.length) * 100, 100) : 0}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-white">{quoteRequests.length}</span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-2">Totaal aantal aanvragen</p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6" data-testid="stat-card-users">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Gebruikers</h3>
                    <Badge className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded-none">
                      {users.length} geregistreerd
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#d0a760]/10 border border-[#d0a760]/30 flex items-center justify-center">
                      <Users className="w-6 h-6 text-[#d0a760]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{users.length}</p>
                      <p className="text-sm text-zinc-400">Actieve accounts</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-testid="dashboard-charts-section">
                {/* Orders by Status Chart */}
                <div className="bg-zinc-900 border border-zinc-800 p-6" data-testid="chart-orders-status">
                  <h3 className="text-lg font-semibold text-white mb-4">Bestellingen per Status</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={orderStatusData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#a1a1aa', fontSize: 12 }}
                          axisLine={{ stroke: '#3f3f46' }}
                          tickLine={{ stroke: '#3f3f46' }}
                        />
                        <YAxis 
                          tick={{ fill: '#a1a1aa', fontSize: 12 }}
                          axisLine={{ stroke: '#3f3f46' }}
                          tickLine={{ stroke: '#3f3f46' }}
                          allowDecimals={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#18181b', 
                            border: '1px solid #3f3f46',
                            borderRadius: 0,
                            color: '#fff'
                          }}
                          labelStyle={{ color: '#d0a760' }}
                        />
                        <Bar dataKey="value" fill="#d0a760" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Revenue Overview Card */}
                <div className="bg-zinc-900 border border-zinc-800 p-6" data-testid="chart-revenue-overview">
                  <h3 className="text-lg font-semibold text-white mb-4">Omzet Overzicht</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-zinc-800 border border-zinc-700">
                      <div>
                        <p className="text-sm text-zinc-400">Totale Omzet</p>
                        <p className="text-2xl font-bold text-[#d0a760]">
                          €{totalRevenue.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-[#d0a760]/10 border border-[#d0a760]/30 flex items-center justify-center">
                        <CurrencyEur className="w-6 h-6 text-[#d0a760]" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-zinc-800 border border-zinc-700">
                      <div>
                        <p className="text-sm text-zinc-400">Gemiddelde Orderwaarde</p>
                        <p className="text-2xl font-bold text-white">
                          €{totalOrders > 0 ? (totalRevenue / totalOrders).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-zinc-700 border border-zinc-600 flex items-center justify-center">
                        <TrendUp className="w-6 h-6 text-zinc-400" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-zinc-800 border border-zinc-700">
                      <div>
                        <p className="text-sm text-zinc-400">Totaal Bestellingen</p>
                        <p className="text-2xl font-bold text-white">{totalOrders}</p>
                      </div>
                      <div className="w-12 h-12 bg-zinc-700 border border-zinc-600 flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-zinc-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-zinc-900 border border-zinc-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Snelle Acties</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    onClick={() => setActiveSection('products')}
                    className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none h-auto py-4 flex flex-col gap-2"
                    data-testid="button-quick-add-product"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-sm">Nieuw Product</span>
                  </Button>
                  <Button
                    onClick={() => setActiveSection('orders')}
                    className="bg-zinc-800 text-white hover:bg-zinc-700 rounded-none h-auto py-4 flex flex-col gap-2 border border-zinc-700"
                    data-testid="button-quick-view-orders"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span className="text-sm">Bestellingen</span>
                  </Button>
                  <Button
                    onClick={() => setActiveSection('bookings')}
                    className="bg-zinc-800 text-white hover:bg-zinc-700 rounded-none h-auto py-4 flex flex-col gap-2 border border-zinc-700"
                    data-testid="button-quick-view-bookings"
                  >
                    <CalendarBlank className="w-5 h-5" />
                    <span className="text-sm">Afspraken</span>
                  </Button>
                  <Button
                    onClick={() => setActiveSection('quotes')}
                    className="bg-zinc-800 text-white hover:bg-zinc-700 rounded-none h-auto py-4 flex flex-col gap-2 border border-zinc-700"
                    data-testid="button-quick-view-quotes"
                  >
                    <FileText className="w-5 h-5" />
                    <span className="text-sm">Offertes</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Products Section */}
          {activeSection === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" data-testid="text-products-title">
                    Producten
                  </h1>
                  <p className="text-zinc-400">Beheer je productcatalogus</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = '/api/admin/products/template';
                      a.download = 'product-template.csv';
                      a.click();
                    }}
                    className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-none"
                    data-testid="button-download-template"
                  >
                    <DownloadSimple className="w-4 h-4 mr-2" />
                    Template
                  </Button>

                  <div className="relative">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      data-testid="input-bulk-upload"
                    />
                    <Button
                      variant="outline"
                      className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-none"
                    >
                      <UploadSimple className="w-4 h-4 mr-2" />
                      {selectedFile ? selectedFile.name : "CSV Upload"}
                    </Button>
                  </div>

                  {selectedFile && (
                    <Button 
                      onClick={handleBulkUpload}
                      disabled={isUploading}
                      className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none"
                      data-testid="button-start-upload"
                    >
                      {isUploading ? "Uploaden..." : "Start Import"}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={handleOptimizeImages}
                    disabled={isOptimizing}
                    className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-none"
                    data-testid="button-optimize-images"
                  >
                    <ImageSquare className="w-4 h-4 mr-2" />
                    {isOptimizing ? "Optimaliseren..." : "Optimaliseer Afbeeldingen"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/admin/export-data', { credentials: 'include' });
                        const data = await response.json();
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `car-audio-limburg-export-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast({ title: "Export succesvol", description: "Data is gedownload als JSON bestand." });
                      } catch (error) {
                        toast({ title: "Export mislukt", description: "Er ging iets mis bij het exporteren.", variant: "destructive" });
                      }
                    }}
                    className="bg-green-600/20 border-green-600/50 text-green-400 hover:bg-green-600/30 hover:text-green-300 rounded-none"
                    data-testid="button-export-data"
                  >
                    <DownloadSimple className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>

                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const text = await file.text();
                          const importData = JSON.parse(text);
                          const response = await apiRequest('POST', '/api/admin/import-data', importData);
                          const result = await response.json();
                          toast({ 
                            title: "Import succesvol", 
                            description: `Producten: ${result.results.products.imported} nieuw, ${result.results.products.updated} bijgewerkt` 
                          });
                          queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
                          queryClient.invalidateQueries({ queryKey: ['/api/products'] });
                        } catch (error) {
                          toast({ title: "Import mislukt", description: "Controleer het JSON bestand.", variant: "destructive" });
                        }
                        e.target.value = '';
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      data-testid="input-import-data"
                    />
                    <Button
                      variant="outline"
                      className="bg-blue-600/20 border-blue-600/50 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 rounded-none"
                    >
                      <UploadSimple className="w-4 h-4 mr-2" />
                      Import Data
                    </Button>
                  </div>

                  <Dialog open={isProductDialogOpen} onOpenChange={(open) => {
                    setIsProductDialogOpen(open);
                    if (!open) {
                      reset();
                      setProductImages([]);
                      setFeatures([]);
                      setSpecifications({});
                      setPrimaryImageIndex(0);
                      setSelectedProduct(null);
                      setVehicleCompatibility([]);
                      setVehicleCompatibilityOpen(false);
                      setHasVariations(false);
                      setProductVariations([]);
                      setProductFormTab('algemeen');
                      setEditingSpecKey(null);
                      setNewImageUrl('');
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none"
                        data-testid="button-add-product"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Product Toevoegen
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-700 rounded-none">
                      <DialogHeader>
                        <DialogTitle className="text-white text-xl">
                          {selectedProduct ? "Product Bewerken" : "Nieuw Product"}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <form onSubmit={handleSubmit(onSubmitProduct)} className="space-y-6 py-4">
                        <Tabs value={productFormTab} onValueChange={setProductFormTab}>
                          <TabsList className="w-full bg-zinc-800 border border-zinc-700 p-1 flex flex-wrap h-auto gap-1">
                            <TabsTrigger value="algemeen" className="text-zinc-400 data-[state=active]:bg-[#d0a760] data-[state=active]:text-black rounded-none text-xs px-3 py-2">Algemeen</TabsTrigger>
                            <TabsTrigger value="beschrijving" className="text-zinc-400 data-[state=active]:bg-[#d0a760] data-[state=active]:text-black rounded-none text-xs px-3 py-2">Beschrijving</TabsTrigger>
                            <TabsTrigger value="media" className="text-zinc-400 data-[state=active]:bg-[#d0a760] data-[state=active]:text-black rounded-none text-xs px-3 py-2">Media</TabsTrigger>
                            <TabsTrigger value="specificaties" className="text-zinc-400 data-[state=active]:bg-[#d0a760] data-[state=active]:text-black rounded-none text-xs px-3 py-2">Specificaties</TabsTrigger>
                            <TabsTrigger value="kenmerken" className="text-zinc-400 data-[state=active]:bg-[#d0a760] data-[state=active]:text-black rounded-none text-xs px-3 py-2">Kenmerken</TabsTrigger>
                            <TabsTrigger value="compatibiliteit" className="text-zinc-400 data-[state=active]:bg-[#d0a760] data-[state=active]:text-black rounded-none text-xs px-3 py-2">Compatibiliteit</TabsTrigger>
                            <TabsTrigger value="instellingen" className="text-zinc-400 data-[state=active]:bg-[#d0a760] data-[state=active]:text-black rounded-none text-xs px-3 py-2">Instellingen</TabsTrigger>
                          </TabsList>

                          {/* Tab 1: Algemeen */}
                          <TabsContent value="algemeen" className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="name" className="text-zinc-300">Naam</Label>
                                <Input
                                  {...register("name")}
                                  placeholder="Product naam"
                                  className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                                  data-testid="input-product-name"
                                />
                                {errors.name && (
                                  <p className="text-sm text-red-400 mt-1">{errors.name.message}</p>
                                )}
                              </div>
                              <div>
                                <Label htmlFor="slug" className="text-zinc-300">Slug</Label>
                                <Input
                                  {...register("slug")}
                                  placeholder="product-slug"
                                  className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                                  data-testid="input-product-slug"
                                />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="sku" className="text-zinc-300">SKU</Label>
                              <Input
                                {...register("sku")}
                                placeholder="SKU123"
                                className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                                data-testid="input-sku"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label className="text-zinc-300">Categorie</Label>
                                <Select value={watch("categoryId") || ""} onValueChange={(value) => setValue("categoryId", value)}>
                                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white rounded-none" data-testid="select-category">
                                    <SelectValue placeholder="Selecteer categorie" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-zinc-800 border-zinc-700">
                                    {categories?.map((category: any) => (
                                      <SelectItem key={category.id} value={category.id} className="text-white hover:bg-zinc-700">
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-zinc-300">Merk</Label>
                                <Select value={watch("brandId") || ""} onValueChange={(value) => setValue("brandId", value)}>
                                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white rounded-none" data-testid="select-brand">
                                    <SelectValue placeholder="Selecteer merk" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-zinc-800 border-zinc-700">
                                    {brands?.map((brand: any) => (
                                      <SelectItem key={brand.id} value={brand.id} className="text-white hover:bg-zinc-700">
                                        {brand.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-zinc-300">Upsell Categorie</Label>
                                <Select value={watch("upsellCategoryId") || ""} onValueChange={(value) => setValue("upsellCategoryId", value)}>
                                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white rounded-none" data-testid="select-upsell-category">
                                    <SelectValue placeholder="Selecteer upsell categorie" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-zinc-800 border-zinc-700">
                                    {categories?.map((category: any) => (
                                      <SelectItem key={category.id} value={category.id} className="text-white hover:bg-zinc-700">
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label htmlFor="price" className="text-zinc-300">Prijs (€)</Label>
                                <Input
                                  {...register("price")}
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                                  data-testid="input-price"
                                />
                                {errors.price && (
                                  <p className="text-sm text-red-400 mt-1">{errors.price.message}</p>
                                )}
                              </div>
                              <div>
                                <Label htmlFor="originalPrice" className="text-zinc-300">Originele prijs (€)</Label>
                                <Input
                                  {...register("originalPrice")}
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                                  data-testid="input-original-price"
                                />
                              </div>
                              <div>
                                <Label htmlFor="stock" className="text-zinc-300">Voorraad</Label>
                                <Input
                                  {...register("stock", { valueAsNumber: true })}
                                  type="number"
                                  placeholder="0"
                                  className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                                  data-testid="input-stock"
                                />
                              </div>
                            </div>
                          </TabsContent>

                          {/* Tab 2: Beschrijving */}
                          <TabsContent value="beschrijving" className="space-y-4 mt-4">
                            <div>
                              <Label htmlFor="shortDescription" className="text-zinc-300">Korte beschrijving</Label>
                              <Input
                                {...register("shortDescription")}
                                placeholder="Korte productbeschrijving"
                                className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                                data-testid="input-short-description"
                              />
                            </div>
                            <div>
                              <Label htmlFor="description" className="text-zinc-300">Beschrijving</Label>
                              <Textarea
                                {...register("description")}
                                placeholder="Volledige productbeschrijving"
                                rows={4}
                                className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                                data-testid="input-description"
                              />
                            </div>
                            <div>
                              <Label className="text-zinc-300">Uitgebreide Beschrijving (Overview)</Label>
                              <Textarea
                                placeholder="Uitgebreide productbeschrijving..."
                                value={overviewContent}
                                onChange={(e) => setOverviewContent(e.target.value)}
                                rows={8}
                                className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760] mt-2 resize-y"
                                data-testid="input-overview-content"
                              />
                            </div>
                          </TabsContent>

                          {/* Tab 3: Media */}
                          <TabsContent value="media" className="space-y-4 mt-4">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <Label className="text-zinc-300">Afbeeldingen</Label>
                                {productImages.length > 0 && (
                                  <Badge className="bg-zinc-800 text-zinc-300 rounded-none">
                                    {productImages.length} afbeelding{productImages.length !== 1 ? 'en' : ''}
                                  </Badge>
                                )}
                              </div>
                              <div className="mt-2 border-2 border-dashed border-zinc-700 p-4 text-center hover:border-[#d0a760] transition-colors">
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={handleImageUpload}
                                  className="hidden"
                                  id="image-upload"
                                  data-testid="input-image-upload"
                                />
                                <label htmlFor="image-upload" className="cursor-pointer">
                                  <UploadSimple className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                                  <p className="text-sm text-zinc-400">
                                    {isUploading ? "Uploaden..." : "Klik om afbeeldingen te uploaden"}
                                  </p>
                                </label>
                              </div>

                              <div className="flex gap-2 mt-3">
                                <Input
                                  placeholder="Afbeelding URL toevoegen..."
                                  value={newImageUrl}
                                  onChange={(e) => setNewImageUrl(e.target.value)}
                                  className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                                  data-testid="input-image-url"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      if (newImageUrl.trim()) {
                                        setProductImages([...productImages, newImageUrl.trim()]);
                                        setNewImageUrl('');
                                      }
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  onClick={() => {
                                    if (newImageUrl.trim()) {
                                      setProductImages([...productImages, newImageUrl.trim()]);
                                      setNewImageUrl('');
                                    }
                                  }}
                                  className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              {productImages.length > 0 && (
                                <div className="mt-4 grid grid-cols-4 gap-2">
                                  {productImages.map((url, index) => (
                                    <div 
                                      key={index} 
                                      className={`relative aspect-square border-2 group ${
                                        index === primaryImageIndex 
                                          ? 'border-[#d0a760]' 
                                          : 'border-zinc-700'
                                      }`}
                                    >
                                      <img
                                        src={url}
                                        alt={`Product ${index + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                      {index === primaryImageIndex && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-[#d0a760] text-black text-[10px] text-center py-0.5 font-semibold">
                                          HOOFD
                                        </div>
                                      )}
                                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          type="button"
                                          onClick={() => setPrimaryImageIndex(index)}
                                          className={`w-6 h-6 flex items-center justify-center ${
                                            index === primaryImageIndex 
                                              ? 'bg-[#d0a760] text-black' 
                                              : 'bg-zinc-800/90 text-white hover:bg-[#d0a760] hover:text-black'
                                          }`}
                                          title="Instellen als hoofdafbeelding"
                                        >
                                          <Star className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newImages = productImages.filter((_, i) => i !== index);
                                            setProductImages(newImages);
                                            if (primaryImageIndex >= newImages.length) {
                                              setPrimaryImageIndex(Math.max(0, newImages.length - 1));
                                            }
                                          }}
                                          className="w-6 h-6 bg-red-500/80 text-white flex items-center justify-center hover:bg-red-600"
                                          title="Verwijderen"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div>
                              <Label className="text-zinc-300">Video URL (YouTube)</Label>
                              <Input
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760] mt-2"
                                data-testid="input-video-url"
                              />
                              {videoUrl && videoUrl.includes('youtube.com/watch?v=') && (
                                <div className="mt-3">
                                  <p className="text-zinc-400 text-xs mb-2">YouTube Preview:</p>
                                  <img
                                    src={`https://img.youtube.com/vi/${videoUrl.split('v=')[1]?.split('&')[0]}/mqdefault.jpg`}
                                    alt="YouTube Thumbnail"
                                    className="w-48 h-auto border border-zinc-700"
                                  />
                                </div>
                              )}
                              {videoUrl && videoUrl.includes('youtu.be/') && (
                                <div className="mt-3">
                                  <p className="text-zinc-400 text-xs mb-2">YouTube Preview:</p>
                                  <img
                                    src={`https://img.youtube.com/vi/${videoUrl.split('youtu.be/')[1]?.split('?')[0]}/mqdefault.jpg`}
                                    alt="YouTube Thumbnail"
                                    className="w-48 h-auto border border-zinc-700"
                                  />
                                </div>
                              )}
                            </div>
                          </TabsContent>

                          {/* Tab 4: Specificaties */}
                          <TabsContent value="specificaties" className="space-y-4 mt-4">
                            <div>
                              <Label className="text-zinc-300">Specificaties</Label>
                              <div className="flex gap-2 mt-2">
                                <Input
                                  placeholder="Naam"
                                  value={newSpecKey}
                                  onChange={(e) => setNewSpecKey(e.target.value)}
                                  className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                                  data-testid="input-spec-key"
                                />
                                <Input
                                  placeholder="Waarde"
                                  value={newSpecValue}
                                  onChange={(e) => setNewSpecValue(e.target.value)}
                                  className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                                  data-testid="input-spec-value"
                                />
                                <Button
                                  type="button"
                                  onClick={() => {
                                    if (newSpecKey.trim() && newSpecValue.trim()) {
                                      setSpecifications({
                                        ...specifications,
                                        [newSpecKey.trim()]: newSpecValue.trim()
                                      });
                                      setNewSpecKey('');
                                      setNewSpecValue('');
                                    }
                                  }}
                                  className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none"
                                  data-testid="button-add-specification"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              {Object.keys(specifications).length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {Object.entries(specifications).map(([key, value], index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between bg-zinc-800 px-3 py-2"
                                    >
                                      <span className="text-sm text-zinc-300 flex-1">
                                        <strong className="text-white">{key}:</strong>{' '}
                                        {editingSpecKey === key ? (
                                          <input
                                            type="text"
                                            defaultValue={String(value)}
                                            autoFocus
                                            className="bg-zinc-700 border border-zinc-600 text-white px-2 py-0.5 text-sm rounded-none focus:border-[#d0a760] outline-none"
                                            onBlur={(e) => {
                                              if (e.target.value.trim()) {
                                                setSpecifications({ ...specifications, [key]: e.target.value.trim() });
                                              }
                                              setEditingSpecKey(null);
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                const target = e.target as HTMLInputElement;
                                                if (target.value.trim()) {
                                                  setSpecifications({ ...specifications, [key]: target.value.trim() });
                                                }
                                                setEditingSpecKey(null);
                                              } else if (e.key === 'Escape') {
                                                setEditingSpecKey(null);
                                              }
                                            }}
                                          />
                                        ) : (
                                          <span
                                            className="cursor-pointer hover:text-[#d0a760] transition-colors"
                                            onClick={() => setEditingSpecKey(key)}
                                            title="Klik om te bewerken"
                                          >
                                            {String(value)}
                                          </span>
                                        )}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newSpecs = { ...specifications };
                                          delete newSpecs[key];
                                          setSpecifications(newSpecs);
                                        }}
                                        className="text-zinc-400 hover:text-red-400 ml-2"
                                        data-testid={`button-remove-spec-${key}`}
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TabsContent>

                          {/* Tab 5: Kenmerken */}
                          <TabsContent value="kenmerken" className="space-y-6 mt-4">
                            <div>
                              <Label className="text-zinc-300">Kenmerken</Label>
                              <div className="flex gap-2 mt-2">
                                <Input
                                  value={newFeature}
                                  onChange={(e) => setNewFeature(e.target.value)}
                                  placeholder="Kenmerk toevoegen"
                                  className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                                  data-testid="input-new-feature"
                                />
                                <Button
                                  type="button"
                                  onClick={() => {
                                    if (newFeature.trim()) {
                                      setFeatures([...features, newFeature.trim()]);
                                      setNewFeature('');
                                    }
                                  }}
                                  className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none"
                                  data-testid="button-add-feature"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              {features.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {features.map((feature, index) => (
                                    <Badge 
                                      key={index} 
                                      className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded-none pr-1"
                                    >
                                      {feature}
                                      <button
                                        type="button"
                                        onClick={() => setFeatures(features.filter((_, i) => i !== index))}
                                        className="ml-2 hover:text-red-400"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                            <Separator className="bg-zinc-700" />

                            <div>
                              <Label className="text-zinc-300">Inhoud van de doos</Label>
                              <div className="flex gap-2 mt-2">
                                <Input
                                  placeholder="Item toevoegen..."
                                  value={newBoxItem}
                                  onChange={(e) => setNewBoxItem(e.target.value)}
                                  className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                                  data-testid="input-new-box-item"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      if (newBoxItem.trim()) {
                                        setBoxContent([...boxContent, newBoxItem.trim()]);
                                        setNewBoxItem('');
                                      }
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  onClick={() => {
                                    if (newBoxItem.trim()) {
                                      setBoxContent([...boxContent, newBoxItem.trim()]);
                                      setNewBoxItem('');
                                    }
                                  }}
                                  className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none"
                                  data-testid="button-add-box-item"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              {boxContent.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {boxContent.map((item, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between bg-zinc-800 px-3 py-2"
                                    >
                                      <span className="text-sm text-zinc-300">{item}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setBoxContent(boxContent.filter((_, i) => i !== index));
                                        }}
                                        className="text-zinc-400 hover:text-red-400"
                                        data-testid={`button-remove-box-item-${index}`}
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <Separator className="bg-zinc-700" />

                            <div>
                              <Label className="text-zinc-300">Downloads (handleidingen, tech sheets, etc.)</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <div className="relative">
                                  <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      
                                      const formData = new FormData();
                                      formData.append('file', file);
                                      
                                      try {
                                        const response = await fetch('/api/upload/pdf', {
                                          method: 'POST',
                                          credentials: 'include',
                                          body: formData,
                                        });
                                        
                                        if (!response.ok) throw new Error('Upload failed');
                                        
                                        const result = await response.json();
                                        const fileName = file.name.replace('.pdf', '').replace(/_/g, ' ');
                                        setDownloads([...downloads, { name: fileName, url: result.url }]);
                                        toast({ title: "PDF geüpload", description: file.name });
                                      } catch (error) {
                                        toast({ title: "Upload mislukt", variant: "destructive" });
                                      }
                                      e.target.value = '';
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    data-testid="input-pdf-upload"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="bg-blue-600/20 border-blue-600/50 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 rounded-none"
                                  >
                                    <UploadSimple className="w-4 h-4 mr-2" />
                                    PDF Uploaden
                                  </Button>
                                </div>
                                <span className="text-zinc-500 self-center">of handmatig:</span>
                                <Input
                                  placeholder="Naam"
                                  value={newDownloadName}
                                  onChange={(e) => setNewDownloadName(e.target.value)}
                                  className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760] w-32"
                                  data-testid="input-download-name"
                                />
                                <Input
                                  placeholder="URL"
                                  value={newDownloadUrl}
                                  onChange={(e) => setNewDownloadUrl(e.target.value)}
                                  className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760] flex-1 min-w-32"
                                  data-testid="input-download-url"
                                />
                                <Button
                                  type="button"
                                  onClick={() => {
                                    if (newDownloadName.trim() && newDownloadUrl.trim()) {
                                      setDownloads([...downloads, { name: newDownloadName.trim(), url: newDownloadUrl.trim() }]);
                                      setNewDownloadName('');
                                      setNewDownloadUrl('');
                                    }
                                  }}
                                  className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none"
                                  data-testid="button-add-download"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              {downloads.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {downloads.map((download, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between bg-zinc-800 px-3 py-2"
                                    >
                                      <div className="flex items-center gap-2 text-sm">
                                        <DownloadSimple className="w-4 h-4 text-[#d0a760]" />
                                        <span className="text-white font-medium">{download.name}</span>
                                        <span className="text-zinc-500">-</span>
                                        <span className="text-zinc-400 text-xs truncate max-w-48">{download.url}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDownloads(downloads.filter((_, i) => i !== index));
                                        }}
                                        className="text-zinc-400 hover:text-red-400"
                                        data-testid={`button-remove-download-${index}`}
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TabsContent>

                          {/* Tab 6: Compatibiliteit */}
                          <TabsContent value="compatibiliteit" className="space-y-6 mt-4">
                            <div className="space-y-3">
                              <Collapsible
                                open={vehicleCompatibilityOpen}
                                onOpenChange={setVehicleCompatibilityOpen}
                              >
                            <CollapsibleTrigger asChild>
                              <button
                                type="button"
                                className="flex items-center justify-between w-full p-4 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700/50 transition-colors"
                                data-testid="toggle-vehicle-compatibility"
                              >
                                <div className="flex items-center gap-3">
                                  <Car className="w-5 h-5 text-[#d0a760]" />
                                  <span className="text-white font-medium">Voertuig Compatibiliteit</span>
                                  {vehicleCompatibility.length > 0 && (
                                    <Badge className="bg-[#d0a760]/20 text-[#d0a760] rounded-none">
                                      {vehicleCompatibility.length} geselecteerd
                                    </Badge>
                                  )}
                                </div>
                                <CaretDown className={`w-5 h-5 text-zinc-400 transition-transform ${vehicleCompatibilityOpen ? 'rotate-180' : ''}`} />
                              </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="border border-t-0 border-zinc-700 bg-zinc-900 p-4 space-y-3 max-h-96 overflow-y-auto">
                                {vehicleMakes.length === 0 ? (
                                  <p className="text-zinc-500 text-sm">Geen voertuigmerken beschikbaar</p>
                                ) : (
                                  vehicleMakes.map((make) => {
                                    const makeModels = vehicleModels.filter(m => m.makeId === make.id);
                                    const isExpanded = expandedMakes.has(make.id);
                                    const selectedModelsForMake = vehicleCompatibility.filter(c => c.makeId === make.id && c.modelId);
                                    const hasAllModelsSelected = makeModels.length > 0 && selectedModelsForMake.length === makeModels.length;
                                    const hasSomeModelsSelected = selectedModelsForMake.length > 0 && selectedModelsForMake.length < makeModels.length;
                                    const hasMakeOnlySelected = vehicleCompatibility.some(c => c.makeId === make.id && !c.modelId);

                                    return (
                                      <div key={make.id} className="border border-zinc-700 bg-zinc-800">
                                        <div className="flex items-center gap-3 p-3">
                                          <Checkbox
                                            id={`make-${make.id}`}
                                            checked={hasAllModelsSelected || hasMakeOnlySelected}
                                            className="border-zinc-600 data-[state=checked]:bg-[#d0a760] data-[state=checked]:border-[#d0a760]"
                                            onCheckedChange={(checked) => {
                                              if (checked) {
                                                const newCompatibility = vehicleCompatibility.filter(c => c.makeId !== make.id);
                                                if (makeModels.length > 0) {
                                                  makeModels.forEach(model => {
                                                    newCompatibility.push({ makeId: make.id, modelId: model.id });
                                                  });
                                                } else {
                                                  newCompatibility.push({ makeId: make.id });
                                                }
                                                setVehicleCompatibility(newCompatibility);
                                              } else {
                                                setVehicleCompatibility(vehicleCompatibility.filter(c => c.makeId !== make.id));
                                              }
                                            }}
                                            data-testid={`checkbox-make-${make.id}`}
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const newExpanded = new Set(expandedMakes);
                                              if (isExpanded) {
                                                newExpanded.delete(make.id);
                                              } else {
                                                newExpanded.add(make.id);
                                              }
                                              setExpandedMakes(newExpanded);
                                            }}
                                            className="flex-1 flex items-center justify-between text-left"
                                          >
                                            <span className="text-white font-medium">{make.name}</span>
                                            <div className="flex items-center gap-2">
                                              {(hasSomeModelsSelected || hasAllModelsSelected) && (
                                                <span className="text-xs text-zinc-400">
                                                  {selectedModelsForMake.length}/{makeModels.length}
                                                </span>
                                              )}
                                              {makeModels.length > 0 && (
                                                <CaretRight className={`w-4 h-4 text-zinc-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                              )}
                                            </div>
                                          </button>
                                        </div>
                                        
                                        {isExpanded && makeModels.length > 0 && (
                                          <div className="border-t border-zinc-700 p-3 bg-zinc-900">
                                            <div className="grid grid-cols-2 gap-2">
                                              {makeModels.map((model) => {
                                                const isSelected = vehicleCompatibility.some(
                                                  c => c.makeId === make.id && c.modelId === model.id
                                                );
                                                return (
                                                  <div key={model.id} className="flex items-center gap-2">
                                                    <Checkbox
                                                      id={`model-${model.id}`}
                                                      checked={isSelected}
                                                      className="border-zinc-600 data-[state=checked]:bg-[#d0a760] data-[state=checked]:border-[#d0a760]"
                                                      onCheckedChange={(checked) => {
                                                        if (checked) {
                                                          setVehicleCompatibility([
                                                            ...vehicleCompatibility.filter(c => !(c.makeId === make.id && !c.modelId)),
                                                            { makeId: make.id, modelId: model.id }
                                                          ]);
                                                        } else {
                                                          setVehicleCompatibility(
                                                            vehicleCompatibility.filter(c => !(c.makeId === make.id && c.modelId === model.id))
                                                          );
                                                        }
                                                      }}
                                                      data-testid={`checkbox-model-${model.id}`}
                                                    />
                                                    <label
                                                      htmlFor={`model-${model.id}`}
                                                      className="text-sm text-zinc-300 cursor-pointer"
                                                    >
                                                      {model.name}
                                                    </label>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </CollapsibleContent>
                              </Collapsible>
                            </div>

                            <Separator className="bg-zinc-700" />

                            {hasVariations && (
                              <div className="p-4 bg-zinc-800 space-y-4">
                                <Label className="text-zinc-300 font-semibold">Productvariaties</Label>
                                
                                {productVariations.length > 0 && (
                                  <div className="border border-zinc-700 overflow-hidden">
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="border-zinc-700 hover:bg-transparent">
                                          <TableHead className="text-[#d0a760] font-semibold">Label</TableHead>
                                          <TableHead className="text-[#d0a760] font-semibold">Prijs</TableHead>
                                          <TableHead className="text-[#d0a760] font-semibold">Voorraad</TableHead>
                                          <TableHead className="text-[#d0a760] font-semibold">SKU</TableHead>
                                          <TableHead className="text-[#d0a760] font-semibold text-right">Acties</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {productVariations.map((variation, index) => (
                                          <TableRow key={index} className="border-zinc-700">
                                            <TableCell className="text-white">
                                              {variation.label}
                                              {variation.specifications && Object.keys(variation.specifications).length > 0 && (
                                                <span className="ml-2 text-[#d0a760]/60 text-xs">({Object.keys(variation.specifications).length} specs)</span>
                                              )}
                                            </TableCell>
                                            <TableCell className="text-white">€{variation.price}</TableCell>
                                            <TableCell className="text-white">{variation.stock}</TableCell>
                                            <TableCell className="text-zinc-400">{variation.sku || '-'}</TableCell>
                                            <TableCell className="text-right">
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                  setProductVariations(productVariations.filter((_, i) => i !== index));
                                                }}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                                data-testid={`button-delete-variation-${index}`}
                                              >
                                                <Trash className="w-4 h-4" />
                                              </Button>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                )}
                                
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                  <div>
                                    <Label className="text-zinc-400 text-sm">Label</Label>
                                    <Input
                                      type="text"
                                      value={newVariationLabel}
                                      onChange={(e) => setNewVariationLabel(e.target.value)}
                                      placeholder="bijv. 128GB"
                                      className="bg-zinc-700 border-zinc-600 text-white rounded-none focus:border-[#d0a760]"
                                      data-testid="input-variation-label"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-zinc-400 text-sm">Prijs (€)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={newVariationPrice}
                                      onChange={(e) => setNewVariationPrice(e.target.value)}
                                      placeholder="0.00"
                                      className="bg-zinc-700 border-zinc-600 text-white rounded-none focus:border-[#d0a760]"
                                      data-testid="input-variation-price"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-zinc-400 text-sm">Voorraad</Label>
                                    <Input
                                      type="number"
                                      value={newVariationStock}
                                      onChange={(e) => setNewVariationStock(parseInt(e.target.value) || 0)}
                                      placeholder="0"
                                      className="bg-zinc-700 border-zinc-600 text-white rounded-none focus:border-[#d0a760]"
                                      data-testid="input-variation-stock"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-zinc-400 text-sm">SKU</Label>
                                    <Input
                                      type="text"
                                      value={newVariationSku}
                                      onChange={(e) => setNewVariationSku(e.target.value)}
                                      placeholder="SKU-001"
                                      className="bg-zinc-700 border-zinc-600 text-white rounded-none focus:border-[#d0a760]"
                                      data-testid="input-variation-sku"
                                    />
                                  </div>
                                  <div className="col-span-2 md:col-span-5">
                                    <Label className="text-zinc-400 text-sm">Specificaties (optioneel, één per regel: Sleutel: Waarde)</Label>
                                    <textarea
                                      value={newVariationSpecs}
                                      onChange={(e) => setNewVariationSpecs(e.target.value)}
                                      placeholder={"Scherm: 10.25 inch\nConnector: Quadlock\niDrive: CIC / NBT"}
                                      rows={3}
                                      className="w-full mt-1 px-3 py-2 bg-zinc-700 border border-zinc-600 text-white text-sm rounded-none focus:border-[#d0a760] focus:outline-none resize-none"
                                      data-testid="input-variation-specs"
                                    />
                                  </div>
                                  <div className="flex items-end col-span-2 md:col-span-5">
                                    <Button
                                      type="button"
                                      onClick={() => {
                                        if (newVariationLabel && newVariationPrice) {
                                          const specs: Record<string, string> = {};
                                          if (newVariationSpecs.trim()) {
                                            newVariationSpecs.split('\n').forEach(line => {
                                              const colonIdx = line.indexOf(':');
                                              if (colonIdx > 0) {
                                                const key = line.substring(0, colonIdx).trim();
                                                const val = line.substring(colonIdx + 1).trim();
                                                if (key && val) specs[key] = val;
                                              }
                                            });
                                          }
                                          setProductVariations([
                                            ...productVariations,
                                            {
                                              label: newVariationLabel,
                                              price: newVariationPrice,
                                              stock: newVariationStock,
                                              sku: newVariationSku || undefined,
                                              sortOrder: productVariations.length,
                                              specifications: Object.keys(specs).length > 0 ? specs : undefined
                                            }
                                          ]);
                                          setNewVariationLabel('');
                                          setNewVariationPrice('');
                                          setNewVariationStock(0);
                                          setNewVariationSku('');
                                          setNewVariationSpecs('');
                                        }
                                      }}
                                      className="w-full bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none"
                                      data-testid="button-add-variation"
                                    >
                                      <Plus className="w-4 h-4 mr-1" />
                                      Variatie Toevoegen
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {!hasVariations && (
                              <p className="text-zinc-500 text-sm">Schakel variaties in via de Instellingen tab om variaties toe te voegen.</p>
                            )}
                          </TabsContent>

                          {/* Tab 7: Instellingen */}
                          <TabsContent value="instellingen" className="space-y-4 mt-4">
                            <div className="flex items-center justify-between p-4 bg-zinc-800">
                              <div>
                                <Label className="text-white">Uitgelicht product</Label>
                                <p className="text-sm text-zinc-400">Toon op homepage</p>
                              </div>
                              <Switch
                                checked={isFeatured || false}
                                onCheckedChange={(checked) => setValue("isFeatured", checked)}
                                data-testid="switch-featured"
                              />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-zinc-800">
                              <div>
                                <Label className="text-white">Installatie service</Label>
                                <p className="text-sm text-zinc-400">Bied installatie aan</p>
                              </div>
                              <Switch
                                checked={canHaveInstallation || false}
                                onCheckedChange={(checked) => {
                                  setValue("canHaveInstallation", checked);
                                  if (!checked) setValue("installationPrice", "");
                                }}
                                data-testid="switch-installation"
                              />
                            </div>

                            {canHaveInstallation && (
                              <div className="p-4 bg-zinc-800">
                                <Label htmlFor="installationPrice" className="text-zinc-300">Installatie prijs (€)</Label>
                                <Input
                                  {...register("installationPrice")}
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  className="mt-2 bg-zinc-700 border-zinc-600 text-white rounded-none focus:border-[#d0a760]"
                                  data-testid="input-installation-price"
                                />
                              </div>
                            )}

                            <div className="flex items-center justify-between p-4 bg-zinc-800">
                              <div>
                                <Label className="text-white">Heeft variaties (bijv. opslagcapaciteit)</Label>
                                <p className="text-sm text-zinc-400">Bied verschillende opties aan</p>
                              </div>
                              <Switch
                                checked={hasVariations || false}
                                onCheckedChange={(checked) => {
                                  setHasVariations(checked);
                                  if (!checked) setProductVariations([]);
                                }}
                                data-testid="switch-has-variations"
                              />
                            </div>
                          </TabsContent>
                        </Tabs>

                        <div className="flex justify-end gap-3 pt-4">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setIsProductDialogOpen(false)}
                            className="bg-transparent border-zinc-600 text-zinc-300 hover:bg-zinc-800 rounded-none"
                            data-testid="button-cancel-product"
                          >
                            Annuleren
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={createProductMutation.isPending || updateProductMutation.isPending}
                            className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none"
                            data-testid="button-save-product"
                          >
                            {(createProductMutation.isPending || updateProductMutation.isPending) 
                              ? "Opslaan..."
                              : (selectedProduct ? "Bijwerken" : "Opslaan")
                            }
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Product Search and Filters */}
              <div className="bg-zinc-900 border border-zinc-800 p-4" data-testid="product-filters-section">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-zinc-400 text-sm mb-2 block">Zoeken</Label>
                    <Input
                      type="text"
                      placeholder="Zoek op productnaam..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-none focus:border-[#d0a760]"
                      data-testid="input-product-search"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-400 text-sm mb-2 block">Categorie</Label>
                    <Select value={productCategoryFilter || "all"} onValueChange={(val) => setProductCategoryFilter(val === "all" ? "" : val)}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]" data-testid="select-product-category">
                        <SelectValue placeholder="Alle categorieën" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700 rounded-none">
                        <SelectItem value="all" className="text-white hover:bg-zinc-700">Alle categorieën</SelectItem>
                        {categories.filter((c: any) => c.id).map((category: any) => (
                          <SelectItem key={category.id} value={category.id} className="text-white hover:bg-zinc-700">
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-zinc-400 text-sm mb-2 block">Merk</Label>
                    <Select value={productBrandFilter || "all"} onValueChange={(val) => setProductBrandFilter(val === "all" ? "" : val)}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]" data-testid="select-product-brand">
                        <SelectValue placeholder="Alle merken" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700 rounded-none">
                        <SelectItem value="all" className="text-white hover:bg-zinc-700">Alle merken</SelectItem>
                        {brands.filter((b: any) => b.id).map((brand: any) => (
                          <SelectItem key={brand.id} value={brand.id} className="text-white hover:bg-zinc-700">
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {(productSearch || productCategoryFilter || productBrandFilter) && (
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm text-zinc-400">
                      {filteredProducts.length} van {products.length} producten gevonden
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setProductSearch('');
                        setProductCategoryFilter('');
                        setProductBrandFilter('');
                      }}
                      className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-none"
                      data-testid="button-clear-filters"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Filters wissen
                    </Button>
                  </div>
                )}
              </div>

              {/* Products Table - Desktop */}
              <div className="hidden md:block bg-zinc-900 border border-zinc-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-[#d0a760] font-semibold">Product</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Prijs</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Voorraad</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Status</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold text-right">Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingProducts ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i} className="border-zinc-800">
                          <TableCell><div className="h-4 bg-zinc-800 animate-pulse"></div></TableCell>
                          <TableCell><div className="h-4 bg-zinc-800 animate-pulse w-20"></div></TableCell>
                          <TableCell><div className="h-4 bg-zinc-800 animate-pulse w-12"></div></TableCell>
                          <TableCell><div className="h-4 bg-zinc-800 animate-pulse w-16"></div></TableCell>
                          <TableCell><div className="h-4 bg-zinc-800 animate-pulse w-24"></div></TableCell>
                        </TableRow>
                      ))
                    ) : filteredProducts?.length === 0 ? (
                      <TableRow className="border-zinc-800">
                        <TableCell colSpan={5} className="text-center text-zinc-500 py-12">
                          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>{products.length === 0 ? 'Nog geen producten toegevoegd' : 'Geen producten gevonden'}</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts?.map((product: Product) => (
                        <TableRow key={product.id} className="border-zinc-800 hover:bg-zinc-800/50" data-testid={`product-row-${product.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {product.images?.[0] && (
                                <img 
                                  src={product.images[0]} 
                                  alt={product.name}
                                  className="w-10 h-10 object-cover border border-zinc-700"
                                />
                              )}
                              <div>
                                <p className="font-medium text-white">{product.name}</p>
                                <p className="text-xs text-zinc-500">{product.sku || 'Geen SKU'}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-white font-medium">€{parseFloat(product.price).toFixed(2)}</TableCell>
                          <TableCell>
                            <span className={`${(product.stock || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {product.stock || 0}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`rounded-none ${product.isActive 
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                              : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'}`}
                            >
                              {product.isActive ? "Actief" : "Inactief"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditProduct(product)}
                                className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-[#d0a760] rounded-none"
                                data-testid={`button-edit-product-${product.id}`}
                              >
                                <PencilSimple className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDeleteProduct(product)}
                                disabled={deleteProductMutation.isPending}
                                className="bg-transparent border-zinc-700 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 rounded-none"
                                data-testid={`button-delete-product-${product.id}`}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Products Cards - Mobile */}
              <div className="md:hidden space-y-3">
                {isLoadingProducts ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 animate-pulse">
                      <div className="h-5 bg-zinc-800 w-3/4 mb-2"></div>
                      <div className="h-4 bg-zinc-800 w-1/2"></div>
                    </div>
                  ))
                ) : filteredProducts?.length === 0 ? (
                  <div className="bg-zinc-900 border border-zinc-800 p-8 text-center">
                    <Package className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                    <p className="text-zinc-500">{products.length === 0 ? 'Nog geen producten' : 'Geen producten gevonden'}</p>
                  </div>
                ) : (
                  filteredProducts?.map((product: Product) => (
                    <div key={product.id} className="bg-zinc-900 border border-zinc-800 p-4" data-testid={`product-card-${product.id}`}>
                      <div className="flex gap-3">
                        {product.images?.[0] && (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-16 h-16 object-cover border border-zinc-700"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white truncate">{product.name}</h3>
                          <p className="text-[#d0a760] font-semibold">€{parseFloat(product.price).toFixed(2)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs ${(product.stock || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              Voorraad: {product.stock || 0}
                            </span>
                            <Badge className={`rounded-none text-xs ${product.isActive 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-zinc-700 text-zinc-400'}`}
                            >
                              {product.isActive ? "Actief" : "Inactief"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-800">
                        <Button 
                          size="sm" 
                          onClick={() => handleEditProduct(product)}
                          className="flex-1 bg-zinc-800 text-white hover:bg-zinc-700 rounded-none"
                        >
                          <PencilSimple className="w-4 h-4 mr-2" />
                          Bewerken
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleDeleteProduct(product)}
                          className="bg-transparent border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-none"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Orders Section */}
          {activeSection === 'orders' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" data-testid="text-orders-title">
                  Bestellingen
                </h1>
                <p className="text-zinc-400">Beheer en volg klantbestellingen</p>
              </div>

              {/* Orders Table - Desktop */}
              <div className="hidden md:block bg-zinc-900 border border-zinc-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-[#d0a760] font-semibold">Bestelnummer</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Klant</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Totaal</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Status</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Datum</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold text-right">Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingOrders ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i} className="border-zinc-800">
                          {[...Array(6)].map((_, j) => (
                            <TableCell key={j}><div className="h-4 bg-zinc-800 animate-pulse"></div></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : orders?.length === 0 ? (
                      <TableRow className="border-zinc-800">
                        <TableCell colSpan={6} className="text-center text-zinc-500 py-12">
                          <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Nog geen bestellingen</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders?.map((order: Order) => (
                        <TableRow key={order.id} className="border-zinc-800 hover:bg-zinc-800/50" data-testid={`order-row-${order.id}`}>
                          <TableCell className="font-medium text-white">{order.orderNumber}</TableCell>
                          <TableCell className="text-zinc-300">Klant</TableCell>
                          <TableCell className="text-[#d0a760] font-semibold">€{parseFloat(order.total).toFixed(2)}</TableCell>
                          <TableCell>
                            <Select 
                              value={order.status || 'pending'} 
                              onValueChange={(status) => updateOrderStatusMutation.mutate({ id: order.id, status })}
                            >
                              <SelectTrigger className="w-36 bg-zinc-800 border-zinc-700 text-white rounded-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-800 border-zinc-700">
                                <SelectItem value="pending" className="text-yellow-400">Wachtend</SelectItem>
                                <SelectItem value="confirmed" className="text-blue-400">Bevestigd</SelectItem>
                                <SelectItem value="processing" className="text-purple-400">Verwerken</SelectItem>
                                <SelectItem value="completed" className="text-green-400">Voltooid</SelectItem>
                                <SelectItem value="cancelled" className="text-red-400">Geannuleerd</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-zinc-400">
                            {order.createdAt ? format(new Date(order.createdAt), "dd MMM yyyy", { locale: nl }) : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-[#d0a760] rounded-none"
                              data-testid={`button-view-order-${order.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Orders Cards - Mobile */}
              <div className="md:hidden space-y-3">
                {isLoadingOrders ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 animate-pulse">
                      <div className="h-5 bg-zinc-800 w-1/2 mb-2"></div>
                      <div className="h-4 bg-zinc-800 w-1/3"></div>
                    </div>
                  ))
                ) : orders?.length === 0 ? (
                  <div className="bg-zinc-900 border border-zinc-800 p-8 text-center">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                    <p className="text-zinc-500">Nog geen bestellingen</p>
                  </div>
                ) : (
                  orders?.map((order: Order) => (
                    <div key={order.id} className="bg-zinc-900 border border-zinc-800 p-4" data-testid={`order-card-${order.id}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-white">{order.orderNumber}</h3>
                          <p className="text-sm text-zinc-500">
                            {order.createdAt ? format(new Date(order.createdAt), "dd MMM yyyy", { locale: nl }) : "-"}
                          </p>
                        </div>
                        <p className="text-[#d0a760] font-bold text-lg">€{parseFloat(order.total).toFixed(2)}</p>
                      </div>
                      <Select 
                        value={order.status || 'pending'} 
                        onValueChange={(status) => updateOrderStatusMutation.mutate({ id: order.id, status })}
                      >
                        <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-white rounded-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="pending">Wachtend</SelectItem>
                          <SelectItem value="confirmed">Bevestigd</SelectItem>
                          <SelectItem value="processing">Verwerken</SelectItem>
                          <SelectItem value="completed">Voltooid</SelectItem>
                          <SelectItem value="cancelled">Geannuleerd</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Bookings Section */}
          {activeSection === 'bookings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" data-testid="text-bookings-title">
                  Installatie Afspraken
                </h1>
                <p className="text-zinc-400">Beheer installatie reserveringen</p>
              </div>

              {/* Bookings Table - Desktop */}
              <div className="hidden md:block bg-zinc-900 border border-zinc-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-[#d0a760] font-semibold">Klant</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Service</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Datum</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Tijd</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Status</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold text-right">Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingBookings ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i} className="border-zinc-800">
                          {[...Array(6)].map((_, j) => (
                            <TableCell key={j}><div className="h-4 bg-zinc-800 animate-pulse"></div></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : bookings?.length === 0 ? (
                      <TableRow className="border-zinc-800">
                        <TableCell colSpan={6} className="text-center text-zinc-500 py-12">
                          <CalendarBlank className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Nog geen afspraken</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      bookings?.map((booking: Booking) => (
                        <TableRow key={booking.id} className="border-zinc-800 hover:bg-zinc-800/50" data-testid={`booking-row-${booking.id}`}>
                          <TableCell className="font-medium text-white">{booking.customerName}</TableCell>
                          <TableCell className="text-zinc-300">{booking.serviceType}</TableCell>
                          <TableCell className="text-zinc-300">
                            {booking.scheduledDate ? format(new Date(booking.scheduledDate), "dd MMM yyyy", { locale: nl }) : "-"}
                          </TableCell>
                          <TableCell className="text-zinc-300">
                            {booking.scheduledDate ? format(new Date(booking.scheduledDate), "HH:mm") : "-"}
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={booking.status || "pending"} 
                              onValueChange={(status) => updateBookingStatusMutation.mutate({ id: booking.id, status })}
                            >
                              <SelectTrigger className="w-36 bg-zinc-800 border-zinc-700 text-white rounded-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-800 border-zinc-700">
                                <SelectItem value="pending" className="text-yellow-400">Wachtend</SelectItem>
                                <SelectItem value="confirmed" className="text-blue-400">Bevestigd</SelectItem>
                                <SelectItem value="in-progress" className="text-purple-400">Bezig</SelectItem>
                                <SelectItem value="completed" className="text-green-400">Voltooid</SelectItem>
                                <SelectItem value="cancelled" className="text-red-400">Geannuleerd</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-[#d0a760] rounded-none"
                              data-testid={`button-view-booking-${booking.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Bookings Cards - Mobile */}
              <div className="md:hidden space-y-3">
                {isLoadingBookings ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 animate-pulse">
                      <div className="h-5 bg-zinc-800 w-3/4 mb-2"></div>
                      <div className="h-4 bg-zinc-800 w-1/2"></div>
                    </div>
                  ))
                ) : bookings?.length === 0 ? (
                  <div className="bg-zinc-900 border border-zinc-800 p-8 text-center">
                    <CalendarBlank className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                    <p className="text-zinc-500">Nog geen afspraken</p>
                  </div>
                ) : (
                  bookings?.map((booking: Booking) => (
                    <div key={booking.id} className="bg-zinc-900 border border-zinc-800 p-4" data-testid={`booking-card-${booking.id}`}>
                      <div className="mb-3">
                        <h3 className="font-medium text-white">{booking.customerName}</h3>
                        <p className="text-sm text-[#d0a760]">{booking.serviceType}</p>
                        <p className="text-sm text-zinc-500 mt-1">
                          {booking.scheduledDate ? format(new Date(booking.scheduledDate), "dd MMM yyyy 'om' HH:mm", { locale: nl }) : "-"}
                        </p>
                      </div>
                      <Select 
                        value={booking.status || "pending"} 
                        onValueChange={(status) => updateBookingStatusMutation.mutate({ id: booking.id, status })}
                      >
                        <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-white rounded-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="pending">Wachtend</SelectItem>
                          <SelectItem value="confirmed">Bevestigd</SelectItem>
                          <SelectItem value="in-progress">Bezig</SelectItem>
                          <SelectItem value="completed">Voltooid</SelectItem>
                          <SelectItem value="cancelled">Geannuleerd</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Quotes Section */}
          {activeSection === 'quotes' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" data-testid="text-quotes-title">
                  Offerte Aanvragen
                </h1>
                <p className="text-zinc-400">Bekijk en verwerk offerte aanvragen</p>
              </div>

              {/* Quotes Table - Desktop */}
              <div className="hidden md:block bg-zinc-900 border border-zinc-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-[#d0a760] font-semibold">Naam</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Email</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Voertuig</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Status</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Datum</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold text-right">Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingQuotes ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i} className="border-zinc-800">
                          {[...Array(6)].map((_, j) => (
                            <TableCell key={j}><div className="h-4 bg-zinc-800 animate-pulse"></div></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : quoteRequests?.length === 0 ? (
                      <TableRow className="border-zinc-800">
                        <TableCell colSpan={6} className="text-center text-zinc-500 py-12">
                          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Nog geen offerte aanvragen</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      quoteRequests?.map((quote: QuoteRequest) => (
                        <TableRow key={quote.id} className="border-zinc-800 hover:bg-zinc-800/50" data-testid={`quote-row-${quote.id}`}>
                          <TableCell className="font-medium text-white">{quote.firstName} {quote.lastName}</TableCell>
                          <TableCell className="text-zinc-300">{quote.email}</TableCell>
                          <TableCell className="text-zinc-300">{quote.vehicleMake} {quote.vehicleModel} ({quote.vehicleYear})</TableCell>
                          <TableCell>
                            <Badge className={`rounded-none ${quote.status === 'pending' 
                              ? 'bg-yellow-500/20 text-yellow-400' 
                              : 'bg-green-500/20 text-green-400'}`}
                            >
                              {quote.status === 'pending' ? 'Wachtend' : 'Verwerkt'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-zinc-400">
                            {quote.createdAt ? format(new Date(quote.createdAt), "dd MMM yyyy", { locale: nl }) : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-[#d0a760] rounded-none"
                              data-testid={`button-view-quote-${quote.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Quotes Cards - Mobile */}
              <div className="md:hidden space-y-3">
                {isLoadingQuotes ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 animate-pulse">
                      <div className="h-5 bg-zinc-800 w-3/4 mb-2"></div>
                      <div className="h-4 bg-zinc-800 w-1/2"></div>
                    </div>
                  ))
                ) : quoteRequests?.length === 0 ? (
                  <div className="bg-zinc-900 border border-zinc-800 p-8 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                    <p className="text-zinc-500">Nog geen offerte aanvragen</p>
                  </div>
                ) : (
                  quoteRequests?.map((quote: QuoteRequest) => (
                    <div key={quote.id} className="bg-zinc-900 border border-zinc-800 p-4" data-testid={`quote-card-${quote.id}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-white">{quote.firstName} {quote.lastName}</h3>
                          <p className="text-sm text-zinc-400">{quote.email}</p>
                        </div>
                        <Badge className={`rounded-none ${quote.status === 'pending' 
                          ? 'bg-yellow-500/20 text-yellow-400' 
                          : 'bg-green-500/20 text-green-400'}`}
                        >
                          {quote.status === 'pending' ? 'Wachtend' : 'Verwerkt'}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#d0a760]">{quote.vehicleMake} {quote.vehicleModel} ({quote.vehicleYear})</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {quote.createdAt ? format(new Date(quote.createdAt), "dd MMM yyyy", { locale: nl }) : "-"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Users Section */}
          {activeSection === 'users' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" data-testid="text-users-title">
                  Gebruikers
                </h1>
                <p className="text-zinc-400">Beheer geregistreerde accounts</p>
              </div>

              {/* Users Table - Desktop */}
              <div className="hidden md:block bg-zinc-900 border border-zinc-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-[#d0a760] font-semibold">Naam</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Email</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Rol</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Registratie</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold text-right">Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingUsers ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i} className="border-zinc-800">
                          {[...Array(5)].map((_, j) => (
                            <TableCell key={j}><div className="h-4 bg-zinc-800 animate-pulse"></div></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : users?.length === 0 ? (
                      <TableRow className="border-zinc-800">
                        <TableCell colSpan={5} className="text-center text-zinc-500 py-12">
                          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Nog geen gebruikers</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users?.map((user: User) => (
                        <TableRow key={user.id} className="border-zinc-800 hover:bg-zinc-800/50" data-testid={`user-row-${user.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-[#d0a760]/20 border border-[#d0a760]/30 flex items-center justify-center">
                                <Users className="w-4 h-4 text-[#d0a760]" />
                              </div>
                              <span className="font-medium text-white">
                                {user.firstName && user.lastName 
                                  ? `${user.firstName} ${user.lastName}` 
                                  : user.email?.split('@')[0] || 'Onbekend'
                                }
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-zinc-300">{user.email}</TableCell>
                          <TableCell>
                            <Badge className={`rounded-none ${user.role === 'admin' 
                              ? 'bg-[#d0a760]/20 text-[#d0a760]' 
                              : 'bg-zinc-700 text-zinc-300'}`}
                            >
                              {user.role === 'admin' ? 'Admin' : 'Klant'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-zinc-400">
                            {user.createdAt ? format(new Date(user.createdAt), "dd MMM yyyy", { locale: nl }) : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-[#d0a760] rounded-none"
                              data-testid={`button-view-user-${user.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Users Cards - Mobile */}
              <div className="md:hidden space-y-3">
                {isLoadingUsers ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 animate-pulse">
                      <div className="h-5 bg-zinc-800 w-3/4 mb-2"></div>
                      <div className="h-4 bg-zinc-800 w-1/2"></div>
                    </div>
                  ))
                ) : users?.length === 0 ? (
                  <div className="bg-zinc-900 border border-zinc-800 p-8 text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                    <p className="text-zinc-500">Nog geen gebruikers</p>
                  </div>
                ) : (
                  users?.map((user: User) => (
                    <div key={user.id} className="bg-zinc-900 border border-zinc-800 p-4" data-testid={`user-card-${user.id}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#d0a760]/20 border border-[#d0a760]/30 flex items-center justify-center">
                          <Users className="w-5 h-5 text-[#d0a760]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-white">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : user.email?.split('@')[0] || 'Onbekend'
                            }
                          </h3>
                          <p className="text-sm text-zinc-400">{user.email}</p>
                        </div>
                        <Badge className={`rounded-none ${user.role === 'admin' 
                          ? 'bg-[#d0a760]/20 text-[#d0a760]' 
                          : 'bg-zinc-700 text-zinc-300'}`}
                        >
                          {user.role === 'admin' ? 'Admin' : 'Klant'}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-500">
                        Geregistreerd: {user.createdAt ? format(new Date(user.createdAt), "dd MMM yyyy", { locale: nl }) : "-"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Blog Section */}
          {activeSection === 'blog' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" data-testid="text-blog-title">
                    Blog Beheer
                  </h1>
                  <p className="text-zinc-400">Beheer blogposts en categorieën</p>
                </div>

                <div className="flex gap-2">
                  {/* Blog Category Dialog */}
                  <Dialog open={isBlogCategoryDialogOpen} onOpenChange={(open) => {
                    setIsBlogCategoryDialogOpen(open);
                    if (!open) resetBlogCategoryForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                        className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-none"
                        data-testid="button-add-category"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Categorie
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg bg-zinc-900 border-zinc-700 rounded-none">
                      <DialogHeader>
                        <DialogTitle className="text-white text-xl">
                          {selectedBlogCategory ? "Categorie Bewerken" : "Nieuwe Categorie"}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div>
                          <Label className="text-zinc-300">Naam</Label>
                          <Input
                            value={blogCategoryName}
                            onChange={(e) => {
                              setBlogCategoryName(e.target.value);
                              if (!selectedBlogCategory) {
                                setBlogCategorySlug(generateSlug(e.target.value));
                              }
                            }}
                            placeholder="Categorie naam"
                            className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                            data-testid="input-category-name"
                          />
                        </div>

                        <div>
                          <Label className="text-zinc-300">Slug</Label>
                          <Input
                            value={blogCategorySlug}
                            onChange={(e) => setBlogCategorySlug(e.target.value)}
                            placeholder="categorie-slug"
                            className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                            data-testid="input-category-slug"
                          />
                        </div>

                        <div>
                          <Label className="text-zinc-300">Beschrijving</Label>
                          <Textarea
                            value={blogCategoryDescription}
                            onChange={(e) => setBlogCategoryDescription(e.target.value)}
                            placeholder="Korte beschrijving van de categorie"
                            rows={3}
                            className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                            data-testid="input-category-description"
                          />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => {
                              setIsBlogCategoryDialogOpen(false);
                              resetBlogCategoryForm();
                            }}
                            className="bg-transparent border-zinc-600 text-zinc-300 hover:bg-zinc-800 rounded-none"
                            data-testid="button-cancel-category"
                          >
                            Annuleren
                          </Button>
                          <Button 
                            onClick={handleSaveBlogCategory}
                            disabled={createBlogCategoryMutation.isPending || updateBlogCategoryMutation.isPending || !blogCategoryName}
                            className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none"
                            data-testid="button-save-category"
                          >
                            {(createBlogCategoryMutation.isPending || updateBlogCategoryMutation.isPending) 
                              ? "Opslaan..."
                              : (selectedBlogCategory ? "Bijwerken" : "Opslaan")
                            }
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Blog Post Dialog */}
                  <Dialog open={isBlogPostDialogOpen} onOpenChange={(open) => {
                    setIsBlogPostDialogOpen(open);
                    if (!open) resetBlogPostForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none"
                        data-testid="button-add-blogpost"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Nieuwe Blogpost
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-700 rounded-none">
                      <DialogHeader>
                        <DialogTitle className="text-white text-xl">
                          {selectedBlogPost ? "Blogpost Bewerken" : "Nieuwe Blogpost"}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-6 py-4">
                        {/* Title & Slug */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-zinc-300">Titel</Label>
                            <Input
                              value={blogPostTitle}
                              onChange={(e) => {
                                setBlogPostTitle(e.target.value);
                                if (!selectedBlogPost) {
                                  setBlogPostSlug(generateSlug(e.target.value));
                                }
                              }}
                              placeholder="Blogpost titel"
                              className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                              data-testid="input-blogpost-title"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-zinc-300">Slug</Label>
                            <Input
                              value={blogPostSlug}
                              onChange={(e) => setBlogPostSlug(e.target.value)}
                              placeholder="blogpost-slug"
                              className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                              data-testid="input-blogpost-slug"
                            />
                          </div>
                        </div>

                        {/* Excerpt */}
                        <div>
                          <Label className="text-zinc-300">Samenvatting (Excerpt)</Label>
                          <Textarea
                            value={blogPostExcerpt}
                            onChange={(e) => setBlogPostExcerpt(e.target.value)}
                            placeholder="Korte samenvatting van het artikel..."
                            rows={2}
                            className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                            data-testid="input-blogpost-excerpt"
                          />
                        </div>

                        {/* Content */}
                        <div>
                          <Label className="text-zinc-300">Inhoud</Label>
                          <Textarea
                            value={blogPostContent}
                            onChange={(e) => setBlogPostContent(e.target.value)}
                            placeholder="Volledige artikelinhoud..."
                            rows={12}
                            className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                            data-testid="input-blogpost-content"
                          />
                        </div>

                        {/* Featured Image & Meta Description */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-zinc-300">Uitgelichte Afbeelding URL</Label>
                            <Input
                              value={blogPostFeaturedImage}
                              onChange={(e) => setBlogPostFeaturedImage(e.target.value)}
                              placeholder="https://..."
                              className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                              data-testid="input-blogpost-image"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-zinc-300">Meta Beschrijving (SEO)</Label>
                            <Input
                              value={blogPostMetaDescription}
                              onChange={(e) => setBlogPostMetaDescription(e.target.value)}
                              placeholder="SEO meta beschrijving..."
                              className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                              data-testid="input-blogpost-meta"
                            />
                          </div>
                        </div>

                        {/* Category & Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-zinc-300">Categorie</Label>
                            <Select value={blogPostCategoryId} onValueChange={setBlogPostCategoryId}>
                              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white rounded-none" data-testid="select-blogpost-category">
                                <SelectValue placeholder="Selecteer categorie" />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-800 border-zinc-700">
                                {blogCategories?.map((category) => (
                                  <SelectItem key={category.id} value={category.id} className="text-white hover:bg-zinc-700">
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label className="text-zinc-300">Status</Label>
                            <Select value={blogPostStatus} onValueChange={(value: 'draft' | 'published') => setBlogPostStatus(value)}>
                              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white rounded-none" data-testid="select-blogpost-status">
                                <SelectValue placeholder="Selecteer status" />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-800 border-zinc-700">
                                <SelectItem value="draft" className="text-white hover:bg-zinc-700">Concept</SelectItem>
                                <SelectItem value="published" className="text-white hover:bg-zinc-700">Gepubliceerd</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Featured Toggle */}
                        <div className="flex items-center justify-between p-4 bg-zinc-800">
                          <div>
                            <Label className="text-white">Uitgelicht artikel</Label>
                            <p className="text-sm text-zinc-400">Toon op homepage of in uitgelichte sectie</p>
                          </div>
                          <Switch
                            checked={blogPostIsFeatured}
                            onCheckedChange={setBlogPostIsFeatured}
                            data-testid="switch-blogpost-featured"
                          />
                        </div>

                        <Separator className="bg-zinc-700" />

                        <div className="flex justify-end gap-3 pt-4">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => {
                              setIsBlogPostDialogOpen(false);
                              resetBlogPostForm();
                            }}
                            className="bg-transparent border-zinc-600 text-zinc-300 hover:bg-zinc-800 rounded-none"
                            data-testid="button-cancel-blogpost"
                          >
                            Annuleren
                          </Button>
                          <Button 
                            onClick={handleSaveBlogPost}
                            disabled={createBlogPostMutation.isPending || updateBlogPostMutation.isPending || !blogPostTitle || !blogPostContent}
                            className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none"
                            data-testid="button-save-blogpost"
                          >
                            {(createBlogPostMutation.isPending || updateBlogPostMutation.isPending) 
                              ? "Opslaan..."
                              : (selectedBlogPost ? "Bijwerken" : "Opslaan")
                            }
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Blog Categories Section */}
              <div className="bg-zinc-900 border border-zinc-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Categorieën</h3>
                  <Badge className="bg-zinc-800 text-zinc-300 rounded-none">
                    {blogCategories.length} categorieën
                  </Badge>
                </div>
                
                {blogCategories.length === 0 ? (
                  <p className="text-zinc-500 text-center py-4">Nog geen categorieën toegevoegd</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {blogCategories.map((category) => (
                      <div 
                        key={category.id} 
                        className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 px-3 py-2"
                        data-testid={`category-item-${category.id}`}
                      >
                        <span className="text-white">{category.name}</span>
                        <button
                          onClick={() => handleEditBlogCategory(category)}
                          className="text-zinc-400 hover:text-[#d0a760]"
                          data-testid={`button-edit-category-${category.id}`}
                        >
                          <PencilSimple className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlogCategory(category)}
                          className="text-zinc-400 hover:text-red-400"
                          data-testid={`button-delete-category-${category.id}`}
                        >
                          <Trash className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Blog Posts Table - Desktop */}
              <div className="hidden md:block bg-zinc-900 border border-zinc-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-[#d0a760] font-semibold">Titel</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Status</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Categorie</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Publicatiedatum</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Weergaven</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold text-right">Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingBlogPosts ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i} className="border-zinc-800">
                          {[...Array(6)].map((_, j) => (
                            <TableCell key={j}><div className="h-4 bg-zinc-800 animate-pulse"></div></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : blogPosts?.length === 0 ? (
                      <TableRow className="border-zinc-800">
                        <TableCell colSpan={6} className="text-center text-zinc-500 py-12">
                          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Nog geen blogposts</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      blogPosts?.map((post: BlogPost) => (
                        <TableRow key={post.id} className="border-zinc-800 hover:bg-zinc-800/50" data-testid={`blogpost-row-${post.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {post.featuredImage && (
                                <img 
                                  src={post.featuredImage} 
                                  alt={post.title}
                                  className="w-10 h-10 object-cover border border-zinc-700"
                                />
                              )}
                              <div>
                                <p className="font-medium text-white">{post.title}</p>
                                {post.isFeatured && (
                                  <Badge className="bg-[#d0a760]/20 text-[#d0a760] rounded-none text-xs mt-1">
                                    Uitgelicht
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`rounded-none ${post.status === 'published' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'}`}
                            >
                              {post.status === 'published' ? 'Gepubliceerd' : 'Concept'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-zinc-300">
                            {blogCategories.find(c => c.id === post.categoryId)?.name || '-'}
                          </TableCell>
                          <TableCell className="text-zinc-400">
                            {post.publishedAt ? format(new Date(post.publishedAt), "dd MMM yyyy", { locale: nl }) : "-"}
                          </TableCell>
                          <TableCell className="text-zinc-300">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4 text-zinc-500" />
                              {post.viewCount || 0}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditBlogPost(post)}
                                className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-[#d0a760] rounded-none"
                                data-testid={`button-edit-blogpost-${post.id}`}
                              >
                                <PencilSimple className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDeleteBlogPost(post)}
                                disabled={deleteBlogPostMutation.isPending}
                                className="bg-transparent border-zinc-700 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 rounded-none"
                                data-testid={`button-delete-blogpost-${post.id}`}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Blog Posts Cards - Mobile */}
              <div className="md:hidden space-y-3">
                {isLoadingBlogPosts ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 animate-pulse">
                      <div className="h-5 bg-zinc-800 w-3/4 mb-2"></div>
                      <div className="h-4 bg-zinc-800 w-1/2"></div>
                    </div>
                  ))
                ) : blogPosts?.length === 0 ? (
                  <div className="bg-zinc-900 border border-zinc-800 p-8 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                    <p className="text-zinc-500">Nog geen blogposts</p>
                  </div>
                ) : (
                  blogPosts?.map((post: BlogPost) => (
                    <div key={post.id} className="bg-zinc-900 border border-zinc-800 p-4" data-testid={`blogpost-card-${post.id}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{post.title}</h3>
                          <div className="flex gap-2 mt-1">
                            <Badge className={`rounded-none text-xs ${post.status === 'published' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'}`}
                            >
                              {post.status === 'published' ? 'Gepubliceerd' : 'Concept'}
                            </Badge>
                            {post.isFeatured && (
                              <Badge className="bg-[#d0a760]/20 text-[#d0a760] rounded-none text-xs">
                                Uitgelicht
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEditBlogPost(post)}
                            className="h-8 w-8 p-0 text-zinc-400 hover:text-[#d0a760]"
                            data-testid={`button-edit-blogpost-mobile-${post.id}`}
                          >
                            <PencilSimple className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteBlogPost(post)}
                            className="h-8 w-8 p-0 text-zinc-400 hover:text-red-400"
                            data-testid={`button-delete-blogpost-mobile-${post.id}`}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-400">
                        {blogCategories.find(c => c.id === post.categoryId)?.name || 'Geen categorie'} • 
                        {post.viewCount || 0} weergaven
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {post.publishedAt ? format(new Date(post.publishedAt), "dd MMM yyyy", { locale: nl }) : "Niet gepubliceerd"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Portfolio Section */}
          {activeSection === 'portfolio' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" data-testid="text-portfolio-title">
                    Portfolio Beheer
                  </h1>
                  <p className="text-zinc-400">Beheer je portfolio projecten</p>
                </div>

                <Dialog open={isPortfolioDialogOpen} onOpenChange={(open) => {
                  setIsPortfolioDialogOpen(open);
                  if (!open) resetPortfolioForm();
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none"
                      data-testid="button-add-portfolio"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nieuw Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-700 rounded-none">
                    <DialogHeader>
                      <DialogTitle className="text-white text-xl">
                        {selectedPortfolioProject ? "Project Bewerken" : "Nieuw Portfolio Project"}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                      {/* Title & Slug */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-zinc-300">Titel</Label>
                          <Input
                            value={portfolioTitle}
                            onChange={(e) => {
                              setPortfolioTitle(e.target.value);
                              if (!selectedPortfolioProject) {
                                setPortfolioSlug(generateSlug(e.target.value));
                              }
                            }}
                            placeholder="Project titel"
                            className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                            data-testid="input-portfolio-title"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-zinc-300">Slug</Label>
                          <Input
                            value={portfolioSlug}
                            onChange={(e) => setPortfolioSlug(e.target.value)}
                            placeholder="project-slug"
                            className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                            data-testid="input-portfolio-slug"
                          />
                        </div>
                      </div>

                      {/* Short Description */}
                      <div>
                        <Label className="text-zinc-300">Korte Beschrijving</Label>
                        <Textarea
                          value={portfolioShortDescription}
                          onChange={(e) => setPortfolioShortDescription(e.target.value)}
                          placeholder="Korte samenvatting van het project..."
                          rows={2}
                          className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                          data-testid="input-portfolio-short-description"
                        />
                      </div>

                      {/* Full Description */}
                      <div>
                        <Label className="text-zinc-300">Volledige Beschrijving</Label>
                        <Textarea
                          value={portfolioFullDescription}
                          onChange={(e) => setPortfolioFullDescription(e.target.value)}
                          placeholder="Gedetailleerde projectbeschrijving..."
                          rows={6}
                          className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                          data-testid="input-portfolio-full-description"
                        />
                      </div>

                      {/* Vehicle Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-zinc-300">Voertuig Merk</Label>
                          <Input
                            value={portfolioVehicleMake}
                            onChange={(e) => setPortfolioVehicleMake(e.target.value)}
                            placeholder="BMW, Audi, Mercedes..."
                            className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                            data-testid="input-portfolio-vehicle-make"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-zinc-300">Voertuig Model</Label>
                          <Input
                            value={portfolioVehicleModel}
                            onChange={(e) => setPortfolioVehicleModel(e.target.value)}
                            placeholder="3 Serie, A4, C-Klasse..."
                            className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                            data-testid="input-portfolio-vehicle-model"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-zinc-300">Voertuig Jaar</Label>
                          <Input
                            value={portfolioVehicleYear}
                            onChange={(e) => setPortfolioVehicleYear(e.target.value)}
                            placeholder="2023"
                            className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                            data-testid="input-portfolio-vehicle-year"
                          />
                        </div>
                      </div>

                      {/* Category */}
                      <div>
                        <Label className="text-zinc-300">Categorie</Label>
                        <Select value={portfolioCategory} onValueChange={setPortfolioCategory}>
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white rounded-none" data-testid="select-portfolio-category">
                            <SelectValue placeholder="Selecteer categorie" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            <SelectItem value="soundupgrade" className="text-white hover:bg-zinc-700">Sound Upgrade</SelectItem>
                            <SelectItem value="carplay" className="text-white hover:bg-zinc-700">CarPlay</SelectItem>
                            <SelectItem value="entertainment" className="text-white hover:bg-zinc-700">Entertainment</SelectItem>
                            <SelectItem value="custom" className="text-white hover:bg-zinc-700">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Featured Image */}
                      <div>
                        <Label className="text-zinc-300">Uitgelichte Afbeelding URL</Label>
                        <Input
                          value={portfolioFeaturedImage}
                          onChange={(e) => setPortfolioFeaturedImage(e.target.value)}
                          placeholder="https://..."
                          className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                          data-testid="input-portfolio-featured-image"
                        />
                      </div>

                      {/* Images Array */}
                      <div>
                        <Label className="text-zinc-300">Afbeeldingen (komma-gescheiden URLs)</Label>
                        <Textarea
                          value={portfolioImages}
                          onChange={(e) => setPortfolioImages(e.target.value)}
                          placeholder="https://image1.jpg, https://image2.jpg, https://image3.jpg"
                          rows={2}
                          className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                          data-testid="input-portfolio-images"
                        />
                      </div>

                      {/* Components */}
                      <div>
                        <Label className="text-zinc-300">Componenten (komma-gescheiden)</Label>
                        <Textarea
                          value={portfolioComponents}
                          onChange={(e) => setPortfolioComponents(e.target.value)}
                          placeholder="Alpine ILX-W690D, Focal PS165FXE, Audison Prima AP4.9..."
                          rows={2}
                          className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                          data-testid="input-portfolio-components"
                        />
                      </div>

                      {/* Toggles */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 bg-zinc-800">
                          <div>
                            <Label className="text-white">Uitgelicht Project</Label>
                            <p className="text-sm text-zinc-400">Toon op homepage of in uitgelichte sectie</p>
                          </div>
                          <Switch
                            checked={portfolioIsFeatured}
                            onCheckedChange={setPortfolioIsFeatured}
                            data-testid="switch-portfolio-featured"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-zinc-800">
                          <div>
                            <Label className="text-white">Gepubliceerd</Label>
                            <p className="text-sm text-zinc-400">Zichtbaar op de website</p>
                          </div>
                          <Switch
                            checked={portfolioIsPublished}
                            onCheckedChange={setPortfolioIsPublished}
                            data-testid="switch-portfolio-published"
                          />
                        </div>
                      </div>

                      <Separator className="bg-zinc-700" />

                      <div className="flex justify-end gap-3 pt-4">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => {
                            setIsPortfolioDialogOpen(false);
                            resetPortfolioForm();
                          }}
                          className="bg-transparent border-zinc-600 text-zinc-300 hover:bg-zinc-800 rounded-none"
                          data-testid="button-cancel-portfolio"
                        >
                          Annuleren
                        </Button>
                        <Button 
                          onClick={handleSavePortfolioProject}
                          disabled={createPortfolioMutation.isPending || updatePortfolioMutation.isPending || !portfolioTitle}
                          className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none"
                          data-testid="button-save-portfolio"
                        >
                          {(createPortfolioMutation.isPending || updatePortfolioMutation.isPending) 
                            ? "Opslaan..."
                            : (selectedPortfolioProject ? "Bijwerken" : "Opslaan")
                          }
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Portfolio Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <p className="text-xs text-zinc-400 uppercase tracking-wider">Totaal Projecten</p>
                  <p className="text-2xl font-bold text-white mt-1">{portfolioProjects.length}</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <p className="text-xs text-zinc-400 uppercase tracking-wider">Gepubliceerd</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">{portfolioProjects.filter(p => p.isPublished).length}</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <p className="text-xs text-zinc-400 uppercase tracking-wider">Uitgelicht</p>
                  <p className="text-2xl font-bold text-[#d0a760] mt-1">{portfolioProjects.filter(p => p.isFeatured).length}</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <p className="text-xs text-zinc-400 uppercase tracking-wider">Concept</p>
                  <p className="text-2xl font-bold text-yellow-400 mt-1">{portfolioProjects.filter(p => !p.isPublished).length}</p>
                </div>
              </div>

              {/* Portfolio Table - Desktop */}
              <div className="hidden md:block bg-zinc-900 border border-zinc-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-[#d0a760] font-semibold">Project</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Voertuig</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Categorie</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Status</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold">Aangemaakt</TableHead>
                      <TableHead className="text-[#d0a760] font-semibold text-right">Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingPortfolio ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i} className="border-zinc-800">
                          {[...Array(6)].map((_, j) => (
                            <TableCell key={j}><div className="h-4 bg-zinc-800 animate-pulse"></div></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : portfolioProjects?.length === 0 ? (
                      <TableRow className="border-zinc-800">
                        <TableCell colSpan={6} className="text-center text-zinc-500 py-12">
                          <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Nog geen portfolio projecten</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      portfolioProjects?.map((project: PortfolioProject) => (
                        <TableRow key={project.id} className="border-zinc-800 hover:bg-zinc-800/50" data-testid={`portfolio-row-${project.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {project.featuredImage && (
                                <img 
                                  src={project.featuredImage} 
                                  alt={project.title}
                                  className="w-12 h-12 object-cover border border-zinc-700"
                                />
                              )}
                              <div>
                                <p className="font-medium text-white">{project.title}</p>
                                {project.isFeatured && (
                                  <Badge className="bg-[#d0a760]/20 text-[#d0a760] rounded-none text-xs mt-1">
                                    Uitgelicht
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-zinc-300">
                            {project.vehicleMake && project.vehicleModel 
                              ? `${project.vehicleMake} ${project.vehicleModel}${project.vehicleYear ? ` (${project.vehicleYear})` : ''}`
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-zinc-800 text-zinc-300 rounded-none capitalize">
                              {project.category || '-'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`rounded-none ${project.isPublished 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'}`}
                            >
                              {project.isPublished ? 'Gepubliceerd' : 'Concept'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-zinc-400">
                            {project.createdAt ? format(new Date(project.createdAt), "dd MMM yyyy", { locale: nl }) : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleEditPortfolioProject(project)}
                                className="h-8 w-8 p-0 text-zinc-400 hover:text-[#d0a760]"
                                data-testid={`button-edit-portfolio-${project.id}`}
                              >
                                <PencilSimple className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDeletePortfolioProject(project)}
                                className="h-8 w-8 p-0 text-zinc-400 hover:text-red-400"
                                data-testid={`button-delete-portfolio-${project.id}`}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Portfolio Cards - Mobile */}
              <div className="md:hidden space-y-3">
                {isLoadingPortfolio ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 animate-pulse">
                      <div className="h-5 bg-zinc-800 w-3/4 mb-2"></div>
                      <div className="h-4 bg-zinc-800 w-1/2"></div>
                    </div>
                  ))
                ) : portfolioProjects?.length === 0 ? (
                  <div className="bg-zinc-900 border border-zinc-800 p-8 text-center">
                    <Car className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                    <p className="text-zinc-500">Nog geen portfolio projecten</p>
                  </div>
                ) : (
                  portfolioProjects?.map((project: PortfolioProject) => (
                    <div key={project.id} className="bg-zinc-900 border border-zinc-800 p-4" data-testid={`portfolio-card-${project.id}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-3">
                          {project.featuredImage && (
                            <img 
                              src={project.featuredImage} 
                              alt={project.title}
                              className="w-16 h-16 object-cover border border-zinc-700"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium text-white">{project.title}</h3>
                            <p className="text-sm text-zinc-400">
                              {project.vehicleMake && project.vehicleModel 
                                ? `${project.vehicleMake} ${project.vehicleModel}`
                                : 'Geen voertuig'
                              }
                            </p>
                            <div className="flex gap-2 mt-1">
                              <Badge className={`rounded-none text-xs ${project.isPublished 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-yellow-500/20 text-yellow-400'}`}
                              >
                                {project.isPublished ? 'Gepubliceerd' : 'Concept'}
                              </Badge>
                              {project.isFeatured && (
                                <Badge className="bg-[#d0a760]/20 text-[#d0a760] rounded-none text-xs">
                                  Uitgelicht
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEditPortfolioProject(project)}
                            className="h-8 w-8 p-0 text-zinc-400 hover:text-[#d0a760]"
                            data-testid={`button-edit-portfolio-mobile-${project.id}`}
                          >
                            <PencilSimple className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeletePortfolioProject(project)}
                            className="h-8 w-8 p-0 text-zinc-400 hover:text-red-400"
                            data-testid={`button-delete-portfolio-mobile-${project.id}`}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500">
                        {project.createdAt ? format(new Date(project.createdAt), "dd MMM yyyy", { locale: nl }) : "Geen datum"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          {activeSection === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" data-testid="text-settings-title">
                  Site Instellingen
                </h1>
                <p className="text-zinc-400">Beheer globale instellingen voor de webshop</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-6">
                <h2 className="text-lg font-semibold text-white">Services</h2>
                
                <div className="flex items-center justify-between p-4 bg-zinc-800">
                  <div>
                    <Label className="text-white text-base">Installatie Service</Label>
                    <p className="text-sm text-zinc-400 mt-1">
                      Schakel de installatie-service in of uit op de hele website. 
                      Als uitgeschakeld worden alle installatie-knoppen, prijzen en de boekingspagina verborgen.
                    </p>
                  </div>
                  <Switch
                    checked={siteSettings?.installationServiceEnabled ?? true}
                    onCheckedChange={(checked) => {
                      updateSiteSettingsMutation.mutate({ installationServiceEnabled: checked });
                    }}
                    data-testid="switch-global-installation"
                  />
                </div>
              </div>

              <TeamleaderSettings />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
