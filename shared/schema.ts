import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const habits = pgTable("habits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  trackingType: text("tracking_type").notNull().default("boolean"), // boolean, numeric, duration, custom
  unit: text("unit"), // e.g., "glasses", "pages", "minutes", "miles", "steps"
  targetValue: real("target_value"), // target amount (e.g., 8 glasses, 30 minutes)
  frequency: text("frequency").notNull().default("daily"), // daily, weekly, custom
  frequencyDays: text("frequency_days").array(), // ["monday", "tuesday"] for weekly, or custom schedule
  icon: text("icon"), // icon identifier
  color: text("color").default("#1976D2"), // hex color for the habit
  isArchived: boolean("is_archived").default(false),
  streakDays: integer("streak_days").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const habitEntries = pgTable("habit_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  habitId: varchar("habit_id").notNull(),
  userId: varchar("user_id").notNull(),
  completed: boolean("completed").default(false),
  value: real("value"), // numeric value for tracking (e.g., 8 glasses, 5 miles)
  notes: text("notes"), // optional notes for the entry
  date: text("date").notNull(), // YYYY-MM-DD format
  createdAt: timestamp("created_at").defaultNow(),
});

export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  deadline: text("deadline"), // YYYY-MM-DD format
  progress: integer("progress").default(0), // 0-100
  category: text("category").default("personal"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const healthEntries = pgTable("health_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  sleepHours: real("sleep_hours"),
  sleepQuality: integer("sleep_quality"), // 1-10
  exerciseMinutes: integer("exercise_minutes").default(0),
  exerciseType: text("exercise_type"),
  caloriesBurned: integer("calories_burned").default(0),
  mood: integer("mood"), // 1-10
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const timerSessions = pgTable("timer_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  duration: integer("duration").notNull(), // in minutes
  type: text("type").default("pomodoro"), // pomodoro, break, long-break
  completed: boolean("completed").default(false),
  date: text("date").notNull(), // YYYY-MM-DD format
  createdAt: timestamp("created_at").defaultNow(),
});

// Workout Tables
export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  isCustom: boolean("is_custom").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workouts = pgTable("workouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  startedAt: timestamp("started_at").notNull(),
  endedAt: timestamp("ended_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sets = pgTable("sets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workoutId: varchar("workout_id").notNull(),
  exerciseId: varchar("exercise_id").notNull(),
  weight: real("weight").notNull(), // in kg or lb
  reps: integer("reps").notNull(),
  orderIndex: integer("order_index").default(0), // for ordering within workout
  createdAt: timestamp("created_at").defaultNow(),
});

export const cardioEntries = pgTable("cardio_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  type: text("type").notNull(), // run, ride, row, other
  durationSec: integer("duration_sec").notNull(),
  distanceMeters: real("distance_meters"), // optional
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Nutrition Tables
export const foodItems = pgTable("food_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  brand: text("brand"),
  barcode: text("barcode"),
  servings: jsonb("servings").$type<Array<{
    unit: string;
    grams: number;
    description?: string;
  }>>(),
  nutrients: jsonb("nutrients").$type<{
    // Macros (per 100g)
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    // Key micros (per 100g) 
    fiber?: number;
    sugar?: number;
    sodium?: number;
    calcium?: number;
    iron?: number;
    potassium?: number;
    magnesium?: number;
    vitaminD?: number;
    vitaminB12?: number;
  }>().notNull(),
  source: text("source").notNull(), // 'usda', 'openfoodfacts', 'user'
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mealEntries = pgTable("meal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  mealType: text("meal_type").notNull(), // 'breakfast', 'lunch', 'dinner', 'snack'
  datetime: timestamp("datetime").notNull(),
  items: jsonb("items").$type<Array<{
    foodId: string;
    quantity: number;
    servingGrams: number;
    notes?: string;
  }>>().notNull(),
  source: text("source").notNull(), // 'search', 'barcode', 'manual'
  totalsCache: jsonb("totals_cache").$type<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const nutritionGoals = pgTable("nutrition_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  calorieTarget: integer("calorie_target").notNull(),
  proteinTarget: integer("protein_target").notNull(), // grams
  carbsTarget: integer("carbs_target").notNull(), // grams  
  fatTarget: integer("fat_target").notNull(), // grams
  fiberTarget: integer("fiber_target").default(25), // grams
  sodiumTarget: integer("sodium_target").default(2300), // mg
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  userId: true,
  streakDays: true,
  createdAt: true,
}).extend({
  trackingType: z.enum(["boolean", "numeric", "duration", "custom"]),
  frequency: z.enum(["daily", "weekly", "custom"]),
  frequencyDays: z.array(z.string()).optional(),
});

export const insertHabitEntrySchema = createInsertSchema(habitEntries).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertHealthEntrySchema = createInsertSchema(healthEntries).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertTimerSessionSchema = createInsertSchema(timerSessions).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertFoodItemSchema = createInsertSchema(foodItems).omit({
  id: true,
  createdAt: true,
});

export const insertMealEntrySchema = createInsertSchema(mealEntries).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertNutritionGoalSchema = createInsertSchema(nutritionGoals).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertSetSchema = createInsertSchema(sets).omit({
  id: true,
  createdAt: true,
});

export const insertCardioEntrySchema = createInsertSchema(cardioEntries).omit({
  id: true,
  userId: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

export type InsertHabitEntry = z.infer<typeof insertHabitEntrySchema>;
export type HabitEntry = typeof habitEntries.$inferSelect;

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

export type InsertHealthEntry = z.infer<typeof insertHealthEntrySchema>;
export type HealthEntry = typeof healthEntries.$inferSelect;

export type InsertTimerSession = z.infer<typeof insertTimerSessionSchema>;
export type TimerSession = typeof timerSessions.$inferSelect;

export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;
export type FoodItem = typeof foodItems.$inferSelect;

export type InsertMealEntry = z.infer<typeof insertMealEntrySchema>;
export type MealEntry = typeof mealEntries.$inferSelect;

export type InsertNutritionGoal = z.infer<typeof insertNutritionGoalSchema>;
export type NutritionGoal = typeof nutritionGoals.$inferSelect;

export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercises.$inferSelect;

export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type Workout = typeof workouts.$inferSelect;

export type InsertSet = z.infer<typeof insertSetSchema>;
export type Set = typeof sets.$inferSelect;

export type InsertCardioEntry = z.infer<typeof insertCardioEntrySchema>;
export type CardioEntry = typeof cardioEntries.$inferSelect;
