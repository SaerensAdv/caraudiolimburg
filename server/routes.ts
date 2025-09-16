import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import multer from "multer";
import { ObjectStorageService } from "./objectStorage";
import Papa from "papaparse";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import {
  insertProductSchema,
  insertCategorySchema,
  insertBrandSchema,
  insertVehicleMakeSchema,
  insertVehicleModelSchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertBookingSchema,
  insertQuoteRequestSchema,
  insertReviewSchema,
} from "@shared/schema";

let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
}

// Multer configuration for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Image upload configuration
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for images
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper function to normalize image URLs to relative paths
  function normalizeImageUrls(product: any) {
    if (product && product.images && Array.isArray(product.images)) {
      product.images = product.images.map((url: string) => {
        // Convert absolute URLs to relative paths
        if (url && typeof url === 'string' && url.includes('://')) {
          // Extract just the path from absolute URLs (everything after the domain)
          const urlParts = url.split('/');
          const pathIndex = urlParts.findIndex(part => part === 'public');
          if (pathIndex >= 0) {
            return '/' + urlParts.slice(pathIndex).join('/');
          }
        }
        // Return as-is if already relative or no normalization needed
        return url;
      });
    }
    return product;
  }

  function normalizeProductArrayUrls(products: any[]) {
    return products.map(normalizeImageUrls);
  }

  // Auth middleware
  setupAuth(app);

  // Object Storage streaming route is now registered in server/index.ts
  // This ensures proper priority over catch-all routes in production

  // Auth routes - handled by auth.ts

  // Customer Portal routes
  app.get('/api/my-orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orders = await storage.getOrdersByUserId(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/my-bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookings = await storage.getBookingsByUserId(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const {
        categoryId,
        brandId,
        search,
        vehicleMakeId,
        vehicleModelId,
        vehicleYear,
        limit,
        offset,
        featured
      } = req.query;

      const products = await storage.getProducts({
        categoryId: categoryId as string,
        brandId: brandId as string,
        search: search as string,
        vehicleMakeId: vehicleMakeId as string,
        vehicleModelId: vehicleModelId as string,
        vehicleYear: vehicleYear ? parseInt(vehicleYear as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        featured: featured === 'true',
      });

      res.json(normalizeProductArrayUrls(products));
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:identifier', async (req, res) => {
    try {
      const identifier = req.params.identifier;
      let product;
      
      // Try to find by slug first, then by ID
      product = await storage.getProductBySlug(identifier);
      if (!product) {
        product = await storage.getProduct(identifier);
      }
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(normalizeImageUrls(product));
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post('/api/products', isAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      
      // Handle "none" value or empty string for upsellCategoryId
      if (productData.upsellCategoryId === 'none' || productData.upsellCategoryId === '') {
        productData.upsellCategoryId = null;
      }
      
      // Handle empty SKU - convert to null or generate unique SKU
      if (productData.sku === '' || productData.sku === undefined) {
        productData.sku = null;
      }
      
      // Handle empty brandId and categoryId 
      if (productData.brandId === '') {
        productData.brandId = null;
      }
      if (productData.categoryId === '') {
        productData.categoryId = null;
      }
      
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/products/:id', isAdmin, async (req, res) => {
    try {
      const productId = req.params.id;
      const productData = insertProductSchema.parse(req.body);
      
      // Handle "none" value or empty string for upsellCategoryId
      if (productData.upsellCategoryId === 'none' || productData.upsellCategoryId === '') {
        productData.upsellCategoryId = null;
      }
      
      // Handle empty SKU - convert to null or generate unique SKU
      if (productData.sku === '' || productData.sku === undefined) {
        productData.sku = null;
      }
      
      // Handle empty brandId and categoryId 
      if (productData.brandId === '') {
        productData.brandId = null;
      }
      if (productData.categoryId === '') {
        productData.categoryId = null;
      }
      
      const product = await storage.updateProduct(productId, productData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', isAdmin, async (req, res) => {
    try {
      const productId = req.params.id;
      await storage.deleteProduct(productId);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Brand routes
  app.get('/api/brands', async (req, res) => {
    try {
      const brands = await storage.getBrands();
      res.json(brands);
    } catch (error) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ message: "Failed to fetch brands" });
    }
  });

  // Vehicle routes
  app.get('/api/vehicle-makes', async (req, res) => {
    try {
      const makes = await storage.getVehicleMakes();
      res.json(makes);
    } catch (error) {
      console.error("Error fetching vehicle makes:", error);
      res.status(500).json({ message: "Failed to fetch vehicle makes" });
    }
  });

  app.get('/api/vehicle-models/:makeId', async (req, res) => {
    try {
      const models = await storage.getVehicleModels(req.params.makeId);
      res.json(models);
    } catch (error) {
      console.error("Error fetching vehicle models:", error);
      res.status(500).json({ message: "Failed to fetch vehicle models" });
    }
  });

  // Cart routes - Support both authenticated users and guest sessions
  app.get('/api/cart', async (req: any, res) => {
    try {
      // For authenticated users, use their user ID
      const userId = req.isAuthenticated() && req.user?.id ? req.user.id : null;
      
      if (!userId) {
        // For guests, return empty cart (client handles localStorage cart)
        return res.json([]);
      }
      
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/cart', async (req: any, res) => {
    try {
      // Only authenticated users can add items to persistent cart
      if (!req.isAuthenticated() || !req.user?.id) {
        return res.status(200).json({ message: "Item will be stored in session cart" });
      }
      
      const userId = req.user.id;
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId,
      });
      const cartItem = await storage.addToCart(cartItemData);
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.patch('/api/cart/:id', async (req: any, res) => {
    try {
      // Only authenticated users can update persistent cart
      if (!req.isAuthenticated() || !req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(req.params.id, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/:id', async (req: any, res) => {
    try {
      // Only authenticated users can remove from persistent cart
      if (!req.isAuthenticated() || !req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      await storage.removeFromCart(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orders = await storage.getOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Booking routes
  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookings = await storage.getBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post('/api/bookings', async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(bookingData);
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get('/api/available-slots/:date/:serviceType', async (req, res) => {
    try {
      const { date, serviceType } = req.params;
      const slots = await storage.getAvailableTimeSlots(date, serviceType);
      res.json(slots);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      res.status(500).json({ message: "Failed to fetch available slots" });
    }
  });

  // Quote request routes
  app.post('/api/quote-requests', async (req, res) => {
    try {
      const quoteData = insertQuoteRequestSchema.parse(req.body);
      const quote = await storage.createQuoteRequest(quoteData);
      res.json(quote);
    } catch (error) {
      console.error("Error creating quote request:", error);
      res.status(500).json({ message: "Failed to create quote request" });
    }
  });

  app.get('/api/quote-requests', isAuthenticated, async (req, res) => {
    try {
      const quotes = await storage.getQuoteRequests();
      res.json(quotes);
    } catch (error) {
      console.error("Error fetching quote requests:", error);
      res.status(500).json({ message: "Failed to fetch quote requests" });
    }
  });

  // BMW CarPlay quote request
  app.post("/api/bmw-carplay-quote", async (req, res) => {
    try {
      const { firstName, lastName, phone, email, message, model, year, license, vin } = req.body;
      
      // Validate required fields
      if (!firstName || !lastName || !phone || !email || !model || !year || !vin) {
        return res.status(400).json({ 
          message: "Verplichte velden zijn niet ingevuld. Controleer voornaam, achternaam, telefoon, email, model, bouwjaar en VIN-nummer." 
        });
      }

      // Validate VIN format (17 characters)
      if (vin.length !== 17) {
        return res.status(400).json({ 
          message: "VIN-nummer moet exact 17 karakters bevatten." 
        });
      }

      // Validate year range
      const yearNum = parseInt(year);
      if (yearNum < 2015 || yearNum > 2025) {
        return res.status(400).json({ 
          message: "Bouwjaar moet tussen 2015 en 2025 liggen voor CarPlay activatie." 
        });
      }

      // Create the quote request with BMW CarPlay specific type
      const quoteData = {
        firstName,
        lastName,
        email,
        phone,
        vehicleMake: model.toLowerCase().includes('bmw') ? 'BMW' : 'MINI',
        vehicleModel: model,
        vehicleYear: yearNum,
        description: `BMW/MINI CarPlay Activatie - ${model} (${year})
        
VIN: ${vin}
${license ? `Kenteken: ${license}` : ''}

${message || 'Geen aanvullende informatie'}`
      };

      const quote = await storage.createQuoteRequest(quoteData);
      
      res.status(201).json({
        message: "Offerteverzoek succesvol verstuurd! We nemen binnen 24 uur contact met je op.",
        quoteId: quote.id
      });
    } catch (error) {
      console.error("Error creating BMW CarPlay quote request:", error);
      res.status(500).json({ message: "Er is een fout opgetreden bij het versturen van je verzoek. Probeer het opnieuw of neem direct contact op." });
    }
  });

  // Payment routes
  app.post("/api/create-payment-intent", isAuthenticated, async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Payment system not configured. Please set up Stripe API keys." });
    }
    
    try {
      const { amount } = req.body;
      
      console.log("Creating payment intent with amount:", amount);
      console.log("User ID:", (req as any).user.id);
      console.log("Stripe configured:", !!stripe);
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount provided" });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "eur",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          userId: (req as any).user.id,
        },
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Stripe payment intent error:", error);
      res
        .status(500)
        .json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Order confirmation after successful payment
  app.post("/api/orders/confirm", isAuthenticated, async (req, res) => {
    try {
      const { paymentIntentId, shippingDetails } = req.body;
      const userId = (req as any).user.id;
      
      if (!stripe) {
        return res.status(500).json({ message: "Payment system not configured" });
      }

      // Verify payment was successful
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: "Payment not successful" });
      }

      // Get cart items to create order
      const cartItems = await storage.getCartItems(userId);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Calculate totals
      const subtotal = cartItems.reduce((sum, item: any) => {
        const price = parseFloat(item.product?.price || "0");
        return sum + (price * item.quantity);
      }, 0);
      
      const installationFee = cartItems.some(item => item.needsInstallation) ? 89 : 0;
      const shipping = subtotal >= 50 ? 0 : 5.95;
      const total = subtotal + installationFee + shipping;

      // Generate unique order number
      const orderNumber = `CAL-${Date.now()}`;

      // Create order
      const order = await storage.createOrder({
        userId,
        orderNumber,
        status: "confirmed",
        totalAmount: total.toString(),
        stripePaymentIntentId: paymentIntentId,
        shippingAddress: shippingDetails,
      });

      // Create order items
      for (const cartItem of cartItems) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: (cartItem as any).product?.price || "0",
          needsInstallation: cartItem.needsInstallation,
        });

        // If installation is needed, create a booking placeholder
        if (cartItem.needsInstallation) {
          await storage.createBooking({
            userId,
            orderId: order.id,
            customerName: (shippingDetails.firstName || "") + " " + (shippingDetails.lastName || ""),
            customerEmail: shippingDetails.email || "noreply@caraudiolimburg.shop",
            customerPhone: shippingDetails.phone || "085 273 36 25",
            vehicleMake: "Te bepalen",
            vehicleModel: "Te bepalen", 
            vehicleYear: new Date().getFullYear(),
            serviceType: "installatie",
            scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            duration: 2,
            status: "pending_scheduling",
            totalCost: installationFee.toString(),
          });
        }
      }

      // Clear cart
      await storage.clearCart(userId);

      res.json({ orderId: order.id, order });
    } catch (error) {
      console.error("Error confirming order:", error);
      res.status(500).json({ message: "Failed to confirm order" });
    }
  });

  // Review routes
  app.get('/api/reviews', async (req, res) => {
    try {
      const { productId, isPublished, isFeatured, limit, offset } = req.query;
      const reviews = await storage.getReviews({
        productId: productId as string,
        isPublished: isPublished === 'true',
        isFeatured: isFeatured === 'true',
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get('/api/reviews/:id', async (req, res) => {
    try {
      const review = await storage.getReview(req.params.id);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json(review);
    } catch (error) {
      console.error("Error fetching review:", error);
      res.status(500).json({ message: "Failed to fetch review" });
    }
  });

  app.post('/api/reviews', async (req: any, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      
      // If user is authenticated, link the review to the user
      if (req.isAuthenticated() && req.user?.id) {
        reviewData.userId = req.user.id;
      }
      
      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.put('/api/reviews/:id', isAuthenticated, async (req, res) => {
    try {
      const updates = insertReviewSchema.partial().parse(req.body);
      const review = await storage.updateReview(req.params.id, updates);
      res.json(review);
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  app.delete('/api/reviews/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteReview(req.params.id);
      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // Admin review management routes
  app.post('/api/admin/reviews/:id/approve', isAdmin, async (req, res) => {
    try {
      const review = await storage.approveReview(req.params.id);
      res.json(review);
    } catch (error) {
      console.error("Error approving review:", error);
      res.status(500).json({ message: "Failed to approve review" });
    }
  });

  app.post('/api/admin/reviews/:id/publish', isAdmin, async (req, res) => {
    try {
      const review = await storage.publishReview(req.params.id);
      res.json(review);
    } catch (error) {
      console.error("Error publishing review:", error);
      res.status(500).json({ message: "Failed to publish review" });
    }
  });

  app.post('/api/admin/reviews/:id/feature', isAdmin, async (req, res) => {
    try {
      const { featured } = req.body;
      const review = await storage.featureReview(req.params.id, featured);
      res.json(review);
    } catch (error) {
      console.error("Error featuring review:", error);
      res.status(500).json({ message: "Failed to feature review" });
    }
  });

  // Sync routes for database synchronization between dev and prod
  app.get('/api/sync/export', isAdmin, async (req, res) => {
    try {
      // Only allow export in development
      if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ message: "Export only available in development" });
      }

      const { since, full } = req.query;
      const fullExport = full === 'true';
      
      // Get all catalog data for export
      const [brands, categories, vehicleMakes, vehicleModels, products] = await Promise.all([
        storage.getBrands(),
        storage.getCategories(),
        storage.getVehicleMakes(),
        storage.getVehicleModels(),
        storage.getProducts({}),  // Pass empty options object
      ]);

      // Get product vehicle compatibility
      const compatibility = await storage.getProductVehicleCompatibility();

      // Filter by updatedAt if incremental
      const filterBySince = (items: any[], dateField = 'updatedAt') => {
        if (fullExport || !since) return items;
        const sinceDate = new Date(since as string);
        return items.filter(item => new Date(item[dateField]) > sinceDate);
      };

      // Create content hashes for each item
      const createContentHash = (item: any, fields: string[]) => {
        const content = fields.map(f => item[f]).join('|');
        return Buffer.from(content).toString('base64').substring(0, 16);
      };

      // Add content hashes to items
      const brandsWithHash = filterBySince(brands).map(b => ({
        ...b,
        contentHash: createContentHash(b, ['name', 'slug', 'description', 'logoUrl'])
      }));

      const categoriesWithHash = filterBySince(categories).map(c => ({
        ...c,
        contentHash: createContentHash(c, ['name', 'slug', 'description', 'imageUrl', 'parentId'])
      }));

      const makesWithHash = filterBySince(vehicleMakes).map(m => ({
        ...m,
        contentHash: createContentHash(m, ['name', 'slug'])
      }));

      const modelsWithHash = filterBySince(vehicleModels).map(m => ({
        ...m,
        contentHash: createContentHash(m, ['name', 'slug', 'makeId', 'startYear', 'endYear'])
      }));

      const productsWithHash = filterBySince(products).map(p => ({
        ...p,
        contentHash: createContentHash(p, [
          'name', 'slug', 'description', 'shortDescription', 'images', 
          'primaryImageIndex', 'brandId', 'categoryId', 'features', 
          'specifications', 'canHaveInstallation', 'upsellCategoryId', 'isFeatured'
        ])
      }));

      const compatibilityWithHash = filterBySince(compatibility).map(c => ({
        ...c,
        contentHash: createContentHash(c, ['productId', 'makeId', 'modelId', 'yearFrom', 'yearTo', 'notes'])
      }));

      res.json({
        exportedAt: new Date().toISOString(),
        environment: 'development',
        full: fullExport,
        data: {
          brands: brandsWithHash,
          categories: categoriesWithHash,
          vehicleMakes: makesWithHash,
          vehicleModels: modelsWithHash,
          products: productsWithHash,
          productVehicleCompatibility: compatibilityWithHash
        }
      });
    } catch (error) {
      console.error("Error exporting catalog:", error);
      res.status(500).json({ message: "Failed to export catalog" });
    }
  });

  app.post('/api/sync/import', isAdmin, async (req, res) => {
    try {
      // Allow import in both development and production for testing
      // In real production setup, you might want to restrict this
      
      const { data, dryRun, force } = req.body;
      
      if (!data) {
        return res.status(400).json({ message: "No data provided for import" });
      }

      const results = {
        created: { brands: 0, categories: 0, vehicleMakes: 0, vehicleModels: 0, products: 0, compatibility: 0 },
        updated: { brands: 0, categories: 0, vehicleMakes: 0, vehicleModels: 0, products: 0, compatibility: 0 },
        skipped: { brands: 0, categories: 0, vehicleMakes: 0, vehicleModels: 0, products: 0, compatibility: 0 },
        conflicts: [] as any[]
      };

      // Import in order to maintain foreign key relationships
      // 1. Brands
      for (const brand of data.brands || []) {
        const existing = await storage.getBrandBySlug(brand.slug);
        if (existing) {
          if (existing.contentHash !== brand.contentHash || force) {
            if (!dryRun) {
              await storage.updateBrand(existing.id, {
                ...brand,
                originEnv: 'dev',
                lastSyncedAt: new Date(),
                contentHash: brand.contentHash
              });
            }
            results.updated.brands++;
          } else {
            results.skipped.brands++;
          }
        } else {
          if (!dryRun) {
            await storage.createBrandWithId({
              ...brand,
              originEnv: 'dev',
              lastSyncedAt: new Date()
            });
          }
          results.created.brands++;
        }
      }

      // 2. Categories  
      for (const category of data.categories || []) {
        const existing = await storage.getCategoryBySlug(category.slug);
        if (existing) {
          if (existing.contentHash !== category.contentHash || force) {
            if (!dryRun) {
              await storage.updateCategory(existing.id, {
                ...category,
                originEnv: 'dev',
                lastSyncedAt: new Date(),
                contentHash: category.contentHash
              });
            }
            results.updated.categories++;
          } else {
            results.skipped.categories++;
          }
        } else {
          if (!dryRun) {
            await storage.createCategoryWithId({
              ...category,
              originEnv: 'dev',
              lastSyncedAt: new Date()
            });
          }
          results.created.categories++;
        }
      }

      // 3. Vehicle Makes
      for (const make of data.vehicleMakes || []) {
        const existing = await storage.getVehicleMakeBySlug(make.slug);
        if (existing) {
          if (existing.contentHash !== make.contentHash || force) {
            if (!dryRun) {
              await storage.updateVehicleMake(existing.id, {
                ...make,
                originEnv: 'dev',
                lastSyncedAt: new Date(),
                contentHash: make.contentHash
              });
            }
            results.updated.vehicleMakes++;
          } else {
            results.skipped.vehicleMakes++;
          }
        } else {
          if (!dryRun) {
            await storage.createVehicleMakeWithId({
              ...make,
              originEnv: 'dev',
              lastSyncedAt: new Date()
            });
          }
          results.created.vehicleMakes++;
        }
      }

      // 4. Vehicle Models
      for (const model of data.vehicleModels || []) {
        const existing = await storage.getVehicleModelBySlug(model.slug, model.makeId);
        if (existing) {
          if (existing.contentHash !== model.contentHash || force) {
            if (!dryRun) {
              await storage.updateVehicleModel(existing.id, {
                ...model,
                originEnv: 'dev',
                lastSyncedAt: new Date(),
                contentHash: model.contentHash
              });
            }
            results.updated.vehicleModels++;
          } else {
            results.skipped.vehicleModels++;
          }
        } else {
          if (!dryRun) {
            await storage.createVehicleModelWithId({
              ...model,
              originEnv: 'dev',
              lastSyncedAt: new Date()
            });
          }
          results.created.vehicleModels++;
        }
      }

      // 5. Products - merge dev-owned fields, preserve prod-owned fields
      for (const product of data.products || []) {
        const existing = await storage.getProductBySlug(product.slug);
        if (existing) {
          if (existing.originEnv === 'prod' && !force) {
            // Skip prod-created products unless force is true
            results.conflicts.push({
              type: 'product',
              slug: product.slug,
              message: 'Product created in production, skipping'
            });
            results.skipped.products++;
          } else if (existing.contentHash !== product.contentHash || force) {
            if (!dryRun) {
              // Preserve prod-owned fields: price, originalPrice, stock, isActive
              await storage.updateProduct(existing.id, {
                // Dev-owned fields
                name: product.name,
                slug: product.slug,
                description: product.description,
                shortDescription: product.shortDescription,
                images: product.images,
                primaryImageIndex: product.primaryImageIndex,
                brandId: product.brandId,
                categoryId: product.categoryId,
                features: product.features,
                specifications: product.specifications,
                canHaveInstallation: product.canHaveInstallation,
                upsellCategoryId: product.upsellCategoryId,
                isFeatured: product.isFeatured,
                // Tracking fields
                originEnv: 'dev',
                lastSyncedAt: new Date(),
                contentHash: product.contentHash,
                // Preserve prod-owned fields
                price: existing.price,
                originalPrice: existing.originalPrice,
                stock: existing.stock,
                isActive: existing.isActive
              });
            }
            results.updated.products++;
          } else {
            results.skipped.products++;
          }
        } else {
          if (!dryRun) {
            await storage.createProductWithId({
              ...product,
              originEnv: 'dev',
              lastSyncedAt: new Date()
            });
          }
          results.created.products++;
        }
      }

      // 6. Product Vehicle Compatibility
      for (const compat of data.productVehicleCompatibility || []) {
        const existing = await storage.getCompatibilityByKey(
          compat.productId,
          compat.makeId,
          compat.modelId,
          compat.yearFrom,
          compat.yearTo
        );
        if (existing) {
          if (existing.contentHash !== compat.contentHash || force) {
            if (!dryRun) {
              await storage.updateCompatibility(existing.id, {
                ...compat,
                originEnv: 'dev',
                lastSyncedAt: new Date(),
                contentHash: compat.contentHash
              });
            }
            results.updated.compatibility++;
          } else {
            results.skipped.compatibility++;
          }
        } else {
          if (!dryRun) {
            await storage.createCompatibilityWithId({
              ...compat,
              originEnv: 'dev',
              lastSyncedAt: new Date()
            });
          }
          results.created.compatibility++;
        }
      }

      // Record sync run
      if (!dryRun) {
        await storage.createSyncRun({
          environment: 'production',
          runType: data.full ? 'full' : 'incremental',
          status: 'completed',
          completedAt: new Date(),
          recordsProcessed: Object.values(results.created).reduce((a, b) => a + b, 0) +
                          Object.values(results.updated).reduce((a, b) => a + b, 0) +
                          Object.values(results.skipped).reduce((a, b) => a + b, 0),
          recordsCreated: Object.values(results.created).reduce((a, b) => a + b, 0),
          recordsUpdated: Object.values(results.updated).reduce((a, b) => a + b, 0),
          recordsSkipped: Object.values(results.skipped).reduce((a, b) => a + b, 0),
          conflicts: results.conflicts.length > 0 ? results.conflicts : null
        });
      }

      res.json({
        dryRun,
        results,
        message: dryRun ? "Dry run completed - no changes made" : "Import completed successfully"
      });
    } catch (error) {
      console.error("Error importing catalog:", error);
      res.status(500).json({ message: "Failed to import catalog" });
    }
  });

  // Admin routes
  app.get('/api/admin/products', isAdmin, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(normalizeProductArrayUrls(products));
    } catch (error) {
      console.error("Error fetching admin products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/admin/orders', isAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/admin/bookings', isAdmin, async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching admin bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Test endpoint to verify auth and routing works
  app.post('/api/test-upload', isAdmin, async (req: any, res) => {
    console.log("🔍 [TEST] Test upload endpoint reached!");
    console.log("🔍 [TEST] User:", req.user?.email);
    res.json({ message: "Test endpoint works!", user: req.user?.email });
  });

  // Simple upload test without multer to isolate the issue
  app.post('/api/upload/simple', isAdmin, async (req: any, res) => {
    console.log("🔍 [SIMPLE] Simple upload endpoint reached!");
    console.log("🔍 [SIMPLE] User:", req.user?.email);
    console.log("🔍 [SIMPLE] Request received");
    res.json({ message: "Simple upload works!", user: req.user?.email });
  });

  // Get presigned URL for product image upload using Object Storage
  app.post('/api/upload/image/url', isAdmin, async (req: any, res) => {
    console.log("🔍 [UPLOAD] Getting presigned URL for product image...");
    
    try {
      const { originalName, mimeType } = req.body;
      
      // Extract file extension from originalName or mimeType
      let fileExtension = 'jpg'; // default
      if (originalName && originalName.includes('.')) {
        fileExtension = originalName.split('.').pop() || 'jpg';
      } else if (mimeType) {
        const mimeToExt = {
          'image/jpeg': 'jpg',
          'image/jpg': 'jpg', 
          'image/png': 'png',
          'image/webp': 'webp',
          'image/gif': 'gif'
        };
        fileExtension = mimeToExt[mimeType as keyof typeof mimeToExt] || 'jpg';
      }
      
      console.log("🔍 [UPLOAD] Extracted extension:", fileExtension, "from originalName:", originalName, "mimeType:", mimeType);
      
      const objectStorageService = new ObjectStorageService();
      const { uploadURL, fileName, objectKey, publicUrl } = await objectStorageService.getProductImageUploadURL(fileExtension);
      
      console.log("✅ [UPLOAD] Presigned URL generated:", fileName);
      
      res.json({
        uploadURL,
        fileName,
        objectKey,
        publicUrl
      });
    } catch (error: any) {
      console.error("❌ [UPLOAD] Failed to get presigned URL:", error);
      res.status(500).json({ 
        message: "Failed to get upload URL",
        error: error?.message || "Unknown error"
      });
    }
  });

  // Complete image upload and set public ACL
  app.put('/api/upload/image/complete', isAdmin, async (req: any, res) => {
    console.log("🔍 [UPLOAD] Completing image upload...");
    
    try {
      const { fileName, objectKey, size, originalName } = req.body;
      
      if (!fileName || !objectKey) {
        return res.status(400).json({ error: "fileName and objectKey are required" });
      }

      // Compute publicUrl server-side for consistency
      const publicUrl = `/public/products/${fileName}`;

      const objectStorageService = new ObjectStorageService();
      
      // Extract file extension from filename for mimeType
      const fileExtension = fileName.includes('.') ? fileName.split('.').pop() || 'jpg' : 'jpg';
      
      // Set public ACL for the uploaded file using the exact objectKey
      try {
        console.log("🔍 [UPLOAD] Setting public ACL for:", objectKey);
        
        // Set the ACL to make the file publicly readable
        await objectStorageService.setPublicObjectAclPolicy(objectKey, {
          visibility: 'public',
          owner: 'system'
        });
        
        console.log("✅ [UPLOAD] Public ACL set successfully");
      } catch (aclError) {
        console.error("⚠️ [UPLOAD] Failed to set public ACL:", aclError);
        // Continue anyway - the file might still be accessible
      }
      
      console.log("✅ [UPLOAD] Image upload completed:", publicUrl);
      
      res.json({
        url: publicUrl,
        fileName: fileName,
        size: size || 0,
        mimeType: `image/${fileExtension}`
      });
    } catch (error: any) {
      console.error("❌ [UPLOAD] Failed to complete upload:", error);
      res.status(500).json({ 
        message: "Failed to complete upload",
        error: error?.message || "Unknown error"
      });
    }
  });

  // Bulk import endpoints
  app.post('/api/admin/products/bulk-upload', isAdmin, upload.single('csvFile'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const csvContent = req.file.buffer.toString('utf8');
      const results = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
      });

      if (results.errors.length > 0) {
        return res.status(400).json({ 
          message: "CSV parsing errors", 
          errors: results.errors 
        });
      }

      const products = results.data as any[];
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < products.length; i++) {
        const productData = products[i];
        try {
          // Validate required fields
          if (!productData.name || !productData.price || !productData.categoryId || !productData.brandId) {
            errors.push(`Row ${i + 1}: Missing required fields (name, price, categoryId, brandId)`);
            errorCount++;
            continue;
          }

          // Transform data to match schema
          const productToCreate = {
            name: productData.name,
            slug: productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            description: productData.description || '',
            price: productData.price.toString(),
            categoryId: productData.categoryId,
            brandId: productData.brandId,
            imageUrl: productData.imageUrl || '',
            isFeatured: productData.featured === 'true' || productData.featured === true,
            specifications: productData.specifications ? JSON.parse(productData.specifications) : {},
            installationPrice: productData.installationPrice ? productData.installationPrice.toString() : null,
          };

          const product = await storage.createProduct(productToCreate);
          successCount++;
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          errorCount++;
        }
      }

      res.json({
        message: `Bulk upload completed. ${successCount} products created, ${errorCount} errors.`,
        successCount,
        errorCount,
        errors: errors.slice(0, 10), // Limit to first 10 errors for response
      });
    } catch (error) {
      console.error("Error in bulk upload:", error);
      res.status(500).json({ message: "Failed to process bulk upload" });
    }
  });

  app.get('/api/admin/products/template', isAdmin, async (req, res) => {
    try {
      // Create CSV template with headers and sample data
      const headers = [
        'name',
        'description', 
        'price',
        'categoryId',
        'brandId',
        'imageUrl',
        'featured',
        'specifications',
        'installationPrice'
      ];

      const sampleData = [
        {
          name: 'Alpine X-A70F Amplifier',
          description: 'High-performance 4-channel amplifier with advanced features',
          price: '299.99',
          categoryId: '', // User needs to fill in actual category ID
          brandId: '', // User needs to fill in actual brand ID
          imageUrl: 'https://example.com/alpine-xa70f.jpg',
          featured: 'false',
          specifications: '{"power": "70W x 4", "channels": 4, "frequency": "10Hz-50kHz"}',
          installationPrice: '89.00'
        }
      ];

      const csvContent = Papa.unparse({
        fields: headers,
        data: sampleData
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="product-template.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error("Error generating template:", error);
      res.status(500).json({ message: "Failed to generate template" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
