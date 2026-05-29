"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Exercise, WorkoutExercise, Set } from "@/db/schema";
import {
  addExerciseToWorkoutAction,
  removeExerciseFromWorkoutAction,
  addSetAction,
  deleteSetAction,
} from "../actions";

type WorkoutExerciseWithDetails = WorkoutExercise & {
  exercise: Exercise;
  sets: Set[];
};

interface Props {
  workoutId: number;
  allExercises: Exercise[];
  workoutExercises: WorkoutExerciseWithDetails[];
}

export function WorkoutExercisesSection({
  workoutId,
  allExercises,
  workoutExercises,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");

  const [addSetForms, setAddSetForms] = useState<
    Record<number, { reps: string; weight: string }>
  >({});

  function getSetForm(workoutExerciseId: number) {
    return addSetForms[workoutExerciseId] ?? { reps: "", weight: "" };
  }

  function updateSetForm(
    workoutExerciseId: number,
    field: "reps" | "weight",
    value: string,
  ) {
    setAddSetForms((prev) => ({
      ...prev,
      [workoutExerciseId]: {
        ...getSetForm(workoutExerciseId),
        [field]: value,
      },
    }));
  }

  function handleAddExercise() {
    if (!selectedExerciseId) return;
    startTransition(async () => {
      await addExerciseToWorkoutAction({
        workoutId,
        exerciseId: Number(selectedExerciseId),
      });
      setSelectedExerciseId("");
      router.refresh();
    });
  }

  function handleRemoveExercise(workoutExerciseId: number) {
    startTransition(async () => {
      await removeExerciseFromWorkoutAction({ workoutId, workoutExerciseId });
      router.refresh();
    });
  }

  function handleAddSet(workoutExerciseId: number) {
    const form = getSetForm(workoutExerciseId);
    const reps = form.reps ? parseInt(form.reps, 10) : undefined;
    const weight = form.weight.trim() || undefined;
    startTransition(async () => {
      await addSetAction({ workoutId, workoutExerciseId, reps, weight });
      setAddSetForms((prev) => ({
        ...prev,
        [workoutExerciseId]: { reps: "", weight: "" },
      }));
      router.refresh();
    });
  }

  function handleDeleteSet(setId: number) {
    startTransition(async () => {
      await deleteSetAction({ workoutId, setId });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {workoutExercises.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No exercises yet. Add one below.
        </p>
      )}

      {workoutExercises.map((we) => (
        <div key={we.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{we.exercise.name}</h3>
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => handleRemoveExercise(we.id)}
            >
              Remove
            </Button>
          </div>

          {we.sets.length > 0 && (
            <div className="space-y-1">
              <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground px-1">
                <span>Set</span>
                <span>Reps</span>
                <span>Weight</span>
                <span />
              </div>
              {we.sets.map((set) => (
                <div
                  key={set.id}
                  className="grid grid-cols-4 gap-2 items-center text-sm px-1"
                >
                  <span>{set.setNumber}</span>
                  <span>{set.reps ?? "—"}</span>
                  <span>{set.weight ?? "—"}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleDeleteSet(set.id)}
                    className="h-6 px-2 text-xs"
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Reps</Label>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 8"
                className="w-20 h-8 text-sm"
                value={getSetForm(we.id).reps}
                onChange={(e) => updateSetForm(we.id, "reps", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Weight</Label>
              <Input
                type="number"
                min={0}
                step="0.5"
                placeholder="e.g. 135"
                className="w-24 h-8 text-sm"
                value={getSetForm(we.id).weight}
                onChange={(e) =>
                  updateSetForm(we.id, "weight", e.target.value)
                }
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => handleAddSet(we.id)}
              className="h-8"
            >
              + Add set
            </Button>
          </div>
        </div>
      ))}

      <div className="pt-2 border-t space-y-2">
        <Label>Add exercise</Label>
        <div className="flex gap-2">
          <Select
            value={selectedExerciseId}
            onValueChange={setSelectedExerciseId}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select an exercise" />
            </SelectTrigger>
            <SelectContent>
              {allExercises.map((exercise) => (
                <SelectItem key={exercise.id} value={String(exercise.id)}>
                  {exercise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddExercise}
            disabled={!selectedExerciseId || isPending}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
