import { useState, useEffect } from "react";
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
  Edit, 
  Trash2, 
  Package, 
  ShoppingCart, 
  Calendar,
  Users,
  TrendingUp,
  Eye,
  Upload,
  Download,
  X,
  Star,
  Image,
  Settings,
  LayoutDashboard,
  FileText,
  Menu,
  LogOut,
  ChevronRight,
  Euro,
  BarChart3,
  Home
} from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import type { Product, Order, Booking, QuoteRequest, User, BlogPost, BlogCategory } from "@shared/schema";
import { Link } from "wouter";

import logoImage from "@assets/CAL white_1758369495328.png";

const productFormSchema = insertProductSchema.extend({
  price: z.string().min(1, "Prijs is verplicht"),
  originalPrice: z.string().optional(),
  installationPrice: z.string().optional(),
  features: z.array(z.string()).optional(),
  specifications: z.record(z.string(), z.any()).optional(),
  images: z.array(z.string()).optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

type AdminSection = 'dashboard' | 'products' | 'orders' | 'bookings' | 'quotes' | 'users' | 'blog';

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

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const payload = {
        ...data,
        price: data.price,
        originalPrice: data.originalPrice || null,
        installationPrice: data.installationPrice || null,
        images: productImages,
        features,
        specifications,
      };
      await apiRequest("POST", "/api/products", payload);
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
    mutationFn: async (data: ProductFormData) => {
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
      };
      await apiRequest("PUT", `/api/products/${selectedProduct.id}`, payload);
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
            <LogOut className="w-8 h-8 text-[#d0a760]" />
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

  const handleEditProduct = (product: Product) => {
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
    
    setIsProductDialogOpen(true);
  };

  // Calculate stats
  const totalProducts = products?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalBookings = bookings?.length || 0;
  const pendingQuotes = quoteRequests?.filter((q: QuoteRequest) => q.status === 'pending').length || 0;
  const totalRevenue = orders?.reduce((sum: number, order: Order) => sum + parseFloat(order.totalAmount || '0'), 0) || 0;

  const navItems = [
    { id: 'dashboard' as AdminSection, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products' as AdminSection, label: 'Producten', icon: Package },
    { id: 'orders' as AdminSection, label: 'Bestellingen', icon: ShoppingCart },
    { id: 'bookings' as AdminSection, label: 'Afspraken', icon: Calendar },
    { id: 'quotes' as AdminSection, label: 'Offertes', icon: FileText },
    { id: 'users' as AdminSection, label: 'Gebruikers', icon: Users },
    { id: 'blog' as AdminSection, label: 'Blog', icon: FileText },
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
                <ChevronRight className="w-4 h-4 ml-auto" />
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
              <Home className="w-4 h-4 mr-2" />
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
            <Menu className="w-6 h-6" />
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
                      <Euro className="w-5 h-5 md:w-6 md:h-6 text-[#d0a760]" />
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
                      <Calendar className="w-5 h-5 md:w-6 md:h-6 text-[#d0a760]" />
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
                    <Calendar className="w-5 h-5" />
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
                    <Download className="w-4 h-4 mr-2" />
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
                      <Upload className="w-4 h-4 mr-2" />
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

                  <Dialog open={isProductDialogOpen} onOpenChange={(open) => {
                    setIsProductDialogOpen(open);
                    if (!open) {
                      reset();
                      setProductImages([]);
                      setFeatures([]);
                      setSpecifications({});
                      setPrimaryImageIndex(0);
                      setSelectedProduct(null);
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
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-700 rounded-none">
                      <DialogHeader>
                        <DialogTitle className="text-white text-xl">
                          {selectedProduct ? "Product Bewerken" : "Nieuw Product"}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <form onSubmit={handleSubmit(onSubmitProduct)} className="space-y-6 py-4">
                        {/* Basic Info */}
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

                        {/* Pricing */}
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

                        {/* Category & Brand */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-zinc-300">Categorie</Label>
                            <Select onValueChange={(value) => setValue("categoryId", value)}>
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
                            <Select onValueChange={(value) => setValue("brandId", value)}>
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
                            <Label htmlFor="sku" className="text-zinc-300">SKU</Label>
                            <Input
                              {...register("sku")}
                              placeholder="SKU123"
                              className="bg-zinc-800 border-zinc-700 text-white rounded-none focus:border-[#d0a760]"
                              data-testid="input-sku"
                            />
                          </div>
                        </div>

                        {/* Images */}
                        <div>
                          <Label className="text-zinc-300">Afbeeldingen</Label>
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
                              <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                              <p className="text-sm text-zinc-400">
                                {isUploading ? "Uploaden..." : "Klik om afbeeldingen te uploaden"}
                              </p>
                            </label>
                          </div>
                          
                          {productImages.length > 0 && (
                            <div className="mt-4 grid grid-cols-4 gap-2">
                              {productImages.map((url, index) => (
                                <div 
                                  key={index} 
                                  className={`relative aspect-square border-2 ${
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
                                  <div className="absolute top-1 right-1 flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => setPrimaryImageIndex(index)}
                                      className={`w-6 h-6 flex items-center justify-center ${
                                        index === primaryImageIndex 
                                          ? 'bg-[#d0a760] text-black' 
                                          : 'bg-zinc-800 text-white'
                                      }`}
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
                                      className="w-6 h-6 bg-red-500/80 text-white flex items-center justify-center"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Features */}
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

                        {/* Specifications */}
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
                                  <span className="text-sm text-zinc-300">
                                    <strong className="text-white">{key}:</strong> {String(value)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newSpecs = { ...specifications };
                                      delete newSpecs[key];
                                      setSpecifications(newSpecs);
                                    }}
                                    className="text-zinc-400 hover:text-red-400"
                                    data-testid={`button-remove-spec-${key}`}
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <Separator className="bg-zinc-700" />

                        {/* Settings */}
                        <div className="space-y-4">
                          <Label className="text-zinc-300 text-base font-semibold">Instellingen</Label>
                          
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
                        </div>

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
                    ) : products?.length === 0 ? (
                      <TableRow className="border-zinc-800">
                        <TableCell colSpan={5} className="text-center text-zinc-500 py-12">
                          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Nog geen producten toegevoegd</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      products?.map((product: Product) => (
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
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDeleteProduct(product)}
                                disabled={deleteProductMutation.isPending}
                                className="bg-transparent border-zinc-700 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 rounded-none"
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
                ) : products?.length === 0 ? (
                  <div className="bg-zinc-900 border border-zinc-800 p-8 text-center">
                    <Package className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                    <p className="text-zinc-500">Nog geen producten</p>
                  </div>
                ) : (
                  products?.map((product: Product) => (
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
                          <Edit className="w-4 h-4 mr-2" />
                          Bewerken
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleDeleteProduct(product)}
                          className="bg-transparent border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-none"
                        >
                          <Trash2 className="w-4 h-4" />
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
                          <TableCell className="text-[#d0a760] font-semibold">€{parseFloat(order.totalAmount).toFixed(2)}</TableCell>
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
                        <p className="text-[#d0a760] font-bold text-lg">€{parseFloat(order.totalAmount).toFixed(2)}</p>
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
                          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
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
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
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
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlogCategory(category)}
                          className="text-zinc-400 hover:text-red-400"
                          data-testid={`button-delete-category-${category.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
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
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDeleteBlogPost(post)}
                                disabled={deleteBlogPostMutation.isPending}
                                className="bg-transparent border-zinc-700 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 rounded-none"
                                data-testid={`button-delete-blogpost-${post.id}`}
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
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteBlogPost(post)}
                            className="h-8 w-8 p-0 text-zinc-400 hover:text-red-400"
                            data-testid={`button-delete-blogpost-mobile-${post.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
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
        </div>
      </main>
    </div>
  );
}
