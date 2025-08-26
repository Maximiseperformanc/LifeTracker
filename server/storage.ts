import { 
  type User, 
  type InsertUser,
  type Habit,
  type InsertHabit,
  type HabitEntry,
  type InsertHabitEntry,
  type Goal,
  type InsertGoal,
  type HealthEntry,
  type InsertHealthEntry,
  type TimerSession,
  type InsertTimerSession
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Habits
  getHabits(userId: string): Promise<Habit[]>;
  createHabit(userId: string, habit: InsertHabit): Promise<Habit>;
  updateHabit(id: string, habit: Partial<Habit>): Promise<Habit | undefined>;
  deleteHabit(id: string): Promise<boolean>;

  // Habit Entries
  getHabitEntries(userId: string, date?: string): Promise<HabitEntry[]>;
  createHabitEntry(userId: string, entry: InsertHabitEntry): Promise<HabitEntry>;
  updateHabitEntry(id: string, entry: Partial<HabitEntry>): Promise<HabitEntry | undefined>;

  // Goals
  getGoals(userId: string): Promise<Goal[]>;
  createGoal(userId: string, goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, goal: Partial<Goal>): Promise<Goal | undefined>;
  deleteGoal(id: string): Promise<boolean>;

  // Health Entries
  getHealthEntries(userId: string, startDate?: string, endDate?: string): Promise<HealthEntry[]>;
  createHealthEntry(userId: string, entry: InsertHealthEntry): Promise<HealthEntry>;
  updateHealthEntry(id: string, entry: Partial<HealthEntry>): Promise<HealthEntry | undefined>;

  // Timer Sessions
  getTimerSessions(userId: string, date?: string): Promise<TimerSession[]>;
  createTimerSession(userId: string, session: InsertTimerSession): Promise<TimerSession>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private habits: Map<string, Habit>;
  private habitEntries: Map<string, HabitEntry>;
  private goals: Map<string, Goal>;
  private healthEntries: Map<string, HealthEntry>;
  private timerSessions: Map<string, TimerSession>;

  constructor() {
    this.users = new Map();
    this.habits = new Map();
    this.habitEntries = new Map();
    this.goals = new Map();
    this.healthEntries = new Map();
    this.timerSessions = new Map();

    // Create a default user for demo purposes
    const defaultUser: User = {
      id: "default-user",
      username: "demo",
      password: "demo"
    };
    this.users.set(defaultUser.id, defaultUser);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Habits
  async getHabits(userId: string): Promise<Habit[]> {
    return Array.from(this.habits.values()).filter(habit => habit.userId === userId);
  }

  async createHabit(userId: string, insertHabit: InsertHabit): Promise<Habit> {
    const id = randomUUID();
    const habit: Habit = { 
      ...insertHabit, 
      id, 
      userId,
      streakDays: 0,
      createdAt: new Date()
    };
    this.habits.set(id, habit);
    return habit;
  }

  async updateHabit(id: string, updateHabit: Partial<Habit>): Promise<Habit | undefined> {
    const existing = this.habits.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateHabit };
    this.habits.set(id, updated);
    return updated;
  }

  async deleteHabit(id: string): Promise<boolean> {
    return this.habits.delete(id);
  }

  // Habit Entries
  async getHabitEntries(userId: string, date?: string): Promise<HabitEntry[]> {
    return Array.from(this.habitEntries.values()).filter(entry => 
      entry.userId === userId && (!date || entry.date === date)
    );
  }

  async createHabitEntry(userId: string, insertEntry: InsertHabitEntry): Promise<HabitEntry> {
    const id = randomUUID();
    const entry: HabitEntry = { 
      ...insertEntry, 
      id, 
      userId,
      createdAt: new Date()
    };
    this.habitEntries.set(id, entry);
    return entry;
  }

  async updateHabitEntry(id: string, updateEntry: Partial<HabitEntry>): Promise<HabitEntry | undefined> {
    const existing = this.habitEntries.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateEntry };
    this.habitEntries.set(id, updated);
    return updated;
  }

  // Goals
  async getGoals(userId: string): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(goal => goal.userId === userId);
  }

  async createGoal(userId: string, insertGoal: InsertGoal): Promise<Goal> {
    const id = randomUUID();
    const goal: Goal = { 
      ...insertGoal, 
      id, 
      userId,
      createdAt: new Date()
    };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: string, updateGoal: Partial<Goal>): Promise<Goal | undefined> {
    const existing = this.goals.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateGoal };
    this.goals.set(id, updated);
    return updated;
  }

  async deleteGoal(id: string): Promise<boolean> {
    return this.goals.delete(id);
  }

  // Health Entries
  async getHealthEntries(userId: string, startDate?: string, endDate?: string): Promise<HealthEntry[]> {
    return Array.from(this.healthEntries.values()).filter(entry => {
      if (entry.userId !== userId) return false;
      if (startDate && entry.date < startDate) return false;
      if (endDate && entry.date > endDate) return false;
      return true;
    });
  }

  async createHealthEntry(userId: string, insertEntry: InsertHealthEntry): Promise<HealthEntry> {
    const id = randomUUID();
    const entry: HealthEntry = { 
      ...insertEntry, 
      id, 
      userId,
      createdAt: new Date()
    };
    this.healthEntries.set(id, entry);
    return entry;
  }

  async updateHealthEntry(id: string, updateEntry: Partial<HealthEntry>): Promise<HealthEntry | undefined> {
    const existing = this.healthEntries.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateEntry };
    this.healthEntries.set(id, updated);
    return updated;
  }

  // Timer Sessions
  async getTimerSessions(userId: string, date?: string): Promise<TimerSession[]> {
    return Array.from(this.timerSessions.values()).filter(session => 
      session.userId === userId && (!date || session.date === date)
    );
  }

  async createTimerSession(userId: string, insertSession: InsertTimerSession): Promise<TimerSession> {
    const id = randomUUID();
    const session: TimerSession = { 
      ...insertSession, 
      id, 
      userId,
      createdAt: new Date()
    };
    this.timerSessions.set(id, session);
    return session;
  }
}

export const storage = new MemStorage();
