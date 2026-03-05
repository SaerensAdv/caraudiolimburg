# Car Audio Limburg E-commerce & Installation Service

## Overview

This project is a full-stack e-commerce application for Car Audio Limburg, integrating online sales of car audio equipment with professional installation service bookings. It serves as a product catalog, service booking platform, and customer acquisition tool. The application aims to attract customers seeking premium car audio solutions and professional installation, offering products from brands like Alpine and Audison, alongside OEM upgrades. Key capabilities include product sales, calendar-based service scheduling, custom quote requests, and comprehensive administrative features for managing orders, inventory, bookings, and leads. The vision is to provide a seamless customer experience from product selection to professional installation, enhancing market presence and operational efficiency.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript, using Vite.
- **UI/UX**: Tailwind CSS and shadcn/ui for styling and components.
- **State Management**: TanStack Query for server-side data, React Hook Form for forms.
- **Routing**: Wouter for client-side routing.
- **Authentication**: Session-based authentication via Replit's OAuth.

### Backend
- **Runtime**: Node.js with Express.js.
- **Database ORM**: Drizzle ORM for type-safe PostgreSQL interaction.
- **API Design**: RESTful API with Express, validated by Zod schemas.
- **Session Management**: Express sessions, persistently stored in PostgreSQL.
- **File Structure**: Monorepo separating client, server, and shared code.

### Database
- **Technology**: PostgreSQL, accessed via Drizzle ORM.
- **Schema**: Tables for users, products, categories, brands, vehicle compatibility, orders, bookings, quotes, and cart management.
- **Relationships**: Defined relational integrity across entities.

### Authentication & Authorization
- **Provider**: Replit OAuth via Passport.js strategy.
- **Session Storage**: Database-backed sessions.
- **User Roles**: Role-based access control (customer, staff, admin).
- **Security**: HTTP-only cookies and secure session management.

### Payment Processing
- **Provider**: Stripe for secure transactions.
- **Supported Methods**: Credit cards, Bancontact, iDEAL (targeting Belgian and Dutch markets).
- **Payment Flow**: PaymentIntent API with automatic_payment_methods enabled, server-side price validation for both authenticated and guest checkout.
- **Webhooks**: Handles Stripe webhooks for real-time payment and order status updates. Webhook fallback creates orders for both guest (from metadata) and authenticated users (from DB cart) when client-side confirmation doesn't complete.
- **Order Confirmation**: Three pathways — direct confirm (card payments), redirect confirm (iDEAL/Bancontact), and webhook fallback. All paths verify payment status, check idempotency, and validate amounts.
- **Variation Support**: All price calculations (payment intent creation, order confirmation, webhook, redirect flow) correctly use variation prices when applicable.
- **Email**: Order confirmation emails sent via Resend integration on all order creation paths (confirm, guest confirm, webhook).
- **Shipping Fallback**: Webhook handler parses shipping from PI metadata, with fallback to Stripe billing_details when metadata is missing.

### File Storage (Product Images)
- **SDK**: `@replit/object-storage` for persisting product images.
- **Upload Flow**: Images are resized, converted to WebP, saved locally, and uploaded to Replit Object Storage.
- **Serving**: Express serves images from the local filesystem first, with fallback to Object Storage.
- **URL Format**: All product images use the `/products/filename.webp` URL pattern.

### Key Features
- **E-commerce**: Product catalog with categorization, branding, vehicle compatibility filtering, and shopping cart.
- **Booking System**: Calendar-based scheduling for installation appointments.
- **Quote System**: Customizable request forms for lead generation.
- **Vehicle Compatibility**: Dynamic product filtering by make, model, year, including RDW API integration for Kenteken (license plate) search.
- **Admin Dashboard**: CRM-like interface for managing products, orders, bookings, and customer interactions.

