import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutDatePicker } from "./_components/workout-date-picker";

const placeholderWorkouts = [
  { id: 1, name: "Back Squat", sets: 4, reps: 5, weight: "185 lb" },
  { id: 2, name: "Romanian Deadlift", sets: 3, reps: 8, weight: "135 lb" },
  { id: 3, name: "Leg Press", sets: 3, reps: 12, weight: "270 lb" },
];

export default function DashboardPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Workout Log</h1>
        <WorkoutDatePicker />
      </div>

      <div className="space-y-3">
        {placeholderWorkouts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            No workouts logged for this date.
          </p>
        ) : (
          placeholderWorkouts.map((workout) => (
            <Card key={workout.id}>
              <CardHeader className="pb-1 pt-4 px-5">
                <CardTitle className="text-base">{workout.name}</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-4">
                <p className="text-sm text-muted-foreground">
                  {workout.sets} sets &times; {workout.reps} reps &mdash; {workout.weight}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
