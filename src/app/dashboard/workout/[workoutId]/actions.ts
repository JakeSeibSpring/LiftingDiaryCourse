"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { getWorkoutById, updateWorkout } from "@/data/workouts";
import {
  addExerciseToWorkout,
  getWorkoutWithExercisesAndSets,
  removeWorkoutExercise,
} from "@/data/workout-exercises";
import { addSet, deleteSet } from "@/data/sets";

const updateWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  name: z.string().max(150).optional(),
  startedAt: z.date(),
});

export async function updateWorkoutAction(params: {
  workoutId: number;
  name?: string;
  startedAt: Date;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const { workoutId, name, startedAt } = updateWorkoutSchema.parse(params);

  return updateWorkout(userId, workoutId, name || undefined, startedAt);
}

async function verifyWorkoutOwnership(userId: string, workoutId: number) {
  const workout = await getWorkoutById(userId, workoutId);
  if (!workout) throw new Error("Not found");
  return workout;
}

const addExerciseSchema = z.object({
  workoutId: z.number().int().positive(),
  exerciseId: z.number().int().positive(),
});

export async function addExerciseToWorkoutAction(params: {
  workoutId: number;
  exerciseId: number;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const { workoutId, exerciseId } = addExerciseSchema.parse(params);
  await verifyWorkoutOwnership(userId, workoutId);

  const existing = await getWorkoutWithExercisesAndSets(workoutId);
  const order = existing.length + 1;

  return addExerciseToWorkout(workoutId, exerciseId, order);
}

const removeExerciseSchema = z.object({
  workoutId: z.number().int().positive(),
  workoutExerciseId: z.number().int().positive(),
});

export async function removeExerciseFromWorkoutAction(params: {
  workoutId: number;
  workoutExerciseId: number;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const { workoutId, workoutExerciseId } = removeExerciseSchema.parse(params);
  await verifyWorkoutOwnership(userId, workoutId);

  return removeWorkoutExercise(workoutExerciseId);
}

const addSetSchema = z.object({
  workoutId: z.number().int().positive(),
  workoutExerciseId: z.number().int().positive(),
  reps: z.number().int().positive().optional(),
  weight: z.string().optional(),
});

export async function addSetAction(params: {
  workoutId: number;
  workoutExerciseId: number;
  reps?: number;
  weight?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const { workoutId, workoutExerciseId, reps, weight } =
    addSetSchema.parse(params);
  await verifyWorkoutOwnership(userId, workoutId);

  const existing = await getWorkoutWithExercisesAndSets(workoutId);
  const workoutExercise = existing.find((we) => we.id === workoutExerciseId);
  const setNumber = (workoutExercise?.sets.length ?? 0) + 1;

  return addSet(workoutExerciseId, setNumber, reps, weight);
}

const deleteSetSchema = z.object({
  workoutId: z.number().int().positive(),
  setId: z.number().int().positive(),
});

export async function deleteSetAction(params: {
  workoutId: number;
  setId: number;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const { workoutId, setId } = deleteSetSchema.parse(params);
  await verifyWorkoutOwnership(userId, workoutId);

  return deleteSet(setId);
}
