import { db } from "@/db";
import { workouts } from "@/db/schema";
import { and, eq, gte, lt, desc } from "drizzle-orm";

export async function createWorkout(
  userId: string,
  name: string | undefined,
  startedAt: Date,
) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, startedAt })
    .returning();
  return workout;
}

export async function getWorkoutsForUser(userId: string) {
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId))
    .orderBy(desc(workouts.startedAt));
}

export async function getWorkoutById(userId: string, workoutId: number) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
  return workout ?? null;
}

export async function updateWorkout(
  userId: string,
  workoutId: number,
  name: string | undefined,
  startedAt: Date,
) {
  const [workout] = await db
    .update(workouts)
    .set({ name, startedAt, updatedAt: new Date() })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();
  return workout;
}

export async function getWorkoutsForUserOnDate(userId: string, date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setDate(end.getDate() + 1);
  end.setHours(0, 0, 0, 0);

  return db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, start),
        lt(workouts.startedAt, end),
      )
    )
    .orderBy(desc(workouts.startedAt));
}
