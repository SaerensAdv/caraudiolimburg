import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Object storage serving is handled by dedicated routes in routes.ts

// Note: Object storage serving is now handled by dedicated routes in routes.ts
// This ensures proper functionality in both development and production environments
// Log Object Storage configuration on startup
console.log("🗂️  Object Storage Configuration:");
console.log("   Bucket ID:", process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID || "❌ NOT SET");
console.log("   Public Paths:", process.env.PUBLIC_OBJECT_SEARCH_PATHS || "❌ NOT SET");

// Critical environment check for production
if (app.get("env") !== "development") {
  if (!process.env.PUBLIC_OBJECT_SEARCH_PATHS) {
    console.error("❌ CRITICAL: PUBLIC_OBJECT_SEARCH_PATHS not set in production!");
    console.error("   This will cause all /public/* image requests to fail with 404");
    console.error("   Please set PUBLIC_OBJECT_SEARCH_PATHS to your bucket public path");
  }
  if (!process.env.PRIVATE_OBJECT_DIR) {
    console.error("❌ CRITICAL: PRIVATE_OBJECT_DIR not set in production!");
  }
}

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

  // Register object storage route BEFORE all other routes to ensure priority
  // This prevents the catch-all route in production from intercepting /public/* requests
  const { ObjectStorageService } = await import("./objectStorage");
  
  app.get('/public/*', async (req, res) => {
    try {
      const filePath = req.path; // e.g., "/public/products/image.jpg"
      console.log(`🔍 [OBJECT_STORAGE] Serving file: ${filePath}`);
      
      // Extract object key by removing "/public/" prefix
      const objectKey = req.path.replace(/^\/public\//, "");
      console.log(`🔍 [OBJECT_STORAGE] Object key: ${objectKey}`);
      
      // Initialize Object Storage service
      const objectStorage = new ObjectStorageService();
      
      // Search for the file in the public area of the bucket
      const file = await objectStorage.searchPublicObject(objectKey);
      
      if (!file) {
        console.log(`❌ [OBJECT_STORAGE] File not found: ${filePath}`);
        return res.status(404).json({ error: "File not found" });
      }
      
      console.log(`✅ [OBJECT_STORAGE] Found file: ${file.name}`);
      
      // Stream the file directly to the response
      await objectStorage.downloadObject(file, res);
      
    } catch (error) {
      console.error("❌ [OBJECT_STORAGE] Error serving file:", error);
      res.status(500).json({ error: "Failed to serve file" });
    }
  });

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

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
  });
})();
