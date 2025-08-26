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
  type InsertTimerSession,
  type FoodItem,
  type InsertFoodItem,
  type MealEntry,
  type InsertMealEntry,
  type NutritionGoal,
  type InsertNutritionGoal
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

  // Food Items
  searchFoodItems(query: string, limit?: number): Promise<FoodItem[]>;
  getFoodItem(id: string): Promise<FoodItem | undefined>;
  getFoodItemByBarcode(barcode: string): Promise<FoodItem | undefined>;
  createFoodItem(foodItem: InsertFoodItem): Promise<FoodItem>;

  // Meal Entries
  getMealEntries(userId: string, date?: string): Promise<MealEntry[]>;
  createMealEntry(userId: string, entry: InsertMealEntry): Promise<MealEntry>;
  updateMealEntry(id: string, entry: Partial<MealEntry>): Promise<MealEntry | undefined>;
  deleteMealEntry(id: string): Promise<boolean>;

  // Nutrition Goals
  getNutritionGoal(userId: string): Promise<NutritionGoal | undefined>;
  createNutritionGoal(userId: string, goal: InsertNutritionGoal): Promise<NutritionGoal>;
  updateNutritionGoal(id: string, goal: Partial<NutritionGoal>): Promise<NutritionGoal | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private habits: Map<string, Habit>;
  private habitEntries: Map<string, HabitEntry>;
  private goals: Map<string, Goal>;
  private healthEntries: Map<string, HealthEntry>;
  private timerSessions: Map<string, TimerSession>;
  private foodItems: Map<string, FoodItem>;
  private mealEntries: Map<string, MealEntry>;
  private nutritionGoals: Map<string, NutritionGoal>;

  constructor() {
    this.users = new Map();
    this.habits = new Map();
    this.habitEntries = new Map();
    this.goals = new Map();
    this.healthEntries = new Map();
    this.timerSessions = new Map();
    this.foodItems = new Map();
    this.mealEntries = new Map();
    this.nutritionGoals = new Map();

    // Create a default user for demo purposes
    const defaultUser: User = {
      id: "default-user",
      username: "demo",
      password: "demo"
    };
    this.users.set(defaultUser.id, defaultUser);
    
    // Seed some common food items for testing
    this.seedFoodDatabase();
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
      id, 
      userId,
      name: insertHabit.name,
      description: insertHabit.description || null,
      trackingType: insertHabit.trackingType || "boolean",
      unit: insertHabit.unit || null,
      targetValue: insertHabit.targetValue || null,
      frequency: insertHabit.frequency || "daily",
      frequencyDays: insertHabit.frequencyDays || null,
      icon: insertHabit.icon || null,
      color: insertHabit.color || "#1976D2",
      isArchived: false,
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
      id, 
      userId,
      habitId: insertEntry.habitId,
      completed: insertEntry.completed || false,
      value: insertEntry.value || null,
      notes: insertEntry.notes || null,
      date: insertEntry.date,
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
      id, 
      userId,
      title: insertGoal.title,
      description: insertGoal.description || null,
      deadline: insertGoal.deadline || null,
      progress: insertGoal.progress || 0,
      category: insertGoal.category || "personal",
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
      id, 
      userId,
      date: insertEntry.date,
      sleepHours: insertEntry.sleepHours || null,
      sleepQuality: insertEntry.sleepQuality || null,
      exerciseMinutes: insertEntry.exerciseMinutes || null,
      exerciseType: insertEntry.exerciseType || null,
      caloriesBurned: insertEntry.caloriesBurned || null,
      mood: insertEntry.mood || null,
      notes: insertEntry.notes || null,
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
      id, 
      userId,
      duration: insertSession.duration,
      type: insertSession.type || "pomodoro",
      completed: insertSession.completed || false,
      date: insertSession.date,
      createdAt: new Date()
    };
    this.timerSessions.set(id, session);
    return session;
  }

  // Food Items
  async searchFoodItems(query: string, limit = 20): Promise<FoodItem[]> {
    const results: FoodItem[] = [];
    const searchTerm = query.toLowerCase();
    
    for (const food of Array.from(this.foodItems.values())) {
      if (
        food.name.toLowerCase().includes(searchTerm) ||
        (food.brand && food.brand.toLowerCase().includes(searchTerm))
      ) {
        results.push(food);
        if (results.length >= limit) break;
      }
    }
    
    return results;
  }

  async getFoodItem(id: string): Promise<FoodItem | undefined> {
    return this.foodItems.get(id);
  }

  async getFoodItemByBarcode(barcode: string): Promise<FoodItem | undefined> {
    for (const food of Array.from(this.foodItems.values())) {
      if (food.barcode === barcode) {
        return food;
      }
    }
    return undefined;
  }

  async createFoodItem(insertFoodItem: InsertFoodItem): Promise<FoodItem> {
    const id = randomUUID();
    const foodItem: FoodItem = {
      id,
      name: insertFoodItem.name,
      brand: insertFoodItem.brand || null,
      barcode: insertFoodItem.barcode || null,
      servings: insertFoodItem.servings || null,
      nutrients: insertFoodItem.nutrients,
      source: insertFoodItem.source,
      verified: insertFoodItem.verified || false,
      createdAt: new Date()
    };
    this.foodItems.set(id, foodItem);
    return foodItem;
  }

  // Meal Entries
  async getMealEntries(userId: string, date?: string): Promise<MealEntry[]> {
    return Array.from(this.mealEntries.values()).filter(entry => 
      entry.userId === userId && (!date || entry.date === date)
    );
  }

  async createMealEntry(userId: string, insertEntry: InsertMealEntry): Promise<MealEntry> {
    const id = randomUUID();
    const entry: MealEntry = {
      id,
      userId,
      date: insertEntry.date,
      mealType: insertEntry.mealType,
      datetime: insertEntry.datetime,
      items: insertEntry.items,
      source: insertEntry.source,
      totalsCache: insertEntry.totalsCache || null,
      createdAt: new Date()
    };
    this.mealEntries.set(id, entry);
    return entry;
  }

  async updateMealEntry(id: string, updateEntry: Partial<MealEntry>): Promise<MealEntry | undefined> {
    const existing = this.mealEntries.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateEntry };
    this.mealEntries.set(id, updated);
    return updated;
  }

  async deleteMealEntry(id: string): Promise<boolean> {
    return this.mealEntries.delete(id);
  }

  // Nutrition Goals
  async getNutritionGoal(userId: string): Promise<NutritionGoal | undefined> {
    for (const goal of Array.from(this.nutritionGoals.values())) {
      if (goal.userId === userId && goal.isActive) {
        return goal;
      }
    }
    return undefined;
  }

  async createNutritionGoal(userId: string, insertGoal: InsertNutritionGoal): Promise<NutritionGoal> {
    const id = randomUUID();
    const goal: NutritionGoal = {
      id,
      userId,
      calorieTarget: insertGoal.calorieTarget,
      proteinTarget: insertGoal.proteinTarget,
      carbsTarget: insertGoal.carbsTarget,
      fatTarget: insertGoal.fatTarget,
      fiberTarget: insertGoal.fiberTarget || 25,
      sodiumTarget: insertGoal.sodiumTarget || 2300,
      isActive: true,
      createdAt: new Date()
    };
    this.nutritionGoals.set(id, goal);
    return goal;
  }

  async updateNutritionGoal(id: string, updateGoal: Partial<NutritionGoal>): Promise<NutritionGoal | undefined> {
    const existing = this.nutritionGoals.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateGoal };
    this.nutritionGoals.set(id, updated);
    return updated;
  }

  private seedFoodDatabase(): void {
    // Common foods with accurate nutritional data
    const commonFoods = [
      {
        name: "Banana",
        brand: null,
        barcode: "123456789012",
        servings: [
          { unit: "medium", grams: 118, description: "1 medium banana (7-8 inches)" },
          { unit: "large", grams: 136, description: "1 large banana (8-9 inches)" },
          { unit: "cup", grams: 150, description: "1 cup sliced" }
        ],
        nutrients: {
          calories: 89,
          protein: 1.1,
          carbs: 22.8,
          fat: 0.3,
          fiber: 2.6,
          sugar: 12.2,
          sodium: 1,
          potassium: 358,
          vitaminB12: 0
        },
        source: "usda" as const,
        verified: true
      },
      {
        name: "Chicken Breast",
        brand: null,
        barcode: "234567890123",
        servings: [
          { unit: "breast", grams: 172, description: "1 breast, boneless, skinless" },
          { unit: "cup", grams: 140, description: "1 cup diced" },
          { unit: "oz", grams: 28.35, description: "1 ounce" }
        ],
        nutrients: {
          calories: 165,
          protein: 31,
          carbs: 0,
          fat: 3.6,
          fiber: 0,
          sugar: 0,
          sodium: 74,
          potassium: 256,
          iron: 0.9
        },
        source: "usda" as const,
        verified: true
      },
      {
        name: "Brown Rice",
        brand: null,
        barcode: "345678901234",
        servings: [
          { unit: "cup", grams: 195, description: "1 cup cooked" },
          { unit: "cup-dry", grams: 185, description: "1 cup uncooked" }
        ],
        nutrients: {
          calories: 111,
          protein: 2.6,
          carbs: 23,
          fat: 0.9,
          fiber: 1.8,
          sugar: 0.4,
          sodium: 5,
          magnesium: 43,
          iron: 0.4
        },
        source: "usda" as const,
        verified: true
      },
      {
        name: "Greek Yogurt",
        brand: "Generic",
        barcode: "456789012345",
        servings: [
          { unit: "cup", grams: 245, description: "1 cup (8 fl oz)" },
          { unit: "container", grams: 170, description: "1 container (6 oz)" }
        ],
        nutrients: {
          calories: 59,
          protein: 10,
          carbs: 3.6,
          fat: 0.4,
          fiber: 0,
          sugar: 3.2,
          sodium: 36,
          calcium: 110,
          vitaminB12: 0.5
        },
        source: "usda" as const,
        verified: true
      },
      {
        name: "Almonds",
        brand: null,
        barcode: "567890123456",
        servings: [
          { unit: "oz", grams: 28, description: "1 ounce (23 almonds)" },
          { unit: "cup", grams: 143, description: "1 cup whole" }
        ],
        nutrients: {
          calories: 579,
          protein: 21.2,
          carbs: 21.6,
          fat: 49.9,
          fiber: 12.5,
          sugar: 4.4,
          sodium: 1,
          calcium: 269,
          magnesium: 270,
          iron: 3.7
        },
        source: "usda" as const,
        verified: true
      }
    ];

    commonFoods.forEach(food => {
      const id = randomUUID();
      this.foodItems.set(id, {
        id,
        name: food.name,
        brand: food.brand,
        barcode: food.barcode,
        servings: food.servings,
        nutrients: food.nutrients,
        source: food.source,
        verified: food.verified,
        createdAt: new Date()
      });
    });
  }
}

export const storage = new MemStorage();