### Security & Data Integrity
- **Cart ownership checks**: PATCH/DELETE /api/cart/:id verify the cart item belongs to the authenticated user (403 if not)
- **Cart quantity validation**: Quantity must be a positive integer between 1 and 99
- **Variation validation**: Server verifies variationId belongs to productId in cart, payment intent, and guest checkout flows
- **Shipping data persistence**: Shipping details stored in Stripe PaymentIntent metadata as fallback for 3DS/iDEAL redirect flows
- **Race condition protection**: addToCart uses atomic UPDATE before INSERT to prevent duplicate cart entries on rapid clicks
- **Guest order variation labels**: Variation labels are fetched from DB instead of being null in guest order items

### Vehicle Filter & Search UX
- **Filter URL sync**: "Filters wissen" in shop.tsx navigates to clean /webshop URL, removing all query params including vehicleMakeId/vehicleModelId
- **Search autocomplete**: Arrow key (Up/Down) navigation through results with Enter to select, ARIA listbox attributes
- **Kenteken formatting**: Auto-formats Dutch license plates with dashes after 5+ characters (supports all 14 sidecodes)

### SEO & Crawler Optimization
- **Server-side meta injection**: `server/og-middleware.ts` injects page-specific `<title>`, `<meta description>`, canonical URL, and OG tags for all routes. Products get name/description from DB; categories/brands get unique titles; static pages use a predefined map.
- **Category/brand meta**: `/webshop?category=*` and `/webshop?brand=*` URLs get unique titles and descriptions (e.g., "Multimedia & Navigatie Systemen Kopen | Car Audio Limburg") instead of sharing the generic webshop title.
- **Canonical URLs**: Every page gets a `<link rel="canonical">` injected server-side, matching the og:url. Uses `SITE_URL` env var for consistent domain.
- **SEO content injection**: Hidden `<div class="sr-only">` (no aria-hidden) with page-specific H2 + paragraph injected before `<noscript>` for crawlers. Blog articles include "Door Dennis Geenen" author attribution. All SEO headings use `<h2>` to avoid conflicting with the noscript `<h1>`.
- **Privacy/legal nav**: Server-rendered `<nav class="sr-only">` with links to privacy policy, terms, about, and contact injected before `<noscript>` for crawler discoverability.
- **Cache-Control**: HTML pages served through og-middleware include `Cache-Control: public, max-age=300, s-maxage=600`.
- **Blog author**: Default author "Dennis Geenen" shown when `authorId` is null (currently all posts). AuthorBox always renders with fallback author data.
- **Blog images**: Stored as `.webp` copies in `public/blog-images/` to match database references (source files are `.jpg`).
- **About page redirect**: `/about` and `/about-us` redirect 301 to `/over-ons` for E-E-A-T about page detection.
- **Sitemaps**: Dynamic sitemap generation at `/sitemap.xml` with sub-sitemaps (pages, products, categories, blog). Non-existent sitemap variants (`sitemap_index.xml`, `news-sitemap.xml`, etc.) return 404 instead of SPA fallback. Base URL derived from request host or `SITE_URL` env var.
- **HTML structure**: `client/index.html` includes `<main>` landmark, skip-link, and expanded `<noscript>` content (300+ words with product categories, installation info, and full navigation).
- **Compression**: `compression` middleware enabled globally via `server/index.ts`.
- **Google Fonts**: Trimmed from 25+ font families to only Inter (the only font actually used).
- **Viewport**: Removed `maximum-scale=1` to allow pinch-to-zoom (accessibility compliance).
- **Squirrelscan audit**: Production score improved from 43 (F) → 77 (C). Key category scores: Accessibility 100, Mobile 100, Images 100, Analytics 100, Internationalization 100, URL Structure 100, Links 94, Crawlability 93, Security 92, Core SEO 91.

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL.
- **Authentication**: Replit OAuth service.
- **Payment Processing**: Stripe.

### Third-party Services
- **Email**: Resend for transactional emails.
- **Session Storage**: `connect-pg-simple` for PostgreSQL-backed session storage.

### Key Libraries & Frameworks
- **Frontend**: React, TanStack Query, React Hook Form, Zod, shadcn/ui.
- **Backend**: Express.js, Drizzle ORM, Passport.js, Stripe SDK.
- **Styling**: Tailwind CSS.
- **Development**: Vite, TypeScript, ESLint.