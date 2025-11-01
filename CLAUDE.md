# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Futabus Ticket Notification** is a full-stack monorepo for managing Vietnamese bus ticket availability subscriptions. Users authenticate via Auth0, create subscriptions for specific routes/dates, and receive notifications when tickets become available.

**Architecture**: Separated frontend (Next.js 15) and backend (Go) with PostgreSQL database.

## Development Commands

### Frontend (Next.js 15)
```bash
cd frontend
pnpm install           # Install dependencies
pnpm dev              # Start dev server on :3000 with Turbopack
pnpm build            # Production build with Turbopack
pnpm start            # Start production server
```

### Backend (Go)
```bash
cd backend
go mod download       # Download dependencies
go mod tidy          # Clean up dependencies
go run main.go       # Start REST API on :8080 (original, auto-migrates database)
go run *.go          # Start dual servers: REST (:8080) + gRPC (:50051)
```

### gRPC Code Generation
```bash
# Generate Go code from protobuf
.\proto\generate-go.ps1    # Windows
./proto/generate-go.sh     # Linux/macOS

# Generate TypeScript/JavaScript for gRPC-Web
.\proto\generate-web.ps1   # Windows
./proto/generate-web.sh    # Linux/macOS
```

### Envoy Proxy (for gRPC-Web)
```bash
# Using Docker (recommended for development)
docker run --rm -p 8081:8081 -p 9901:9901 \
  -v $(pwd)/envoy-local.yaml:/etc/envoy/envoy.yaml \
  envoyproxy/envoy:v1.28-latest

# Or use Docker Compose
docker-compose up -d
```

### Database
```bash
# PostgreSQL setup (required before running backend)
createdb futabus
# Or: psql -U postgres -c "CREATE DATABASE futabus;"

# Verify data
psql -U postgres -d futabus -c "SELECT * FROM subscriptions;"
```

## High-Level Architecture

### Dual API Architecture (REST + gRPC)

The backend now supports **two communication protocols**:

1. **REST API** (Port 8080):
   - Original implementation using Gin framework
   - Used by dashboard for CRUD operations
   - Next.js API Routes proxy requests with JWT tokens

2. **gRPC API** (Port 50051):
   - New implementation for subscription details with tickets
   - Used via gRPC-Web from browser through Envoy proxy
   - Shares same JWT authentication via metadata

**gRPC-Web Flow**:
```
Browser (gRPC-Web Client)
  ↓ HTTP/1.1 + Protobuf
Envoy Proxy (:8081)
  ↓ HTTP/2 + gRPC
Go gRPC Server (:50051)
  ↓
PostgreSQL (subscriptions + tickets)
```

### Authentication Flow (Auth0 + JWT)

**REST API Flow:**
1. **Frontend**: User logs in via Auth0 → Session stored with access token
2. **API Routes**: Next.js `/api/*` routes extract token from session → Forward to Go backend
3. **Backend Middleware**: `Auth0JWTMiddleware` validates JWT signature using JWKS public keys from Auth0
4. **User Context**: User ID extracted from JWT claims → Scopes all database queries

**gRPC Flow:**
1. **Frontend**: Client component fetches access token from `/api/auth/me`
2. **gRPC-Web Client**: Adds token to metadata `authorization: Bearer <token>`
3. **Envoy Proxy**: Translates gRPC-Web (HTTP/1.1) to native gRPC (HTTP/2)
4. **gRPC Interceptor**: `UnaryAuthInterceptor` validates JWT with same JWKS
5. **Service Handler**: User ID from context → Query subscription with ticket

**Key Insight**: Frontend and backend share NO secrets. Both REST and gRPC use Auth0's public keys (RS256 asymmetric encryption) for validation.

### Data Flow: Subscription Creation
```
Dashboard UI → Next.js API Route (/api/subscriptions)
  ↓ (extracts access_token from session)
Go Backend (/api/subscriptions)
  ↓ (JWT middleware validates token with JWKS)
PostgreSQL
  ↓ (unique constraint check on user_id + route + date + is_active)
Response → Dashboard refreshes list
```

### Conflict Detection Pattern
- **Unique constraint**: `(user_id, origin_id, destination_id, date_time, is_active)` where `is_active = true`
- **409 Conflict** returned for duplicate active subscriptions
- **Soft delete**: `is_active` flag instead of physical deletion (preserves history)

