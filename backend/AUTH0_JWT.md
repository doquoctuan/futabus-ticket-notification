# Auth0 JWT Authentication Implementation

## 🔐 Overview

Backend đã được implement **Auth0 JWT Token verification** để authenticate requests từ frontend một cách an toàn.

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐         ┌──────────┐
│   Browser   │────────>│   Next.js    │────────>│  Go Backend  │────────>│  Auth0   │
│             │         │  API Routes  │         │              │         │   JWKS   │
└─────────────┘         └──────────────┘         └──────────────┘         └──────────┘
                                │                        │
                                │  Auth0 Session         │  Verify JWT
                                │  (with access_token)   │  with JWKS
                                │                        │
                                └────────────────────────┘
```

## 🔑 How It Works

### 1. **User Login (Auth0)**
- User đăng nhập qua Auth0
- Auth0 returns: `id_token` + `access_token` + `refresh_token`
- Next.js lưu session với tokens

### 2. **Frontend → Backend Request**
```typescript
// Next.js API Route
const session = await auth0.getSession();
const accessToken = session.tokenSet.accessToken; // JWT token

await fetch(`${BACKEND_URL}/api/subscriptions`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});
```

### 3. **Backend JWT Verification**
```go
// Go Backend Middleware
1. Extract token from "Authorization: Bearer <token>" header
2. Fetch JWKS from Auth0: https://{domain}/.well-known/jwks.json
3. Verify token signature using public key from JWKS
4. Validate claims:
   - Issuer: https://{AUTH0_DOMAIN}/
   - Audience: {AUTH0_AUDIENCE}
   - Expiration: token.exp > now
5. Extract user_id from token.sub
```

## 📦 Backend Implementation

### Dependencies Added
```go
github.com/golang-jwt/jwt/v5          // JWT parsing and validation
github.com/MicahParks/keyfunc/v3      // JWKS (JSON Web Key Set) handling
```

### Key Components

**1. JWKS Initialization**
```go
func initJWKS() error {
    jwksURL := fmt.Sprintf("https://%s/.well-known/jwks.json", auth0Domain)
    jwks, err = keyfunc.NewDefaultCtx(context.Background(), []string{jwksURL})
    // Auto-refreshes keys periodically
}
```

**2. JWT Middleware**
```go
func Auth0JWTMiddleware() gin.HandlerFunc {
    // 1. Extract token from Authorization header
    // 2. Parse & validate JWT with JWKS
    // 3. Verify issuer & audience
    // 4. Store user_id in gin.Context
}
```

**3. Protected Routes**
```go
r.Use(Auth0JWTMiddleware()) // All /api/* routes except /api/health

// Handlers can access user info:
// userID := c.GetString("user_id")
```

## 🌐 Frontend Implementation

### API Routes Updated
All frontend API routes now extract and forward `access_token`:

```typescript
// app/api/subscriptions/route.ts
const session = await auth0.getSession();
const accessToken = session.tokenSet.accessToken as string;

await fetch(`${BACKEND_URL}/api/subscriptions`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});
```

### Helper Utility
```typescript
// lib/auth-helpers.ts
export async function getAccessToken(): Promise<string | null>
export async function createAuthHeaders(): Promise<Record<string, string>>
```

## ⚙️ Configuration

### Backend (.env)
```bash
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://your-api-identifier  # API Identifier from Auth0
DATABASE_HOST=localhost
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-password
DATABASE_NAME=futabus
DATABASE_PORT=5432
PORT=8080
```

### Frontend (.env.local)
```bash
# Auth0 SDK config
AUTH0_SECRET='your-long-secret-string'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-tenant.auth0.com'
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'

# IMPORTANT: Must include audience to get access_token
AUTH0_AUDIENCE='https://your-api-identifier'  # Same as backend
AUTH0_SCOPE='openid profile email'

# Backend URL
BACKEND_URL='http://localhost:8080'
```

## 🎯 Auth0 Dashboard Setup

### 1. Create API
```
Auth0 Dashboard → Applications → APIs → Create API

Name: Futabus API
Identifier: https://futabus-api  (use as AUTH0_AUDIENCE)
Signing Algorithm: RS256
```

### 2. Configure Application
```
Auth0 Dashboard → Applications → Your App → Settings

Allowed Callback URLs: http://localhost:3000/auth/callback
Allowed Logout URLs: http://localhost:3000
Allowed Web Origins: http://localhost:3000
```

### 3. Enable API Access
```
Auth0 Dashboard → Applications → Your App → APIs

