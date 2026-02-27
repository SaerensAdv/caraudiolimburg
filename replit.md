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
- **Webhooks**: Handles Stripe webhooks for real-time payment and order status updates.

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