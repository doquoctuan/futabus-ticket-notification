# Server Actions Implementation

## 📁 Files Created

1. **`app/actions/subscriptions.ts`** - Server Actions cho subscription management
2. **`app/dashboard-server-actions/page.tsx`** - Dashboard sử dụng Server Actions

## 🎯 Lợi ích của Server Actions

### ✅ So với API Routes (cách hiện tại):

| Feature | API Routes | Server Actions |
|---------|-----------|----------------|
| **Network Calls** | Client → API Route → Backend | Direct Server → Backend |
| **Type Safety** | ❌ Manual typing | ✅ End-to-end TypeScript |
| **Progressive Enhancement** | ❌ Requires JS | ✅ Works without JS |
| **Code Splitting** | Manual | Automatic |
| **Revalidation** | Manual | Built-in `revalidatePath()` |
| **Loading States** | Manual | `useTransition()` hook |
| **Boilerplate** | More (separate route files) | Less (functions in one file) |

## 🚀 Nơi đã áp dụng Server Actions

### 1. **Create Subscription** (`createSubscription`)
```tsx
// Trước (API Route):
const res = await fetch('/api/subscriptions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

// Sau (Server Action):
const result = await createSubscription(formData);
if (result.success) { ... }
```

**Lợi ích:**
- ✅ Progressive Enhancement - form vẫn work khi JS disabled
- ✅ Type-safe từ client → server
- ✅ Auto revalidation với `revalidatePath('/dashboard')`

### 2. **Toggle Active Status** (`toggleSubscriptionStatus`)
```tsx
// Trước:
await fetch(`/api/subscriptions/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ is_active: !isActive }),
});

// Sau:
const result = await toggleSubscriptionStatus(id.toString(), isActive);
```

**Lợi ích:**
- ✅ Simpler API - truyền params trực tiếp
- ✅ Auto refresh data sau khi update

### 3. **Delete Subscription** (`deleteSubscription`)
```tsx
// Trước:
await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' });

// Sau:
const result = await deleteSubscription(id.toString());
```

**Lợi ích:**
- ✅ Consistent error handling
- ✅ Automatic revalidation

### 4. **Fetch Subscriptions** (`fetchUserSubscriptions`)
```tsx
// Trước:
const res = await fetch('/api/subscriptions');
const data = await res.json();

// Sau:
const result = await fetchUserSubscriptions();
if (result.success) setSubscriptions(result.data);
```

## 📊 Features trong Dashboard với Server Actions

### 1. **useTransition Hook**
```tsx
const [isPending, startTransition] = useTransition();

startTransition(async () => {
  const result = await createSubscription(formData);
  // ...
});
```
- Hiển thị loading state tự động
- Không block UI khi đang xử lý

### 2. **Error Handling**
```tsx
const [error, setError] = useState<string | null>(null);

if (result.success) {
  // Success flow
} else {
  setError(result.error || 'Đã xảy ra lỗi');
}
```
- Centralized error messages
- User-friendly Vietnamese errors

### 3. **Optimistic Updates** (có thể thêm)
```tsx
// Có thể implement sau:
const optimisticDelete = (id: number) => {
  setSubscriptions(prev => prev.filter(s => s.id !== id));
  startTransition(async () => {
    const result = await deleteSubscription(id.toString());
    if (!result.success) {
      // Rollback nếu thất bại
      loadSubscriptions();
    }
  });
};
```

## 🔄 So sánh Architecture

### Current (API Routes):
```
Client Component
    ↓ fetch()
API Route (/app/api/subscriptions/route.ts)
    ↓ Auth0 session
    ↓ fetch()
Go Backend (localhost:8080)
    ↓
PostgreSQL
```

### New (Server Actions):
```
Client Component
    ↓ Server Action call
Server Function (/app/actions/subscriptions.ts)
    ↓ Auth0 session
    ↓ fetch()
Go Backend (localhost:8080)
    ↓
PostgreSQL
```

**Ít hơn 1 network hop!**

## 🧪 Test Server Actions

### Cách 1: Truy cập route mới
```
http://localhost:3000/dashboard-server-actions
```

### Cách 2: Thay thế dashboard hiện tại
Rename:
- `app/dashboard/page.tsx` → `app/dashboard/page-old.tsx`
- `app/dashboard-server-actions/page.tsx` → `app/dashboard/page.tsx`

## 📝 Migration Path

### Bước 1: Test Server Actions (✅ Đã xong)
- Tạo route mới `/dashboard-server-actions`
- Test toàn bộ functionality

### Bước 2: Compare Performance
- Measure time to interactive
- Check network waterfall
- Validate error handling

### Bước 3: Gradual Migration
- Nếu hài lòng → replace dashboard chính
- Nếu cần cả 2 → giữ song song
- Delete API routes không cần thiết

### Bước 4: Cleanup (nếu migrate hoàn toàn)
```
Delete:
- app/api/subscriptions/route.ts
- app/api/subscriptions/[id]/route.ts

Keep:
- app/actions/subscriptions.ts (Server Actions)
```

## 🎨 UI Improvements với Server Actions

### Loading State
```tsx
{isPending && (
  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
    <div className="animate-spin ..."></div>
    Đang xử lý...
  </div>
)}
```

### Disabled Buttons
```tsx
<button
  disabled={isPending}
  className="... disabled:opacity-50"
>
  {isPending ? 'Đang thêm...' : 'Thêm'}
</button>
```

## 🔐 Security Notes

**Auth vẫn server-side:**
```tsx
const session = await auth0.getSession();
if (!session?.user?.sub) {
  return { success: false, error: 'Unauthorized' };
}
```

Server Actions chạy trên server → Auth0 session an toàn như API Routes!

## 🚦 Next Steps

### Immediate:
1. ✅ Test `/dashboard-server-actions` thoroughly
2. ✅ Compare UX với dashboard hiện tại
3. ✅ Check errors trong console

### Future Enhancements:
- [ ] Add optimistic UI updates
- [ ] Implement toast notifications thay vì alert()
- [ ] Add form validation với Zod
- [ ] Rate limiting cho Server Actions
- [ ] Add telemetry/logging

## 📚 Reference

- [Next.js Server Actions Docs](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [useTransition Hook](https://react.dev/reference/react/useTransition)
- [Progressive Enhancement](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#forms)