Enable your API
Grant types: Authorization Code, Refresh Token
```

## 🔍 Token Structure

### Access Token (JWT)
```json
{
  "iss": "https://your-tenant.auth0.com/",
  "sub": "auth0|123456789",
  "aud": ["https://futabus-api"],
  "iat": 1697731200,
  "exp": 1697817600,
  "scope": "openid profile email"
}
```

### Verification Flow
```
1. Backend receives: "Bearer eyJhbGc..."
2. Decodes JWT header → get "kid" (key ID)
3. Fetches JWKS from Auth0
4. Finds matching public key using "kid"
5. Verifies signature with public key
6. Validates issuer, audience, expiration
7. Extracts sub (user_id) → stores in context
```

## 🛡️ Security Benefits

| Feature | Implementation |
|---------|----------------|
| **Token Signing** | RS256 (asymmetric) - Auth0 signs with private key |
| **Token Verification** | Backend verifies with Auth0's public key (JWKS) |
| **No Shared Secrets** | Frontend never sees signing keys |
| **Auto Key Rotation** | JWKS auto-refreshes from Auth0 |
| **Expiration** | Tokens expire (default: 24h) |
| **Issuer Validation** | Only accepts tokens from your Auth0 tenant |
| **Audience Validation** | Only accepts tokens for your API |

## 🧪 Testing

### 1. Check Token in Browser
```javascript
// In browser console after login:
fetch('/api/subscriptions')
  .then(r => r.json())
  .then(console.log)
```

### 2. Test Backend Directly (fails without token)
```bash
curl http://localhost:8080/api/subscriptions/user123
# Response: {"error":"Missing authorization header"}
```

### 3. Test with Token
```bash
# Get token from browser Network tab
TOKEN="eyJhbGc..."

curl http://localhost:8080/api/subscriptions/auth0|123 \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Check Logs
```bash
# Backend logs
Server starting on port 8080 with Auth0 JWT authentication
JWKS initialized successfully
Auth0 Domain: your-tenant.auth0.com
Auth0 Audience: https://futabus-api
```

## 🐛 Troubleshooting

### "No access token in session"
**Cause:** AUTH0_AUDIENCE not configured in frontend
**Fix:** Add `AUTH0_AUDIENCE` to frontend `.env.local`

### "Invalid issuer"
**Cause:** AUTH0_DOMAIN mismatch between frontend/backend
**Fix:** Ensure both use same Auth0 tenant domain

### "Invalid audience"
**Cause:** Token audience doesn't match backend expectation
**Fix:** Ensure AUTH0_AUDIENCE matches in both frontend and backend

### "Token validation error: token is expired"
**Cause:** Token expired (default 24h)
**Fix:** User needs to re-login or use refresh token

### "Failed to create JWKS"
**Cause:** Cannot reach Auth0 JWKS endpoint
**Fix:** Check internet connection and Auth0_DOMAIN is correct

## 📊 Comparison: Shared Secret vs JWT

| Aspect | Shared Secret (Option 1) | JWT Verification (Option 2) ✅ |
|--------|--------------------------|-------------------------------|
| **Security** | ⚠️ Medium - secret in both apps | ✅ High - asymmetric keys |
| **Setup** | ✅ Simple | ⚠️ Moderate |
| **Token Expiration** | ❌ No | ✅ Yes |
| **User Info** | ❌ Must send separately | ✅ Embedded in token |
| **Key Rotation** | ⚠️ Manual | ✅ Automatic via JWKS |
| **Auth0 Native** | ❌ No | ✅ Yes |
| **Scalability** | ⚠️ Secret distribution issue | ✅ Public JWKS endpoint |

## 🚀 Next Steps

### Current Implementation
✅ JWT verification with Auth0  
✅ JWKS auto-refresh  
✅ Issuer & audience validation  
✅ Token expiration check  

### Future Enhancements
- [ ] Add refresh token handling
- [ ] Implement rate limiting per user
- [ ] Add custom claims (permissions/roles)
- [ ] Add user context logging
- [ ] Add token caching for performance
- [ ] Add metrics/monitoring for auth failures

## 📚 Resources

- [Auth0 JWT Validation](https://auth0.com/docs/secure/tokens/json-web-tokens/validate-json-web-tokens)
- [JWKS Endpoint](https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets)
- [golang-jwt Library](https://github.com/golang-jwt/jwt)
- [keyfunc Library](https://github.com/MicahParks/keyfunc)
