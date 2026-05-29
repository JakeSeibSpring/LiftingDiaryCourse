import { Suspense } from "react";
import Link from "next/link";
import { parseISO } from "date-fns";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutDatePicker } from "./_components/workout-date-picker";
import { getWorkoutsForUserOnDate } from "@/data/workouts";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { date: dateParam } = await searchParams;
  const date =
    typeof dateParam === "string" ? parseISO(dateParam) : new Date();

  const { userId } = await auth();
  const workouts = await getWorkoutsForUserOnDate(userId!, date);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Workout Log</h1>
        <Suspense>
          <WorkoutDatePicker />
        </Suspense>
      </div>

      <div className="space-y-3">
        {workouts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            No workouts logged for this date.
          </p>
        ) : (
          workouts.map((workout) => (
            <Link
              key={workout.id}
              href={`/dashboard/workout/${workout.id}`}
              className="block"
            >
              <Card>
                <CardHeader className="pb-1 pt-4 px-5">
                  <CardTitle className="text-base">
                    {workout.name ?? "Untitled Workout"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-4">
                  <p className="text-sm text-muted-foreground">
                    {workout.startedAt.toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
