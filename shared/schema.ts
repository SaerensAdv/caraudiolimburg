import { sql } from 'drizzle-orm';
import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("customer"),
  stripeCustomerId: varchar("stripe_customer_id"),
  passwordHash: varchar("password_hash"), // For email/password auth
  googleId: varchar("google_id"), // For Google OAuth
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product categories
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  parentId: varchar("parent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Product brands
export const brands = pgTable("brands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  logoUrl: varchar("logo_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vehicle makes
export const vehicleMakes = pgTable("vehicle_makes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vehicle models
export const vehicleModels = pgTable("vehicle_models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull(),
  makeId: varchar("make_id").notNull().references(() => vehicleMakes.id),
  startYear: integer("start_year"),
  endYear: integer("end_year"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  shortDescription: varchar("short_description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  installationPrice: decimal("installation_price", { precision: 10, scale: 2 }),
  sku: varchar("sku").unique(),
  stock: integer("stock").default(0),
  images: text("images").array(),
  primaryImageIndex: integer("primary_image_index").default(0),
  brandId: varchar("brand_id").references(() => brands.id),
  categoryId: varchar("category_id").references(() => categories.id),
  features: text("features").array(),
  specifications: jsonb("specifications"),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  canHaveInstallation: boolean("can_have_installation").default(false),
  hasVariations: boolean("has_variations").default(false),
  upsellCategoryId: varchar("upsell_category_id").references(() => categories.id),
  overviewContent: text("overview_content"),
  boxContent: jsonb("box_content"),
  accessories: jsonb("accessories"),
  videoUrl: varchar("video_url"),
  downloads: jsonb("downloads"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product variations (e.g., different car models with different prices/images)
export const productVariations = pgTable("product_variations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  label: varchar("label").notNull(),
  sku: varchar("sku"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  images: text("images").array(),
  stock: integer("stock").default(0),
  sortOrder: integer("sort_order").default(0),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Product vehicle compatibility
export const productVehicleCompatibility = pgTable("product_vehicle_compatibility", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  makeId: varchar("make_id").references(() => vehicleMakes.id),
  modelId: varchar("model_id").references(() => vehicleModels.id),
  yearFrom: integer("year_from"),
  yearTo: integer("year_to"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Shopping cart items
export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  needsInstallation: boolean("needs_installation").default(false),
  variationId: varchar("variation_id").references(() => productVariations.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Optional - anonymous reviews allowed
  customerName: varchar("customer_name").notNull(),
  customerEmail: varchar("customer_email"),
  rating: integer("rating").notNull(), // 1-5 stars
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  productId: varchar("product_id").references(() => products.id), // Optional - general reviews allowed
  isVerified: boolean("is_verified").default(false), // If customer actually purchased
  isApproved: boolean("is_approved").default(false), // For moderation
  isPublished: boolean("is_published").default(false), // Admin control
  isFeatured: boolean("is_featured").default(false), // Highlight on homepage
  adminNotes: text("admin_notes"), // Internal notes for admins
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order status enum
export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"]);

// Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  guestEmail: varchar("guest_email"),
  orderNumber: varchar("order_number").notNull().unique(),
  status: orderStatusEnum("status").default("pending"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
  installationTotal: decimal("installation_total", { precision: 10, scale: 2 }),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  stripeSessionId: varchar("stripe_session_id"),
  shippingAddress: jsonb("shipping_address"),
  billingAddress: jsonb("billing_address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  needsInstallation: boolean("needs_installation").default(false),
  variationId: varchar("variation_id").references(() => productVariations.id),
  variationLabel: varchar("variation_label"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Installation bookings
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  orderId: varchar("order_id").references(() => orders.id),
  customerName: varchar("customer_name").notNull(),
  customerEmail: varchar("customer_email").notNull(),
  customerPhone: varchar("customer_phone").notNull(),
  vehicleMake: varchar("vehicle_make").notNull(),
  vehicleModel: varchar("vehicle_model").notNull(),
  vehicleYear: integer("vehicle_year").notNull(),
  serviceType: varchar("service_type").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  duration: integer("duration").notNull(), // in hours
  status: varchar("status").default("pending"),
  notes: text("notes"),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quote requests
export const quoteRequests = pgTable("quote_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  vehicleMake: varchar("vehicle_make").notNull(),
  vehicleModel: varchar("vehicle_model").notNull(),
  vehicleYear: integer("vehicle_year").notNull(),
  description: text("description"),
  status: varchar("status").default("pending"),
  responseNotes: text("response_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wishlists / Favorites
export const wishlists = pgTable("wishlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_wishlist_user_product").on(table.userId, table.productId),
]);

// Wishlist relations
export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlists.productId],
    references: [products.id],
  }),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  cartItems: many(cartItems),
  orders: many(orders),
  bookings: many(bookings),
  wishlists: many(wishlists),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "categoryParent",
  }),
  children: many(categories, { relationName: "categoryParent" }),
  products: many(products),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

export const vehicleMakesRelations = relations(vehicleMakes, ({ many }) => ({
  models: many(vehicleModels),
  compatibility: many(productVehicleCompatibility),
}));

export const vehicleModelsRelations = relations(vehicleModels, ({ one, many }) => ({
  make: one(vehicleMakes, {
    fields: [vehicleModels.makeId],
    references: [vehicleMakes.id],
  }),
  compatibility: many(productVehicleCompatibility),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  compatibility: many(productVehicleCompatibility),
  variations: many(productVariations),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const productVehicleCompatibilityRelations = relations(productVehicleCompatibility, ({ one }) => ({
  product: one(products, {
    fields: [productVehicleCompatibility.productId],
    references: [products.id],
  }),
  make: one(vehicleMakes, {
    fields: [productVehicleCompatibility.makeId],
    references: [vehicleMakes.id],
  }),
  model: one(vehicleModels, {
    fields: [productVehicleCompatibility.modelId],
    references: [vehicleModels.id],
  }),
}));

export const productVariationsRelations = relations(productVariations, ({ one }) => ({
  product: one(products, {
    fields: [productVariations.productId],
    references: [products.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  variation: one(productVariations, {
    fields: [cartItems.variationId],
    references: [productVariations.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
  booking: one(bookings),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variation: one(productVariations, {
    fields: [orderItems.variationId],
    references: [productVariations.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [bookings.orderId],
    references: [orders.id],
  }),
}));

// Blog post status enum
export const blogPostStatusEnum = pgEnum("blog_post_status", ["draft", "published"]);

// Blog categories
export const blogCategories = pgTable("blog_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blog posts
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  slug: varchar("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  featuredImage: varchar("featured_image"),
  metaDescription: varchar("meta_description"),
  authorId: varchar("author_id").references(() => users.id),
  categoryId: varchar("category_id").references(() => blogCategories.id),
  status: blogPostStatusEnum("status").default("draft"),
  isFeatured: boolean("is_featured").default(false),
  viewCount: integer("view_count").default(0),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blog relations
export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
  category: one(blogCategories, {
    fields: [blogPosts.categoryId],
    references: [blogCategories.id],
  }),
}));

export const blogCategoriesRelations = relations(blogCategories, ({ many }) => ({
  posts: many(blogPosts),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertBrandSchema = createInsertSchema(brands).omit({
  id: true,
  createdAt: true,
});

export const insertVehicleMakeSchema = createInsertSchema(vehicleMakes).omit({
  id: true,
  createdAt: true,
});

export const insertVehicleModelSchema = createInsertSchema(vehicleModels).omit({
  id: true,
  createdAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuoteRequestSchema = createInsertSchema(quoteRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWishlistSchema = createInsertSchema(wishlists).omit({
  id: true,
  createdAt: true,
});

export const insertProductVehicleCompatibilitySchema = createInsertSchema(productVehicleCompatibility).omit({
  id: true,
  createdAt: true,
});

export const insertProductVariationSchema = createInsertSchema(productVariations).omit({
  id: true,
  createdAt: true,
});

export const insertBlogCategorySchema = createInsertSchema(blogCategories).omit({
  id: true,
  createdAt: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Brand = typeof brands.$inferSelect;
export type InsertBrand = z.infer<typeof insertBrandSchema>;

export type VehicleMake = typeof vehicleMakes.$inferSelect;
export type InsertVehicleMake = z.infer<typeof insertVehicleMakeSchema>;

export type VehicleModel = typeof vehicleModels.$inferSelect;
export type InsertVehicleModel = z.infer<typeof insertVehicleModelSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;

export type ProductVehicleCompatibility = typeof productVehicleCompatibility.$inferSelect;
export type InsertProductVehicleCompatibility = z.infer<typeof insertProductVehicleCompatibilitySchema>;

export type ProductVariation = typeof productVariations.$inferSelect;
export type InsertProductVariation = z.infer<typeof insertProductVariationSchema>;

export type BlogCategory = typeof blogCategories.$inferSelect;
export type InsertBlogCategory = z.infer<typeof insertBlogCategorySchema>;

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

// Portfolio projects - showcase completed installation work
export const portfolioProjects = pgTable("portfolio_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  slug: varchar("slug").notNull().unique(),
  shortDescription: text("short_description"),
  fullDescription: text("full_description"),
  vehicleMake: varchar("vehicle_make"),
  vehicleModel: varchar("vehicle_model"),
  vehicleYear: varchar("vehicle_year"),
  category: varchar("category"), // soundupgrade, carplay, entertainment, custom
  images: jsonb("images").$type<string[]>().default([]),
  featuredImage: varchar("featured_image"),
  components: jsonb("components").$type<string[]>().default([]), // list of installed components
  isFeatured: boolean("is_featured").default(false),
  isPublished: boolean("is_published").default(true),
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPortfolioProjectSchema = createInsertSchema(portfolioProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PortfolioProject = typeof portfolioProjects.$inferSelect;
export type InsertPortfolioProject = z.infer<typeof insertPortfolioProjectSchema>;

// ClickUp configuration for scheduled jobs
export const clickupConfig = pgTable("clickup_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar("workspace_id"),
  workspaceName: varchar("workspace_name"),
  spaceId: varchar("space_id"),
  spaceName: varchar("space_name"),
  folderId: varchar("folder_id"),
  folderName: varchar("folder_name"),
  listId: varchar("list_id"),
  listName: varchar("list_name"),
  isEnabled: boolean("is_enabled").default(true),
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertClickupConfigSchema = createInsertSchema(clickupConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ClickupConfig = typeof clickupConfig.$inferSelect;
export type InsertClickupConfig = z.infer<typeof insertClickupConfigSchema>;

// Site settings table (single-row config)
export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  installationServiceEnabled: boolean("installation_service_enabled").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SiteSettings = typeof siteSettings.$inferSelect;

// Re-export chat models for Gemini integration
export * from "./models/chat";
