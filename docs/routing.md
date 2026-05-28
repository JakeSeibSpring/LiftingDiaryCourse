# Routing

## Route Structure

**All application routes live under `/dashboard`.** The root route (`/`) is a public landing page only. Do not add feature pages outside of `/dashboard`.

```
/                          ← public landing page
/dashboard                 ← protected: main app entry point
/dashboard/workout/new     ← protected: create workout
/dashboard/workout/[id]    ← protected: view/edit workout
```

## Protected Routes

Every route under `/dashboard` is a protected route — unauthenticated users must not be able to access it. Route protection is enforced via **Next.js middleware**, not inside page components.

Do not add `auth()` checks or redirects inside page components for the purpose of protecting the route. The middleware handles that.

## Middleware

The middleware file is `src/proxy.ts`. This is where route protection is configured using Clerk's `clerkMiddleware` with `createRouteMatcher`.

```ts
// src/proxy.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

- `createRouteMatcher(['/dashboard(.*)'])` matches `/dashboard` and all sub-routes.
- `auth.protect()` redirects unauthenticated users to the Clerk sign-in page automatically.
- The `matcher` config controls which requests the middleware runs on — do not remove the existing entries.

## Rules Summary

| Rule | Detail |
|---|---|
| All feature routes | Must be under `/dashboard` |
| Route protection | Middleware only (`src/proxy.ts`) — not in page components |
| Unauthenticated access | Clerk redirects automatically via `auth.protect()` |
| Public routes | Only `/` and non-`/dashboard` paths are public |
