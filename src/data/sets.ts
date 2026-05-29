import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sets } from "@/db/schema";

export async function addSet(
  workoutExerciseId: number,
  setNumber: number,
  reps?: number,
  weight?: string,
) {
  const [set] = await db
    .insert(sets)
    .values({ workoutExerciseId, setNumber, reps, weight })
    .returning();
  return set;
}

export async function deleteSet(setId: number) {
  await db.delete(sets).where(eq(sets.id, setId));
}
