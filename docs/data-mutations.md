# Data Mutations

## Two-Layer Architecture

All data mutations follow a strict two-layer pattern:

1. **`/data` helper** — a plain async function that executes the Drizzle ORM call.
2. **Server action** — calls the helper, handles auth, validates input, and is the only entry point for the client.

Neither layer is optional. Do not write Drizzle calls directly inside server actions, and do not call server actions from other server actions.

## Layer 1: `/data` Mutation Helpers

Mutation helpers live alongside query helpers in `src/data/` (e.g. `src/data/workouts.ts`).

Rules:
- **Use Drizzle ORM exclusively.** Never write raw SQL strings.
- **Accept all required values as typed parameters** — including `userId` for any mutation that touches user-owned rows.
- **Never look up the session** — the caller is responsible for providing `userId`.
- **Always scope writes to the authenticated user.** For updates and deletes, always include `userId` in the `where` clause to prevent one user from modifying another's data.

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function createWorkout(userId: string, name: string) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name })
    .returning();
  return workout;
}

export async function deleteWorkout(userId: string, workoutId: number) {
  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

## Layer 2: Server Actions

All server actions must:

- Live in a **colocated `actions.ts` file** next to the route or component that uses them (e.g. `src/app/dashboard/actions.ts`).
- Have `"use server"` at the top of the file.
- Have **fully typed parameters** — never use `FormData` as a parameter type.
- **Validate all arguments with Zod** before doing anything else.
- Obtain `userId` from `auth()` (see `docs/auth.md`) — never accept it as a parameter from the client.
- Call `/data` helpers for the actual database work.

```ts
// src/app/dashboard/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(150),
});

export async function createWorkoutAction(params: { name: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const { name } = createWorkoutSchema.parse(params);

  return createWorkout(userId, name);
}
```

### File placement

```
src/
  app/
    dashboard/
      page.tsx          # server component
      actions.ts        # server actions for this route
      _components/
        create-workout-form.tsx   # client component that calls the action
  data/
    workouts.ts         # /data helpers (queries + mutations)
```

### Parameter typing rules

- Parameters must be a plain typed object or individual typed primitives — not `FormData`.
- Define a matching Zod schema for every action and call `.parse()` (not `.safeParse()`) so invalid input throws immediately.

```ts
// Correct
export async function updateWorkoutAction(params: { id: number; name: string }) { ... }

// Wrong — never use FormData
export async function updateWorkoutAction(formData: FormData) { ... }
```

## Redirects After Mutations

Never call `redirect()` inside a server action. Instead, return a value from the action and let the client component handle navigation after the call resolves.

```ts
// Wrong — do not redirect inside a server action
export async function createWorkoutAction(params: { name: string }) {
  // ...
  redirect("/dashboard");
}

// Correct — return the result; the client navigates
export async function createWorkoutAction(params: { name: string }) {
  // ...
  return createWorkout(userId, name);
}
```

```tsx
// Client component handles the redirect
startTransition(async () => {
  await createWorkoutAction({ name });
  router.push("/dashboard");
});
```

## Rules Summary

| Rule | Detail |
|---|---|
| Drizzle only | All DB writes go through Drizzle ORM — no raw SQL |
| `/data` helpers | Every mutation is a named function in `src/data/` |
| Server actions only | No mutations in route handlers, server components, or client components |
| `actions.ts` colocation | One `actions.ts` per route/feature, next to the page that uses it |
| No `FormData` | Action parameters must be typed objects or primitives |
| Zod validation | Every action validates its params with Zod before proceeding |
| Auth in the action | `userId` comes from `auth()` inside the action — never from the client |
| Scope writes to user | Updates/deletes always include `userId` in the `where` clause |
| No `redirect()` in actions | Never call `redirect()` inside a server action — navigate client-side after the action resolves |
