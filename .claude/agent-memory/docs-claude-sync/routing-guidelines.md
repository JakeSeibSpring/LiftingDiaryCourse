---
name: routing-guidelines-sync
description: Added /docs/routing.md reference to AGENTS.md Code Generation Guidelines
metadata:
  type: project
---

Updated AGENTS.md on 2026-05-28 to add Code Generation Guidelines section with entry for `/docs/routing.md`.

The routing doc specifies that:
- All feature routes must be under `/dashboard` (root `/` is public landing page only)
- Route protection is enforced via middleware in `src/proxy.ts` using Clerk's `clerkMiddleware` + `createRouteMatcher`
- Protection must NOT be added inside page components

This was important enough to warrant a guideline because an AI agent might otherwise create routes outside `/dashboard` or add auth checks in the wrong place, violating project conventions.