### Backend File Structure

**Original (Single-file)**: `backend/main.go`
- All REST API logic in one file
- Suitable for simple CRUD operations

**New (Modular with gRPC)**:
- `backend/main.go` - Main entry point, dual server setup, REST routes
- `backend/models.go` - Database models (Subscription, Ticket)
- `backend/grpc_server.go` - gRPC server initialization
- `backend/grpc_service.go` - gRPC service implementation (GetSubscriptionDetail, AttachTicket, DetachTicket)
- `backend/grpc_auth.go` - JWT authentication interceptor for gRPC
- `backend/proto/` - Generated protobuf code

**Rationale**: Modular structure needed for dual-protocol support while keeping each file focused on one concern.

### API Proxy Pattern
Next.js API Routes (`app/api/subscriptions/`) act as proxy layer:
- Extract Auth0 token from server-side session
- Forward requests to Go backend with `Authorization: Bearer <token>`
- Hide backend URL from browser
- Centralize authentication logic

### Vietnamese Location Data
- Static JSON file: `frontend/data/location_info.json` (66 cities/provinces)
- Level 2 locations only (major cities)
- **Why static**: Rarely changes; avoids database table; faster client-side validation

### Datetime Handling
- **Input**: Local timezone with ISO 8601 format (`2025-12-25T08:00:00+07:00`)
- **Storage**: PostgreSQL `timestamptz` (UTC conversion automatic)
- **Validation**: Frontend prevents past dates

## Critical Files to Understand

### Backend (REST)
- **`backend/main.go`**: Main entry point, dual server setup, REST API handlers
- **`backend/go.mod`**: Dependencies (Gin, GORM, JWT, JWKS, gRPC libraries)

### Backend (gRPC)
- **`backend/models.go`**: Database models (Subscription with Ticket relationship)
- **`backend/grpc_server.go`**: gRPC server initialization with auth interceptor
- **`backend/grpc_service.go`**: Service implementation (3 RPC methods)
- **`backend/grpc_auth.go`**: JWT validation interceptor for gRPC metadata
- **`proto/subscription_service.proto`**: Protobuf schema definitions
- **`backend/proto/*.pb.go`**: Generated Go code from protobuf

### Protobuf & Code Generation
- **`proto/subscription_service.proto`**: Service and message definitions
- **`proto/generate-go.ps1|.sh`**: Script to generate Go gRPC stubs
- **`proto/generate-web.ps1|.sh`**: Script to generate TypeScript gRPC-Web stubs

### Frontend (REST API)
- **`frontend/app/dashboard/page.tsx`**: Main UI with subscription CRUD (REST)
- **`frontend/app/api/subscriptions/route.ts`**: GET/POST proxy to backend
- **`frontend/app/api/subscriptions/[id]/route.ts`**: PUT/DELETE proxy
- **`frontend/lib/auth0.ts`**: Auth0 client with explicit scope/audience
- **`frontend/lib/auth-helpers.ts`**: Token extraction utilities
- **`frontend/data/location_info.json`**: Vietnamese cities reference data
- **`frontend/middleware.ts`**: Route protection (redirects to login)

### Frontend (gRPC-Web)
- **`frontend/app/dashboard/subscriptions/[id]/page.tsx`**: Detail page using gRPC
- **`frontend/lib/grpc-client.ts`**: gRPC-Web client initialization
- **`frontend/app/api/auth/me/route.ts`**: Endpoint to get access token for gRPC
- **`frontend/src/proto/*.ts`**: Generated TypeScript code from protobuf

### Infrastructure
- **`backend/k8s/`**: Kubernetes manifests for production deployment (HPA, network policies, secrets)
- **`backend/Dockerfile`**: Multi-stage Alpine build (non-root user, read-only filesystem)
- **`envoy.yaml`**: Envoy proxy config for Docker (gRPC-Web to gRPC translation)
- **`envoy-local.yaml`**: Envoy config for local development
- **`docker-compose.yml`**: Full stack orchestration (PostgreSQL + Backend + Envoy)

## Key Architectural Decisions

