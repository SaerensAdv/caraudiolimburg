import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import type { User as DatabaseUser } from "@shared/schema";
import connectPg from "connect-pg-simple";

// Simple rate limiter
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

function rateLimiter(maxAttempts: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = loginAttempts.get(ip);
    
    if (!record || now > record.resetTime) {
      loginAttempts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (record.count >= maxAttempts) {
      return res.status(429).json({ message: 'Te veel pogingen. Probeer later opnieuw.' });
    }
    
    record.count++;
    next();
  };
}

const authRateLimiter = rateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

declare global {
  namespace Express {
    interface User extends DatabaseUser {}
  }
}

// Using bcrypt instead of scrypt for password hashing

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  return await bcrypt.compare(supplied, stored);
}

export function setupAuth(app: Express) {
  // Session configuration
  const PostgresSessionStore = connectPg(session);
  const sessionStore = new PostgresSessionStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    tableName: 'sessions',
    ttl: 7 * 24 * 60 * 60, // 7 days
  });

  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is required');
  }

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local Strategy (Email/Password)
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Gebruiker niet gevonden" });
          }

          if (!user.passwordHash) {
            return done(null, false, { message: "Account gebruikt Google login" });
          }

          const isValidPassword = await comparePasswords(password, user.passwordHash);
          if (!isValidPassword) {
            return done(null, false, { message: "Onjuist wachtwoord" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );


  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Auth routes

  // Main login route - redirects to login page
  app.get('/api/login', (req, res) => {
    res.redirect('/login');
  });

  // Email/Password Registration
  app.post('/api/auth/register', authRateLimiter, async (req, res, next) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "E-mailadres is al in gebruik" });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const user = await storage.createUser({
        email,
        passwordHash,
        firstName,
        lastName,
        role: 'customer',
      });

      // Login user
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registratie mislukt" });
    }
  });

  // Email/Password Login
  app.post('/api/auth/login', authRateLimiter, (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Login fout" });
      }
      
      if (!user) {
        return res.status(400).json({ 
          message: info?.message || "Ongeldige inloggegevens" 
        });
      }

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login fout" });
        }
        res.json(user);
      });
    })(req, res, next);
  });

  // Logout (POST for API calls)
  app.post('/api/auth/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Uitgelogd" });
    });
  });

  // Logout (GET for direct navigation/links)
  app.get('/api/auth/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.redirect('/');
    });
  });

  // Get current user
  app.get('/api/auth/user', (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(req.user);
  });
}

// Middleware to check if user is authenticated
export const isAuthenticated = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Middleware to check if user is admin
export const isAdmin = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated() || req.user?.role !== 'admin') {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};