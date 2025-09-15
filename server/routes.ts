import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import multer from "multer";
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
  // Auth middleware
  setupAuth(app);

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

      res.json(products);
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
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post('/api/products', isAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      
      // Handle "none" value for upsellCategoryId
      if (productData.upsellCategoryId === 'none') {
        productData.upsellCategoryId = null;
      }
      
      // Handle empty SKU - convert to null or generate unique SKU
      if (productData.sku === '' || productData.sku === undefined) {
        productData.sku = null;
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
      
      // Handle "none" value for upsellCategoryId
      if (productData.upsellCategoryId === 'none') {
        productData.upsellCategoryId = null;
      }
      
      // Handle empty SKU - convert to null or generate unique SKU
      if (productData.sku === '' || productData.sku === undefined) {
        productData.sku = null;
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

  // Admin routes
  app.get('/api/admin/products', isAdmin, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
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

  // Image upload endpoint using local public directory
  app.post('/api/upload/image', isAdmin, imageUpload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fs = await import('fs');
      const path = await import('path');

      // Generate unique filename
      const fileExtension = req.file.originalname.split('.').pop();
      const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
      
      // Use local public directory for development
      const publicDir = path.join(process.cwd(), 'public', 'products');
      const filePath = path.join(publicDir, fileName);
      
      // Ensure directory exists
      await fs.promises.mkdir(publicDir, { recursive: true });
      
      // Save file locally
      await fs.promises.writeFile(filePath, req.file.buffer);
      
      // Return public URL
      const publicUrl = `/products/${fileName}`;
      
      res.json({
        url: publicUrl,
        fileName: fileName,
        size: req.file.size,
        mimeType: req.file.mimetype
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
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