### UUID v7 Primary Keys
- Time-ordered (better than UUID v4 for database indexes)
- Generated via GORM `BeforeCreate` hook
- Library: `github.com/gofrs/uuid/v5`

### JWKS Auto-Refresh
- Backend caches Auth0 public keys via `keyfunc` library
- Automatically refreshes on key rotation
- URL: `https://{AUTH0_DOMAIN}/.well-known/jwks.json`

### Middleware Chain (Go)
```go
r.Use(cors.New(config))        // CORS (allows localhost:3000)
r.Use(Auth0JWTMiddleware())     // JWT validation (all routes except /health)
```

### Next.js App Router Patterns
- **Server Components**: Default for layouts
- **Client Components**: Dashboard UI (uses Auth0 hooks with `'use client'`)
- **Middleware**: Edge runtime for fast session checks

### Database Connection Fallback
Backend checks `DATABASE_URL` env var, falls back to individual vars (`DATABASE_HOST`, `DATABASE_USERNAME`, etc.).

## Environment Configuration

### Backend Required Variables
- `AUTH0_DOMAIN`: Auth0 tenant (e.g., `your-tenant.auth0.com`)
- `AUTH0_AUDIENCE`: API identifier (must be `https://futabus-api`)
- `DATABASE_HOST`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `DATABASE_PORT`
- `REST_PORT` (optional, defaults to 8080)
- `GRPC_PORT` (optional, defaults to 50051)

### Frontend Required Variables
- `AUTH0_SECRET`: Session encryption (generate with `openssl rand -hex 32`)
- `AUTH0_BASE_URL`: Application URL (e.g., `http://localhost:3000`)
- `AUTH0_ISSUER_BASE_URL`: Auth0 tenant URL
- `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`: From Auth0 dashboard
- `AUTH0_AUDIENCE`: Must match backend (`https://futabus-api`)
- `AUTH0_SCOPE`: `openid profile email`
- `BACKEND_URL`: Go REST backend URL (defaults to `http://localhost:8080`)
- `NEXT_PUBLIC_GRPC_URL`: Envoy gRPC-Web endpoint (defaults to `http://localhost:8081`)

**Critical**:
- `AUTH0_AUDIENCE` must be identical in frontend `.env.local` and backend `.env` for token validation to work
- `NEXT_PUBLIC_GRPC_URL` must point to Envoy proxy, not directly to gRPC server

## Common Development Scenarios

### Running Full Stack Locally (REST Only)
1. Start PostgreSQL: `createdb futabus`
2. Start backend: `cd backend && go run main.go`
3. Start frontend: `cd frontend && pnpm dev`
4. Open http://localhost:3000

### Running Full Stack with gRPC-Web
1. Start PostgreSQL: `createdb futabus`
2. Start backend with gRPC: `cd backend && go run *.go`
3. Start Envoy proxy:
   ```bash
   docker run --rm -p 8081:8081 -p 9901:9901 \
     -v $(pwd)/envoy-local.yaml:/etc/envoy/envoy.yaml \
     envoyproxy/envoy:v1.28-latest
   ```
4. Start frontend: `cd frontend && pnpm dev`
5. Open http://localhost:3000/dashboard
6. Click "View Details" on a subscription to see gRPC in action

### Running with Docker Compose
```bash
# Create .env file with AUTH0_DOMAIN and AUTH0_AUDIENCE
docker-compose up -d

# Services:
# - PostgreSQL: localhost:5432
# - Backend REST: localhost:8080
# - Backend gRPC: localhost:50051
# - Envoy (gRPC-Web): localhost:8081
# - Envoy Admin: localhost:9901
```

### Testing API Manually
```bash
# Get token from browser DevTools → Network → Authorization header
TOKEN="eyJhbGc..."

# Test backend directly
curl http://localhost:8080/api/subscriptions/auth0|123456 \
  -H "Authorization: Bearer $TOKEN"
```

### Database Schema Inspection
Backend auto-migrates on startup. Check schema:
```bash
psql -U postgres -d futabus -c "\d subscriptions"
```

### Verifying Auth0 JWKS
```bash
curl https://your-tenant.auth0.com/.well-known/jwks.json
```

## Alternative Implementations

