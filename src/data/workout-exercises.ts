import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { workoutExercises, sets } from "@/db/schema";

export async function getWorkoutWithExercisesAndSets(workoutId: number) {
  return db.query.workoutExercises.findMany({
    where: eq(workoutExercises.workoutId, workoutId),
    with: {
      exercise: true,
      sets: {
        orderBy: asc(sets.setNumber),
      },
    },
    orderBy: asc(workoutExercises.order),
  });
}

export async function addExerciseToWorkout(
  workoutId: number,
  exerciseId: number,
  order: number,
) {
  const [workoutExercise] = await db
    .insert(workoutExercises)
    .values({ workoutId, exerciseId, order })
    .returning();
  return workoutExercise;
}

export async function removeWorkoutExercise(workoutExerciseId: number) {
  await db
    .delete(workoutExercises)
    .where(eq(workoutExercises.id, workoutExerciseId));
}
