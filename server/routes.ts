import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import multer from "multer";
import Papa from "papaparse";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { Client as ObjectStorageClient } from "@replit/object-storage";
import { z } from "zod";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import { handleChatMessage } from "./chatbot";
import { etrustedService } from "./services/etrusted";
import { clickupService, type WebsiteReport } from "./services/clickup";
import { clickupScheduler } from "./services/scheduler";
import { emailService } from "./services/email";
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
import { generateImage } from "./replit_integrations/image";
import { getAllCachedReviewImageUrls, generateAllReviewImages, getAllCachedPortraitUrls, generateAllPortraits } from "./services/reviewImages";

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

// Helper: save a product image buffer to local filesystem AND Object Storage for persistence
async function saveProductImage(fileName: string, buffer: Buffer): Promise<string> {
  const localDir = path.join(process.cwd(), 'public', 'products');
  const localPath = path.join(localDir, fileName);
  await fs.promises.mkdir(localDir, { recursive: true });
  await fs.promises.writeFile(localPath, buffer);

  if (process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID) {
    try {
      const client = new ObjectStorageClient();
      const objectName = `products/${fileName}`;
      const result = await client.uploadFromBytes(objectName, buffer);
      if (result.ok) {
        console.log(`✅ [Object Storage] Uploaded: ${objectName}`);
      } else {
        console.error(`❌ [Object Storage] Upload failed for ${objectName}:`, result.error);
      }
    } catch (err) {
      console.error(`❌ [Object Storage] Exception uploading ${fileName}:`, err);
    }
  }

  return `/products/${fileName}`;
}

