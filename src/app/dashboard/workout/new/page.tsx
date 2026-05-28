import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateWorkoutForm } from "./_components/create-workout-form";

export default function NewWorkoutPage() {
  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">&larr; Back</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New workout</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateWorkoutForm />
        </CardContent>
      </Card>
    </main>
  );
}
