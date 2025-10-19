# 🚀 Quick Start: Auth0 JWT Authentication

## Prerequisites
- Auth0 account
- Go 1.21+
- Node.js 18+

## Setup Steps

### 1️⃣ Auth0 Configuration

#### Create API
```
1. Go to Auth0 Dashboard → Applications → APIs
2. Click "Create API"
   - Name: Futabus API
   - Identifier: https://futabus-api
   - Signing Algorithm: RS256
3. Save the Identifier (use as AUTH0_AUDIENCE)
```

#### Configure Application
```
1. Go to Auth0 Dashboard → Applications → Your App
2. Settings tab:
   - Allowed Callback URLs: http://localhost:3000/auth/callback
   - Allowed Logout URLs: http://localhost:3000
   - Allowed Web Origins: http://localhost:3000
3. APIs tab:
   - Enable "Futabus API"
   - Grant Types: ✅ Authorization Code, ✅ Refresh Token
```

### 2️⃣ Backend Setup

#### Install Dependencies
```bash
cd backend
go mod tidy
```

#### Configure Environment
```bash
# Copy example
cp .env.example .env

# Edit .env
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://futabus-api

DATABASE_HOST=localhost
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-password
DATABASE_NAME=futabus
DATABASE_PORT=5432
PORT=8080
```

#### Run Backend
```bash
go run main.go
```

Expected output:
```
Auth0 Domain: your-tenant.auth0.com
Auth0 Audience: https://futabus-api
Initializing JWKS from: https://your-tenant.auth0.com/.well-known/jwks.json
JWKS initialized successfully
Server starting on port 8080 with Auth0 JWT authentication
```

### 3️⃣ Frontend Setup

#### Configure Environment
```bash
cd frontend

# Create .env.local
cat > .env.local << EOF
# Auth0 Configuration
AUTH0_SECRET='use-openssl-rand-hex-32'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-tenant.auth0.com'
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'

# ⚠️ IMPORTANT: Must match backend
AUTH0_AUDIENCE='https://futabus-api'
AUTH0_SCOPE='openid profile email'

# Backend URL
BACKEND_URL='http://localhost:8080'
EOF
```

#### Install Dependencies
```bash
pnpm install
```

#### Run Frontend
```bash
pnpm dev
```

### 4️⃣ Test Authentication

#### Manual Test
1. Open http://localhost:3000
2. Click "Login"
3. Login with Auth0
4. Go to Dashboard
5. Create a subscription
6. Check backend logs:
```
[GIN] 2024/01/01 - 10:00:00 | 201 |     123.456ms |       127.0.0.1 | POST     "/api/subscriptions"
```

#### Test Token Flow
```bash
# 1. Login in browser and open DevTools → Network tab
# 2. Find any /api/ request
# 3. Copy Authorization header value:
TOKEN="eyJhbGc..."

# 4. Test backend directly:
curl http://localhost:8080/api/subscriptions/auth0|123456 \
  -H "Authorization: Bearer $TOKEN"
```

#### Expected Response
```json
[
  {
    "id": "01939abc-def0-7890-1234-56789abcdef0",
    "user_id": "auth0|123456",
    "email": "user@example.com",
    "origin_id": 1,
    "origin_code": "SGN",
    "destination_id": 2,
    "destination_code": "HAN",
    "date_time": "2024-12-25T08:00:00Z",
    "is_active": true
  }
]
```

## 🐛 Common Issues

### Issue: "No access token in session"
```bash
# Frontend .env.local missing AUTH0_AUDIENCE
✅ Add: AUTH0_AUDIENCE='https://futabus-api'
```

### Issue: "Invalid audience"
```bash
# Backend and frontend audience mismatch
✅ Ensure both have same AUTH0_AUDIENCE value
```

### Issue: "Failed to initialize JWKS"
```bash
# Wrong AUTH0_DOMAIN or no internet
✅ Check: curl https://your-tenant.auth0.com/.well-known/jwks.json
```

### Issue: "Missing authorization header"
```bash
# Frontend not sending token
✅ Check: session.tokenSet.accessToken is available
✅ Verify: AUTH0_AUDIENCE in frontend .env.local
```

## ✅ Verification Checklist

Backend:
- [ ] `go run main.go` starts without errors
- [ ] Logs show "JWKS initialized successfully"
- [ ] Can access http://localhost:8080/api/health

Frontend:
- [ ] `pnpm dev` starts successfully
- [ ] Can login with Auth0
- [ ] Dashboard shows user email
- [ ] Can create subscriptions
- [ ] Can toggle active/inactive
- [ ] Can delete subscriptions

Authentication:
- [ ] Backend logs show JWT validation success
- [ ] Requests without token return 401
- [ ] Expired tokens return 401
- [ ] Wrong audience returns 401

## 📚 Next Steps

- Read [AUTH0_JWT.md](./AUTH0_JWT.md) for detailed architecture
- Implement refresh token handling
- Add custom claims for roles/permissions
- Set up production environment variables
- Configure Auth0 production tenant
