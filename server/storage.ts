import {
  users,
  products,
  categories,
  brands,
  vehicleMakes,
  vehicleModels,
  cartItems,
  orders,
  orderItems,
  bookings,
  quoteRequests,
  productVehicleCompatibility,
  productVariations,
  productUpsells,
  wishlists,
  blogPosts,
  blogCategories,
  portfolioProjects,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Category,
  type InsertCategory,
  type Brand,
  type InsertBrand,
  type VehicleMake,
  type InsertVehicleMake,
  type VehicleModel,
  type InsertVehicleModel,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Booking,
  type InsertBooking,
  type QuoteRequest,
  type InsertQuoteRequest,
  reviews,
  type Review,
  type InsertReview,
  type Wishlist,
  type BlogPost,
  type InsertBlogPost,
  type BlogCategory,
  type InsertBlogCategory,
  type ProductVehicleCompatibility,
  type InsertProductVehicleCompatibility,
  type ProductVariation,
  type PortfolioProject,
  type InsertPortfolioProject,
  type InsertProductVariation,
  siteSettings,
  type SiteSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, like, ilike, inArray, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User>;
  updateUserGoogleId(id: string, googleId: string): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Product operations
  getProducts(options?: {
    categoryId?: string;
    brandId?: string;
    search?: string;
    vehicleMakeId?: string;
    vehicleModelId?: string;
    vehicleYear?: number;
    limit?: number;
    offset?: number;
    featured?: boolean;
  }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Brand operations
  getBrands(): Promise<Brand[]>;
  getBrand(id: string): Promise<Brand | undefined>;
  createBrand(brand: InsertBrand): Promise<Brand>;

  // Vehicle operations
  getVehicleMakes(): Promise<VehicleMake[]>;
  getVehicleModels(makeId: string): Promise<VehicleModel[]>;
  getAllVehicleMakes(): Promise<VehicleMake[]>;
  getAllVehicleModelsByMake(makeId: string): Promise<VehicleModel[]>;
  createVehicleMake(make: InsertVehicleMake): Promise<VehicleMake>;
  createVehicleModel(model: InsertVehicleModel): Promise<VehicleModel>;

  // Cart operations
  getCartItems(userId: string): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem>;
  removeFromCart(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrders(userId?: string): Promise<Order[]>;
  getOrdersByUserId(userId: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrderByPaymentIntentId(paymentIntentId: string): Promise<Order | undefined>;
  getOrderWithItems(id: string): Promise<{ order: Order; items: (OrderItem & { product: Product })[] } | undefined>;
  updateOrderStatus(id: string, status: string): Promise<Order>;

  // Booking operations
  getBookings(userId?: string): Promise<Booking[]>;
  getBookingsByUserId(userId: string): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking>;
  cancelBooking(id: string): Promise<Booking>;
  updateBookingStatus(id: string, status: string): Promise<Booking>;
  getAvailableTimeSlots(date: string, serviceType: string): Promise<string[]>;

  // Quote request operations
  createQuoteRequest(quote: InsertQuoteRequest): Promise<QuoteRequest>;
  getQuoteRequests(): Promise<QuoteRequest[]>;
  updateQuoteRequest(id: string, updates: Partial<InsertQuoteRequest>): Promise<QuoteRequest>;

  // Review operations
  getReviews(options?: {
    productId?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Review[]>;
  getReview(id: string): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, updates: Partial<InsertReview>): Promise<Review>;
  deleteReview(id: string): Promise<void>;
  approveReview(id: string): Promise<Review>;
  publishReview(id: string): Promise<Review>;
  featureReview(id: string, featured: boolean): Promise<Review>;

  // Wishlist operations
  getWishlistByUserId(userId: string): Promise<(Wishlist & { product: Product })[]>;
  addToWishlist(userId: string, productId: string): Promise<Wishlist>;
  removeFromWishlist(userId: string, productId: string): Promise<void>;
  isInWishlist(userId: string, productId: string): Promise<boolean>;

  // Blog category operations
  getBlogCategories(): Promise<BlogCategory[]>;
  getBlogCategory(id: string): Promise<BlogCategory | undefined>;
  getBlogCategoryBySlug(slug: string): Promise<BlogCategory | undefined>;
  createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory>;
  updateBlogCategory(id: string, updates: Partial<InsertBlogCategory>): Promise<BlogCategory>;
  deleteBlogCategory(id: string): Promise<void>;

  // Blog post operations
  getBlogPosts(options?: {
    categoryId?: string;
    status?: "draft" | "published";
    featured?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<BlogPost[]>;
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, updates: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: string): Promise<void>;
  incrementBlogPostViews(id: string): Promise<void>;
  getPublishedBlogPostsForSitemap(): Promise<{ slug: string; updatedAt: Date | null }[]>;

  // Product vehicle compatibility operations
  getProductVehicleCompatibility(productId: string): Promise<ProductVehicleCompatibility[]>;
  setProductVehicleCompatibility(productId: string, compatibility: InsertProductVehicleCompatibility[]): Promise<ProductVehicleCompatibility[]>;
  clearProductVehicleCompatibility(productId: string): Promise<void>;
  getAllVehicleModels(): Promise<{ id: string; name: string; makeId: string }[]>;

  // Product variation operations
  getProductVariations(productId: string): Promise<ProductVariation[]>;
  getProductVariation(id: string): Promise<ProductVariation | undefined>;
  createProductVariation(variation: InsertProductVariation): Promise<ProductVariation>;
  updateProductVariation(id: string, updates: Partial<InsertProductVariation>): Promise<ProductVariation | undefined>;
  deleteProductVariation(id: string): Promise<boolean>;
  deleteProductVariationsByProductId(productId: string): Promise<void>;

  // Product upsell operations
  getProductUpsells(productId: string): Promise<(Product & { upsellLabel?: string | null })[]>;

  // Site settings operations
  getSiteSettings(): Promise<SiteSettings>;
  updateSiteSettings(updates: Partial<Pick<SiteSettings, 'installationServiceEnabled'>>): Promise<SiteSettings>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserGoogleId(id: string, googleId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ googleId, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Product operations
  async getProducts(options: {
    categoryId?: string;
    brandId?: string;
    search?: string;
    vehicleMakeId?: string;
    vehicleModelId?: string;
    vehicleYear?: number;
    limit?: number;
    offset?: number;
    featured?: boolean;
  } = {}): Promise<Product[]> {
    const conditions = [eq(products.isActive, true)];

    if (options.categoryId) {
      conditions.push(eq(products.categoryId, options.categoryId));
    }
    
    if (options.brandId) {
      conditions.push(eq(products.brandId, options.brandId));
    }
    
    if (options.featured) {
      conditions.push(eq(products.isFeatured, true));
    }
    
    if (options.search) {
      const words = options.search.trim().split(/\s+/).filter(w => w.length > 0);
      if (words.length > 0) {
        const wordConditions = words.map(word => {
          const term = `%${word}%`;
          return or(
            ilike(products.name, term),
            ilike(products.description, term),
            ilike(products.sku, term),
            sql`EXISTS (SELECT 1 FROM ${brands} WHERE ${brands.id} = ${products.brandId} AND ${ilike(brands.name, term)})`
          );
        });
        conditions.push(and(...wordConditions)!);
      }
    }

    if (options.vehicleMakeId) {
      conditions.push(
        sql`EXISTS (SELECT 1 FROM ${productVehicleCompatibility} WHERE ${productVehicleCompatibility.productId} = ${products.id} AND ${productVehicleCompatibility.makeId} = ${options.vehicleMakeId})`
      );
    }

    if (options.vehicleModelId) {
      conditions.push(
        sql`EXISTS (SELECT 1 FROM ${productVehicleCompatibility} WHERE ${productVehicleCompatibility.productId} = ${products.id} AND ${productVehicleCompatibility.modelId} = ${options.vehicleModelId})`
      );
    }

    if (options.vehicleYear) {
      conditions.push(
        sql`EXISTS (SELECT 1 FROM ${productVehicleCompatibility} WHERE ${productVehicleCompatibility.productId} = ${products.id} AND (${productVehicleCompatibility.yearFrom} IS NULL OR ${productVehicleCompatibility.yearFrom} <= ${options.vehicleYear}) AND (${productVehicleCompatibility.yearTo} IS NULL OR ${productVehicleCompatibility.yearTo} >= ${options.vehicleYear}))`
      );
    }

    // Build query step by step to avoid TypeScript issues
    let queryBuilder = db.select().from(products);
    
    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions)) as any;
    }
    
    queryBuilder = queryBuilder.orderBy(desc(products.createdAt)) as any;

    if (options.limit) {
      queryBuilder = queryBuilder.limit(options.limit) as any;
    }
    
    if (options.offset) {
      queryBuilder = queryBuilder.offset(options.offset) as any;
    }

    return await queryBuilder;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    // First delete all related records to avoid foreign key constraint violations
    
    // Delete product vehicle compatibility records
    await db.delete(productVehicleCompatibility).where(eq(productVehicleCompatibility.productId, id));
    
    // Delete product variations (cascade should handle this, but be explicit)
    await db.delete(productVariations).where(eq(productVariations.productId, id));
    
    // Delete cart items that reference this product
    await db.delete(cartItems).where(eq(cartItems.productId, id));
    
    // Finally delete the product itself
    await db.delete(products).where(eq(products.id, id));
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Brand operations
  async getBrands(): Promise<Brand[]> {
    return await db.select().from(brands).orderBy(asc(brands.name));
  }

  async getBrand(id: string): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.id, id));
    return brand;
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    const [newBrand] = await db.insert(brands).values(brand).returning();
    return newBrand;
  }

  // Vehicle operations
  async getAllVehicleMakes(): Promise<VehicleMake[]> {
    return await db.select().from(vehicleMakes).orderBy(asc(vehicleMakes.name));
  }

  async getAllVehicleModelsByMake(makeId: string): Promise<VehicleModel[]> {
    return await db.select().from(vehicleModels).where(eq(vehicleModels.makeId, makeId)).orderBy(asc(vehicleModels.name));
  }

  // Only return makes/models that have at least one active product linked
  async getVehicleMakes(): Promise<VehicleMake[]> {
    const makesWithProducts = await db
      .selectDistinct({ id: vehicleMakes.id, name: vehicleMakes.name, slug: vehicleMakes.slug, createdAt: vehicleMakes.createdAt })
      .from(vehicleMakes)
      .innerJoin(productVehicleCompatibility, eq(productVehicleCompatibility.makeId, vehicleMakes.id))
      .innerJoin(products, and(eq(products.id, productVehicleCompatibility.productId), eq(products.isActive, true)))
      .orderBy(asc(vehicleMakes.name));
    return makesWithProducts;
  }

  async getVehicleModels(makeId: string): Promise<VehicleModel[]> {
    const modelsWithProducts = await db
      .selectDistinct({ id: vehicleModels.id, name: vehicleModels.name, slug: vehicleModels.slug, makeId: vehicleModels.makeId, startYear: vehicleModels.startYear, endYear: vehicleModels.endYear, createdAt: vehicleModels.createdAt })
      .from(vehicleModels)
      .innerJoin(productVehicleCompatibility, eq(productVehicleCompatibility.modelId, vehicleModels.id))
      .innerJoin(products, and(eq(products.id, productVehicleCompatibility.productId), eq(products.isActive, true)))
      .where(eq(vehicleModels.makeId, makeId))
      .orderBy(asc(vehicleModels.name));
    return modelsWithProducts;
  }

  async createVehicleMake(make: InsertVehicleMake): Promise<VehicleMake> {
    const [newMake] = await db.insert(vehicleMakes).values(make).returning();
    return newMake;
  }

  async createVehicleModel(model: InsertVehicleModel): Promise<VehicleModel> {
    const [newModel] = await db.insert(vehicleModels).values(model).returning();
    return newModel;
  }

  // Cart operations
  async getCartItems(userId: string): Promise<CartItem[]> {
    return await db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        needsInstallation: cartItems.needsInstallation,
        variationId: cartItems.variationId,
        createdAt: cartItems.createdAt,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          images: products.images,
          hasVariations: products.hasVariations,
        },
        variation: {
          id: productVariations.id,
          label: productVariations.label,
          price: productVariations.price,
          originalPrice: productVariations.originalPrice,
          stock: productVariations.stock,
        }
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .leftJoin(productVariations, eq(cartItems.variationId, productVariations.id))
      .where(eq(cartItems.userId, userId)) as any;
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists with same product and variation
    const conditions = [
      eq(cartItems.userId, cartItem.userId),
      eq(cartItems.productId, cartItem.productId)
    ];
    
    // For products with variations, also match on variationId
    if (cartItem.variationId) {
      conditions.push(eq(cartItems.variationId, cartItem.variationId));
    }

    const [existing] = await db
      .select()
      .from(cartItems)
      .where(and(...conditions));

    // Only update quantity if variationId matches (or both are null)
    if (existing && existing.variationId === (cartItem.variationId || null)) {
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: existing.quantity + (cartItem.quantity || 1) })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return updated;
    }

    const [newItem] = await db.insert(cartItems).values(cartItem).returning();
    return newItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem> {
    const [updated] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updated;
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db.insert(orderItems).values(orderItem).returning();
    return newOrderItem;
  }

  async getOrders(userId?: string): Promise<Order[]> {
    if (userId) {
      return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
    }
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderByPaymentIntentId(paymentIntentId: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.stripePaymentIntentId, paymentIntentId));
    return order;
  }

  async getOrderWithItems(id: string): Promise<{ order: Order; items: (OrderItem & { product: Product })[] } | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const items = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        needsInstallation: orderItems.needsInstallation,
        createdAt: orderItems.createdAt,
        product: products,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, id));

    return { 
      order, 
      items: items.filter(item => item.product !== null) as (OrderItem & { product: Product })[] 
    };
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [updated] = await db
      .update(orders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  // Booking operations
  async getBookings(userId?: string): Promise<Booking[]> {
    if (userId) {
      return await db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
    }
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async getBookingsByUserId(userId: string): Promise<Booking[]> {
    return await db.select().from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking> {
    const [updated] = await db
      .update(bookings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }

  async cancelBooking(id: string): Promise<Booking> {
    const [updated] = await db
      .update(bookings)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking> {
    const [updated] = await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }

  async getAvailableTimeSlots(date: string, serviceType: string): Promise<string[]> {
    // Basic implementation - in a real app this would check against actual bookings
    const allSlots = ["09:00", "11:00", "13:00", "15:00", "17:00"];
    
    // Get existing bookings for the date
    const dateStart = new Date(date);
    const dateEnd = new Date(date);
    dateEnd.setDate(dateEnd.getDate() + 1);
    
    const existingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.serviceType, serviceType),
          eq(bookings.status, "confirmed")
        )
      );

    // For simplicity, return available slots (in real app would calculate based on duration and existing bookings)
    return allSlots.filter((_, index) => index !== 2); // Mock: 13:00 is unavailable
  }

  // Quote request operations
  async createQuoteRequest(quote: InsertQuoteRequest): Promise<QuoteRequest> {
    const [newQuote] = await db.insert(quoteRequests).values(quote).returning();
    return newQuote;
  }

  async getQuoteRequests(): Promise<QuoteRequest[]> {
    return await db.select().from(quoteRequests).orderBy(desc(quoteRequests.createdAt));
  }

  async updateQuoteRequest(id: string, updates: Partial<InsertQuoteRequest>): Promise<QuoteRequest> {
    const [updated] = await db
      .update(quoteRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(quoteRequests.id, id))
      .returning();
    return updated;
  }

  // Review operations
  async getReviews(options?: {
    productId?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Review[]> {
    const conditions = [];
    
    if (options?.productId) {
      conditions.push(eq(reviews.productId, options.productId));
    }
    if (options?.isPublished !== undefined) {
      conditions.push(eq(reviews.isPublished, options.isPublished));
    }
    if (options?.isFeatured !== undefined) {
      conditions.push(eq(reviews.isFeatured, options.isFeatured));
    }
    
    // Build query step by step to avoid TypeScript issues
    const baseQuery = db.select().from(reviews).orderBy(desc(reviews.createdAt));
    
    if (conditions.length > 0) {
      if (options?.limit && options?.offset) {
        return await baseQuery.where(and(...conditions)).limit(options.limit).offset(options.offset);
      } else if (options?.limit) {
        return await baseQuery.where(and(...conditions)).limit(options.limit);
      } else if (options?.offset) {
        return await baseQuery.where(and(...conditions)).offset(options.offset);
      } else {
        return await baseQuery.where(and(...conditions));
      }
    } else {
      if (options?.limit && options?.offset) {
        return await baseQuery.limit(options.limit).offset(options.offset);
      } else if (options?.limit) {
        return await baseQuery.limit(options.limit);
      } else if (options?.offset) {
        return await baseQuery.offset(options.offset);
      } else {
        return await baseQuery;
      }
    }
  }

  async getReview(id: string): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async updateReview(id: string, updates: Partial<InsertReview>): Promise<Review> {
    const [updated] = await db
      .update(reviews)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();
    return updated;
  }

  async deleteReview(id: string): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, id));
  }

  async approveReview(id: string): Promise<Review> {
    const [updated] = await db
      .update(reviews)
      .set({ isApproved: true, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();
    return updated;
  }

  async publishReview(id: string): Promise<Review> {
    const [updated] = await db
      .update(reviews)
      .set({ isPublished: true, isApproved: true, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();
    return updated;
  }

  async featureReview(id: string, featured: boolean): Promise<Review> {
    const [updated] = await db
      .update(reviews)
      .set({ isFeatured: featured, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();
    return updated;
  }

  // Wishlist operations
  async getWishlistByUserId(userId: string): Promise<(Wishlist & { product: Product })[]> {
    const results = await db
      .select({
        id: wishlists.id,
        userId: wishlists.userId,
        productId: wishlists.productId,
        createdAt: wishlists.createdAt,
        product: products,
      })
      .from(wishlists)
      .leftJoin(products, eq(wishlists.productId, products.id))
      .where(eq(wishlists.userId, userId))
      .orderBy(desc(wishlists.createdAt));
    
    return results.filter(r => r.product !== null) as (Wishlist & { product: Product })[];
  }

  async addToWishlist(userId: string, productId: string): Promise<Wishlist> {
    const existing = await db
      .select()
      .from(wishlists)
      .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)));
    
    if (existing.length > 0) {
      return existing[0];
    }
    
    const [newWishlistItem] = await db
      .insert(wishlists)
      .values({ userId, productId })
      .returning();
    return newWishlistItem;
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    await db
      .delete(wishlists)
      .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)));
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(wishlists)
      .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)));
    return !!result;
  }

  // Blog category operations
  async getBlogCategories(): Promise<BlogCategory[]> {
    return await db.select().from(blogCategories).orderBy(asc(blogCategories.name));
  }

  async getBlogCategory(id: string): Promise<BlogCategory | undefined> {
    const [category] = await db.select().from(blogCategories).where(eq(blogCategories.id, id));
    return category;
  }

  async getBlogCategoryBySlug(slug: string): Promise<BlogCategory | undefined> {
    const [category] = await db.select().from(blogCategories).where(eq(blogCategories.slug, slug));
    return category;
  }

  async createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory> {
    const [newCategory] = await db.insert(blogCategories).values(category).returning();
    return newCategory;
  }

  async updateBlogCategory(id: string, updates: Partial<InsertBlogCategory>): Promise<BlogCategory> {
    const [updated] = await db
      .update(blogCategories)
      .set(updates)
      .where(eq(blogCategories.id, id))
      .returning();
    return updated;
  }

  async deleteBlogCategory(id: string): Promise<void> {
    await db.delete(blogCategories).where(eq(blogCategories.id, id));
  }

  // Blog post operations
  async getBlogPosts(options: {
    categoryId?: string;
    status?: "draft" | "published";
    featured?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<BlogPost[]> {
    const conditions = [];
    
    if (options.categoryId) {
      conditions.push(eq(blogPosts.categoryId, options.categoryId));
    }
    if (options.status) {
      conditions.push(eq(blogPosts.status, options.status));
    }
    if (options.featured !== undefined) {
      conditions.push(eq(blogPosts.isFeatured, options.featured));
    }
    if (options.search) {
      conditions.push(
        or(
          ilike(blogPosts.title, `%${options.search}%`),
          ilike(blogPosts.excerpt, `%${options.search}%`)
        )
      );
    }

    let query = db.select().from(blogPosts);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    
    query = query.orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt)) as typeof query;
    
    if (options.limit) {
      query = query.limit(options.limit) as typeof query;
    }
    if (options.offset) {
      query = query.offset(options.offset) as typeof query;
    }

    return await query;
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await db.insert(blogPosts).values(post).returning();
    return newPost;
  }

  async updateBlogPost(id: string, updates: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [updated] = await db
      .update(blogPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return updated;
  }

  async deleteBlogPost(id: string): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  async incrementBlogPostViews(id: string): Promise<void> {
    const post = await this.getBlogPost(id);
    if (post) {
      await db
        .update(blogPosts)
        .set({ viewCount: (post.viewCount || 0) + 1 })
        .where(eq(blogPosts.id, id));
    }
  }

  async getPublishedBlogPostsForSitemap(): Promise<{ slug: string; updatedAt: Date | null }[]> {
    return await db
      .select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"))
      .orderBy(desc(blogPosts.publishedAt));
  }

  // Product vehicle compatibility operations
  async getProductVehicleCompatibility(productId: string): Promise<any[]> {
    return await db
      .select()
      .from(productVehicleCompatibility)
      .where(eq(productVehicleCompatibility.productId, productId));
  }

  async setProductVehicleCompatibility(productId: string, compatibility: any[]): Promise<any[]> {
    // Delete existing compatibility records for this product
    await db.delete(productVehicleCompatibility).where(eq(productVehicleCompatibility.productId, productId));
    
    // Insert new compatibility records
    if (compatibility.length === 0) {
      return [];
    }
    
    const records = compatibility.map(c => ({
      productId,
      makeId: c.makeId,
      modelId: c.modelId || null,
      yearFrom: c.yearFrom || null,
      yearTo: c.yearTo || null,
      notes: c.notes || null,
    }));
    
    return await db.insert(productVehicleCompatibility).values(records).returning();
  }

  async clearProductVehicleCompatibility(productId: string): Promise<void> {
    await db.delete(productVehicleCompatibility).where(eq(productVehicleCompatibility.productId, productId));
  }

  async getAllVehicleModels(): Promise<{ id: string; name: string; makeId: string }[]> {
    return await db
      .select({ id: vehicleModels.id, name: vehicleModels.name, makeId: vehicleModels.makeId })
      .from(vehicleModels)
      .orderBy(asc(vehicleModels.name));
  }

  // Product variation operations
  async getProductVariations(productId: string): Promise<ProductVariation[]> {
    return await db
      .select()
      .from(productVariations)
      .where(eq(productVariations.productId, productId))
      .orderBy(asc(productVariations.sortOrder), asc(productVariations.createdAt));
  }

  async getProductVariation(id: string): Promise<ProductVariation | undefined> {
    const [variation] = await db
      .select()
      .from(productVariations)
      .where(eq(productVariations.id, id));
    return variation;
  }

  async createProductVariation(variation: InsertProductVariation): Promise<ProductVariation> {
    const [newVariation] = await db
      .insert(productVariations)
      .values(variation)
      .returning();
    return newVariation;
  }

  async updateProductVariation(id: string, updates: Partial<InsertProductVariation>): Promise<ProductVariation | undefined> {
    const [updated] = await db
      .update(productVariations)
      .set(updates)
      .where(eq(productVariations.id, id))
      .returning();
    return updated;
  }

  async deleteProductVariation(id: string): Promise<boolean> {
    const result = await db
      .delete(productVariations)
      .where(eq(productVariations.id, id))
      .returning();
    return result.length > 0;
  }

  async deleteProductVariationsByProductId(productId: string): Promise<void> {
    await db
      .delete(productVariations)
      .where(eq(productVariations.productId, productId));
  }

  // Product upsell operations
  async getProductUpsells(productId: string): Promise<(Product & { upsellLabel?: string | null })[]> {
    const upsellLinks = await db
      .select({
        product: products,
        label: productUpsells.label,
      })
      .from(productUpsells)
      .innerJoin(products, eq(productUpsells.upsellProductId, products.id))
      .where(and(
        eq(productUpsells.productId, productId),
        eq(products.isActive, true)
      ))
      .orderBy(asc(productUpsells.sortOrder));

    return upsellLinks.map(link => ({
      ...link.product,
      upsellLabel: link.label,
    }));
  }

  // Portfolio project operations
  async getPortfolioProjects(options: {
    category?: string;
    featured?: boolean;
    published?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<PortfolioProject[]> {
    const conditions = [];
    
    if (options.category) {
      conditions.push(eq(portfolioProjects.category, options.category));
    }
    if (options.featured !== undefined) {
      conditions.push(eq(portfolioProjects.isFeatured, options.featured));
    }
    if (options.published !== undefined) {
      conditions.push(eq(portfolioProjects.isPublished, options.published));
    }

    let query = db.select().from(portfolioProjects);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    query = query.orderBy(desc(portfolioProjects.publishedAt)) as any;
    
    if (options.limit) {
      query = query.limit(options.limit) as any;
    }
    if (options.offset) {
      query = query.offset(options.offset) as any;
    }

    return await query;
  }

  async getPortfolioProject(id: string): Promise<PortfolioProject | undefined> {
    const [project] = await db.select().from(portfolioProjects).where(eq(portfolioProjects.id, id));
    return project;
  }

  async getPortfolioProjectBySlug(slug: string): Promise<PortfolioProject | undefined> {
    const [project] = await db.select().from(portfolioProjects).where(eq(portfolioProjects.slug, slug));
    return project;
  }

  async createPortfolioProject(project: InsertPortfolioProject): Promise<PortfolioProject> {
    const [newProject] = await db.insert(portfolioProjects).values(project).returning();
    return newProject;
  }

  async updatePortfolioProject(id: string, updates: Partial<InsertPortfolioProject>): Promise<PortfolioProject | undefined> {
    const [updated] = await db
      .update(portfolioProjects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(portfolioProjects.id, id))
      .returning();
    return updated;
  }

  async deletePortfolioProject(id: string): Promise<boolean> {
    const result = await db
      .delete(portfolioProjects)
      .where(eq(portfolioProjects.id, id))
      .returning();
    return result.length > 0;
  }

  async getSiteSettings(): Promise<SiteSettings> {
    const [settings] = await db.select().from(siteSettings).limit(1);
    if (!settings) {
      const [newSettings] = await db.insert(siteSettings).values({ installationServiceEnabled: true }).returning();
      return newSettings;
    }
    return settings;
  }

  async updateSiteSettings(updates: Partial<Pick<SiteSettings, 'installationServiceEnabled'>>): Promise<SiteSettings> {
    const current = await this.getSiteSettings();
    const [updated] = await db
      .update(siteSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(siteSettings.id, current.id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
