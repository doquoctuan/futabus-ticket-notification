# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### 🚧 In Progress
- Email notification system
- SMS alert integration
- Admin dashboard
- Ticket availability webhook

## [1.0.0] - 2025-10-19

### 🎉 Initial Release

#### ✨ Features
- **Authentication & Authorization**
  - Auth0 OAuth 2.0 integration
  - JWT token verification with RS256
  - JWKS auto-refresh from Auth0
  - Secure session management
  - User profile display

- **Subscription Management**
  - Create new subscriptions with route and date/time selection
  - View all user subscriptions
  - Toggle subscription active/inactive status
  - Delete subscriptions
  - Conflict detection for duplicate subscriptions

- **Route Selection**
  - 66 Vietnamese cities and provinces
  - Origin and destination selection
  - Validation prevents same origin/destination

- **Date & Time Handling**
  - Local timezone support with UTC storage
  - Date picker with min date validation
  - Optional time selection
  - ISO 8601 format with timezone offset

- **User Interface**
  - Responsive design (mobile/tablet/desktop)
  - Vietnamese language interface
  - Real-time UI updates after changes
  - Loading states and error handling
  - Clean, modern design with TailwindCSS

#### 🔐 Security
- JWT authentication on all API endpoints
- CORS configuration for local development
- Secure token transmission (Authorization header)
- Issuer and audience validation
- Token expiration checking
- UUID v7 primary keys for database records

#### 🏗️ Technical
- **Backend:**
  - Go 1.21+ with Gin framework
  - GORM ORM with PostgreSQL
  - Single-file API server architecture
  - RESTful API design
  - Unique constraints on database

- **Frontend:**
  - Next.js 15 with App Router
  - TypeScript for type safety
  - Auth0 Next.js SDK
  - API Routes as backend proxy
  - Server Actions implementation (alternative)
  - TailwindCSS for styling

- **Database:**
  - PostgreSQL 16+
  - UUID v7 primary keys
  - Unique indexes for data integrity
  - Automatic migrations with GORM

#### 📚 Documentation
- Comprehensive README.md
- QUICKSTART_AUTH.md for authentication setup
- AUTH0_JWT.md for technical deep-dive
- SERVER_ACTIONS.md for alternative implementation
- IMPLEMENTATION_SUMMARY.md for development notes
- CONTRIBUTING.md for contributors
- .env.example files for both frontend and backend

#### 🛠️ Development Tools
- pnpm for frontend package management
- Go modules for backend dependencies
- Hot reload for development
- TypeScript strict mode
- ESLint configuration

### 🔧 Configuration
- Auth0 tenant setup required
- API identifier configuration
- Database connection settings
- Environment-based configuration
- CORS settings for development

### 📦 Dependencies

#### Backend
- `github.com/gin-gonic/gin` v1.9.1
- `github.com/gin-contrib/cors` v1.4.0
- `gorm.io/gorm` v1.25.5
- `gorm.io/driver/postgres` v1.5.4
- `github.com/gofrs/uuid/v5` v5.0.0
- `github.com/golang-jwt/jwt/v5` v5.3.0
- `github.com/MicahParks/keyfunc/v3` v3.7.0

#### Frontend
- `next` 15.5.6
- `react` 19.1.0
- `react-dom` 19.1.0
- `@auth0/nextjs-auth0` latest
- `typescript` 5.x
- `tailwindcss` 3.x

## [0.2.0] - Development Phase

### Added
- Server Actions implementation as alternative to API Routes
- Enhanced error handling with Vietnamese messages
- Auth helper utilities for token management

### Changed
- Migrated to Next.js 15
- Updated to React 19
- Improved form validation

## [0.1.0] - Initial Development

### Added
- Basic project structure
- Auth0 integration
- Database schema
- API Routes implementation
- Dashboard UI
- Location data from Vietnamese sources

---

## Version History Notes

### Versioning Strategy
- **Major (X.0.0)** - Breaking changes, major features
- **Minor (0.X.0)** - New features, non-breaking changes
- **Patch (0.0.X)** - Bug fixes, minor improvements

### Release Schedule
- Major releases: When significant features are complete
- Minor releases: Monthly or when substantial features are added
- Patch releases: As needed for bug fixes

## Future Roadmap

### Version 1.1.0 (Planned)
- Email notification system
- User preferences page
- Notification history
- Export subscriptions to CSV

### Version 1.2.0 (Planned)
- SMS notifications via Twilio
- Webhook for ticket availability
- Rate limiting
- Request caching

### Version 2.0.0 (Future)
- Admin dashboard
- Analytics and reporting
- Multiple notification channels
- Mobile app (React Native)
- API for third-party integrations

---

[Unreleased]: https://github.com/doquoctuan/futabus-ticket-notification/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/doquoctuan/futabus-ticket-notification/releases/tag/v1.0.0
[0.2.0]: https://github.com/doquoctuan/futabus-ticket-notification/releases/tag/v0.2.0
[0.1.0]: https://github.com/doquoctuan/futabus-ticket-notification/releases/tag/v0.1.0
