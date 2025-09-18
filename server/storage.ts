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
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, like, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
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
  updateOrderStatus(id: string, status: string): Promise<Order>;

  // Booking operations
  getBookings(userId?: string): Promise<Booking[]>;
  getBookingsByUserId(userId: string): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
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
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
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
      const searchCondition = or(
        like(products.name, `%${options.search}%`),
        like(products.description, `%${options.search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
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
  async getVehicleMakes(): Promise<VehicleMake[]> {
    return await db.select().from(vehicleMakes).orderBy(asc(vehicleMakes.name));
  }

  async getVehicleModels(makeId: string): Promise<VehicleModel[]> {
    return await db.select().from(vehicleModels).where(eq(vehicleModels.makeId, makeId)).orderBy(asc(vehicleModels.name));
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
        createdAt: cartItems.createdAt,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          images: products.images,
        }
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId)) as any;
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const [existing] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, cartItem.userId),
          eq(cartItems.productId, cartItem.productId)
        )
      );

    if (existing) {
      // Update quantity
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
    
    const baseQuery = db.select().from(reviews);
    
    let finalQuery = conditions.length > 0 
      ? baseQuery.where(and(...conditions))
      : baseQuery;
    
    finalQuery = finalQuery.orderBy(desc(reviews.createdAt));
    
    if (options?.limit) {
      finalQuery = finalQuery.limit(options.limit);
    }
    if (options?.offset) {
      finalQuery = finalQuery.offset(options.offset);
    }
    
    return await finalQuery;
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
}

export const storage = new DatabaseStorage();