### Server Actions (Optional)
- **Directory**: `frontend/app/dashboard-server-actions/`
- **Purpose**: Alternative to API Routes using Next.js Server Actions
- **Docs**: `frontend/SERVER_ACTIONS.md`
- **Trade-off**: Simpler code but less explicit API contract

## Kubernetes Deployment

Production manifests in `backend/k8s/`:
- **Deployment**: Go backend with health probes, resource limits, non-root user
- **StatefulSet**: PostgreSQL with persistent volume
- **Ingress**: HTTP routing
- **HPA**: Auto-scaling (1-3 replicas)
- **NetworkPolicy**: Pod-to-pod traffic restrictions
- **PodDisruptionBudget**: Ensures availability during updates

**Security features**: Read-only filesystem, dropped capabilities, non-root UID 1000, secrets management.

## Testing & Validation

### Frontend Validation
- Origin ≠ Destination
- Date ≥ Today
- Required fields (email, cities, date/time)

### Backend Validation
- JWT signature verification
- Token expiration check
- Audience/issuer validation
- Unique constraint enforcement (409 Conflict on duplicates)

### Health Check
Backend exposes `/api/health` (no auth required):
```bash
curl http://localhost:8080/api/health
# {"status":"healthy"}
```

## Debugging Common Issues

### "No access token in session"
→ Add `AUTH0_AUDIENCE=https://futabus-api` to `frontend/.env.local`

### "Invalid audience" or "Invalid issuer"
→ Verify `AUTH0_AUDIENCE` matches in both frontend and backend `.env` files

### "Failed to initialize JWKS"
→ Check `AUTH0_DOMAIN` is correct and test: `curl https://{domain}/.well-known/jwks.json`

### Database connection failed
→ Verify PostgreSQL running: `pg_isready` and test: `psql -U postgres -d futabus -c "SELECT 1;"`

## Dependencies Version Notes

### Frontend
- Next.js 15.5.6 (App Router, Turbopack)
- React 19 (latest)
- TailwindCSS 4.x
- @auth0/nextjs-auth0 4.11.0
- TypeScript 5.x

### Backend
- Go 1.21+
- Gin 1.9.1
- GORM 1.25.5
- golang-jwt/jwt 5.3.0
- MicahParks/keyfunc 3.7.0 (JWKS client)
- gofrs/uuid 5.0.0 (UUID v7)

## gRPC Implementation Details

### Ticket Model
New database table `tickets` with foreign key to `subscriptions`:
- Stores bus ticket information (seat, price, booking status, QR code)
- One-to-one relationship with subscriptions
- Auto-migrated when backend starts with gRPC enabled

### gRPC Services
Three RPC methods in `SubscriptionService`:
1. **GetSubscriptionDetail**: Fetch subscription with attached ticket
2. **AttachTicket**: Add ticket information to subscription
3. **DetachTicket**: Remove ticket from subscription

### Why gRPC-Web + Envoy?
- **Type Safety**: Protobuf enforces schema between frontend/backend
- **Performance**: Binary protocol faster than JSON for complex objects
- **Future-proof**: Can add streaming RPCs for real-time updates
- **Browser Compatible**: gRPC-Web allows direct browser calls (no Server Actions needed)
- **Envoy**: Industry-standard proxy for gRPC-Web translation

### Testing gRPC
```bash
# Using grpcurl (install from https://github.com/fullstorydev/grpcurl)
grpcurl -plaintext \
  -H "authorization: Bearer $TOKEN" \
  -d '{"subscription_id": "uuid"}' \
  localhost:50051 \
  futabus.SubscriptionService/GetSubscriptionDetail

# Envoy admin interface
curl http://localhost:9901/stats
```

## Additional Documentation

- `GRPC_IMPLEMENTATION.md`: Complete gRPC-Web implementation guide
- `frontend/FRONTEND_SETUP.md`: Frontend gRPC client setup
- `backend/MAIN_GO_UPDATES.md`: Changes needed to support dual servers
- `QUICKSTART_AUTH.md`: Auth0 setup guide
- `backend/AUTH0_JWT.md`: JWT verification architecture
- `backend/KUBERNETES.md`: Kubernetes deployment details
- `frontend/SERVER_ACTIONS.md`: Server Actions implementation guide
- `IMPLEMENTATION_SUMMARY.md`: Development notes
