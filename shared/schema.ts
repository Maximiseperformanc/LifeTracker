import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
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
  targetMinutes: integer("target_minutes").default(0),
  streakDays: integer("streak_days").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const habitEntries = pgTable("habit_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  habitId: varchar("habit_id").notNull(),
  userId: varchar("user_id").notNull(),
  completed: boolean("completed").default(false),
  minutesSpent: integer("minutes_spent").default(0),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  userId: true,
  streakDays: true,
  createdAt: true,
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
