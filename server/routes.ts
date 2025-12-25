import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import multer from "multer";
import Papa from "papaparse";
import sharp from "sharp";
import { z } from "zod";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import { handleChatMessage } from "./chatbot";
import { etrustedService } from "./services/etrusted";
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
  insertBlogPostSchema,
  insertBlogCategorySchema,
  insertProductVariationSchema,
} from "@shared/schema";

let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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

  // Wishlist routes
  app.get('/api/wishlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const wishlistItems = await storage.getWishlistByUserId(userId);
      res.json(wishlistItems);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.post('/api/wishlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { productId } = req.body;
      
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }
      
      const wishlistItem = await storage.addToWishlist(userId, productId);
      res.json(wishlistItem);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });

  app.delete('/api/wishlist/:productId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { productId } = req.params;
      
      await storage.removeFromWishlist(userId, productId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });

  app.get('/api/wishlist/check/:productId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { productId } = req.params;
      
      const inWishlist = await storage.isInWishlist(userId, productId);
      res.json({ inWishlist });
    } catch (error) {
      console.error("Error checking wishlist:", error);
      res.status(500).json({ message: "Failed to check wishlist" });
    }
  });

  // Order details with items (for customer portal)
  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;
      
      const result = await storage.getOrderWithItems(orderId);
      if (!result) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check ownership
      if (result.order.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).json({ message: "Failed to fetch order details" });
    }
  });

  // Invoice download
  app.get('/api/orders/:id/invoice', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;
      
      const result = await storage.getOrderWithItems(orderId);
      if (!result) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (result.order.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const { order, items } = result;
      const shippingAddress = order.shippingAddress as any || {};
      
      const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Factuur ${order.orderNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { font-size: 24px; font-weight: bold; color: #d0a760; }
    .invoice-info { text-align: right; }
    .address { margin-bottom: 30px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; }
    .total-row { font-weight: bold; font-size: 16px; }
    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Car Audio Limburg</div>
    <div class="invoice-info">
      <h2>FACTUUR</h2>
      <p>Factuurnummer: ${order.orderNumber}</p>
      <p>Datum: ${new Date(order.createdAt).toLocaleDateString('nl-NL')}</p>
    </div>
  </div>
  
  <div class="address">
    <strong>Verzendadres:</strong><br>
    ${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}<br>
    ${shippingAddress.address || ''}<br>
    ${shippingAddress.postalCode || ''} ${shippingAddress.city || ''}<br>
    ${shippingAddress.country || 'Nederland'}
  </div>

  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>Aantal</th>
        <th>Prijs</th>
        <th>Totaal</th>
      </tr>
    </thead>
    <tbody>
      ${items.map(item => `
        <tr>
          <td>${item.product?.name || 'Product'}</td>
          <td>${item.quantity}</td>
          <td>€${parseFloat(item.price).toFixed(2)}</td>
          <td>€${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
        </tr>
      `).join('')}
      <tr class="total-row">
        <td colspan="3">Totaal</td>
        <td>€${parseFloat(order.total).toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <p>Car Audio Limburg | Bedankt voor uw bestelling!</p>
    <p>www.caraudiolimburg.nl</p>
  </div>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="factuur-${order.orderNumber}.html"`);
      res.send(invoiceHtml);
    } catch (error) {
      console.error("Error generating invoice:", error);
      res.status(500).json({ message: "Failed to generate invoice" });
    }
  });

  // Update booking
  app.patch('/api/bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookingId = req.params.id;
      
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      if (booking.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const { scheduledDate, notes } = req.body;
      const updates: any = {};
      if (scheduledDate) updates.scheduledDate = new Date(scheduledDate);
      if (notes !== undefined) updates.notes = notes;

      const updated = await storage.updateBooking(bookingId, updates);
      res.json(updated);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // Cancel booking
  app.patch('/api/bookings/:id/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookingId = req.params.id;
      
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      if (booking.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const updated = await storage.cancelBooking(bookingId);
      res.json(updated);
    } catch (error) {
      console.error("Error cancelling booking:", error);
      res.status(500).json({ message: "Failed to cancel booking" });
    }
  });

  // Update user profile
  app.patch('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName } = req.body;

      const updates: any = {};
      if (firstName !== undefined) updates.firstName = firstName;
      if (lastName !== undefined) updates.lastName = lastName;

      const updated = await storage.updateUser(userId, updates);
      res.json(updated);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Support contact form
  app.post('/api/support-contact', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const { subject, message } = req.body;

      if (!subject || !message) {
        return res.status(400).json({ message: "Subject and message are required" });
      }

      // Create a quote request as a support inquiry
      const supportRequest = await storage.createQuoteRequest({
        firstName: user?.firstName || 'Klant',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: '-',
        vehicleMake: 'Support',
        vehicleModel: subject,
        vehicleYear: new Date().getFullYear(),
        description: `Support verzoek van ${user?.email}:\n\n${message}`,
      });

      res.json({ success: true, id: supportRequest.id });
    } catch (error) {
      console.error("Error creating support request:", error);
      res.status(500).json({ message: "Failed to send support request" });
    }
  });

  // Search autocomplete route
  app.get('/api/search/autocomplete', async (req, res) => {
    try {
      const query = (req.query.q as string || '').trim();
      
      if (query.length < 2) {
        return res.json({ products: [], categories: [], brands: [] });
      }
      
      const [allProducts, allCategories, allBrands] = await Promise.all([
        storage.getProducts({ search: query, limit: 5 }),
        storage.getCategories(),
        storage.getBrands()
      ]);
      
      const queryLower = query.toLowerCase();
      const matchingCategories = allCategories
        .filter(cat => cat.name.toLowerCase().includes(queryLower))
        .slice(0, 3)
        .map(cat => ({ id: cat.id, name: cat.name, slug: cat.slug }));
      
      const matchingBrands = allBrands
        .filter(brand => brand.name.toLowerCase().includes(queryLower))
        .slice(0, 3)
        .map(brand => ({ id: brand.id, name: brand.name, slug: brand.slug }));
      
      const products = allProducts.slice(0, 5).map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        imageUrl: p.images?.[0] || null,
        price: p.price
      }));
      
      res.json({
        products,
        categories: matchingCategories,
        brands: matchingBrands
      });
    } catch (error) {
      console.error("Error in search autocomplete:", error);
      res.status(500).json({ message: "Failed to fetch autocomplete results" });
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
      
      // Include variations if the product has variations
      if (product.hasVariations) {
        const variations = await storage.getProductVariations(product.id);
        return res.json({ ...product, variations });
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

  // Product vehicle compatibility routes
  app.get('/api/products/:id/compatibility', async (req, res) => {
    try {
      const productId = req.params.id;
      const compatibility = await storage.getProductVehicleCompatibility(productId);
      res.json(compatibility);
    } catch (error) {
      console.error("Error fetching product compatibility:", error);
      res.status(500).json({ message: "Failed to fetch product compatibility" });
    }
  });

  app.post('/api/products/:id/compatibility', isAdmin, async (req, res) => {
    try {
      const productId = req.params.id;
      const { compatibility } = req.body;
      
      if (!Array.isArray(compatibility)) {
        return res.status(400).json({ message: "Compatibility must be an array" });
      }
      
      const result = await storage.setProductVehicleCompatibility(productId, compatibility);
      res.json(result);
    } catch (error) {
      console.error("Error saving product compatibility:", error);
      res.status(500).json({ message: "Failed to save product compatibility" });
    }
  });

  app.delete('/api/products/:id/compatibility', isAdmin, async (req, res) => {
    try {
      const productId = req.params.id;
      await storage.clearProductVehicleCompatibility(productId);
      res.json({ message: "Product compatibility cleared" });
    } catch (error) {
      console.error("Error clearing product compatibility:", error);
      res.status(500).json({ message: "Failed to clear product compatibility" });
    }
  });

  // Product variation routes
  app.get('/api/products/:productId/variations', async (req, res) => {
    try {
      const productId = req.params.productId;
      const variations = await storage.getProductVariations(productId);
      res.json(variations);
    } catch (error) {
      console.error("Error fetching product variations:", error);
      res.status(500).json({ message: "Failed to fetch product variations" });
    }
  });

  app.post('/api/products/:productId/variations', isAdmin, async (req, res) => {
    try {
      const productId = req.params.productId;
      
      // Verify product exists
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const variationData = insertProductVariationSchema.parse({
        ...req.body,
        productId,
      });
      
      const variation = await storage.createProductVariation(variationData);
      
      // Update product to have variations flag
      if (!product.hasVariations) {
        await storage.updateProduct(productId, { hasVariations: true });
      }
      
      res.json(variation);
    } catch (error) {
      console.error("Error creating product variation:", error);
      res.status(500).json({ message: "Failed to create product variation" });
    }
  });

  app.put('/api/products/:productId/variations/:variationId', isAdmin, async (req, res) => {
    try {
      const { productId, variationId } = req.params;
      
      // Verify variation exists and belongs to product
      const existingVariation = await storage.getProductVariation(variationId);
      if (!existingVariation || existingVariation.productId !== productId) {
        return res.status(404).json({ message: "Variation not found" });
      }
      
      const updates = req.body;
      const variation = await storage.updateProductVariation(variationId, updates);
      res.json(variation);
    } catch (error) {
      console.error("Error updating product variation:", error);
      res.status(500).json({ message: "Failed to update product variation" });
    }
  });

  app.delete('/api/products/:productId/variations/:variationId', isAdmin, async (req, res) => {
    try {
      const { productId, variationId } = req.params;
      
      // Verify variation exists and belongs to product
      const existingVariation = await storage.getProductVariation(variationId);
      if (!existingVariation || existingVariation.productId !== productId) {
        return res.status(404).json({ message: "Variation not found" });
      }
      
      await storage.deleteProductVariation(variationId);
      
      // Check if product has any remaining variations
      const remainingVariations = await storage.getProductVariations(productId);
      if (remainingVariations.length === 0) {
        await storage.updateProduct(productId, { hasVariations: false });
      }
      
      res.json({ message: "Variation deleted successfully" });
    } catch (error) {
      console.error("Error deleting product variation:", error);
      res.status(500).json({ message: "Failed to delete product variation" });
    }
  });

  // Get all vehicle models (for admin panel)
  app.get('/api/vehicle-models', async (req, res) => {
    try {
      const models = await storage.getAllVehicleModels();
      res.json(models);
    } catch (error) {
      console.error("Error fetching all vehicle models:", error);
      res.status(500).json({ message: "Failed to fetch vehicle models" });
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
      const { productId, variationId } = req.body;
      
      // Validate product exists
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // If product has variations, variationId must be provided and valid
      if (product.hasVariations) {
        if (!variationId) {
          return res.status(400).json({ message: "Variation is required for this product" });
        }
        const variation = await storage.getProductVariation(variationId);
        if (!variation || variation.productId !== productId) {
          return res.status(400).json({ message: "Invalid variation for this product" });
        }
      }
      
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

  // Guest checkout - create payment intent with server-side price validation
  app.post("/api/guest-checkout/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Payment system not configured. Please set up Stripe API keys." });
    }
    
    try {
      const { cartItems, guestEmail } = req.body;
      
      if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({ message: "Cart items are required" });
      }

      if (!guestEmail || !guestEmail.includes('@')) {
        return res.status(400).json({ message: "Valid email address is required" });
      }
      
      // Server-side price validation - NEVER trust client prices
      let subtotal = 0;
      const validatedItems = [];
      
      for (const item of cartItems) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(400).json({ message: `Product not found: ${item.productId}` });
        }
        
        let price = parseFloat(product.price);
        
        // Handle variations if present
        if (item.variationId) {
          const variation = await storage.getProductVariation(item.variationId);
          if (variation) {
            price = parseFloat(variation.price);
          }
        }
        
        subtotal += price * item.quantity;
        validatedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          needsInstallation: item.needsInstallation || false,
          variationId: item.variationId || null,
          price: price.toString(),
        });
      }
      
      const installationFee = validatedItems.some(item => item.needsInstallation) ? 89 : 0;
      const shipping = subtotal >= 50 ? 0 : 5.95;
      const total = subtotal + installationFee + shipping;
      
      console.log("Guest checkout - Creating payment intent with validated amount:", total);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // Convert to cents
        currency: "eur",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          guestEmail,
          isGuest: "true",
          cartItems: JSON.stringify(validatedItems.map(i => ({ 
            productId: i.productId, 
            quantity: i.quantity, 
            needsInstallation: i.needsInstallation,
            variationId: i.variationId,
            price: i.price 
          }))),
        },
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        calculatedTotal: total,
        subtotal,
        installationFee,
        shipping,
      });
    } catch (error: any) {
      console.error("Guest checkout payment intent error:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Guest order confirmation after successful payment
  app.post("/api/guest-orders/confirm", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Payment system not configured" });
    }

    try {
      const { paymentIntentId, shippingDetails, guestEmail } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({ message: "Payment intent ID required" });
      }

      // Verify payment was successful with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: "Payment not successful" });
      }

      // Verify this is a guest checkout
      if (paymentIntent.metadata?.isGuest !== "true") {
        return res.status(400).json({ message: "Not a guest checkout" });
      }

      // Check if order already exists (idempotency)
      const existingOrder = await storage.getOrderByPaymentIntentId(paymentIntentId);
      if (existingOrder) {
        return res.json({ orderId: existingOrder.id, orderNumber: existingOrder.orderNumber });
      }

      // Parse cart items from payment intent metadata
      let cartItems: any[] = [];
      try {
        cartItems = JSON.parse(paymentIntent.metadata?.cartItems || "[]");
      } catch (e) {
        return res.status(400).json({ message: "Invalid cart data in payment" });
      }

      if (cartItems.length === 0) {
        return res.status(400).json({ message: "No cart items found" });
      }

      // Recalculate total from stored prices
      let subtotal = 0;
      for (const item of cartItems) {
        subtotal += parseFloat(item.price) * item.quantity;
      }
      
      const installationFee = cartItems.some(item => item.needsInstallation) ? 89 : 0;
      const shipping = subtotal >= 50 ? 0 : 5.95;
      const total = subtotal + installationFee + shipping;

      // Verify amount matches (security check)
      const expectedAmountInCents = Math.round(total * 100);
      if (paymentIntent.amount !== expectedAmountInCents) {
        console.error("Guest payment amount mismatch:", { expected: expectedAmountInCents, received: paymentIntent.amount });
      }

      // Generate unique order number
      const orderNumber = `CAL-G-${Date.now()}`;

      // Create guest order
      const order = await storage.createOrder({
        userId: null,
        guestEmail: guestEmail || paymentIntent.metadata?.guestEmail,
        orderNumber,
        status: "confirmed",
        total: total.toString(),
        subtotal: subtotal.toString(),
        installationTotal: installationFee.toString(),
        stripePaymentIntentId: paymentIntentId,
        shippingAddress: shippingDetails,
      });

      // Create order items
      for (const cartItem of cartItems) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: cartItem.price,
          needsInstallation: cartItem.needsInstallation,
          variationId: cartItem.variationId || null,
          variationLabel: null,
        });
      }

      // Send eTrusted review invitation (non-blocking)
      const customerEmail = guestEmail || paymentIntent.metadata?.guestEmail;
      if (customerEmail) {
        const productDetails = await Promise.all(
          cartItems.slice(0, 5).map(async (item: any) => {
            const product = await storage.getProduct(item.productId);
            return product ? {
              name: product.name,
              sku: product.id,
            } : null;
          })
        );

        etrustedService.sendReviewInvitation({
          customerEmail,
          orderReference: orderNumber,
          orderDate: new Date().toISOString(),
          products: productDetails.filter(Boolean) as any[],
        }).catch(err => console.error('[eTrusted] Failed to send invitation:', err));
      }

      res.json({ orderId: order.id, orderNumber: order.orderNumber, order });
    } catch (error) {
      console.error("Error confirming guest order:", error);
      res.status(500).json({ message: "Failed to confirm order" });
    }
  });

  // Get order by payment intent ID (idempotent - creates order if missing for successful payments)
  app.get("/api/orders/by-payment-intent/:paymentIntentId", isAuthenticated, async (req, res) => {
    try {
      const { paymentIntentId } = req.params;
      const userId = (req as any).user.id;
      
      if (!stripe) {
        return res.status(500).json({ message: "Payment system not configured" });
      }

      // First, verify the payment intent belongs to this user via Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.metadata?.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized - payment doesn't belong to user" });
      }

      // Get order from database by payment intent ID
      const orders = await storage.getOrdersByUserId(userId);
      let order = orders.find(o => o.stripePaymentIntentId === paymentIntentId);
      
      // If order doesn't exist but payment succeeded, create it idempotently (handles 3DS return flow)
      if (!order && paymentIntent.status === 'succeeded') {
        // Get cart items (they may be cleared already, but try)
        const cartItems = await storage.getCartItems(userId);
        
        if (cartItems.length > 0) {
          // Calculate totals for verification
          const subtotal = await Promise.all(
            cartItems.map(async (item) => {
              const product = await storage.getProduct(item.productId);
              const price = parseFloat(product?.price || "0");
              return price * item.quantity;
            })
          ).then(prices => prices.reduce((sum, price) => sum + price, 0));
          
          const installationFee = cartItems.some(item => item.needsInstallation) ? 89 : 0;
          const shipping = subtotal >= 50 ? 0 : 5.95;
          const expectedTotal = subtotal + installationFee + shipping;
          
          // Create order idempotently
          const orderNumber = `CAL-${Date.now()}`;
          order = await storage.createOrder({
            userId,
            orderNumber,
            status: "confirmed",
            total: expectedTotal.toString(),
            stripePaymentIntentId: paymentIntentId,
            shippingAddress: {}, // Default empty shipping for 3DS return
          });

          // Create order items
          for (const cartItem of cartItems) {
            const cartItemAny = cartItem as any;
            await storage.createOrderItem({
              orderId: order.id,
              productId: cartItem.productId,
              quantity: cartItem.quantity,
              price: cartItemAny.variation?.price || (await storage.getProduct(cartItem.productId))?.price || "0",
              needsInstallation: cartItem.needsInstallation,
              variationId: cartItem.variationId || null,
              variationLabel: cartItemAny.variation?.label || null,
            });
          }

          // Clear cart
          await storage.clearCart(userId);
        }
      }
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Order confirmation after successful payment (idempotent)
  app.post("/api/orders/confirm", isAuthenticated, async (req, res) => {
    try {
      const { paymentIntentId, shippingDetails } = req.body;
      const userId = (req as any).user.id;
      
      if (!stripe) {
        return res.status(500).json({ message: "Payment system not configured" });
      }

      // Check if order already exists (idempotency)
      const existingOrders = await storage.getOrdersByUserId(userId);
      const existingOrder = existingOrders.find(o => o.stripePaymentIntentId === paymentIntentId);
      if (existingOrder) {
        return res.json({ orderId: existingOrder.id, orderNumber: existingOrder.orderNumber });
      }

      // Verify payment was successful and belongs to user
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: "Payment not successful" });
      }
      
      // Verify the payment intent belongs to this user
      if (paymentIntent.metadata?.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized - payment doesn't belong to user" });
      }

      // Get cart items to verify amount matches payment
      const cartItems = await storage.getCartItems(userId);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Calculate totals and verify they match payment intent (need to fetch product details)
      const subtotal = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          const price = parseFloat(product?.price || "0");
          return price * item.quantity;
        })
      ).then(prices => prices.reduce((sum, price) => sum + price, 0));
      
      const installationFee = cartItems.some(item => item.needsInstallation) ? 89 : 0;
      const shipping = subtotal >= 50 ? 0 : 5.95;
      const expectedTotal = subtotal + installationFee + shipping;
      
      // Verify amount matches (convert to cents for comparison)
      const expectedAmountInCents = Math.round(expectedTotal * 100);
      if (paymentIntent.amount !== expectedAmountInCents) {
        return res.status(400).json({ 
          message: "Payment amount doesn't match cart total",
          expected: expectedAmountInCents,
          received: paymentIntent.amount
        });
      }

      // Create order with verified payment
      const total = expectedTotal;

      // Generate unique order number
      const orderNumber = `CAL-${Date.now()}`;

      // Create order
      const order = await storage.createOrder({
        userId,
        orderNumber,
        status: "confirmed",
        total: total.toString(),
        stripePaymentIntentId: paymentIntentId,
        shippingAddress: shippingDetails,
      });

      // Create order items
      for (const cartItem of cartItems) {
        const cartItemAny = cartItem as any;
        await storage.createOrderItem({
          orderId: order.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: cartItemAny.variation?.price || cartItemAny.product?.price || "0",
          needsInstallation: cartItem.needsInstallation,
          variationId: cartItem.variationId || null,
          variationLabel: cartItemAny.variation?.label || null,
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

      // Send eTrusted review invitation (non-blocking)
      if (shippingDetails?.email) {
        const productDetails = await Promise.all(
          cartItems.slice(0, 5).map(async (item: any) => {
            const product = await storage.getProduct(item.productId);
            return product ? {
              name: product.name,
              sku: product.id,
            } : null;
          })
        );

        etrustedService.sendReviewInvitation({
          customerEmail: shippingDetails.email,
          customerFirstName: shippingDetails.firstName,
          customerLastName: shippingDetails.lastName,
          orderReference: orderNumber,
          orderDate: new Date().toISOString(),
          products: productDetails.filter(Boolean) as any[],
        }).catch(err => console.error('[eTrusted] Failed to send invitation:', err));
      }

      res.json({ orderId: order.id, order });
    } catch (error) {
      console.error("Error confirming order:", error);
      res.status(500).json({ message: "Failed to confirm order" });
    }
  });

  // Order creation from redirect (iDEAL, Bancontact, etc.) - idempotent
  app.post("/api/orders/create-from-redirect", isAuthenticated, async (req, res) => {
    try {
      const { paymentIntentId, shippingDetails } = req.body;
      const userId = (req as any).user.id;
      
      if (!stripe) {
        return res.status(500).json({ message: "Payment system not configured" });
      }

      if (!paymentIntentId) {
        return res.status(400).json({ message: "Payment intent ID required" });
      }

      // Verify payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      // Verify the payment intent belongs to this user
      if (paymentIntent.metadata?.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized - payment doesn't belong to user" });
      }

      // Check if order already exists (idempotency)
      const existingOrders = await storage.getOrdersByUserId(userId);
      const existingOrder = existingOrders.find(o => o.stripePaymentIntentId === paymentIntentId);
      if (existingOrder) {
        return res.json(existingOrder);
      }

      // Verify payment was successful
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: "Payment not successful", status: paymentIntent.status });
      }

      // Get cart items
      const cartItems = await storage.getCartItems(userId);
      if (cartItems.length === 0) {
        // If cart is empty but payment succeeded, the order was likely already created
        // Check once more for existing order and return 400 if not found
        const finalCheck = await storage.getOrdersByUserId(userId);
        const existingOrder = finalCheck.find(o => o.stripePaymentIntentId === paymentIntentId);
        if (existingOrder) {
          return res.json(existingOrder);
        }
        return res.status(400).json({ message: "Cart is empty - order may have already been created. Please check your order history." });
      }

      // Calculate totals
      const subtotal = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          const price = parseFloat(product?.price || "0");
          return price * item.quantity;
        })
      ).then(prices => prices.reduce((sum, price) => sum + price, 0));
      
      const installationFee = cartItems.some(item => item.needsInstallation) ? 89 : 0;
      const shipping = subtotal >= 50 ? 0 : 5.95;
      const expectedTotal = subtotal + installationFee + shipping;

      // Verify amount matches payment intent (security check)
      const expectedAmountInCents = Math.round(expectedTotal * 100);
      if (paymentIntent.amount !== expectedAmountInCents) {
        console.error("Payment amount mismatch:", { expected: expectedAmountInCents, received: paymentIntent.amount });
        return res.status(400).json({ 
          message: "Payment amount doesn't match cart total. Please contact support.",
          expected: expectedAmountInCents,
          received: paymentIntent.amount
        });
      }

      // Generate unique order number
      const orderNumber = `CAL-${Date.now()}`;

      // Create order with shipping details from localStorage (passed from frontend)
      const order = await storage.createOrder({
        userId,
        orderNumber,
        status: "confirmed",
        total: expectedTotal.toString(),
        stripePaymentIntentId: paymentIntentId,
        shippingAddress: shippingDetails || {},
      });

      // Create order items
      for (const cartItem of cartItems) {
        const cartItemAny = cartItem as any;
        const product = await storage.getProduct(cartItem.productId);
        await storage.createOrderItem({
          orderId: order.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: cartItemAny.variation?.price || product?.price || "0",
          needsInstallation: cartItem.needsInstallation,
          variationId: cartItem.variationId || null,
          variationLabel: cartItemAny.variation?.label || null,
        });

        // If installation is needed, create a booking placeholder
        if (cartItem.needsInstallation && shippingDetails) {
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

      res.json(order);
    } catch (error) {
      console.error("Error creating order from redirect:", error);
      res.status(500).json({ message: "Failed to create order" });
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

  app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
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

  // Image upload endpoint using Object Storage for production persistence  
  // Automatically resizes to 1000x1000 and converts to WebP format
  app.post('/api/upload/image', isAdmin, imageUpload.single('file'), async (req: any, res) => {
    console.log("🔍 [UPLOAD] Starting image upload with optimization...");
    
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      console.log("✅ [UPLOAD] File received:", req.file.originalname, req.file.size, "bytes");

      const fs = await import('fs');
      const path = await import('path');

      // Process image: resize to max 1000x1000 (don't upscale) and convert to WebP
      const metadata = await sharp(req.file.buffer).metadata();
      const maxSize = 1000;
      
      // Only resize if image is larger than maxSize, otherwise keep original dimensions
      const needsResize = (metadata.width && metadata.width > maxSize) || (metadata.height && metadata.height > maxSize);
      
      let sharpInstance = sharp(req.file.buffer);
      if (needsResize) {
        sharpInstance = sharpInstance.resize(maxSize, maxSize, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }
      
      const processedImage = await sharpInstance
        .webp({ quality: 90 })
        .toBuffer();
      
      console.log("✅ [UPLOAD] Image optimized: 1000x1000 WebP, size:", processedImage.length, "bytes");

      // Generate unique filename with .webp extension
      const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
      
      // Object Storage configuration
      const publicSearchPaths = process.env.PUBLIC_OBJECT_SEARCH_PATHS;
      const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
      
      if (!publicSearchPaths) {
        throw new Error("Object Storage not configured properly");
      }
      
      if (!bucketId) {
        throw new Error("Object Storage not configured");
      }
      
      const objectStorageDir = path.join('public', 'products');
      const objectStoragePath = path.join(objectStorageDir, fileName);
      
      try {
        await fs.promises.mkdir(objectStorageDir, { recursive: true });
        await fs.promises.writeFile(objectStoragePath, processedImage);
        console.log(`✅ [UPLOAD] Optimized image saved: ${objectStoragePath}`);
        
        const publicUrl = `/products/${fileName}`;
        
        res.json({
          url: publicUrl,
          fileName: fileName,
          size: processedImage.length,
          mimeType: 'image/webp'
        });
      } catch (objectStorageError: any) {
        console.error("❌ [UPLOAD] Object Storage upload failed:", objectStorageError);
        
        if (process.env.NODE_ENV === 'production') {
          return res.status(500).json({ 
            message: "Image upload failed - Object Storage not available in production",
            error: objectStorageError?.message || "Unknown error"
          });
        }
        
        // Development fallback to local directory
        console.log("🔄 [UPLOAD] Falling back to local storage (development only)");
        const localDir = path.join(process.cwd(), 'public', 'products');
        const localPath = path.join(localDir, fileName);
        
        await fs.promises.mkdir(localDir, { recursive: true });
        await fs.promises.writeFile(localPath, processedImage);
        
        const publicUrl = `/products/${fileName}`;
        
        res.json({
          url: publicUrl,
          fileName: fileName,
          size: processedImage.length,
          mimeType: 'image/webp'
        });
      }
    } catch (error: any) {
      console.error("❌ [UPLOAD] Error:", error);
      res.status(500).json({ 
        message: "Failed to upload image",
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

  // ============================================
  // SITEMAP.XML - SEO Compliant (sitemaps.org)
  // ============================================
  
  // Helper: Escape XML special characters
  function escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // Helper: Normalize URL (no trailing slash, except for root)
  function normalizeUrl(baseUrl: string, path: string): string {
    const cleanPath = path.replace(/\/+$/, ''); // Remove trailing slashes
    if (cleanPath === '' || cleanPath === '/') {
      return baseUrl; // Root URL without trailing slash
    }
    return `${baseUrl}${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
  }

  // Helper: Generate sitemap XML
  async function generateSitemapXml(baseUrl: string): Promise<string> {
    const urls: Array<{ loc: string; lastmod?: string; changefreq?: string; priority?: string }> = [];

    // Static pages (public, indexable)
    const staticPages = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/products', priority: '0.9', changefreq: 'daily' },
      { path: '/shop', priority: '0.9', changefreq: 'daily' },
      { path: '/blog', priority: '0.8', changefreq: 'weekly' },
      { path: '/studio', priority: '0.8', changefreq: 'weekly' },
      { path: '/booking', priority: '0.8', changefreq: 'weekly' },
      { path: '/about', priority: '0.7', changefreq: 'monthly' },
      { path: '/faq', priority: '0.6', changefreq: 'monthly' },
      { path: '/contact', priority: '0.7', changefreq: 'monthly' },
      { path: '/apple-carplay-bmw', priority: '0.8', changefreq: 'weekly' },
      { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
      { path: '/voorwaarden', priority: '0.3', changefreq: 'yearly' },
    ];

    // Add static pages
    for (const page of staticPages) {
      urls.push({
        loc: normalizeUrl(baseUrl, page.path),
        changefreq: page.changefreq,
        priority: page.priority,
      });
    }

    // Add dynamic product pages
    try {
      const products = await storage.getProducts({ limit: 50000 }); // Sitemap limit
      for (const product of products) {
        if (product.slug) {
          urls.push({
            loc: normalizeUrl(baseUrl, `/product/${product.slug}`),
            changefreq: 'weekly',
            priority: '0.7',
          });
        }
      }
    } catch (error) {
      console.error('Sitemap: Error fetching products:', error);
    }

    // Add dynamic blog post pages
    try {
      const blogPosts = await storage.getPublishedBlogPostsForSitemap();
      for (const post of blogPosts) {
        if (post.slug) {
          urls.push({
            loc: normalizeUrl(baseUrl, `/blog/${post.slug}`),
            lastmod: post.updatedAt ? post.updatedAt.toISOString().split('T')[0] : undefined,
            changefreq: 'weekly',
            priority: '0.7',
          });
        }
      }
    } catch (error) {
      console.error('Sitemap: Error fetching blog posts:', error);
    }

    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const url of urls) {
      xml += '  <url>\n';
      xml += `    <loc>${escapeXml(url.loc)}</loc>\n`;
      if (url.lastmod) {
        xml += `    <lastmod>${escapeXml(url.lastmod)}</lastmod>\n`;
      }
      if (url.changefreq) {
        xml += `    <changefreq>${escapeXml(url.changefreq)}</changefreq>\n`;
      }
      if (url.priority) {
        xml += `    <priority>${escapeXml(url.priority)}</priority>\n`;
      }
      xml += '  </url>\n';
    }

    xml += '</urlset>';
    return xml;
  }

  // ============================================
  // Blog Routes - Public
  // ============================================

  // Get all blog categories
  app.get('/api/blog/categories', async (req, res) => {
    try {
      const categories = await storage.getBlogCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching blog categories:", error);
      res.status(500).json({ message: "Failed to fetch blog categories" });
    }
  });

  // Get published blog posts with optional filters
  app.get('/api/blog/posts', async (req, res) => {
    try {
      const { categoryId, search, limit, offset } = req.query;

      const posts = await storage.getBlogPosts({
        categoryId: categoryId as string,
        search: search as string,
        status: "published",
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  // Get a single blog post by slug (increment view count)
  app.get('/api/blog/posts/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPostBySlug(slug);

      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      // Only show published posts to public
      if (post.status !== "published") {
        return res.status(404).json({ message: "Blog post not found" });
      }

      // Increment view count
      await storage.incrementBlogPostViews(post.id);

      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // ============================================
  // Blog Routes - Admin
  // ============================================

  // Get all blog posts (including drafts) for admin
  app.get('/api/admin/blog/posts', isAdmin, async (req, res) => {
    try {
      const { categoryId, status, search, limit, offset } = req.query;

      const posts = await storage.getBlogPosts({
        categoryId: categoryId as string,
        status: status as "draft" | "published" | undefined,
        search: search as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  // Create a new blog post
  app.post('/api/admin/blog/posts', isAdmin, async (req, res) => {
    try {
      const postData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  // Update a blog post
  app.patch('/api/admin/blog/posts/:id', isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const post = await storage.updateBlogPost(id, updates);

      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      res.json(post);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  // Delete a blog post
  app.delete('/api/admin/blog/posts/:id', isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBlogPost(id);
      res.json({ message: "Blog post deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // Create a new blog category
  app.post('/api/admin/blog/categories', isAdmin, async (req, res) => {
    try {
      const categoryData = insertBlogCategorySchema.parse(req.body);
      const category = await storage.createBlogCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating blog category:", error);
      res.status(500).json({ message: "Failed to create blog category" });
    }
  });

  // Update a blog category
  app.patch('/api/admin/blog/categories/:id', isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const category = await storage.updateBlogCategory(id, updates);

      if (!category) {
        return res.status(404).json({ message: "Blog category not found" });
      }

      res.json(category);
    } catch (error) {
      console.error("Error updating blog category:", error);
      res.status(500).json({ message: "Failed to update blog category" });
    }
  });

  // Delete a blog category
  app.delete('/api/admin/blog/categories/:id', isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBlogCategory(id);
      res.json({ message: "Blog category deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog category:", error);
      res.status(500).json({ message: "Failed to delete blog category" });
    }
  });

  // Batch optimize product images - downloads external images, resizes to 1000x1000, converts to WebP
  app.post('/api/admin/products/optimize-images', isAdmin, async (req: any, res) => {
    console.log("🔍 [OPTIMIZE] Starting batch image optimization...");
    
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      // Get all products
      const products = await storage.getProducts();
      const results = {
        processed: 0,
        skipped: 0,
        failed: 0,
        details: [] as { productId: string; name: string; status: string; newImages?: string[] }[]
      };
      
      const publicSearchPaths = process.env.PUBLIC_OBJECT_SEARCH_PATHS;
      const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
      
      if (!publicSearchPaths || !bucketId) {
        return res.status(500).json({ message: "Object Storage not configured" });
      }
      
      const objectStorageDir = path.join('public', 'products');
      await fs.promises.mkdir(objectStorageDir, { recursive: true });
      
      for (const product of products) {
        const images = product.images || [];
        if (images.length === 0) {
          results.skipped++;
          results.details.push({ productId: product.id, name: product.name, status: 'skipped - no images' });
          continue;
        }
        
        const newImages: string[] = [];
        let hasChanges = false;
        
        for (let i = 0; i < images.length; i++) {
          const imageUrl = images[i];
          
          // Skip if already a local WebP file
          if (imageUrl.startsWith('/products/') && imageUrl.endsWith('.webp')) {
            newImages.push(imageUrl);
            continue;
          }
          
          try {
            let imageBuffer: Buffer;
            
            // Download external images
            if (imageUrl.startsWith('http')) {
              console.log(`📥 [OPTIMIZE] Downloading: ${imageUrl}`);
              const response = await fetch(imageUrl);
              if (!response.ok) {
                console.error(`❌ [OPTIMIZE] Failed to download: ${imageUrl}`);
                newImages.push(imageUrl); // Keep original
                continue;
              }
              imageBuffer = Buffer.from(await response.arrayBuffer());
            } else if (imageUrl.startsWith('/products/')) {
              // Local non-WebP file
              const localPath = path.join('public', imageUrl);
              try {
                imageBuffer = await fs.promises.readFile(localPath);
              } catch {
                newImages.push(imageUrl); // Keep original if can't read
                continue;
              }
            } else {
              newImages.push(imageUrl); // Keep unknown format
              continue;
            }
            
            // Process image: resize to max 1000x1000 (don't upscale small images) and convert to WebP
            const metadata = await sharp(imageBuffer).metadata();
            const maxSize = 1000;
            
            let sharpInstance = sharp(imageBuffer);
            // Only resize if image is larger than maxSize
            if ((metadata.width && metadata.width > maxSize) || (metadata.height && metadata.height > maxSize)) {
              sharpInstance = sharpInstance.resize(maxSize, maxSize, {
                fit: 'inside',
                withoutEnlargement: true
              });
            }
            
            const processedImage = await sharpInstance
              .webp({ quality: 90 })
              .toBuffer();
            
            // Save to Object Storage
            const fileName = `product-${product.id}-${i}-${Date.now()}.webp`;
            const objectStoragePath = path.join(objectStorageDir, fileName);
            await fs.promises.writeFile(objectStoragePath, processedImage);
            
            const newUrl = `/products/${fileName}`;
            newImages.push(newUrl);
            hasChanges = true;
            console.log(`✅ [OPTIMIZE] Processed: ${product.name} image ${i + 1}`);
          } catch (imgError) {
            console.error(`❌ [OPTIMIZE] Error processing image for ${product.name}:`, imgError);
            newImages.push(imageUrl); // Keep original on error
          }
        }
        
        if (hasChanges) {
          // Update product with new images
          await storage.updateProduct(product.id, { images: newImages });
          results.processed++;
          results.details.push({ productId: product.id, name: product.name, status: 'optimized', newImages });
        } else {
          results.skipped++;
          results.details.push({ productId: product.id, name: product.name, status: 'no changes needed' });
        }
      }
      
      console.log(`✅ [OPTIMIZE] Batch complete: ${results.processed} processed, ${results.skipped} skipped, ${results.failed} failed`);
      res.json(results);
    } catch (error: any) {
      console.error("❌ [OPTIMIZE] Batch optimization failed:", error);
      res.status(500).json({ message: "Failed to optimize images", error: error?.message });
    }
  });

  // Sitemap route
  app.get('/sitemap.xml', async (req, res) => {
    try {
      // Always use HTTPS for sitemap URLs (required by Google)
      const host = req.headers['x-forwarded-host'] || req.headers.host || 'caraudiolimburg.replit.app';
      const baseUrl = process.env.BASE_URL || `https://${host}`;

      const xml = await generateSitemapXml(baseUrl.replace(/\/+$/, '')); // Remove trailing slash from base

      // Set correct headers for XML
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      res.setHeader('X-Robots-Tag', 'noindex'); // Sitemap itself should not be indexed
      
      res.send(xml);
    } catch (error) {
      console.error('Sitemap generation error:', error);
      res.status(500).setHeader('Content-Type', 'text/plain').send('Error generating sitemap');
    }
  });

  // AI Chatbot route
  app.post('/api/chat', async (req, res) => {
    const chatRequestSchema = z.object({
      messages: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string()
      })).default([]),
      message: z.string().min(1, 'Bericht is verplicht')
    });

    const parsed = chatRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Ongeldig verzoek. Voer een bericht in.' });
    }

    const { messages, message } = parsed.data;

    try {
      const response = await handleChatMessage(messages, message);
      res.json({ response });
    } catch (error) {
      console.error('Chat API error:', error);
      res.status(500).json({ error: 'Er is een fout opgetreden. Probeer het later opnieuw.' });
    }
  });

  // eTrusted/Trusted Shops API routes
  app.get('/api/etrusted/service-reviews', async (req, res) => {
    try {
      if (!etrustedService.isConfigured()) {
        return res.json({ reviews: [], enabled: false });
      }
      const limit = parseInt(req.query.limit as string) || 10;
      const reviews = await etrustedService.getServiceReviews(limit);
      res.json({ reviews, enabled: true });
    } catch (error) {
      console.error("Error fetching eTrusted reviews:", error);
      res.json({ reviews: [], enabled: false, error: true });
    }
  });

  app.get('/api/etrusted/aggregate', async (req, res) => {
    try {
      if (!etrustedService.isConfigured()) {
        return res.json({ rating: null, count: 0, enabled: false });
      }
      const aggregate = await etrustedService.getAggregatedRating();
      if (!aggregate) {
        return res.json({ rating: null, count: 0, enabled: false });
      }
      res.json({ ...aggregate, enabled: true });
    } catch (error) {
      console.error("Error fetching eTrusted aggregate:", error);
      res.json({ rating: null, count: 0, enabled: false, error: true });
    }
  });

  app.get('/api/etrusted/config', (req, res) => {
    const config = etrustedService.getTrustbadgeConfig();
    res.json(config);
  });

  app.post('/api/etrusted/invite', isAdmin, async (req, res) => {
    try {
      if (!etrustedService.isConfigured()) {
        return res.status(400).json({ message: "eTrusted service not configured", success: false });
      }

      const schema = z.object({
        customerEmail: z.string().email(),
        customerFirstName: z.string().optional(),
        customerLastName: z.string().optional(),
        orderReference: z.string().min(1),
        orderDate: z.string(),
        products: z.array(z.object({
          name: z.string(),
          sku: z.string().optional(),
          url: z.string().optional(),
          imageUrl: z.string().optional(),
        })).optional(),
      });

      const parseResult = schema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: parseResult.error.flatten().fieldErrors,
          success: false 
        });
      }

      const success = await etrustedService.sendReviewInvitation(parseResult.data);
      res.json({ success });
    } catch (error) {
      console.error("Error sending review invitation:", error);
      res.status(500).json({ message: "Failed to send review invitation", success: false });
    }
  });

  // Robots.txt route
  app.get('/robots.txt', (req, res) => {
    // Always use HTTPS for sitemap reference
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'caraudiolimburg.replit.app';
    const baseUrl = process.env.BASE_URL || `https://${host}`;

    const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /login
Disallow: /my-account
Disallow: /cart
Disallow: /checkout
Disallow: /order-confirmation

Sitemap: ${baseUrl.replace(/\/+$/, '')}/sitemap.xml
`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.send(robotsTxt);
  });

  const httpServer = createServer(app);
  return httpServer;
}
