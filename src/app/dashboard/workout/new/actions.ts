"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().max(150).optional(),
  startedAt: z.date(),
});

export async function createWorkoutAction(params: {
  name?: string;
  startedAt: Date;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const { name, startedAt } = createWorkoutSchema.parse(params);

  return createWorkout(userId, name || undefined, startedAt);
}
