# Data Fetching

## Server Components Only

**All data fetching must happen exclusively in server components.**

Do not fetch data in:
- Route handlers (`src/app/api/`)
- Client components (`"use client"`)
- Middleware
- Any other mechanism

If a client component needs data, fetch it in a server component ancestor and pass it down as props.

## Database Queries via `/data` Helpers

All database queries must be implemented as helper functions inside the `/data` directory (e.g. `src/data/workouts.ts`). Pages and server components call these helpers — they never import `db` or write queries inline.

```
src/
  data/
    workouts.ts     # e.g. getWorkoutsForUser, getWorkoutById
    exercises.ts    # e.g. getExercises
  app/
    dashboard/
      page.tsx      # server component — calls helpers from /data, renders UI
```

### Rules for `/data` helpers

- **Use Drizzle ORM exclusively.** Never write raw SQL strings.
- **Always accept `userId` as a parameter** for any query that touches user-owned data.
- **Always filter by `userId`** in the `where` clause. A logged-in user must only ever be able to read or modify their own rows.

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId))
    .orderBy(desc(workouts.startedAt));
}
```

The caller (a server component) is responsible for obtaining the authenticated user's ID and passing it in — helpers must never look up the session themselves.

```ts
// src/app/dashboard/page.tsx  (server component)
import { auth } from "@/lib/auth";
import { getWorkoutsForUser } from "@/data/workouts";

export default async function DashboardPage() {
  const { userId } = await auth();
  const workouts = await getWorkoutsForUser(userId);
  // render ...
}
```

## Why These Rules Exist

| Concern | Rule |
|---|---|
| Security | Filtering by `userId` in every query prevents users from accessing each other's data, even if a bug exposes an ID. |
| Consistency | A single `/data` layer makes it easy to audit every database access in one place. |
| Simplicity | Server components eliminate the need for API routes, loading states, and client-side fetch boilerplate. |
