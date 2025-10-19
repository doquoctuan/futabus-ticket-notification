# GitHub Copilot Instructions

## Project Architecture

**Futabus Ticket Notification** is a full-stack web application that helps users subscribe to bus ticket availability notifications for Vietnamese routes. The system consists of two main components:

- **Backend**: Go API server using Gin framework with PostgreSQL database
- **Frontend**: Next.js 15 application with Auth0 authentication and TailwindCSS

## Key Architectural Patterns

### Backend (Go + Gin + GORM)
- **Single-file API server** (`backend/main.go`) with embedded models and handlers
- **UUID v7 primary keys** with GORM hooks for auto-generation 
- **Unique constraint enforcement** via database indexes for preventing duplicate active subscriptions
- **CORS configuration** specifically allowing `http://localhost:3000` for local development
- **PostgreSQL connection** with fallback to localhost defaults when `DATABASE_URL` not set

### Frontend (Next.js 15 + Auth0)
- **App Router architecture** with server components for authentication flow
- **Auth0 integration** using custom client in `lib/auth0.ts` with explicit scope/audience configuration
- **Route-based authentication** with automatic redirects: home → login (unauthenticated) or dashboard (authenticated)
- **API proxy pattern** where Next.js API routes (`app/api/`) forward to Go backend, injecting user context from Auth0 session

### Data Flow & Integration
- **Vietnamese location data** stored as static JSON (`frontend/data/location_info.json`) with hierarchical structure (level 2 = provinces/cities)
- **Subscription model** includes origin/destination IDs, codes, and names for redundant but performant lookups
- **Datetime handling** converts local timezone input to UTC for storage, avoiding timezone drift

## Development Workflows

### Backend Development
```bash
cd backend
go mod tidy
go run main.go  # Starts on :8080, auto-migrates database
```

### Frontend Development  
```bash
cd frontend
pnpm dev  # Uses --turbopack for faster builds
```

### Database Requirements
- PostgreSQL instance running on localhost:5432 (default)
- Database: `futabus`, User: `postgres`, Password: `ctadmin`
- Auto-migration creates `subscriptions` table with unique constraint

## Project-Specific Conventions

### API Design
- **RESTful endpoints** with user ID extraction from Auth0 session (not URL params for security)
- **Conflict detection** returns 409 status for duplicate active subscriptions
- **Soft delete pattern** via `is_active` boolean rather than physical deletion

### Frontend Patterns
- **Client components** predominant due to Auth0 hooks (`'use client'` directive)
- **Form state management** with manual city lookup from JSON data
- **Error handling** via try-catch with user-friendly Vietnamese messages
- **Datetime coordination** between form inputs and API expects ISO strings

### Code Organization
- **Monolithic backend** - all handlers, models, and DB logic in single file
- **Feature-based frontend** - API routes mirror backend endpoints
- **Static data approach** - location info embedded as JSON rather than database table

## Environment Configuration

### Required Environment Variables
**Backend:**
- `DATABASE_URL` (optional, falls back to localhost PostgreSQL)
- `PORT` (optional, defaults to 8080)

**Frontend:**
- `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` 
- `AUTH0_SCOPE`, `AUTH0_AUDIENCE` (explicitly configured in auth0.ts)
- `BACKEND_URL` (defaults to http://localhost:8080)

## Critical Files for Understanding

- `backend/main.go` - Complete API server with all business logic
- `frontend/app/dashboard/page.tsx` - Main UI with subscription management
- `frontend/app/api/subscriptions/route.ts` - Auth proxy to backend
- `frontend/data/location_info.json` - Vietnamese provinces/cities reference data
- `frontend/lib/auth0.ts` - Auth0 client configuration with explicit parameters