# Futabus Ticket Notification - Backend API

A Go REST API server for managing bus ticket availability subscriptions using Gin framework with CockroachDB database.

## 🚀 Features

- **RESTful API** for subscription management
- **UUID v7 primary keys** with automatic generation
- **Duplicate prevention** via unique constraints for active subscriptions
- **CockroachDB integration** with GORM ORM
- **CORS support** for frontend integration
- **Environment configuration** via `.env` file support
- **Auto-migration** of database schema

## 🛠️ Tech Stack

- **Go 1.21+**
- **Gin Web Framework** - HTTP router and middleware
- **GORM** - ORM for database operations
- **CockroachDB** - Distributed SQL database
- **UUID v5** - For generating UUID v7 identifiers

## 📋 Prerequisites

- Go 1.21 or higher
- CockroachDB instance (cloud or local)
- PowerShell (for running scripts on Windows)

## ⚙️ Environment Setup

1. **Clone the repository and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   go mod tidy
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the database credentials in `.env`:
   ```env
   DATABASE_HOST=your-cockroach-host
   DATABASE_USERNAME=your-username
   DATABASE_PASSWORD=your-password
   DATABASE_NAME=your-database
   DATABASE_PORT=26257
   PORT=8080
   GIN_MODE=debug
   ```

## 🚀 Running the Application

### Option 1: Using PowerShell Script (Recommended)
```powershell
./run.ps1
```

### Option 2: Manual Environment Setup
```powershell
# Set environment variables
$env:DATABASE_HOST="your-host"
$env:DATABASE_USERNAME="your-username"
$env:DATABASE_PASSWORD="your-password"
$env:DATABASE_NAME="your-database"
$env:DATABASE_PORT="26257"
$env:PORT="8080"

# Run the application
go run main.go
```

### Option 3: Direct Run (uses fallback values)
```bash
go run main.go
```

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/subscriptions` | Create a new subscription |
| `GET` | `/api/subscriptions/:userId` | Get user's subscriptions |
| `PUT` | `/api/subscriptions/:id` | Update subscription |
| `DELETE` | `/api/subscriptions/:id` | Delete subscription |
| `GET` | `/api/health` | Health check endpoint |

### API Request Examples

**Create Subscription:**
```bash
curl -X POST http://localhost:8080/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "email": "user@example.com",
    "origin_id": 1,
    "origin_code": "SGN",
    "destination_id": 2,
    "destination_code": "HAN",
    "date_time": "2024-12-25T08:00:00Z"
  }'
```

**Get User Subscriptions:**
```bash
curl http://localhost:8080/api/subscriptions/user123
```

**Health Check:**
```bash
curl http://localhost:8080/api/health
```

## 🗄️ Database Schema

### Subscriptions Table
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key (UUID v7) |
| `user_id` | String | User identifier from Auth0 |
| `email` | String | User email address |
| `origin_id` | Integer | Origin location ID |
| `origin_code` | String | Origin location code |
| `destination_id` | Integer | Destination location ID |
| `destination_code` | String | Destination location code |
| `date_time` | Timestamp | Travel date and time (UTC) |
| `is_active` | Boolean | Subscription status |
| `created_at` | Integer | Creation timestamp |
| `updated_at` | Integer | Last update timestamp |

### Unique Constraints
- Prevents duplicate active subscriptions for same route and datetime
- Index: `unique_active_subscription` on `(user_id, origin_id, destination_id, date_time, is_active)` WHERE `is_active = true`

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_HOST` | CockroachDB host | - | ✅ |
| `DATABASE_USERNAME` | Database username | - | ✅ |
| `DATABASE_PASSWORD` | Database password | - | ✅ |
| `DATABASE_NAME` | Database name | - | ✅ |
| `DATABASE_PORT` | Database port | `26257` | ✅ |
| `PORT` | Server port | `8080` | ❌ |
| `GIN_MODE` | Gin mode (debug/release/test) | `debug` | ❌ |

### CORS Configuration
- Allows requests from `http://localhost:3000` (frontend)
- Supports credentials for Auth0 integration
- Allows `Origin`, `Content-Type`, and `Authorization` headers

## 🏗️ Architecture

### Project Structure
```
backend/
├── main.go              # Main application with embedded models and handlers
├── go.mod              # Go module dependencies
├── run.ps1             # PowerShell script to load .env and run
├── .env                # Environment variables (gitignored)
├── .env.example        # Environment variables template
└── README.md           # This file
```

### Key Design Decisions
- **Single-file architecture** - All models, handlers, and database logic in `main.go`
- **UUID v7 for primary keys** - Time-ordered UUIDs for better performance
- **Soft delete pattern** - Uses `is_active` flag instead of physical deletion
- **Conflict detection** - Returns 409 status for duplicate active subscriptions
- **Auto-migration** - Database schema is automatically created/updated on startup

## 🛡️ Security Features

- **CORS protection** with specific origin allowlist
- **Input validation** via Gin's JSON binding
- **SQL injection protection** via GORM's parameterized queries
- **Environment-based configuration** to avoid hardcoded credentials

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Failed**
- Verify CockroachDB credentials in `.env`
- Ensure database is accessible from your network
- Check if the database name exists

**2. Port Already in Use**
- Change `PORT` in `.env` file
- Kill existing processes using the port

**3. CORS Errors**
- Ensure frontend is running on `http://localhost:3000`
- Check CORS configuration in `main.go`

**4. Slow SQL Warnings**
- These are normal for CockroachDB initial setup
- Database indexes are being created automatically
- Performance improves after initial migration

## 📝 Development

### Adding New Endpoints
1. Define handler function in `main.go`
2. Add route to the API group in `main()`
3. Update this README with new endpoint documentation

### Database Changes
1. Modify the `Subscription` struct in `main.go`
2. GORM will auto-migrate changes on next startup
3. For complex migrations, consider manual SQL in `initDB()`

## 🔗 Integration

This backend is designed to work with:
- **Frontend**: Next.js application with Auth0 authentication
- **Database**: CockroachDB (cloud or self-hosted)
- **Authentication**: Auth0 (user ID extraction handled by frontend API proxy)