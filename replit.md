# Car Audio Limburg E-commerce & Installation Service

## Overview

This is a full-stack e-commerce application for Car Audio Limburg, combining an online store for car audio equipment with professional installation service booking. The application serves as both a product catalog and customer acquisition platform, targeting customers who want to purchase premium car audio systems with professional installation.

The system handles product sales (Alpine, Audison, OEM upgrades), service bookings with calendar scheduling, quote requests for custom installations, and provides comprehensive admin/CRM capabilities for managing orders, inventory, bookings, and leads.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent UI elements
- **State Management**: TanStack Query for server state, React Hook Form for form state
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Session-based authentication integrated with Replit's OAuth system

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Database ORM**: Drizzle ORM with PostgreSQL (configured for Neon database)
- **API Design**: RESTful API using Express route handlers with Zod validation
- **Session Management**: Express sessions with PostgreSQL storage
- **File Structure**: Monorepo structure with separate client, server, and shared directories

### Database Design
- **Primary Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Structure**: Comprehensive schema including users, products, categories, brands, vehicle compatibility, orders, bookings, quotes, and cart management
- **Relationships**: Well-defined relationships between entities (products-categories, vehicle compatibility, order items)

### Authentication & Authorization
- **Provider**: Replit OAuth integration with passport.js strategy
- **Session Storage**: Database-backed sessions for persistence across requests
- **User Roles**: Role-based access control supporting customer, staff, and admin roles
- **Security**: HTTP-only cookies with secure session management

### Payment Processing
- **Provider**: Stripe integration with support for multiple payment methods
- **Supported Methods**: Credit cards, Bancontact, iDEAL (targeting BE/NL markets)
- **Webhook Handling**: Stripe webhooks for payment confirmation and order processing

### Key Features Architecture
- **E-commerce**: Full product catalog with categories, brands, vehicle compatibility, and shopping cart
- **Booking System**: Calendar-based appointment scheduling for installation services
- **Quote System**: Lead generation through custom quote request forms
- **Vehicle Compatibility**: Dynamic filtering based on vehicle make, model, and year
- **Admin Dashboard**: Comprehensive CRM for managing products, orders, bookings, and customer relationships

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL (configured via DATABASE_URL environment variable)
- **Authentication**: Replit OAuth service for user authentication
- **Payment Processing**: Stripe for payment processing and webhook handling

### Third-party Services
- **Email**: Resend for transactional emails (order confirmations, booking notifications)
- **File Storage**: Local file storage in public directory with optional cloud storage integration
- **Session Storage**: PostgreSQL-backed session storage using connect-pg-simple

### Key Libraries & Frameworks
- **Frontend**: React, TanStack Query, React Hook Form, Zod validation, shadcn/ui components
- **Backend**: Express.js, Drizzle ORM, Passport.js, Stripe SDK
- **Styling**: Tailwind CSS with custom design tokens for brand consistency
- **Development**: Vite, TypeScript, ESLint for development workflow