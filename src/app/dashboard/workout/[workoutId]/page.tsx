import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkoutById } from "@/data/workouts";
import { getAllExercises } from "@/data/exercises";
import { getWorkoutWithExercisesAndSets } from "@/data/workout-exercises";
import { EditWorkoutForm } from "./_components/edit-workout-form";
import { WorkoutExercisesSection } from "./_components/workout-exercises-section";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  const { userId } = await auth();
  if (!userId) return notFound();

  const [workout, allExercises, workoutExercises] = await Promise.all([
    getWorkoutById(userId, Number(workoutId)),
    getAllExercises(),
    getWorkoutWithExercisesAndSets(Number(workoutId)),
  ]);

  if (!workout) return notFound();

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">&larr; Back</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit workout</CardTitle>
        </CardHeader>
        <CardContent>
          <EditWorkoutForm workout={workout} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exercises</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkoutExercisesSection
            workoutId={workout.id}
            allExercises={allExercises}
            workoutExercises={workoutExercises}
          />
        </CardContent>
      </Card>
    </main>
  );
}