// PDF upload configuration
const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for PDFs
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // WordPress-to-new-site 301 redirect middleware
  app.use((req, res, next) => {
    const path = req.path;

    if (path.startsWith('/api/') || path.startsWith('/assets/')) {
      return next();
    }

    const cleanPath = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;

    if (path.startsWith('/wp-content/') || path.startsWith('/wp-content')) {
      return res.status(410).send('Gone');
    }

    const brandMatch = cleanPath.match(/^\/(brand|product-brand)\/([^/]+)$/);
    if (brandMatch) {
      return res.redirect(301, `/webshop?brand=${brandMatch[2]}`);
    }

    if (/^\/cat(\/|$)/.test(cleanPath)) {
      return res.redirect(301, '/webshop');
    }

    if (/^\/product_cat(\/|$)/.test(cleanPath)) {
      return res.redirect(301, '/webshop');
    }

    if (/^\/landingpaginas(\/|$)/.test(cleanPath)) {
      return res.redirect(301, '/webshop');
    }

    if (/^\/model-year(\/|$)/.test(cleanPath)) {
      return res.redirect(301, '/webshop');
    }

    if (/^\/audio-upgrades\//.test(cleanPath)) {
      return res.redirect(301, '/webshop');
    }

    if (cleanPath === '/klantenservice/garantie-en-reparatie') {
      return res.redirect(301, '/veelgestelde-vragen');
    }
    if (cleanPath === '/klantenservice/veelgestelde-vragen') {
      return res.redirect(301, '/veelgestelde-vragen');
    }
    if (cleanPath === '/klantenservice' || cleanPath.startsWith('/klantenservice/')) {
      return res.redirect(301, '/contact');
    }

    if (cleanPath === '/webshop/privacy-policy') {
      return res.redirect(301, '/privacy-policy');
    }

    const staticRedirects: Record<string, string> = {
      '/reviews': '/',
      '/alarminstallaties': '/webshop',
      '/dashcams': '/webshop',
      '/achteruitrijcameras': '/webshop',
      '/carplay': '/webshop',
      '/audio-upgrade': '/webshop',
      '/audi-audio-upgrade': '/webshop',
      '/bmw-audio-upgrade-2': '/webshop',
      '/inbouwservice-car-audio-limburg': '/montage',
      '/bedrijfsgegevens': '/over-ons',
      '/about': '/over-ons',
      '/about-us': '/over-ons',
      '/landing-page': '/',
      '/cookie-policy': '/privacy-policy',
    };

    if (staticRedirects[cleanPath]) {
      return res.redirect(301, staticRedirects[cleanPath]);
    }

    const wpBlogSlugs = new Set([
      'de-voordelen-van-het-upgraden-van-je-af-fabriek-speakers',
      'apple-carplay-voor-uw-bmw-compatibiliteit-installatie-en-gebruik',
      'car-audio-limburg-blijft-in-beweging',
      'car-audio-limburg-blikt-terug-en-kijkt-vooruit',
      'een-nieuw-jaar-een-fris-begin',
      'hoe-maak-je-apple-carplay-draadloos',
      'kies-de-luidsprekers-die-bij-jou-passen',
      'waarom-een-rear-entertainment-systeem-op-de-achterbank-de-perfecte-aanvulling-is-voor-uw-familie-uitstapjes',
      'zijn-alpine-sound-systemen-goed',
    ]);

    const rootSlugMatch = cleanPath.match(/^\/([a-z0-9-]+)$/);
    if (rootSlugMatch && wpBlogSlugs.has(rootSlugMatch[1])) {
      return res.redirect(301, `/blog/${rootSlugMatch[1]}`);
    }

    const spaRoutes = new Set(['/portfolio', '/webshop', '/blog', '/contact', '/over-ons', '/montage', '/booking', '/faq', '/cart', '/checkout', '/login', '/admin']);
    if (path.length > 1 && path.endsWith('/') && cleanPath === path.slice(0, -1) && !spaRoutes.has(cleanPath)) {
      return res.redirect(301, cleanPath);
    }

    next();
  });

  // Health check endpoints for deployment monitoring
  app.get('/health', async (req, res) => {
    try {
      // Check database connectivity by querying a simple product
      const dbHealthy = await storage.getProducts({ limit: 1 }).then(
        () => true,
        () => false
      );
      
      const status = dbHealthy ? 'healthy' : 'degraded';
      const statusCode = dbHealthy ? 200 : 503;
      
      res.status(statusCode).json({
        status,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: dbHealthy ? 'connected' : 'disconnected'
      });
    } catch (error) {
      console.error('Health check error:', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Internal server error'
      });
    }
  });

  app.get('/api/health', async (req, res) => {
    try {
      // Check database connectivity by querying a simple product
      const dbHealthy = await storage.getProducts({ limit: 1 }).then(
        () => true,
        () => false
      );
      
      const status = dbHealthy ? 'healthy' : 'degraded';
      const statusCode = dbHealthy ? 200 : 503;
      
      res.status(statusCode).json({
        status,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: dbHealthy ? 'connected' : 'disconnected'
      });
    } catch (error) {
      console.error('Health check error:', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Internal server error'
      });
    }
  });

  app.get('/api/stripe-config', (req, res) => {
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      return res.status(500).json({ error: 'Stripe is niet geconfigureerd' });
    }
    res.json({ publishableKey });
  });

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
      <p>Datum: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString('nl-NL') : 'N/A'}</p>
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
        storage.getProducts({ search: query, limit: 10 }),
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
      
      const products = allProducts.slice(0, 10).map(p => ({
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
        featured,
        ids
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
        ids: ids ? (ids as string).split(',') : undefined,
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

  // Product upsells routes
  app.get('/api/products/:productId/upsells', async (req, res) => {
    try {
      const productId = req.params.productId;
      const upsells = await storage.getProductUpsells(productId);
      res.json(upsells);
    } catch (error) {
      console.error("Error fetching product upsells:", error);
      res.status(500).json({ message: "Failed to fetch product upsells" });
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
      const all = req.query.all === 'true';
      const makes = all ? await storage.getAllVehicleMakes() : await storage.getVehicleMakes();
      res.json(makes);
    } catch (error) {
      console.error("Error fetching vehicle makes:", error);
      res.status(500).json({ message: "Failed to fetch vehicle makes" });
    }
  });

  app.get('/api/vehicle-models/:makeId', async (req, res) => {
    try {
      const all = req.query.all === 'true';
      const models = all ? await storage.getAllVehicleModelsByMake(req.params.makeId) : await storage.getVehicleModels(req.params.makeId);
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
      const { productId, variationId, quantity: reqQuantity } = req.body;
      
      if (reqQuantity !== undefined && (!Number.isInteger(reqQuantity) || reqQuantity < 1 || reqQuantity > 99)) {
        return res.status(400).json({ message: "Quantity must be a whole number between 1 and 99" });
      }
      
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
      if (!req.isAuthenticated() || !req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { quantity } = req.body;
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return res.status(400).json({ message: "Quantity must be a whole number between 1 and 99" });
      }

      const existing = await storage.getCartItem(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      if (existing.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const cartItem = await storage.updateCartItem(req.params.id, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/:id', async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const existing = await storage.getCartItem(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      if (existing.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
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
      const body = {
        ...req.body,
        scheduledDate: req.body.scheduledDate ? new Date(req.body.scheduledDate) : undefined,
      };
      const bookingData = insertBookingSchema.parse(body);
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

  app.patch('/api/bookings/:id/status', isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const booking = await storage.updateBookingStatus(id, status);
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  app.patch('/api/orders/:id/status', isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await storage.updateOrderStatus(id, status);
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Contact form route
  app.post('/api/contact', async (req, res) => {
    try {
      const { firstName, lastName, email, phone, subject, message } = req.body;

      if (!lastName || !email) {
        return res.status(400).json({ message: "Achternaam en e-mail zijn verplicht" });
      }

      // Save locally first (always succeeds)
      const contactRequest = await storage.createQuoteRequest({
        firstName: firstName || '',
        lastName,
        email,
        phone: phone || '',
        vehicleMake: 'Contact',
        vehicleModel: subject || 'Algemeen',
        vehicleYear: new Date().getFullYear(),
        description: `Contactformulier:\n\nOnderwerp: ${subject || 'Geen onderwerp'}\n\n${message || 'Geen bericht'}`,
      });

      // Send confirmation email (best-effort)
      try {
        const { sendContactConfirmationEmail } = await import('./services/email');
        await sendContactConfirmationEmail(
          email,
          `${firstName || ''} ${lastName}`.trim(),
          subject || 'Algemeen',
          message || ''
        );
      } catch (emailError) {
        console.error("Contact confirmation email failed:", emailError);
      }

      // Then try Teamleader sync (best-effort)
      try {
        const teamleader = await import('./services/teamleader');
        if (teamleader.isConfigured()) {
          const contactIdTl = await teamleader.createContact({
            firstName: firstName || '',
            lastName,
            email,
            phone: phone || '',
            country: 'NL',
          });

          if (contactIdTl) {
            await teamleader.createDeal({
              contactId: contactIdTl,
              title: `Website Contact - ${firstName || ''} ${lastName}`,
              summary: `Onderwerp: ${subject || 'Geen onderwerp'}\n\nBericht:\n${message || 'Geen bericht'}`,
            });
          }
        }
      } catch (tlError) {
        console.error("Teamleader sync failed (contact form):", tlError);
      }

      res.json({ success: true, id: contactRequest.id });
    } catch (error) {
      console.error("Error processing contact form:", error);
      res.status(500).json({ message: "Er is een fout opgetreden" });
    }
  });

  // Quote request routes
  app.post('/api/quote-requests', async (req, res) => {
    try {
      const quoteData = insertQuoteRequestSchema.parse(req.body);
      const quote = await storage.createQuoteRequest(quoteData);

      // Send confirmation email (best-effort)
      try {
        const { sendQuoteConfirmationEmail } = await import('./services/email');
        const vehicleInfo = `${quoteData.vehicleMake} ${quoteData.vehicleModel} (${quoteData.vehicleYear})`;
        await sendQuoteConfirmationEmail(
          quoteData.email,
          `${quoteData.firstName} ${quoteData.lastName}`.trim(),
          vehicleInfo,
          quoteData.description || ''
        );
      } catch (emailError) {
        console.error("Quote confirmation email failed:", emailError);
      }

      // Then try Teamleader sync (best-effort)
      try {
        const teamleader = await import('./services/teamleader');
        if (teamleader.isConfigured()) {
          const contactId = await teamleader.createContact({
            firstName: quoteData.firstName,
            lastName: quoteData.lastName,
            email: quoteData.email,
            phone: quoteData.phone,
            country: 'NL',
          });

          if (contactId) {
            await teamleader.createDeal({
              contactId,
              title: `Offerte - ${quoteData.firstName} ${quoteData.lastName}`,
              summary: quoteData.description || '',
              customFields: {
                merk: quoteData.vehicleMake,
                model: quoteData.vehicleModel,
                bouwjaar: String(quoteData.vehicleYear),
              },
            });
          }
        }
      } catch (tlError) {
        console.error("Teamleader sync failed (quote form):", tlError);
      }

      res.json(quote);
    } catch (error) {
      console.error("Error creating quote request:", error);
      res.status(500).json({ message: "Failed to create quote request" });
    }
  });

  app.get('/api/quote-requests', isAdmin, async (req, res) => {
    try {
      const quotes = await storage.getQuoteRequests();
      res.json(quotes);
    } catch (error) {
      console.error("Error fetching quote requests:", error);
      res.status(500).json({ message: "Failed to fetch quote requests" });
    }
  });

  app.patch('/api/quote-requests/:id/status', isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, responseNotes } = req.body;
      const quote = await storage.updateQuoteRequest(id, { status, responseNotes });
      res.json(quote);
    } catch (error) {
      console.error("Error updating quote request status:", error);
      res.status(500).json({ message: "Failed to update quote request status" });
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

      // Send confirmation email (best-effort)
      try {
        const { sendQuoteConfirmationEmail } = await import('./services/email');
        const vehicleInfo = `${model} (${year})`;
        await sendQuoteConfirmationEmail(
          email,
          `${firstName} ${lastName}`.trim(),
          vehicleInfo,
          `CarPlay Activatie\nVIN: ${vin}${license ? '\nKenteken: ' + license : ''}${message ? '\n\n' + message : ''}`
        );
      } catch (emailError) {
        console.error("BMW CarPlay confirmation email failed:", emailError);
      }

      // Then try Teamleader sync (best-effort)
      try {
        const teamleader = await import('./services/teamleader');
        if (teamleader.isConfigured()) {
          const contactId = await teamleader.createContact({
            firstName,
            lastName,
            email,
            phone,
            country: 'NL',
          });

          if (contactId) {
            await teamleader.createDeal({
              contactId,
              title: `BMW CarPlay - ${firstName} ${lastName}`,
              summary: `BMW/MINI CarPlay Activatie - ${model} (${year})\nVIN: ${vin}\n${license ? 'Kenteken: ' + license : ''}\n\n${message || ''}`,
              customFields: {
                merk: model.toLowerCase().includes('bmw') ? 'BMW' : 'MINI',
                kenteken: license || '',
                model: model,
                vin: vin,
                bouwjaar: String(year),
              },
            });
          }
        }
      } catch (tlError) {
        console.error("Teamleader sync failed (BMW CarPlay quote):", tlError);
      }

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
      const userId = (req as any).user.id;
      
      // Server-side price validation - fetch cart items from database
      const cartItems = await storage.getCartItems(userId);
      
      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate total from actual product prices in database
      let subtotal = 0;
      let installationFee = 0;
      
      for (const cartItem of cartItems) {
        const product = await storage.getProduct(cartItem.productId);
        if (!product) {
          return res.status(400).json({ message: `Product not found: ${cartItem.productId}` });
        }
        
        let price = parseFloat(product.price);
        
        if (cartItem.variationId) {
          const variation = await storage.getProductVariation(cartItem.variationId);
          if (!variation || variation.productId !== cartItem.productId) {
            return res.status(400).json({ message: `Invalid variation for product: ${cartItem.productId}` });
          }
          price = parseFloat(variation.price);
        }
        
        subtotal += price * cartItem.quantity;
        
        if (cartItem.needsInstallation && product.canHaveInstallation && product.installationPrice) {
          installationFee += parseFloat(product.installationPrice);
        }
      }
      const shipping = subtotal >= 100 ? 0 : 15;
      const total = subtotal + installationFee + shipping;
      
      if (total <= 0) {
        return res.status(400).json({ message: "Invalid cart total" });
      }
      
      const { shippingDetails } = req.body;
      const metadata: Record<string, string> = { userId };
      if (shippingDetails) {
        metadata.shippingDetails = JSON.stringify(shippingDetails).slice(0, 500);
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100),
        currency: "eur",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata,
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Stripe payment intent error:", error);
      res
        .status(500)
        .json({ message: "Error creating payment intent: " + error.message });
    }
  });

  app.post("/api/update-payment-intent-shipping", async (req: any, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Payment system not configured" });
    }
    try {
      const { clientSecret, shippingDetails } = req.body;
      if (!clientSecret || !shippingDetails) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const piId = clientSecret.split('_secret_')[0];
      const paymentIntent = await stripe.paymentIntents.retrieve(piId);

      if (req.isAuthenticated?.() && req.user?.id) {
        if (paymentIntent.metadata?.userId && paymentIntent.metadata.userId !== req.user.id) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }

      await stripe.paymentIntents.update(piId, {
        metadata: { 
          ...paymentIntent.metadata,
          shippingDetails: JSON.stringify(shippingDetails).slice(0, 500),
        },
      });
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error updating payment intent shipping:", error);
      res.status(500).json({ message: "Failed to update shipping details" });
    }
  });

  // Guest checkout - create payment intent with server-side price validation
  app.post("/api/guest-checkout/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Payment system not configured. Please set up Stripe API keys." });
    }
    
    try {
      const { cartItems, guestEmail, shippingDetails } = req.body;
      
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
          if (!variation || variation.productId !== item.productId) {
            return res.status(400).json({ message: `Invalid variation for product: ${product.name}` });
          }
          price = parseFloat(variation.price);
        } else if (product.hasVariations) {
          return res.status(400).json({ message: `Variation is required for product: ${product.name}` });
        }
        
        subtotal += price * item.quantity;
        const itemInstallationPrice = (item.needsInstallation && product.canHaveInstallation && product.installationPrice)
          ? product.installationPrice
          : null;
        validatedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          needsInstallation: item.needsInstallation || false,
          variationId: item.variationId || null,
          price: price.toString(),
          installationPrice: itemInstallationPrice,
        });
      }
      
      const installationFee = validatedItems.reduce((sum, item) => {
        if (item.needsInstallation && item.installationPrice) {
          return sum + parseFloat(item.installationPrice);
        }
        return sum;
      }, 0);
      const shipping = subtotal >= 100 ? 0 : 15;
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
            price: i.price,
            installationPrice: i.installationPrice,
          }))),
          ...(shippingDetails ? { shippingDetails: JSON.stringify(shippingDetails).slice(0, 500) } : {}),
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
      
      const installationFee = cartItems.reduce((sum: number, item: any) => {
        if (item.needsInstallation && item.installationPrice) {
          return sum + parseFloat(item.installationPrice);
        }
        return sum;
      }, 0);
      const shipping = subtotal >= 100 ? 0 : 15;
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
        status: "paid",
        total: total.toString(),
        subtotal: subtotal.toString(),
        installationTotal: installationFee.toString(),
        stripePaymentIntentId: paymentIntentId,
        shippingAddress: shippingDetails,
      });

      for (const cartItem of cartItems) {
        let variationLabel = null;
        if (cartItem.variationId) {
          const variation = await storage.getProductVariation(cartItem.variationId);
          if (variation) variationLabel = variation.label;
        }
        await storage.createOrderItem({
          orderId: order.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: cartItem.price,
          needsInstallation: cartItem.needsInstallation,
          variationId: cartItem.variationId || null,
          variationLabel,
        });
      }

      // Send order confirmation email and eTrusted review invitation
      const customerEmail = guestEmail || paymentIntent.metadata?.guestEmail;
      if (customerEmail) {
        // Send order confirmation email
        const itemsWithDetails = await Promise.all(
          cartItems.map(async (item: any) => {
            const product = await storage.getProduct(item.productId);
            return {
              name: product?.name || 'Product',
              quantity: item.quantity,
              price: (parseFloat(item.price) * item.quantity).toFixed(2),
            };
          })
        );

        emailService.sendOrderConfirmationEmail({
          orderNumber,
          customerEmail,
          customerName: shippingDetails?.firstName || 'Klant',
          items: itemsWithDetails,
          subtotal: subtotal.toFixed(2),
          shipping: shipping.toFixed(2),
          total: total.toFixed(2),
          shippingAddress: {
            firstName: shippingDetails?.firstName || '',
            lastName: shippingDetails?.lastName || '',
            address: shippingDetails?.address || '',
            city: shippingDetails?.city || '',
            postalCode: shippingDetails?.postalCode || '',
            country: shippingDetails?.country || 'Nederland',
          },
        }).then(() => {
          console.log(`[Guest Order] Confirmation email sent for order ${orderNumber} to ${customerEmail}`);
        }).catch(err => {
          console.error(`[Guest Order] Failed to send confirmation email for ${orderNumber}:`, err);
        });

        // Send eTrusted review invitation (non-blocking)
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

  // Get guest order by payment intent ID
  app.get("/api/guest-orders/by-payment-intent/:paymentIntentId", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Payment system not configured" });
    }

    try {
      const { paymentIntentId } = req.params;

      // Verify payment intent exists and is a guest checkout
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.metadata?.isGuest !== "true") {
        return res.status(403).json({ message: "Not a guest checkout" });
      }

      // Get order with items from database
      const order = await storage.getOrderByPaymentIntentId(paymentIntentId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Get order with items using existing function
      const orderWithItems = await storage.getOrderWithItems(order.id);
      if (!orderWithItems) {
        return res.status(404).json({ message: "Order details not found" });
      }

      res.json({
        ...orderWithItems.order,
        items: orderWithItems.items.map(item => ({
          ...item,
          product: item.product ? {
            name: item.product.name,
            slug: item.product.slug,
            images: item.product.images,
          } : null,
        })),
      });
    } catch (error) {
      console.error("Error fetching guest order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
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
          
          const installationFee = cartItems.reduce((sum, item) => {
            const anyItem = item as any;
            if (item.needsInstallation && anyItem.product?.canHaveInstallation && anyItem.product?.installationPrice) {
              return sum + parseFloat(anyItem.product.installationPrice);
            }
            return sum;
          }, 0);
          const shipping = subtotal >= 100 ? 0 : 15;
          const expectedTotal = subtotal + installationFee + shipping;
          
          const orderNumber = `CAL-${Date.now()}`;
          let shippingAddress = {};
          try {
            if (paymentIntent.metadata?.shippingDetails) {
              shippingAddress = JSON.parse(paymentIntent.metadata.shippingDetails);
            }
          } catch {}
          
          order = await storage.createOrder({
            userId,
            orderNumber,
            status: "paid",
            total: expectedTotal.toString(),
            stripePaymentIntentId: paymentIntentId,
            shippingAddress,
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
      
      const installationFee = cartItems.reduce((sum, item) => {
        const anyItem = item as any;
        if (item.needsInstallation && anyItem.product?.canHaveInstallation && anyItem.product?.installationPrice) {
          return sum + parseFloat(anyItem.product.installationPrice);
        }
        return sum;
      }, 0);
      const shipping = subtotal >= 100 ? 0 : 15;
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
        status: "paid",
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
      
      const installationFee = cartItems.reduce((sum, item) => {
        const anyItem = item as any;
        if (item.needsInstallation && anyItem.product?.canHaveInstallation && anyItem.product?.installationPrice) {
          return sum + parseFloat(anyItem.product.installationPrice);
        }
        return sum;
      }, 0);
      const shipping = subtotal >= 100 ? 0 : 15;
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

      let resolvedShipping = shippingDetails || {};
      if (!shippingDetails || Object.keys(shippingDetails).length === 0) {
        try {
          if (paymentIntent.metadata?.shippingDetails) {
            resolvedShipping = JSON.parse(paymentIntent.metadata.shippingDetails);
          }
        } catch {}
      }

      const order = await storage.createOrder({
        userId,
        orderNumber,
        status: "paid",
        total: expectedTotal.toString(),
        stripePaymentIntentId: paymentIntentId,
        shippingAddress: resolvedShipping,
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

  // Image upload endpoint - resizes to max 1000x1000, converts to WebP, saves to local + Object Storage
  app.post('/api/upload/image', isAdmin, imageUpload.single('file'), async (req: any, res) => {
    console.log("🔍 [UPLOAD] Starting image upload with optimization...");
    
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      console.log("✅ [UPLOAD] File received:", req.file.originalname, req.file.size, "bytes");

      // Process image: resize to max 1000x1000 (don't upscale) and convert to WebP
      const metadata = await sharp(req.file.buffer).metadata();
      const maxSize = 1000;
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
      
      console.log("✅ [UPLOAD] Image optimized to WebP, size:", processedImage.length, "bytes");

      const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
      const publicUrl = await saveProductImage(fileName, processedImage);

      console.log(`✅ [UPLOAD] Saved as ${publicUrl}`);
      res.json({
        url: publicUrl,
        fileName: fileName,
        size: processedImage.length,
        mimeType: 'image/webp'
      });
    } catch (error: any) {
      console.error("❌ [UPLOAD] Error:", error);
      res.status(500).json({ 
        message: "Failed to upload image",
        error: error?.message || "Unknown error"
      });
    }
  });

  // PDF upload endpoint for product downloads (manuals, tech sheets, etc.)
  app.post('/api/upload/pdf', isAdmin, pdfUpload.single('file'), async (req: any, res) => {
    console.log("🔍 [UPLOAD] Starting PDF upload...");
    
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log("🔍 [UPLOAD] PDF file received:", {
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });

      // Sanitize filename
      const sanitizedName = req.file.originalname
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .toLowerCase();
      const fileName = `download-${Date.now()}-${sanitizedName}`;
      
      const downloadDir = path.join(process.cwd(), 'public', 'downloads');
      const filePath = path.join(downloadDir, fileName);
      
      await fs.promises.mkdir(downloadDir, { recursive: true });
      await fs.promises.writeFile(filePath, req.file.buffer);
      
      console.log(`✅ [UPLOAD] PDF saved: ${filePath}`);
      
      const publicUrl = `/downloads/${fileName}`;
      
      res.json({
        url: publicUrl,
        fileName: fileName,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: 'application/pdf'
      });
    } catch (error: any) {
      console.error("❌ [UPLOAD] PDF upload error:", error);
      res.status(500).json({ 
        message: "Failed to upload PDF",
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
  // Portfolio Routes - Public
  // ============================================

  // Get all portfolio projects (public)
  app.get('/api/portfolio', async (req, res) => {
    try {
      const { category, featured, limit, offset } = req.query;
      const projects = await storage.getPortfolioProjects({
        category: category as string,
        featured: featured === 'true' ? true : undefined,
        published: true,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(projects);
    } catch (error) {
      console.error("Error fetching portfolio projects:", error);
      res.status(500).json({ message: "Failed to fetch portfolio projects" });
    }
  });

  // Get single portfolio project by slug (public)
  app.get('/api/portfolio/:slug', async (req, res) => {
    try {
      const project = await storage.getPortfolioProjectBySlug(req.params.slug);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching portfolio project:", error);
      res.status(500).json({ message: "Failed to fetch portfolio project" });
    }
  });

  // Admin portfolio routes
  app.get('/api/admin/portfolio', isAdmin, async (req: any, res) => {
    try {
      const projects = await storage.getPortfolioProjects({});
      res.json(projects);
    } catch (error) {
      console.error("Error fetching portfolio projects:", error);
      res.status(500).json({ message: "Failed to fetch portfolio projects" });
    }
  });

  app.post('/api/admin/portfolio', isAdmin, async (req: any, res) => {
    try {
      const project = await storage.createPortfolioProject(req.body);
      res.status(201).json(project);
    } catch (error: any) {
      console.error("Error creating portfolio project:", error);
      res.status(500).json({ message: error.message || "Failed to create portfolio project" });
    }
  });

  app.put('/api/admin/portfolio/:id', isAdmin, async (req: any, res) => {
    try {
      const project = await storage.updatePortfolioProject(req.params.id, req.body);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error: any) {
      console.error("Error updating portfolio project:", error);
      res.status(500).json({ message: error.message || "Failed to update portfolio project" });
    }
  });

  app.delete('/api/admin/portfolio/:id', isAdmin, async (req: any, res) => {
    try {
      const deleted = await storage.deletePortfolioProject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json({ message: "Portfolio project deleted" });
    } catch (error) {
      console.error("Error deleting portfolio project:", error);
      res.status(500).json({ message: "Failed to delete portfolio project" });
    }
  });

  // Site Settings Routes
  // ============================================

  app.get('/api/site-settings', async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });

  app.put('/api/admin/site-settings', isAdmin, async (req: any, res) => {
    try {
      const { installationServiceEnabled } = req.body;
      const updated = await storage.updateSiteSettings({ installationServiceEnabled });
      res.json(updated);
    } catch (error) {
      console.error("Error updating site settings:", error);
      res.status(500).json({ message: "Failed to update site settings" });
    }
  });

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
      const products = await storage.getProducts();
      const results = {
        processed: 0,
        skipped: 0,
        failed: 0,
        details: [] as { productId: string; name: string; status: string; newImages?: string[] }[]
      };
      
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
          
          // Skip if already a local WebP file in Object Storage
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
                newImages.push(imageUrl);
                continue;
              }
              imageBuffer = Buffer.from(await response.arrayBuffer());
            } else if (imageUrl.startsWith('/products/')) {
              const localPath = path.join(process.cwd(), 'public', imageUrl);
              try {
                imageBuffer = await fs.promises.readFile(localPath);
              } catch {
                newImages.push(imageUrl);
                continue;
              }
            } else {
              newImages.push(imageUrl);
              continue;
            }
            
            const metadata = await sharp(imageBuffer).metadata();
            const maxSize = 1000;
            
            let sharpInstance = sharp(imageBuffer);
            if ((metadata.width && metadata.width > maxSize) || (metadata.height && metadata.height > maxSize)) {
              sharpInstance = sharpInstance.resize(maxSize, maxSize, {
                fit: 'inside',
                withoutEnlargement: true
              });
            }
            
            const processedImage = await sharpInstance
              .webp({ quality: 90 })
              .toBuffer();
            
            const fileName = `product-${product.id}-${i}-${Date.now()}.webp`;
            const newUrl = await saveProductImage(fileName, processedImage);
            newImages.push(newUrl);
            hasChanges = true;
            console.log(`✅ [OPTIMIZE] Processed: ${product.name} image ${i + 1}`);
          } catch (imgError) {
            console.error(`❌ [OPTIMIZE] Error processing image for ${product.name}:`, imgError);
            newImages.push(imageUrl);
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

  // Review Images routes
  app.get('/api/review-images', (req, res) => {
    try {
      const images = getAllCachedReviewImageUrls();
      const portraits = getAllCachedPortraitUrls();
      res.json({ images, portraits });
    } catch (error) {
      console.error("Error fetching review images:", error);
      res.json({ images: [], portraits: [] });
    }
  });

  app.post('/api/review-images/generate', isAdmin, async (req, res) => {
    try {
      const images = await generateAllReviewImages();
      const portraits = await generateAllPortraits();
      res.json({ images, portraits, generated: images.length + portraits.length });
    } catch (error) {
      console.error("Error generating review images:", error);
      res.status(500).json({ error: "Failed to generate review images" });
    }
  });

  // ClickUp Integration Routes
  app.get('/api/clickup/workspaces', isAdmin, async (req, res) => {
    try {
      const data = await clickupService.getWorkspaces();
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching ClickUp workspaces:", error);
      res.status(500).json({ message: error.message || "Failed to fetch workspaces" });
    }
  });

  app.get('/api/clickup/workspaces/:workspaceId/spaces', isAdmin, async (req, res) => {
    try {
      const { workspaceId } = req.params;
      const data = await clickupService.getSpaces(workspaceId);
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching ClickUp spaces:", error);
      res.status(500).json({ message: error.message || "Failed to fetch spaces" });
    }
  });

  app.get('/api/clickup/spaces/:spaceId/folders', isAdmin, async (req, res) => {
    try {
      const { spaceId } = req.params;
      const data = await clickupService.getFolders(spaceId);
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching ClickUp folders:", error);
      res.status(500).json({ message: error.message || "Failed to fetch folders" });
    }
  });

  app.get('/api/clickup/folders/:folderId/lists', isAdmin, async (req, res) => {
    try {
      const { folderId } = req.params;
      const data = await clickupService.getLists(folderId);
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching ClickUp lists:", error);
      res.status(500).json({ message: error.message || "Failed to fetch lists" });
    }
  });

  app.get('/api/clickup/spaces/:spaceId/lists', isAdmin, async (req, res) => {
    try {
      const { spaceId } = req.params;
      const data = await clickupService.getFolderlessLists(spaceId);
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching ClickUp folderless lists:", error);
      res.status(500).json({ message: error.message || "Failed to fetch lists" });
    }
  });

  app.get('/api/clickup/lists/:listId/tasks', isAdmin, async (req, res) => {
    try {
      const { listId } = req.params;
      const includeCompleted = req.query.include_closed === 'true';
      const data = await clickupService.getTasks(listId, { include_closed: includeCompleted });
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching ClickUp tasks:", error);
      res.status(500).json({ message: error.message || "Failed to fetch tasks" });
    }
  });

  app.get('/api/clickup/spaces/:spaceId/tags', isAdmin, async (req, res) => {
    try {
      const { spaceId } = req.params;
      const data = await clickupService.getSpaceTags(spaceId);
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching ClickUp tags:", error);
      res.status(500).json({ message: error.message || "Failed to fetch tags" });
    }
  });

  app.post('/api/clickup/spaces/:spaceId/setup-tags', isAdmin, async (req, res) => {
    try {
      const { spaceId } = req.params;
      const result = await clickupService.setupDefaultTags(spaceId);
      res.json({ 
        message: `Tags setup complete. Created: ${result.created.length}, Already existing: ${result.existing.length}`,
        ...result
      });
    } catch (error: any) {
      console.error("Error setting up ClickUp tags:", error);
      res.status(500).json({ message: error.message || "Failed to setup tags" });
    }
  });

  app.get('/api/clickup/default-tags', isAdmin, (req, res) => {
    const tags = clickupService.getDefaultTags();
    res.json(tags);
  });

  app.get('/api/clickup/lists/:listId/custom-fields', isAdmin, async (req, res) => {
    try {
      const { listId } = req.params;
      const data = await clickupService.getCustomFields(listId);
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching ClickUp custom fields:", error);
      res.status(500).json({ message: error.message || "Failed to fetch custom fields" });
    }
  });

  async function generateWebsiteReport(): Promise<WebsiteReport> {
    const [products, orders, users, bookings, quotes] = await Promise.all([
      storage.getProducts().catch(() => []),
      storage.getOrders().catch(() => []),
      storage.getAllUsers().catch(() => []),
      storage.getBookings().catch(() => []),
      storage.getQuoteRequests().catch(() => []),
    ]);

    const now = new Date();
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const recentOrders = orders.filter((o: any) => new Date(o.createdAt || 0) >= lastMonth);
    const recentBookings = bookings.filter((b: any) => new Date(b.createdAt || 0) >= lastMonth);
    const recentQuotes = quotes.filter((q: any) => new Date(q.createdAt || 0) >= lastMonth);

    const completedItems: string[] = [
      'Cinematic intro animatie geïmplementeerd',
      'eTrusted/Trusted Shops reviews integratie actief',
      'Chat widget met localStorage persistentie',
      'Google OAuth authenticatie',
      'Stripe betalingen (iDEAL, Bancontact)',
      'Product variaties systeem',
      'Mobiele optimalisatie',
      'SEO optimalisatie met meta tags',
    ];

    const inProgressItems: string[] = [
      'ClickUp integratie voor maandelijkse monitoring',
    ];

    const todoItems: string[] = [
      'Google Analytics integratie uitbreiden',
      'Email marketing automatisering',
      'Performance optimalisatie afbeeldingen',
      'A/B testing voor conversie verbetering',
    ];

    const issues: string[] = [];
    
    if (products.length === 0) {
      issues.push('Geen producten in de database gevonden');
    }
    
    const recommendations: string[] = [];
    
    if (recentOrders.length < 5) {
      recommendations.push('Overweeg promotiecampagne om verkoop te stimuleren');
    }
    
    if (recentQuotes.length > recentOrders.length * 2) {
      recommendations.push('Veel offertes maar weinig conversie - follow-up proces verbeteren');
    }

    return {
      status: 'online',
      uptime: '99.9%',
      lastUpdate: now.toISOString(),
      completed: completedItems,
      inProgress: inProgressItems,
      todo: todoItems,
      issues: issues.length > 0 ? issues : undefined,
      statistics: {
        products: products.length,
        orders: orders.length,
        users: users.length,
        bookings: bookings.length,
        quotes: quotes.length,
      },
      recommendations: recommendations.length > 0 ? recommendations : undefined,
    };
  }

  app.post('/api/clickup/monthly-report', isAdmin, async (req, res) => {
    try {
      const { listId } = req.body;
      
      if (!listId) {
        return res.status(400).json({ message: "List ID is required" });
      }

      const report = await generateWebsiteReport();
      const task = await clickupService.createMonthlyReport(listId, report);
      
      res.json({ 
        message: "Monthly report created successfully",
        taskId: task.id,
        taskUrl: task.url,
        report
      });
    } catch (error: any) {
      console.error("Error creating monthly report:", error);
      res.status(500).json({ message: error.message || "Failed to create monthly report" });
    }
  });

  app.get('/api/clickup/report-preview', isAdmin, async (req, res) => {
    try {
      const report = await generateWebsiteReport();
      res.json(report);
    } catch (error: any) {
      console.error("Error generating report preview:", error);
      res.status(500).json({ message: error.message || "Failed to generate report" });
    }
  });

  app.post('/api/clickup/lists/:listId/tasks', isAdmin, async (req, res) => {
    try {
      const { listId } = req.params;
      const taskSchema = z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        tags: z.array(z.string()).optional(),
        priority: z.number().min(1).max(4).optional(),
        due_date: z.number().optional(),
        status: z.string().optional(),
      });

      const parseResult = taskSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid task data", 
          errors: parseResult.error.flatten().fieldErrors 
        });
      }

      const task = await clickupService.createTask(listId, parseResult.data);
      res.json(task);
    } catch (error: any) {
      console.error("Error creating ClickUp task:", error);
      res.status(500).json({ message: error.message || "Failed to create task" });
    }
  });

  app.get('/api/clickup/config', isAdmin, async (req, res) => {
    try {
      const config = await clickupScheduler.getConfig();
      const stats = clickupScheduler.getStats();
      res.json({ config, stats });
    } catch (error: any) {
      console.error("Error fetching ClickUp config:", error);
      res.status(500).json({ message: error.message || "Failed to fetch config" });
    }
  });

  app.post('/api/clickup/config', isAdmin, async (req, res) => {
    try {
      const configSchema = z.object({
        workspaceId: z.string().optional(),
        workspaceName: z.string().optional(),
        spaceId: z.string().optional(),
        spaceName: z.string().optional(),
        folderId: z.string().optional(),
        folderName: z.string().optional(),
        listId: z.string().optional(),
        listName: z.string().optional(),
        isEnabled: z.boolean().optional(),
      });

      const parseResult = configSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid config data", 
          errors: parseResult.error.flatten().fieldErrors 
        });
      }

      const config = await clickupScheduler.saveConfig(parseResult.data);
      res.json({ message: "Configuration saved", config });
    } catch (error: any) {
      console.error("Error saving ClickUp config:", error);
      res.status(500).json({ message: error.message || "Failed to save config" });
    }
  });

  app.post('/api/clickup/scheduler/run', isAdmin, async (req, res) => {
    try {
      const result = await clickupScheduler.runMonthlyReport();
      if (result.success) {
        res.json({ message: "Report created successfully", taskUrl: result.taskUrl });
      } else {
        res.status(400).json({ message: result.error || "Failed to create report" });
      }
    } catch (error: any) {
      console.error("Error running ClickUp scheduler:", error);
      res.status(500).json({ message: error.message || "Failed to run scheduler" });
    }
  });

  app.get('/api/clickup/scheduler/stats', isAdmin, (req, res) => {
    const stats = clickupScheduler.getStats();
    res.json(stats);
  });

  // Product image generation with Gemini
  app.post('/api/admin/products/:id/generate-images', isAdmin, async (req: any, res) => {
    try {
      const productId = req.params.id;
      const { imageTypes } = req.body;
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product niet gevonden" });
      }

      const brand = product.brandId ? await storage.getBrand(product.brandId) : null;
      const category = product.categoryId ? await storage.getCategory(product.categoryId) : null;
      
      const brandName = brand?.name || '';
      const categoryType = category?.name || 'audio product';
      
      const promptTemplates: Record<string, string> = {
        studio: `High-resolution studio product photo of the ${brandName} ${product.name} ${categoryType}. Front view showing main components. Neutral light grey background, soft professional studio lighting, sharp focus on product details. Realistic shadows, no text, no branding overlays, ultra-clean commercial product photography style. Square 1:1 aspect ratio.`,
        
        premium: `Premium angled studio shot of the ${brandName} ${product.name} ${categoryType}. 45-degree diagonal perspective, dark charcoal background with subtle gradient. Dramatic rim lighting highlighting materials and textures. High contrast, cinematic lighting, luxury audio product photography. Square 1:1 aspect ratio.`,
        
        exploded: `Exploded view product layout of the ${brandName} ${product.name} ${categoryType}. All components displayed separately but aligned symmetrically. Clean white background, even studio lighting, technical product presentation style, ultra-sharp details, realistic proportions, no labels or text. Square 1:1 aspect ratio.`,
        
        incar: `Realistic in-car installation photo of the ${brandName} ${product.name} ${categoryType} installed in a modern luxury car interior. OEM-style fitment, clean interior, natural daylight, shallow depth of field. Focus on seamless integration and premium finish. Photorealistic automotive lifestyle photography. Square 1:1 aspect ratio.`,
        
        closeup: `Extreme close-up macro photo of the ${brandName} ${product.name} ${categoryType}. Focus on key details and premium materials. Ultra-sharp detail, soft background blur, professional macro photography lighting, realistic materials, premium audio engineering look. Square 1:1 aspect ratio.`
      };

      const typesToGenerate = imageTypes || ['studio', 'premium', 'closeup'];
      const generatedImages: { type: string; url: string }[] = [];
      const errors: { type: string; error: string }[] = [];

      for (const imageType of typesToGenerate) {
        const prompt = promptTemplates[imageType];
        if (!prompt) {
          errors.push({ type: imageType, error: 'Unknown image type' });
          continue;
        }

        try {
          console.log(`[Image Gen] Generating ${imageType} image for ${product.name}...`);
          const dataUrl = await generateImage(prompt);
          
          const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          
          const slug = product.slug || product.name.toLowerCase().replace(/\s+/g, '-');
          const fileName = `${slug}-${imageType}-${Date.now()}.webp`;
          
          const processedImage = await sharp(buffer)
            .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 90 })
            .toBuffer();
          
          const publicUrl = await saveProductImage(fileName, processedImage);
          generatedImages.push({ type: imageType, url: publicUrl });
          console.log(`[Image Gen] ✅ Generated ${imageType}: ${publicUrl}`);
        } catch (error: any) {
          console.error(`[Image Gen] ❌ Error generating ${imageType}:`, error.message);
          errors.push({ type: imageType, error: error.message });
        }
      }

      if (generatedImages.length > 0) {
        const existingImages = product.images || [];
        const newImages = [...existingImages, ...generatedImages.map(img => img.url)];
        await storage.updateProduct(productId, { images: newImages });
      }

      res.json({
        success: true,
        product: product.name,
        generated: generatedImages,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error: any) {
      console.error("[Image Gen] Error:", error);
      res.status(500).json({ message: error.message || "Failed to generate images" });
    }
  });

  // Robots.txt route
  function getSitemapBaseUrl(req: any): string {
    if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    return `${proto}://${host}`;
  }

  app.get('/robots.txt', (req, res) => {
    const baseUrl = getSitemapBaseUrl(req);
    res.setHeader('Content-Type', 'text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /checkout
Disallow: /my-account
Disallow: /login
Disallow: /cart
Disallow: /migration-options
Disallow: /demo-tools
Sitemap: ${baseUrl}/sitemap.xml`);
  });

  app.get(['/sitemap_index.xml', '/sitemap-index.xml', '/sitemaps.xml', '/sitemap1.xml', '/post-sitemap.xml', '/wp-sitemap.xml', '/page-sitemap.xml', '/news-sitemap.xml'], (req, res) => {
    res.status(404).setHeader('Content-Type', 'text/plain').send('Not Found');
  });

  const SITEMAP_BASE_URL = 'https://caraudiolimburg.nl';

  function escapeXml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }

  app.get('/feed/google-merchant.xml', async (req, res) => {
    try {
      const [allProducts, allBrands, allCategories] = await Promise.all([
        storage.getProducts({}),
        storage.getBrands(),
        storage.getCategories(),
      ]);

      const brandMap = new Map(allBrands.map(b => [b.id, b.name]));
      const categoryMap = new Map(allCategories.map(c => [c.id, c.name]));

      const activeProducts = allProducts.filter(p => p.isActive !== false);

      const items = activeProducts.map(product => {
        const rawDesc = product.shortDescription || (product.description ? product.description.substring(0, 5000) : '');
        const description = rawDesc.replace(/<[^>]*>/g, '').trim();

        const images = product.images || [];
        const primaryImage = images[0] || '';
        const absoluteImage = primaryImage.startsWith('http') ? primaryImage : `${SITEMAP_BASE_URL}${primaryImage}`;

        const additionalImages = images.slice(1, 11).map(img =>
          img.startsWith('http') ? img : `${SITEMAP_BASE_URL}${img}`
        );

        const availability = product.stock === 0 ? 'out_of_stock' : 'in_stock';

        const price = parseFloat(product.price);
        const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null;
        const hasSalePrice = originalPrice !== null && originalPrice > price;

        const brandName = product.brandId ? brandMap.get(product.brandId) || '' : '';
        const categoryName = product.categoryId ? categoryMap.get(product.categoryId) || '' : '';

        let itemXml = `    <item>
      <g:id>${escapeXml(product.sku || product.id)}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      <g:description>${escapeXml(description || product.name)}</g:description>
      <g:link>${SITEMAP_BASE_URL}/webshop/${escapeXml(product.slug)}</g:link>`;

        if (primaryImage) {
          itemXml += `\n      <g:image_link>${escapeXml(absoluteImage)}</g:image_link>`;
        }

        for (const addImg of additionalImages) {
          itemXml += `\n      <g:additional_image_link>${escapeXml(addImg)}</g:additional_image_link>`;
        }

        itemXml += `\n      <g:availability>${availability}</g:availability>`;

        if (hasSalePrice) {
          itemXml += `\n      <g:price>${originalPrice!.toFixed(2)} EUR</g:price>`;
          itemXml += `\n      <g:sale_price>${price.toFixed(2)} EUR</g:sale_price>`;
        } else {
          itemXml += `\n      <g:price>${price.toFixed(2)} EUR</g:price>`;
        }

        if (brandName) {
          itemXml += `\n      <g:brand>${escapeXml(brandName)}</g:brand>`;
        }

        itemXml += `\n      <g:condition>new</g:condition>`;

        if (product.sku) {
          itemXml += `\n      <g:mpn>${escapeXml(product.sku)}</g:mpn>`;
        }

        if (categoryName) {
          itemXml += `\n      <g:product_type>${escapeXml(categoryName)}</g:product_type>`;
        }

        itemXml += `\n      <g:shipping>
        <g:country>NL</g:country>
        <g:price>0 EUR</g:price>
      </g:shipping>`;

        itemXml += `\n      <g:identifier_exists>no</g:identifier_exists>`;
        itemXml += `\n    </item>`;

        return itemXml;
      });

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://schemas.google.com/g/1.0" version="2.0">
  <channel>
    <title>Car Audio Limburg</title>
    <link>${SITEMAP_BASE_URL}</link>
    <description>Premium car audio producten en installatie service</description>
${items.join('\n')}
  </channel>
</rss>`;

      res.set('Content-Type', 'application/xml');
      res.set('Cache-Control', 'public, max-age=3600');
      res.send(xml);
    } catch (error) {
      console.error('Error generating Google Merchant feed:', error);
      res.status(500).send('Error generating feed');
    }
  });

  app.get('/sitemap-index.xsl', (req, res) => {
    const xsl = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="nl">
      <head>
        <title>XML Sitemap Index — Car Audio Limburg</title>
        <meta name="robots" content="noindex, follow"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{background:#0a0a0a;color:#e5e5e5;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6}
          .container{max-width:1100px;margin:0 auto;padding:24px 16px}
          .header{padding:32px 0 24px;border-bottom:1px solid #262626;margin-bottom:24px}
          .logo{font-size:28px;font-weight:700;color:#d4a853;letter-spacing:-0.5px}
          .logo span{color:#fff}
          .subtitle{font-size:22px;font-weight:600;color:#fff;margin-top:8px}
          .desc{color:#a3a3a3;font-size:14px;margin-top:8px;max-width:700px}
          .desc a{color:#d4a853;text-decoration:none}
          .desc a:hover{text-decoration:underline}
          .nav{margin-top:12px;font-size:13px}
          .nav a{color:#d4a853;text-decoration:none;margin-right:16px}
          .nav a:hover{text-decoration:underline}
          .count{background:#141414;border:1px solid #262626;border-radius:8px;padding:12px 20px;margin-bottom:16px;font-size:14px;color:#a3a3a3}
          .count strong{color:#d4a853}
          table{width:100%;border-collapse:collapse;background:#141414;border:1px solid #262626;border-radius:8px;overflow:hidden}
          th{background:#1a1a1a;color:#d4a853;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;padding:14px 16px;text-align:left;border-bottom:1px solid #262626}
          td{padding:12px 16px;border-bottom:1px solid #1f1f1f;font-size:14px}
          tr:last-child td{border-bottom:none}
          tr:nth-child(even) td{background:#111}
          tr:hover td{background:#1a1a1a}
          td a{color:#d4a853;text-decoration:none;word-break:break-all}
          td a:hover{text-decoration:underline;color:#e0ba6a}
          .footer{margin-top:32px;padding-top:20px;border-top:1px solid #262626;color:#525252;font-size:12px;text-align:center}
          .footer a{color:#d4a853;text-decoration:none}
          @media(max-width:640px){.container{padding:16px 12px}th,td{padding:10px 12px;font-size:13px}.logo{font-size:22px}.subtitle{font-size:18px}}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Car Audio <span>Limburg</span></div>
            <div class="subtitle">XML Sitemap Index</div>
            <p class="desc">Dit is de XML sitemap index van <a href="https://caraudiolimburg.nl">caraudiolimburg.nl</a>, gegenereerd voor zoekmachines zoals Google. Een sitemap helpt zoekmachines om alle pagina's op de website te ontdekken en te indexeren.</p>
            <div class="nav">
              <a href="https://caraudiolimburg.nl">&#x2190; Homepage</a>
            </div>
          </div>
          <div class="count">Aantal sitemaps: <strong><xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/></strong></div>
          <table>
            <thead>
              <tr>
                <th>Sitemap URL</th>
                <th>Laatst gewijzigd</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                <tr>
                  <td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
                  <td><xsl:value-of select="sitemap:lastmod"/></td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
          <div class="footer">
            <p>Dit is een XML sitemap, bedoeld voor zoekmachines. <a href="https://www.sitemaps.org/">Meer informatie over sitemaps</a>.</p>
            <p style="margin-top:6px">&#xA9; Car Audio Limburg &#x2014; <a href="https://caraudiolimburg.nl">caraudiolimburg.nl</a></p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`;
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(xsl);
  });

  app.get('/sitemap.xsl', (req, res) => {
    const xsl = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="nl">
      <head>
        <title>XML Sitemap — Car Audio Limburg</title>
        <meta name="robots" content="noindex, follow"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{background:#0a0a0a;color:#e5e5e5;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6}
          .container{max-width:1100px;margin:0 auto;padding:24px 16px}
          .header{padding:32px 0 24px;border-bottom:1px solid #262626;margin-bottom:24px}
          .logo{font-size:28px;font-weight:700;color:#d4a853;letter-spacing:-0.5px}
          .logo span{color:#fff}
          .subtitle{font-size:22px;font-weight:600;color:#fff;margin-top:8px}
          .desc{color:#a3a3a3;font-size:14px;margin-top:8px;max-width:700px}
          .desc a{color:#d4a853;text-decoration:none}
          .desc a:hover{text-decoration:underline}
          .nav{margin-top:12px;font-size:13px}
          .nav a{color:#d4a853;text-decoration:none;margin-right:16px}
          .nav a:hover{text-decoration:underline}
          .count{background:#141414;border:1px solid #262626;border-radius:8px;padding:12px 20px;margin-bottom:16px;font-size:14px;color:#a3a3a3}
          .count strong{color:#d4a853}
          table{width:100%;border-collapse:collapse;background:#141414;border:1px solid #262626;border-radius:8px;overflow:hidden}
          th{background:#1a1a1a;color:#d4a853;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;padding:14px 16px;text-align:left;border-bottom:1px solid #262626}
          td{padding:12px 16px;border-bottom:1px solid #1f1f1f;font-size:14px}
          tr:last-child td{border-bottom:none}
          tr:nth-child(even) td{background:#111}
          tr:hover td{background:#1a1a1a}
          td a{color:#d4a853;text-decoration:none;word-break:break-all}
          td a:hover{text-decoration:underline;color:#e0ba6a}
          .priority{display:inline-block;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600}
          .p-high{background:rgba(212,168,83,0.15);color:#d4a853}
          .p-med{background:rgba(212,168,83,0.08);color:#a3a3a3}
          .p-low{background:rgba(82,82,82,0.2);color:#737373}
          .images-badge{display:inline-block;background:rgba(212,168,83,0.12);color:#d4a853;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:500}
          .footer{margin-top:32px;padding-top:20px;border-top:1px solid #262626;color:#525252;font-size:12px;text-align:center}
          .footer a{color:#d4a853;text-decoration:none}
          @media(max-width:768px){.container{padding:16px 12px}th,td{padding:10px 8px;font-size:12px}.logo{font-size:22px}.subtitle{font-size:18px}.hide-mobile{display:none}}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Car Audio <span>Limburg</span></div>
            <div class="subtitle">XML Sitemap</div>
            <p class="desc">Dit is de XML sitemap van <a href="https://caraudiolimburg.nl">caraudiolimburg.nl</a>. Deze sitemap bevat alle URL's die beschikbaar zijn voor zoekmachines om te indexeren.</p>
            <div class="nav">
              <a href="https://caraudiolimburg.nl">&#x2190; Homepage</a>
              <a href="https://caraudiolimburg.nl/sitemap.xml">Sitemap Index</a>
            </div>
          </div>
          <div class="count">Aantal URL's: <strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></strong></div>
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th class="hide-mobile">Laatst gewijzigd</th>
                <th class="hide-mobile">Frequentie</th>
                <th>Prioriteit</th>
                <xsl:if test="sitemap:urlset/sitemap:url/image:image">
                  <th class="hide-mobile">Afbeeldingen</th>
                </xsl:if>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
                  <td class="hide-mobile"><xsl:value-of select="sitemap:lastmod"/></td>
                  <td class="hide-mobile"><xsl:value-of select="sitemap:changefreq"/></td>
                  <td>
                    <xsl:choose>
                      <xsl:when test="sitemap:priority &gt;= 0.8">
                        <span class="priority p-high"><xsl:value-of select="sitemap:priority"/></span>
                      </xsl:when>
                      <xsl:when test="sitemap:priority &gt;= 0.5">
                        <span class="priority p-med"><xsl:value-of select="sitemap:priority"/></span>
                      </xsl:when>
                      <xsl:otherwise>
                        <span class="priority p-low"><xsl:value-of select="sitemap:priority"/></span>
                      </xsl:otherwise>
                    </xsl:choose>
                  </td>
                  <xsl:if test="/sitemap:urlset/sitemap:url/image:image">
                    <td class="hide-mobile">
                      <xsl:if test="count(image:image) &gt; 0">
                        <span class="images-badge"><xsl:value-of select="count(image:image)"/> img</span>
                      </xsl:if>
                    </td>
                  </xsl:if>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
          <div class="footer">
            <p>Dit is een XML sitemap, bedoeld voor zoekmachines zoals Google, Bing en Yahoo. <a href="https://www.sitemaps.org/">Meer informatie over sitemaps</a>.</p>
            <p style="margin-top:6px">&#xA9; Car Audio Limburg &#x2014; <a href="https://caraudiolimburg.nl">caraudiolimburg.nl</a></p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`;
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(xsl);
  });

  app.get('/sitemap.xml', async (req, res) => {
    try {
      const baseUrl = getSitemapBaseUrl(req);
      const now = new Date().toISOString().split('T')[0];
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap-index.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-pages.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-products.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-categories.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-blog.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(xml);
    } catch (error) {
      console.error('Error generating sitemap index:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  app.get('/sitemap-pages.xml', (req, res) => {
    try {
      const now = new Date().toISOString().split('T')[0];
      const staticPages = [
        { loc: '/', changefreq: 'daily', priority: '1.0' },
        { loc: '/webshop', changefreq: 'daily', priority: '0.9' },
        { loc: '/contact', changefreq: 'monthly', priority: '0.7' },
        { loc: '/over-ons', changefreq: 'monthly', priority: '0.5' },
        { loc: '/veelgestelde-vragen', changefreq: 'monthly', priority: '0.5' },
        { loc: '/montage', changefreq: 'monthly', priority: '0.7' },
        { loc: '/blog', changefreq: 'weekly', priority: '0.7' },
        { loc: '/kenniscentrum', changefreq: 'weekly', priority: '0.7' },
        { loc: '/portfolio', changefreq: 'monthly', priority: '0.6' },
        { loc: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
        { loc: '/algemene-voorwaarden', changefreq: 'yearly', priority: '0.3' },
        { loc: '/apple-carplay-voor-uw-bmw', changefreq: 'monthly', priority: '0.6' },
      ];

      const sitemapUrl = getSitemapBaseUrl(req);
      const urls = staticPages.map(
        (p) => `  <url>\n    <loc>${sitemapUrl}${p.loc}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
      );

      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(xml);
    } catch (error) {
      console.error('Error generating pages sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  app.get('/sitemap-products.xml', async (req, res) => {
    try {
      const sitemapUrl = getSitemapBaseUrl(req);
      const allProducts = await storage.getProducts({});
      const urls: string[] = [];

      for (const product of allProducts) {
        if (!product.slug) continue;
        const lastmod = (product as any).updatedAt
          ? new Date((product as any).updatedAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
        const images = product.images && product.images.length > 0 ? product.images : [];
        const imageTags = images.map((img: string) => {
          const imageUrl = img.startsWith('http') ? img : `${sitemapUrl}${img}`;
          return `\n    <image:image>\n      <image:loc>${escapeXml(imageUrl)}</image:loc>\n      <image:title>${escapeXml(product.name)}</image:title>\n    </image:image>`;
        }).join('');
        urls.push(`  <url>\n    <loc>${sitemapUrl}/webshop/${escapeXml(product.slug)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>${imageTags}\n  </url>`);
      }

      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>`;
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(xml);
    } catch (error) {
      console.error('Error generating products sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  app.get('/sitemap-categories.xml', async (req, res) => {
    try {
      const now = new Date().toISOString().split('T')[0];
      const [allCategories, allBrands] = await Promise.all([
        storage.getCategories(),
        storage.getBrands(),
      ]);
      const urls: string[] = [];

      const sitemapUrl = getSitemapBaseUrl(req);
      for (const category of allCategories) {
        if (!category.slug) continue;
        urls.push(`  <url>\n    <loc>${sitemapUrl}/webshop?category=${escapeXml(category.slug)}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`);
      }

      for (const brand of allBrands) {
        if (!brand.slug) continue;
        urls.push(`  <url>\n    <loc>${sitemapUrl}/webshop?brand=${escapeXml(brand.slug)}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`);
      }

      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(xml);
    } catch (error) {
      console.error('Error generating categories sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  app.get('/sitemap-blog.xml', async (req, res) => {
    try {
      const blogPosts = await storage.getPublishedBlogPostsForSitemap().catch(() => []);
      const urls: string[] = [];

      for (const post of blogPosts) {
        if (!post.slug) continue;
        const lastmod = (post as any).updatedAt
          ? new Date((post as any).updatedAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
        const sitemapUrl = getSitemapBaseUrl(req);
        urls.push(`  <url>\n    <loc>${sitemapUrl}/blog/${escapeXml(post.slug)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`);
      }

      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(xml);
    } catch (error) {
      console.error('Error generating blog sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  // Data Export endpoint - exports all data for migration
  app.get('/api/admin/export-data', isAdmin, async (req: any, res) => {
    try {
      const [categories, brands, vehicleMakes, products] = await Promise.all([
        storage.getCategories(),
        storage.getBrands(),
        storage.getVehicleMakes(),
        storage.getProducts()
      ]);

      // Get all vehicle models for all makes
      const vehicleModelsPromises = vehicleMakes.map(make => storage.getVehicleModels(make.id));
      const vehicleModelsArrays = await Promise.all(vehicleModelsPromises);
      const vehicleModels = vehicleModelsArrays.flat();

      // Get all product variations and compatibility
      const productVariationsData: any[] = [];
      const productCompatibilityData: any[] = [];
      
      for (const product of products) {
        const variations = await storage.getProductVariations(product.id);
        const compatibility = await storage.getProductVehicleCompatibility(product.id);
        productVariationsData.push(...variations);
        productCompatibilityData.push(...compatibility);
      }

      const exportData = {
        exportDate: new Date().toISOString(),
        version: "1.0",
        data: {
          categories,
          brands,
          vehicleMakes,
          vehicleModels,
          products,
          productVariations: productVariationsData,
          productCompatibility: productCompatibilityData
        }
      };

      res.setHeader('Content-Disposition', 'attachment; filename=car-audio-limburg-export.json');
      res.json(exportData);
    } catch (error: any) {
      console.error("Error exporting data:", error);
      res.status(500).json({ message: error.message || "Failed to export data" });
    }
  });

  // Data Import endpoint - imports data from export JSON
  app.post('/api/admin/import-data', isAdmin, async (req: any, res) => {
    try {
      const { data } = req.body;
      
      if (!data) {
        return res.status(400).json({ message: "No data provided" });
      }

      const results = {
        categories: { imported: 0, skipped: 0 },
        brands: { imported: 0, skipped: 0 },
        vehicleMakes: { imported: 0, skipped: 0 },
        vehicleModels: { imported: 0, skipped: 0 },
        products: { imported: 0, updated: 0 },
        productVariations: { imported: 0, skipped: 0 },
        productCompatibility: { imported: 0, skipped: 0 }
      };

      // Import categories (skip if exists)
      if (data.categories) {
        for (const cat of data.categories) {
          try {
            const existing = await storage.getCategory(cat.id);
            if (!existing) {
              await storage.createCategory(cat);
              results.categories.imported++;
            } else {
              results.categories.skipped++;
            }
          } catch {
            results.categories.skipped++;
          }
        }
      }

      // Import brands (skip if exists)
      if (data.brands) {
        for (const brand of data.brands) {
          try {
            const existing = await storage.getBrand(brand.id);
            if (!existing) {
              await storage.createBrand(brand);
              results.brands.imported++;
            } else {
              results.brands.skipped++;
            }
          } catch {
            results.brands.skipped++;
          }
        }
      }

      // Import vehicle makes (skip if exists)
      if (data.vehicleMakes) {
        for (const make of data.vehicleMakes) {
          try {
            await storage.createVehicleMake(make);
            results.vehicleMakes.imported++;
          } catch {
            results.vehicleMakes.skipped++;
          }
        }
      }

      // Import vehicle models (skip if exists)
      if (data.vehicleModels) {
        for (const model of data.vehicleModels) {
          try {
            await storage.createVehicleModel(model);
            results.vehicleModels.imported++;
          } catch {
            results.vehicleModels.skipped++;
          }
        }
      }

      // Import products (update if exists, create if new)
      if (data.products) {
        for (const product of data.products) {
          try {
            const existing = await storage.getProduct(product.id);
            if (existing) {
              await storage.updateProduct(product.id, product);
              results.products.updated++;
            } else {
              await storage.createProduct(product);
              results.products.imported++;
            }
          } catch (err) {
            console.error("Error importing product:", product.id, err);
          }
        }
      }

      // Import product variations (skip if exists)
      if (data.productVariations) {
        for (const variation of data.productVariations) {
          try {
            await storage.createProductVariation(variation);
            results.productVariations.imported++;
          } catch {
            results.productVariations.skipped++;
          }
        }
      }

      // Import product compatibility (skip if exists)
      if (data.productCompatibility) {
        for (const compat of data.productCompatibility) {
          try {
            await storage.setProductVehicleCompatibility(compat.productId, [{ makeId: compat.makeId, modelId: compat.modelId }]);
            results.productCompatibility.imported++;
          } catch {
            results.productCompatibility.skipped++;
          }
        }
      }

      res.json({ 
        message: "Import completed successfully",
        results 
      });
    } catch (error: any) {
      console.error("Error importing data:", error);
      res.status(500).json({ message: error.message || "Failed to import data" });
    }
  });

  // Teamleader OAuth2 routes
  app.get('/api/teamleader/auth-url', isAdmin, async (req: any, res) => {
    try {
      const teamleader = await import('./services/teamleader');
      const { url, state } = teamleader.getAuthorizationUrl();
      // Store state in session for validation
      req.session.teamleaderOAuthState = state;
      await new Promise<void>((resolve, reject) => {
        req.session.save((err: any) => err ? reject(err) : resolve());
      });
      res.json({ url });
    } catch (error: any) {
      console.error("Error getting Teamleader auth URL:", error);
      res.status(500).json({ message: error.message || "Failed to get authorization URL" });
    }
  });

  app.get('/api/teamleader/callback', isAdmin, async (req: any, res) => {
    try {
      const { code, state } = req.query;
      
      // Validate state
      const expectedState = req.session?.teamleaderOAuthState;
      if (!state || state !== expectedState) {
        return res.status(403).send('Ongeldige OAuth state. Probeer opnieuw.');
      }
      
      // Clear state from session
      delete req.session.teamleaderOAuthState;
      
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ message: "Authorization code is required" });
      }
      const teamleader = await import('./services/teamleader');
      await teamleader.exchangeCodeForTokens(code);
      res.redirect('/admin?section=settings&teamleader=connected');
    } catch (error: any) {
      console.error("Error in Teamleader callback:", error);
      res.redirect('/admin?section=settings&teamleader=error');
    }
  });

  app.get('/api/teamleader/status', isAdmin, async (req, res) => {
    try {
      const teamleader = await import('./services/teamleader');
      const status = await teamleader.getConnectionStatus();
      res.json(status);
    } catch (error) {
      console.error("Error checking Teamleader status:", error);
      res.status(500).json({ message: "Failed to check connection status" });
    }
  });

  app.post('/api/teamleader/disconnect', isAdmin, async (req, res) => {
    try {
      const teamleader = await import('./services/teamleader');
      await teamleader.disconnect();
      res.json({ success: true });
    } catch (error) {
      console.error("Error disconnecting Teamleader:", error);
      res.status(500).json({ message: "Failed to disconnect" });
    }
  });

  app.get('/api/rdw/kenteken/:plate/match', async (req, res) => {
    try {
      const plate = req.params.plate.toUpperCase().replace(/[-\s]/g, '');

      if (!plate || plate.length < 4) {
        return res.status(400).json({ message: "Ongeldig kenteken" });
      }

      const rdwUrl = `https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${plate}`;
      const response = await fetch(rdwUrl);

      if (!response.ok) {
        return res.status(502).json({ message: "RDW service niet beschikbaar" });
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        return res.status(404).json({ message: "Kenteken niet gevonden" });
      }

      const vehicle = data[0];
      const firstRegistration = vehicle.datum_eerste_toelating;
      const bouwjaar = firstRegistration ? parseInt(firstRegistration.substring(0, 4)) : null;
      const rdwMerk = vehicle.merk || '';
      const rdwModel = vehicle.handelsbenaming || '';

      let brandstof: string | null = null;
      try {
        const fuelUrl = `https://opendata.rdw.nl/resource/8ys7-d773.json?kenteken=${plate}`;
        const fuelResponse = await fetch(fuelUrl);
        if (fuelResponse.ok) {
          const fuelData = await fuelResponse.json();
          if (fuelData && fuelData.length > 0) {
            brandstof = fuelData[0].brandstof_omschrijving || null;
          }
        }
      } catch {}

      const kleur = vehicle.eerste_kleur ? vehicle.eerste_kleur.charAt(0) + vehicle.eerste_kleur.slice(1).toLowerCase() : null;

      const removeAccents = (str: string) =>
        str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      const allMakes = await storage.getAllVehicleMakes();

      let matchedMake: { id: string; name: string } | null = null;
      const rdwMerkLower = rdwMerk.toLowerCase().trim();
      const rdwMerkNorm = removeAccents(rdwMerkLower);

      for (const make of allMakes) {
        const dbNameLower = make.name.toLowerCase();
        const dbNameNorm = removeAccents(dbNameLower);
        if (dbNameLower === rdwMerkLower || dbNameNorm === rdwMerkNorm) {
          matchedMake = { id: make.id, name: make.name };
          break;
        }
      }

      let matchedModel: { id: string; name: string } | null = null;
      let confidence: 'exact' | 'partial' | 'make_only' | 'none' = 'none';

      if (matchedMake) {
        const allModels = await storage.getAllVehicleModelsByMake(matchedMake.id);
        const rdwModelLower = rdwModel.toLowerCase().trim();
        const rdwModelNorm = removeAccents(rdwModelLower);

        for (const model of allModels) {
          const dbModelLower = model.name.toLowerCase();
          const dbModelNorm = removeAccents(dbModelLower);
          if (dbModelLower === rdwModelLower || dbModelNorm === rdwModelNorm) {
            matchedModel = { id: model.id, name: model.name };
            confidence = 'exact';
            break;
          }
        }

        if (!matchedModel) {
          for (const model of allModels) {
            const dbModelLower = model.name.toLowerCase();
            const dbModelNorm = removeAccents(dbModelLower);
            if (rdwModelLower.includes(dbModelLower) || rdwModelNorm.includes(dbModelNorm)) {
              matchedModel = { id: model.id, name: model.name };
              confidence = 'partial';
              break;
            }
          }
        }

        if (!matchedModel) {
          for (const model of allModels) {
            const dbModelLower = model.name.toLowerCase();
            const dbModelNorm = removeAccents(dbModelLower);
            if (rdwModelLower.startsWith(dbModelLower) || rdwModelNorm.startsWith(dbModelNorm)) {
              matchedModel = { id: model.id, name: model.name };
              confidence = 'partial';
              break;
            }
          }
        }

        if (!matchedModel) {
          confidence = 'make_only';
        }
      }

      let productCount = 0;
      let modelSpecificCount = 0;
      let makeCompatibleCount = 0;
      let shopUrl = '/webshop';

      if (matchedMake) {
        const counts = await storage.getVehicleProductCounts(
          matchedMake.id,
          matchedModel?.id || undefined,
          bouwjaar || undefined,
        );
        modelSpecificCount = counts.modelSpecificCount;
        makeCompatibleCount = counts.makeCompatibleCount;
        productCount = modelSpecificCount + makeCompatibleCount;

        const params = new URLSearchParams();
        params.set('vehicleMakeId', matchedMake.id);
        if (matchedModel) params.set('vehicleModelId', matchedModel.id);
        if (bouwjaar) params.set('vehicleYear', bouwjaar.toString());
        shopUrl = `/webshop?${params.toString()}`;
      }

      const displayMerk = rdwMerk ? rdwMerk.charAt(0) + rdwMerk.slice(1).toLowerCase() : null;

      res.json({
        vehicle: {
          kenteken: vehicle.kenteken,
          merk: matchedMake?.name || displayMerk,
          model: rdwModel || null,
          bouwjaar,
          brandstof,
          kleur,
        },
        match: {
          makeId: matchedMake?.id || null,
          makeName: matchedMake?.name || null,
          modelId: matchedModel?.id || null,
          modelName: matchedModel?.name || null,
          confidence,
        },
        productCount,
        modelSpecificCount,
        makeCompatibleCount,
        shopUrl,
      });
    } catch (error) {
      console.error("RDW match error:", error);
      res.status(500).json({ message: "Fout bij ophalen voertuiggegevens" });
    }
  });

  app.get('/api/rdw/kenteken/:plate', async (req, res) => {
    try {
      const plate = req.params.plate.toUpperCase().replace(/[-\s]/g, '');

      if (!plate || plate.length < 4) {
        return res.status(400).json({ message: "Ongeldig kenteken" });
      }

      const rdwUrl = `https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${plate}`;
      const response = await fetch(rdwUrl);

      if (!response.ok) {
        return res.status(502).json({ message: "RDW service niet beschikbaar" });
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        return res.status(404).json({ message: "Kenteken niet gevonden" });
      }

      const vehicle = data[0];

      const firstRegistration = vehicle.datum_eerste_toelating;
      const year = firstRegistration ? parseInt(firstRegistration.substring(0, 4)) : null;

      const result: any = {
        kenteken: vehicle.kenteken,
        merk: vehicle.merk ? vehicle.merk.charAt(0) + vehicle.merk.slice(1).toLowerCase() : null,
        model: vehicle.handelsbenaming || null,
        bouwjaar: year,
        brandstof: null,
        kleur: vehicle.eerste_kleur ? vehicle.eerste_kleur.charAt(0) + vehicle.eerste_kleur.slice(1).toLowerCase() : null,
        voertuigsoort: vehicle.voertuigsoort || null,
        apkVervaldatum: vehicle.vervaldatum_apk || null,
      };

      const fuelUrl = `https://opendata.rdw.nl/resource/8ys7-d773.json?kenteken=${plate}`;
      const fuelResponse = await fetch(fuelUrl);
      if (fuelResponse.ok) {
        const fuelData = await fuelResponse.json();
        if (fuelData && fuelData.length > 0) {
          result.brandstof = fuelData[0].brandstof_omschrijving || null;
        }
      }

      res.json(result);
    } catch (error) {
      console.error("RDW lookup error:", error);
      res.status(500).json({ message: "Fout bij ophalen voertuiggegevens" });
    }
  });

  app.post('/api/admin/sync-missing-products', isAdmin, async (req: any, res) => {
    try {
      const possiblePaths = [
        path.join(process.cwd(), 'server', 'migrations', 'sync_missing_products.sql'),
        path.join(process.cwd(), 'dist', 'migrations', 'sync_missing_products.sql'),
        path.join(process.cwd(), 'migrations', 'sync_missing_products.sql'),
      ];
      let sqlFilePath = '';
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) { sqlFilePath = p; break; }
      }
      if (!sqlFilePath) {
        return res.status(404).json({ message: 'Sync SQL file not found', checked: possiblePaths });
      }
      const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
      const statements = sqlContent
        .split(';')
        .map((s: string) => s.trim())
        .filter((s: string) => s.toUpperCase().startsWith('INSERT'));
      
      if (statements.length === 0) {
        return res.json({ message: 'No INSERT statements found in sync file', success: 0 });
      }

      const { pool } = await import('./db');
      
      let success = 0;
      for (const stmt of statements) {
        await pool.query(stmt);
        success++;
      }
      
      const countResult = await pool.query('SELECT COUNT(*) as count FROM products');
      const totalProducts = parseInt(countResult.rows[0].count);
      const varResult = await pool.query('SELECT COUNT(*) as count FROM product_variations');
      const totalVariations = parseInt(varResult.rows[0].count);
      
      res.json({
        message: `Sync complete. ${success} statements executed successfully.`,
        success,
        totalProducts,
        totalVariations
      });
    } catch (error: any) {
      console.error('Sync error:', error);
      res.status(500).json({ message: 'Sync failed: ' + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
