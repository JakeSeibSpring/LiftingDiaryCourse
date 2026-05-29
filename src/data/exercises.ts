import { asc } from "drizzle-orm";
import { db } from "@/db";
import { exercises } from "@/db/schema";

export async function getAllExercises() {
  return db.select().from(exercises).orderBy(asc(exercises.name));
}
