# 🤝 Contributing to Futabus Ticket Notification

First off, thank you for considering contributing to this project! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)

## 📜 Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow:

- **Be respectful** - Treat everyone with respect
- **Be collaborative** - Work together and help each other
- **Be inclusive** - Welcome diverse perspectives
- **Be professional** - Keep communications constructive

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Go 1.21+
- PostgreSQL 16+
- Auth0 account
- Git

### Setup Development Environment

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/futabus-ticket-notification.git
cd futabus-ticket-notification

# 3. Add upstream remote
git remote add upstream https://github.com/doquoctuan/futabus-ticket-notification.git

# 4. Setup backend
cd backend
cp .env.example .env
# Edit .env with your configuration
go mod download
go run main.go

# 5. Setup frontend
cd ../frontend
cp .env.example .env.local
# Edit .env.local with your configuration
pnpm install
pnpm dev
```

## 🔄 Development Workflow

### 1. Create a Feature Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a new branch
git checkout -b feat/your-feature-name
# Or for bugs: git checkout -b fix/bug-description
```

### 2. Make Your Changes

- Write clear, readable code
- Follow the coding standards below
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Backend tests (when available)
cd backend
go test ./...

# Frontend tests (when available)
cd frontend
pnpm test

# Manual testing
# - Start both backend and frontend
# - Test all affected features
# - Check browser console for errors
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add amazing feature"
```

See [Commit Messages](#commit-messages) section for conventions.

### 5. Push and Create PR

```bash
git push origin feat/your-feature-name
```

Then create a Pull Request on GitHub.

## 💻 Coding Standards

### Go (Backend)

```go
// ✅ Good
func createSubscription(c *gin.Context) {
    var subscription Subscription
    if err := c.ShouldBindJSON(&subscription); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    // ... rest of logic
}

// ❌ Bad
func create(c *gin.Context){
var s Subscription
err:=c.ShouldBindJSON(&s)
if err!=nil{
c.JSON(400,gin.H{"error":err.Error()})
return}
}
```

**Guidelines:**
- Use `gofmt` for formatting
- Follow [Effective Go](https://go.dev/doc/effective_go)
- Keep functions small and focused
- Use meaningful variable names
- Add error handling
- Write comments for exported functions

### TypeScript/React (Frontend)

```typescript
// ✅ Good
export async function createSubscription(data: SubscriptionData) {
  try {
    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create subscription');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

// ❌ Bad
export async function create(d:any){
const r=await fetch('/api/subscriptions',{method:'POST',body:JSON.stringify(d)})
return await r.json()
}
```

**Guidelines:**
- Use TypeScript strict mode
- Use functional components with hooks
- Follow React best practices
- Use meaningful component/function names
- Add proper type definitions
- Handle errors appropriately
- Use async/await over promises

### File Structure

```typescript
// ✅ Component structure
'use client'; // If needed

import { useState } from 'react';
import { ComponentProps } from '@/types';

interface Props {
  // Props definition
}

export default function ComponentName({ prop1, prop2 }: Props) {
  // Hooks
  const [state, setState] = useState();
  
  // Helper functions
  const handleAction = () => {
    // Logic
  };
  
  // JSX
  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

## 📝 Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding tests
- `chore` - Maintenance tasks

### Examples

```bash
# Good commits
feat(backend): add JWT authentication middleware
fix(frontend): resolve token refresh issue
docs(readme): update setup instructions
refactor(api): simplify error handling

# With body
feat(subscriptions): add email notifications

Implement email notification system using SendGrid.
Users will receive emails when ticket availability changes.

Closes #123

# Breaking change
feat(auth)!: migrate to Auth0 JWT verification

BREAKING CHANGE: Requires AUTH0_AUDIENCE configuration
```

## 🔍 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex code
- [ ] Documentation updated if needed
- [ ] No new warnings or errors
- [ ] Manual testing completed
- [ ] Branch is up to date with main

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] No console errors
- [ ] All features work as expected

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Documentation updated
- [ ] No new warnings
```

### Review Process

1. **Automated Checks** - CI/CD runs automatically
2. **Code Review** - Maintainer reviews code
3. **Feedback** - Address any comments
4. **Approval** - Maintainer approves PR
5. **Merge** - Maintainer merges to main

## 🧪 Testing Guidelines

### Manual Testing Checklist

**Backend:**
- [ ] Server starts without errors
- [ ] All API endpoints respond correctly
- [ ] JWT authentication works
- [ ] Database operations succeed
- [ ] Error handling works properly

**Frontend:**
- [ ] Pages load without errors
- [ ] Authentication flow works
- [ ] All UI interactions work
- [ ] Forms validate correctly
- [ ] Error messages display properly
- [ ] Responsive on mobile/tablet

### Integration Testing

```bash
# Test full flow
1. Login with Auth0
2. Create a subscription
3. Toggle subscription status
4. Delete subscription
5. Logout
```

## 📂 Project Areas to Contribute

### High Priority
- 🔴 Email notification system
- 🔴 SMS notification integration
- 🔴 Ticket availability checker
- 🔴 Unit tests
- 🔴 Integration tests

### Medium Priority
- 🟡 Admin dashboard
- 🟡 User preferences page
- 🟡 Docker setup
- 🟡 CI/CD pipeline
- 🟡 Performance optimization

### Low Priority
- 🟢 UI/UX improvements
- 🟢 Additional documentation
- 🟢 Code refactoring
- 🟢 Accessibility improvements
- 🟢 Internationalization

## 💡 Need Help?

- 📖 Check existing [documentation](./README.md)
- 💬 Open a [GitHub Discussion](https://github.com/doquoctuan/futabus-ticket-notification/discussions)
- 🐛 Report bugs via [GitHub Issues](https://github.com/doquoctuan/futabus-ticket-notification/issues)
- 📧 Email maintainer (if available)

## 🎉 Recognition

Contributors will be:
- Listed in the project README
- Mentioned in release notes
- Given credit in commit history

Thank you for contributing! 🙏
