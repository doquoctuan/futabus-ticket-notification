# 🚌 Futabus Ticket Notification

A full-stack web application that helps users subscribe to bus ticket availability notifications for Vietnamese routes operated by Futabus.

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go)](https://golang.org/)
[![Auth0](https://img.shields.io/badge/Auth0-JWT-EB5424?logo=auth0)](https://auth0.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-316192?logo=postgresql)](https://www.postgresql.org/)

## 🎯 Features

- 🔐 **Secure Authentication** - Auth0 integration with JWT token verification
- 🎫 **Subscription Management** - Create, update, toggle, and delete notifications
- 🌍 **Vietnamese Routes** - Support for major cities and provinces in Vietnam
- ⏰ **Date/Time Selection** - Schedule notifications for specific travel dates and times
- 🔄 **Real-time Updates** - Auto-refresh subscription list after changes
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🛡️ **Secure API** - Backend validates all requests with Auth0 JWT tokens

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Next.js 15 Frontend                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Auth0 SDK (Login/Logout/Session)                      │  │
│  │  • Dashboard UI (React + TailwindCSS)                    │  │
│  │  • API Routes (Proxy to Backend)                         │  │
│  │  • Server Actions (Optional alternative)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP + JWT Token
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Go Backend (Gin)                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • JWT Middleware (Auth0 Token Verification)             │  │
│  │  • JWKS Integration (Auto-refresh public keys)           │  │
│  │  • RESTful API (CRUD Subscriptions)                      │  │
│  │  • GORM ORM (Database operations)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ SQL
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Subscriptions Table (UUID v7 primary keys)            │  │
│  │  • Unique Constraints (Prevent duplicate subscriptions)  │  │
│  │  • Indexes (Optimized queries)                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                         ▲
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Auth0 (Authentication)                       │
│  • User Management                                              │
│  • JWT Token Generation                                         │
│  • JWKS Endpoint (Public Keys)                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Auth:** @auth0/nextjs-auth0 SDK
- **Styling:** TailwindCSS
- **HTTP Client:** Native Fetch API
- **Package Manager:** pnpm

### Backend
- **Language:** Go 1.21+
- **Framework:** Gin (HTTP router)
- **ORM:** GORM
- **Database Driver:** PostgreSQL
- **Auth:** JWT verification with Auth0 JWKS
- **UUID:** UUID v7 for primary keys

### Database
- **Engine:** PostgreSQL 16+
- **Features:** JSONB, Indexes, Unique Constraints

### Authentication
- **Provider:** Auth0
- **Method:** JWT (RS256 signing algorithm)
- **Flow:** Authorization Code + Refresh Token

## 📦 Project Structure

```
futabus-ticket-notification/
├── backend/                      # Go backend service
│   ├── main.go                  # Single-file API server
│   ├── go.mod                   # Go dependencies
│   ├── .env.example             # Environment template
│   ├── AUTH0_JWT.md             # JWT authentication docs
│   └── README.md                # Backend-specific docs
│
├── frontend/                     # Next.js frontend
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── dashboard/          # Main app UI
│   │   │   └── page.tsx
│   │   ├── dashboard-server-actions/  # Alternative with Server Actions
│   │   │   └── page.tsx
│   │   ├── api/                # API Routes (proxy to backend)
│   │   │   └── subscriptions/
│   │   │       ├── route.ts    # GET, POST
│   │   │       └── [id]/
│   │   │           └── route.ts # PUT, DELETE
│   │   └── actions/            # Server Actions
│   │       └── subscriptions.ts
│   ├── lib/
│   │   ├── auth0.ts            # Auth0 client config
│   │   └── auth-helpers.ts     # Token utilities
│   ├── data/
│   │   └── location_info.json  # Vietnamese cities/provinces
│   ├── middleware.ts           # Auth middleware
│   ├── .env.example            # Environment template
│   ├── SERVER_ACTIONS.md       # Server Actions guide
│   └── README.md               # Frontend-specific docs
│
├── .github/
│   └── copilot-instructions.md # GitHub Copilot context
│
├── QUICKSTART_AUTH.md          # Quick authentication setup
├── IMPLEMENTATION_SUMMARY.md    # Implementation details
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm**
- **Go** 1.21+
- **PostgreSQL** 16+
- **Auth0 Account** (free tier works)

### 1. Clone Repository

```bash
git clone https://github.com/doquoctuan/futabus-ticket-notification.git
cd futabus-ticket-notification
```

### 2. Setup Auth0

1. Create an Auth0 account at https://auth0.com
2. Create a new **API**:
   - Name: `Futabus API`
   - Identifier: `https://futabus-api` ← **Important: Use this exact value**
   - Signing Algorithm: `RS256`
3. Create/Configure your **Application**:
   - Type: Regular Web Application
   - Allowed Callback URLs: `http://localhost:3000/auth/callback`
   - Allowed Logout URLs: `http://localhost:3000`
   - Allowed Web Origins: `http://localhost:3000`
4. In Application → APIs tab:
   - Enable "Futabus API"
   - Grant Types: ✅ Authorization Code, ✅ Refresh Token

### 3. Setup Database

```bash
# Using PostgreSQL
createdb futabus

# Or with custom user
psql -U postgres -c "CREATE DATABASE futabus;"
```

### 4. Backend Setup

```bash
cd backend

# Install dependencies
go mod download

# Create .env file
cat > .env << EOF
# Auth0 Configuration
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://futabus-api

# Database Configuration
DATABASE_HOST=localhost
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-password
DATABASE_NAME=futabus
DATABASE_PORT=5432

# Server
PORT=8080
EOF

# Run backend
go run main.go
```

**Expected output:**
```
Auth0 Domain: your-tenant.auth0.com
Auth0 Audience: https://futabus-api
Initializing JWKS from: https://your-tenant.auth0.com/.well-known/jwks.json
JWKS initialized successfully
Server starting on port 8080 with Auth0 JWT authentication
```

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Create .env.local file
cat > .env.local << EOF
# Auth0 Configuration
AUTH0_SECRET='use-openssl-rand-hex-32'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-tenant.auth0.com'
AUTH0_CLIENT_ID='your-auth0-client-id'
AUTH0_CLIENT_SECRET='your-auth0-client-secret'
AUTH0_AUDIENCE='https://futabus-api'
AUTH0_SCOPE='openid profile email'

# Backend API
BACKEND_URL='http://localhost:8080'
EOF

# Run frontend
pnpm dev
```

### 6. Access Application

Open http://localhost:3000 in your browser and login with Auth0!

## 📚 Documentation

- **[QUICKSTART_AUTH.md](./QUICKSTART_AUTH.md)** - Step-by-step authentication setup
- **[backend/AUTH0_JWT.md](./backend/AUTH0_JWT.md)** - JWT verification architecture
- **[frontend/SERVER_ACTIONS.md](./frontend/SERVER_ACTIONS.md)** - Server Actions implementation
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Development notes

## 🔐 Security Features

### Authentication & Authorization
- ✅ Auth0 OAuth 2.0 / OpenID Connect
- ✅ JWT token verification with RS256 signature
- ✅ JWKS auto-refresh for key rotation
- ✅ Token expiration validation
- ✅ Issuer and audience verification
- ✅ User session management

### Backend Security
- ✅ JWT middleware on all protected routes
- ✅ CORS configuration (localhost in dev)
- ✅ No shared secrets between frontend/backend
- ✅ Public key cryptography (Auth0 JWKS)

### Database Security
- ✅ UUID v7 primary keys (sortable, unique)
- ✅ Unique constraints prevent duplicates
- ✅ Parameterized queries (SQL injection protection)
- ✅ User-scoped queries (data isolation)

## 🌟 Key Features Detail

### Subscription Management
- **Create:** Add new route notifications with date/time
- **Read:** View all active and inactive subscriptions
- **Update:** Toggle active/inactive status
- **Delete:** Remove subscriptions permanently

### Route Selection
- **66 Vietnamese Cities/Provinces** from static JSON data
- **Level 2 locations** (major cities only)
- **Validation:** Prevents origin = destination

### Date/Time Handling
- **Local timezone** input with UTC storage
- **ISO 8601** format with timezone offset
- **Min date:** Current date (no past dates)
- **Optional time:** Defaults to 00:00 if not specified

### Conflict Detection
- **Unique constraint** on (user_id, origin_id, destination_id, date_time, is_active)
- **409 Conflict** response for duplicate active subscriptions
- **Soft delete pattern** via is_active flag

## 🧪 Testing

### Manual Testing
```bash
# 1. Start backend
cd backend && go run main.go

# 2. Start frontend
cd frontend && pnpm dev

# 3. Open http://localhost:3000
# 4. Login with Auth0
# 5. Create a subscription
# 6. Verify in PostgreSQL:
psql -U postgres -d futabus -c "SELECT * FROM subscriptions;"
```

### API Testing with cURL
```bash
# Get JWT token from browser (DevTools → Network → Authorization header)
TOKEN="eyJhbGc..."

# Test GET
curl http://localhost:8080/api/subscriptions/auth0|123456 \
  -H "Authorization: Bearer $TOKEN"

# Test POST
curl http://localhost:8080/api/subscriptions \
  -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "auth0|123456",
    "email": "user@example.com",
    "origin_id": 1,
    "origin_code": "SGN",
    "destination_id": 2,
    "destination_code": "HAN",
    "date_time": "2025-12-25T08:00:00+07:00"
  }'
```

### Health Check
```bash
# Backend health (no auth required)
curl http://localhost:8080/api/health
# Expected: {"status":"healthy"}
```

## 🔧 Configuration

### Environment Variables

#### Backend (`.env`)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `AUTH0_DOMAIN` | ✅ | Auth0 tenant domain | `your-tenant.auth0.com` |
| `AUTH0_AUDIENCE` | ✅ | Auth0 API identifier | `https://futabus-api` |
| `DATABASE_HOST` | ✅ | PostgreSQL host | `localhost` |
| `DATABASE_USERNAME` | ✅ | Database user | `postgres` |
| `DATABASE_PASSWORD` | ✅ | Database password | `your-password` |
| `DATABASE_NAME` | ✅ | Database name | `futabus` |
| `DATABASE_PORT` | ✅ | Database port | `5432` |
| `PORT` | ❌ | Server port | `8080` (default) |

#### Frontend (`.env.local`)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `AUTH0_SECRET` | ✅ | Session encryption key | Generate with `openssl rand -hex 32` |
| `AUTH0_BASE_URL` | ✅ | Application URL | `http://localhost:3000` |
| `AUTH0_ISSUER_BASE_URL` | ✅ | Auth0 tenant URL | `https://your-tenant.auth0.com` |
| `AUTH0_CLIENT_ID` | ✅ | Auth0 application client ID | From Auth0 dashboard |
| `AUTH0_CLIENT_SECRET` | ✅ | Auth0 application secret | From Auth0 dashboard |
| `AUTH0_AUDIENCE` | ✅ | API identifier (must match backend) | `https://futabus-api` |
| `AUTH0_SCOPE` | ✅ | OpenID scopes | `openid profile email` |
| `BACKEND_URL` | ❌ | Backend API URL | `http://localhost:8080` |

## 🐛 Troubleshooting

### "No access token in session"
**Cause:** `AUTH0_AUDIENCE` not set in frontend  
**Fix:** Add `AUTH0_AUDIENCE=https://futabus-api` to `.env.local`

### "Invalid audience"
**Cause:** Backend and frontend audience mismatch  
**Fix:** Ensure both use same `AUTH0_AUDIENCE` value

### "Failed to initialize JWKS"
**Cause:** Wrong `AUTH0_DOMAIN` or network issue  
**Fix:** Verify domain and test: `curl https://your-tenant.auth0.com/.well-known/jwks.json`

### "Missing authorization header"
**Cause:** Frontend not sending token  
**Fix:** Check Auth0 API is enabled in application settings

### Database connection failed
**Cause:** PostgreSQL not running or wrong credentials  
**Fix:** 
```bash
# Check PostgreSQL status
pg_isready

# Test connection
psql -U postgres -d futabus -c "SELECT 1;"
```

## 🚧 Roadmap

### Planned Features
- [ ] Email notifications when tickets become available
- [ ] SMS notifications (Twilio integration)
- [ ] Webhook for ticket availability checks
- [ ] Admin dashboard for monitoring
- [ ] User preferences (notification frequency)
- [ ] Multiple routes per subscription
- [ ] Price alerts
- [ ] Seat availability tracking

### Technical Improvements
- [ ] Add unit tests (Go + Jest)
- [ ] Integration tests
- [ ] Docker Compose setup
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Production deployment guide (Vercel + Railway)
- [ ] Rate limiting
- [ ] Request logging & monitoring
- [ ] Caching layer (Redis)
- [ ] Background job queue

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**doquoctuan**
- GitHub: [@doquoctuan](https://github.com/doquoctuan)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Auth0](https://auth0.com/) - Authentication platform
- [Gin](https://gin-gonic.com/) - Go web framework
- [GORM](https://gorm.io/) - Go ORM
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- Vietnamese location data from public sources

## 📞 Support

For issues and questions:
- 💬 GitHub Issues: [Create an issue](https://github.com/doquoctuan/futabus-ticket-notification/issues)

---

Made with ❤️ for Vietnamese bus travelers
