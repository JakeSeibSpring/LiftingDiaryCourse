import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  numeric,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const exercises = pgTable('exercises', {
  id:        serial('id').primaryKey(),
  name:      varchar('name', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const workouts = pgTable('workouts', {
  id:          serial('id').primaryKey(),
  userId:      varchar('user_id', { length: 256 }).notNull(),
  name:        varchar('name', { length: 150 }),
  startedAt:   timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('workouts_user_id_idx').on(t.userId),
  index('workouts_user_started_at_idx').on(t.userId, t.startedAt),
]);

export const workoutExercises = pgTable('workout_exercises', {
  id:         serial('id').primaryKey(),
  workoutId:  integer('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id').notNull().references(() => exercises.id, { onDelete: 'restrict' }),
  order:      integer('order').notNull(),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('we_workout_id_idx').on(t.workoutId),
  index('we_workout_order_idx').on(t.workoutId, t.order),
]);

export const sets = pgTable('sets', {
  id:                serial('id').primaryKey(),
  workoutExerciseId: integer('workout_exercise_id').notNull().references(() => workoutExercises.id, { onDelete: 'cascade' }),
  setNumber:         integer('set_number').notNull(),
  reps:              integer('reps'),
  weight:            numeric('weight', { precision: 7, scale: 2 }),
  createdAt:         timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('sets_workout_exercise_id_idx').on(t.workoutExerciseId),
]);

export const exercisesRelations = relations(exercises, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutsRelations = relations(workouts, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(workoutExercises, ({ one, many }) => ({
  workout:  one(workouts,  { fields: [workoutExercises.workoutId],  references: [workouts.id] }),
  exercise: one(exercises, { fields: [workoutExercises.exerciseId], references: [exercises.id] }),
  sets:     many(sets),
}));

export const setsRelations = relations(sets, ({ one }) => ({
  workoutExercise: one(workoutExercises, {
    fields: [sets.workoutExerciseId],
    references: [workoutExercises.id],
  }),
}));

export type Exercise           = typeof exercises.$inferSelect;
export type NewExercise        = typeof exercises.$inferInsert;
export type Workout            = typeof workouts.$inferSelect;
export type NewWorkout         = typeof workouts.$inferInsert;
export type WorkoutExercise    = typeof workoutExercises.$inferSelect;
export type NewWorkoutExercise = typeof workoutExercises.$inferInsert;
export type Set                = typeof sets.$inferSelect;
export type NewSet             = typeof sets.$inferInsert;
