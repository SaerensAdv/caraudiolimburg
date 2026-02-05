import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { ogMiddleware } from "./og-middleware";
import { clickupScheduler } from "./services/scheduler";
import { emailService } from "./services/email";
import { blogScheduler } from "./services/blog-scheduler";
import path from "path";
import Stripe from "stripe";
import { storage } from "./storage";

const app = express();

// Security headers middleware
app.use((req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking attacks
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy - prevent XSS, injection attacks
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdn.jsdelivr.net https://*.stripe.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; " +
    "font-src 'self' data: https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https://api.stripe.com https://*.stripe.com wss://localhost:* http://localhost:*; " +
    "frame-src https://js.stripe.com https://*.stripe.com; " +
    "child-src 'self'; " +
    "object-src 'none'; " +
    "upgrade-insecure-requests"
  );
  
  // HSTS - force HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
});

let stripeWebhook: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripeWebhook = new Stripe(process.env.STRIPE_SECRET_KEY);
}

app.post("/api/webhooks/stripe", express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  if (!stripeWebhook) {
    console.error("[Stripe Webhook] Stripe not configured");
    return res.status(500).json({ message: "Stripe not configured" });
  }

  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured");
    return res.status(500).json({ message: "Webhook secret not configured" });
  }

  let event: Stripe.Event;

  try {
    event = stripeWebhook.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
    return res.status(400).json({ message: `Webhook signature verification failed: ${err.message}` });
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[Stripe Webhook] Payment succeeded: ${paymentIntent.id}`);

        const existingOrder = await storage.getOrderByPaymentIntentId(paymentIntent.id);
        if (existingOrder) {
          console.log(`[Stripe Webhook] Order already exists for payment ${paymentIntent.id}: ${existingOrder.orderNumber}`);
          break;
        }

        const metadata = paymentIntent.metadata || {};
        const isGuest = metadata.isGuest === "true";
        const userId = metadata.userId || null;
        const guestEmail = metadata.guestEmail || null;

        let cartItems: any[] = [];
        try {
          cartItems = JSON.parse(metadata.cartItems || "[]");
        } catch (e) {
          console.error(`[Stripe Webhook] Failed to parse cart items for payment ${paymentIntent.id}`);
          break;
        }

        if (cartItems.length === 0) {
          console.log(`[Stripe Webhook] No cart items found for payment ${paymentIntent.id}`);
          break;
        }

        let subtotal = 0;
        for (const item of cartItems) {
          subtotal += parseFloat(item.price) * item.quantity;
        }

        const installationFee = cartItems.some((item: any) => item.needsInstallation) ? 89 : 0;
        const shipping = subtotal >= 50 ? 0 : 5.95;
        const total = subtotal + installationFee + shipping;

        const orderNumber = isGuest ? `CAL-G-${Date.now()}` : `CAL-${Date.now()}`;

        const order = await storage.createOrder({
          userId: isGuest ? null : userId,
          guestEmail: isGuest ? guestEmail : null,
          orderNumber,
          status: "paid",
          total: total.toString(),
          subtotal: subtotal.toString(),
          installationTotal: installationFee.toString(),
          stripePaymentIntentId: paymentIntent.id,
          shippingAddress: {},
        });

        for (const cartItem of cartItems) {
          await storage.createOrderItem({
            orderId: order.id,
            productId: cartItem.productId,
            quantity: cartItem.quantity,
            price: cartItem.price,
            needsInstallation: cartItem.needsInstallation || false,
            variationId: cartItem.variationId || null,
            variationLabel: null,
          });
        }

        console.log(`[Stripe Webhook] Created order ${order.orderNumber} for payment ${paymentIntent.id}`);

        // Send confirmation email to all customers (guest or logged-in)
        let customerEmail: string | null = null;
        let customerName = 'Klant';
        
        if (isGuest) {
          customerEmail = guestEmail;
        } else if (userId) {
          try {
            const user = await storage.getUser(userId);
            if (user?.email) {
              customerEmail = user.email;
              customerName = user.firstName || 'Klant';
            }
          } catch (e) {
            console.error(`[Stripe Webhook] Failed to fetch user ${userId} for email`);
          }
        }
        
        if (customerEmail) {
          try {
            const itemsWithDetails = await Promise.all(cartItems.map(async (item: any) => {
              const product = await storage.getProduct(item.productId);
              return {
                name: product?.name || 'Product',
                quantity: item.quantity,
                price: (parseFloat(item.price) * item.quantity).toFixed(2),
              };
            }));

            await emailService.sendOrderConfirmationEmail({
              orderNumber: order.orderNumber,
              customerEmail,
              customerName,
              items: itemsWithDetails,
              subtotal: subtotal.toFixed(2),
              shipping: shipping.toFixed(2),
              total: total.toFixed(2),
              shippingAddress: {
                firstName: '',
                lastName: '',
                address: '',
                city: '',
                postalCode: '',
                country: 'Nederland',
              },
            });
            console.log(`[Stripe Webhook] Confirmation email sent for order ${order.orderNumber} to ${customerEmail}`);
          } catch (emailError: any) {
            console.error(`[Stripe Webhook] Failed to send confirmation email for order ${order.orderNumber}: ${emailError.message}`);
          }
        } else {
          console.warn(`[Stripe Webhook] No email address found for order ${order.orderNumber}`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const failureMessage = paymentIntent.last_payment_error?.message || 'Unknown error';
        console.error(`[Stripe Webhook] Payment failed: ${paymentIntent.id}, reason: ${failureMessage}`);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (error: any) {
    console.error(`[Stripe Webhook] Error processing event ${event.type}: ${error.message}`);
    return res.status(500).json({ message: "Error processing webhook event" });
  }

  res.status(200).json({ received: true });
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from local public directory (development fallback)
app.use('/products', express.static(path.join(process.cwd(), 'public', 'products')));
app.use('/public/products', express.static(path.join(process.cwd(), 'public', 'products')));

// Serve blog images
app.use('/blog-images', express.static(path.join(process.cwd(), 'public', 'blog-images')));

// Serve attached assets (stock images, etc.)
app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets')));

// Object Storage files are automatically served at /public/* paths when PUBLIC_OBJECT_SEARCH_PATHS is configured
// Log Object Storage configuration on startup
console.log("🗂️  Object Storage Configuration:");
console.log("   Bucket ID:", process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID || "❌ NOT SET");
console.log("   Public Paths:", process.env.PUBLIC_OBJECT_SEARCH_PATHS || "❌ NOT SET");

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Open Graph meta tags for social media sharing (WhatsApp, Facebook, etc.)
  app.use(ogMiddleware);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Start the ClickUp scheduler for monthly reports
    clickupScheduler.start().catch(err => {
      console.error('Failed to start ClickUp scheduler:', err);
    });
    
    // Start the Blog scheduler for auto-publishing scheduled posts
    blogScheduler.start();
  });
})();
