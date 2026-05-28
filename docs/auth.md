# Authentication

## Provider

**This app uses [Clerk](https://clerk.com/) for all authentication.** Do not implement custom auth, session management, or JWT handling. Clerk handles sign-up, sign-in, sessions, and user identity.

The installed package is `@clerk/nextjs` (v7+).

## Middleware

Clerk middleware runs on every request via `src/proxy.ts`:

```ts
// src/proxy.ts
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()
```

Do not add route protection logic here. `clerkMiddleware` handles session validation automatically across all matched routes.

## ClerkProvider

`ClerkProvider` wraps the entire app in the root layout (`src/app/layout.tsx`). Do not add it anywhere else.

## Getting the Authenticated User

**Always use `auth()` from `@clerk/nextjs/server` in server components** to obtain the current user's ID.

```ts
import { auth } from "@clerk/nextjs/server";

export default async function SomePage() {
  const { userId } = await auth();
  // pass userId to /data helpers
}
```

- `auth()` is async — always `await` it.
- `userId` will be `null` if the user is not signed in.
- Never accept `userId` as a URL parameter or request body field — always derive it from `auth()`.
- Never call `auth()` inside `/data` helpers. The server component is responsible for obtaining `userId` and passing it in (see `docs/data-fetching.md`).

## UI Components

Use Clerk's pre-built components from `@clerk/nextjs` for all auth-related UI. Do not build custom sign-in or sign-up flows.

| Component | Purpose |
|---|---|
| `<SignInButton mode="modal" />` | Opens Clerk's sign-in modal |
| `<SignUpButton mode="modal" />` | Opens Clerk's sign-up modal |
| `<UserButton />` | Avatar + account menu for signed-in users |
| `<Show when="signed-in">` | Conditionally renders children when signed in |
| `<Show when="signed-out">` | Conditionally renders children when signed out |

```tsx
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

// In a server or client component:
<Show when="signed-out">
  <SignInButton mode="modal" />
  <SignUpButton mode="modal" />
</Show>
<Show when="signed-in">
  <UserButton />
</Show>
```

## Rules Summary

| Rule | Detail |
|---|---|
| Auth provider | Clerk only — no custom sessions or JWT |
| Getting `userId` | `auth()` from `@clerk/nextjs/server` in server components |
| Passing `userId` | Server component → `/data` helper as a parameter |
| Auth UI | Clerk components only (`SignInButton`, `UserButton`, etc.) |
| Client components | Never call `auth()` in client components |
