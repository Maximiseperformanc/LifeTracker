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

// Content Tables - Screen Time
export const screenTimeApps = pgTable("screen_time_apps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").default("Other"), // Social, Productivity, Entertainment, Games, etc.
  isExcluded: boolean("is_excluded").default(false), // privacy toggle
  createdAt: timestamp("created_at").defaultNow(),
});

export const screenTimeEntries = pgTable("screen_time_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  appId: varchar("app_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  minutes: integer("minutes").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const screenTimeLimits = pgTable("screen_time_limits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  appId: varchar("app_id"), // null for daily total limit
  limitMinutes: integer("limit_minutes").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Content Tables - Watchlist
export const watchlistItems = pgTable("watchlist_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // movie, show, podcast, other
  source: text("source"), // Netflix, Spotify, YouTube, etc.
  link: text("link"), // URL if added via link
  length: integer("length"), // runtime in minutes (optional)
  status: text("status").notNull().default("To Watch"), // "To Watch", "In Progress", "Done"
  finishedAt: timestamp("finished_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertScreenTimeAppSchema = createInsertSchema(screenTimeApps).omit({
  id: true,
  createdAt: true,
});

export const insertScreenTimeEntrySchema = createInsertSchema(screenTimeEntries).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertScreenTimeLimitSchema = createInsertSchema(screenTimeLimits).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertWatchlistItemSchema = createInsertSchema(watchlistItems).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  type: z.enum(["movie", "show", "podcast", "other"]),
  status: z.enum(["To Watch", "In Progress", "Done"]),
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

export type InsertTodoCategory = z.infer<typeof insertTodoCategorySchema>;
export type TodoCategory = typeof todoCategories.$inferSelect;

export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type Todo = typeof todos.$inferSelect;

export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;

export type InsertWeeklyPlan = z.infer<typeof insertWeeklyPlanSchema>;
export type WeeklyPlan = typeof weeklyPlans.$inferSelect;

export type InsertDailyPlan = z.infer<typeof insertDailyPlanSchema>;
export type DailyPlan = typeof dailyPlans.$inferSelect;

export type InsertScreenTimeApp = z.infer<typeof insertScreenTimeAppSchema>;
export type ScreenTimeApp = typeof screenTimeApps.$inferSelect;

export type InsertScreenTimeEntry = z.infer<typeof insertScreenTimeEntrySchema>;
export type ScreenTimeEntry = typeof screenTimeEntries.$inferSelect;

export type InsertScreenTimeLimit = z.infer<typeof insertScreenTimeLimitSchema>;
export type ScreenTimeLimit = typeof screenTimeLimits.$inferSelect;

export type InsertWatchlistItem = z.infer<typeof insertWatchlistItemSchema>;
export type WatchlistItem = typeof watchlistItems.$inferSelect;

// To Do System Tables
export const todoCategories = pgTable("todo_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  color: text("color").default("#3B82F6"),
  icon: text("icon").default("📝"),
  description: text("description"),
  orderIndex: integer("order_index").default(0),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const todos = pgTable("todos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  categoryId: varchar("category_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, cancelled
  dueDate: text("due_date"), // YYYY-MM-DD format
  dueTime: text("due_time"), // HH:MM format
  estimatedMinutes: integer("estimated_minutes"),
  tags: text("tags").array(),
  dependencies: text("dependencies").array(), // Array of todo IDs this depends on
  notes: text("notes"),
  completedAt: timestamp("completed_at"),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Calendar/Events Tables
export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  eventType: text("event_type").notNull().default("appointment"), // appointment, work, personal, deadline, meeting
  startDate: text("start_date").notNull(), // YYYY-MM-DD format
  startTime: text("start_time"), // HH:MM format
  endDate: text("end_date"), // YYYY-MM-DD format
  endTime: text("end_time"), // HH:MM format
  location: text("location"),
  isAllDay: boolean("is_all_day").default(false),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: text("recurring_pattern"), // daily, weekly, monthly, yearly
  reminder: integer("reminder_minutes"), // minutes before event
  color: text("color").default("#3B82F6"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Planning Tables
export const weeklyPlans = pgTable("weekly_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  weekStartDate: text("week_start_date").notNull(), // YYYY-MM-DD format (Monday)
  title: text("title").notNull(),
  goals: jsonb("goals").$type<Array<{
    id: string;
    text: string;
    completed: boolean;
    category: string;
  }>>(),
  priorities: jsonb("priorities").$type<Array<{
    id: string;
    text: string;
    category: string;
    completed: boolean;
  }>>(),
  notes: text("notes"),
  reflection: text("reflection"), // For completed weeks
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyPlans = pgTable("daily_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  weeklyPlanId: varchar("weekly_plan_id"),
  date: text("date").notNull(), // YYYY-MM-DD format
  title: text("title").notNull(),
  timeBlocks: jsonb("time_blocks").$type<Array<{
    id: string;
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    title: string;
    type: string; // work, personal, break, todo, habit
    todoId?: string;
    habitId?: string;
    completed: boolean;
  }>>(),
  priorities: jsonb("priorities").$type<Array<{
    id: string;
    text: string;
    completed: boolean;
    todoId?: string;
  }>>(),
  reflection: text("reflection"),
  energyLevel: integer("energy_level"), // 1-10
  moodRating: integer("mood_rating"), // 1-10
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for new tables
export const insertTodoCategorySchema = createInsertSchema(todoCategories).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertTodoSchema = createInsertSchema(todos).omit({
  id: true,
  userId: true,
  completedAt: true,
  createdAt: true,
}).extend({
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  eventType: z.enum(["appointment", "work", "personal", "deadline", "meeting"]),
});

export const insertWeeklyPlanSchema = createInsertSchema(weeklyPlans).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertDailyPlanSchema = createInsertSchema(dailyPlans).omit({
  id: true,
  userId: true,
  createdAt: true,
});
