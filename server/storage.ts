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
  type InsertNutritionGoal,
  type Exercise,
  type InsertExercise,
  type Workout,
  type InsertWorkout,
  type Set,
  type InsertSet,
  type CardioEntry,
  type InsertCardioEntry,
  type ScreenTimeApp,
  type InsertScreenTimeApp,
  type ScreenTimeEntry,
  type InsertScreenTimeEntry,
  type ScreenTimeLimit,
  type InsertScreenTimeLimit,
  type WatchlistItem,
  type InsertWatchlistItem,
  type TodoCategory,
  type InsertTodoCategory,
  type Todo,
  type InsertTodo,
  type CalendarEvent,
  type InsertCalendarEvent,
  type WeeklyPlan,
  type InsertWeeklyPlan,
  type DailyPlan,
  type InsertDailyPlan
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

  // Exercises
  getExercises(): Promise<Exercise[]>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  
  // Workouts
  getWorkouts(userId: string, limit?: number, offset?: number): Promise<Workout[]>;
  getWorkout(id: string): Promise<Workout | undefined>;
  startWorkout(userId: string, workout: InsertWorkout): Promise<Workout>;
  finishWorkout(id: string, notes?: string): Promise<Workout | undefined>;
  deleteWorkout(id: string): Promise<boolean>;
  
  // Sets
  getSetsForWorkout(workoutId: string): Promise<Set[]>;
  addSetToWorkout(workoutId: string, set: InsertSet): Promise<Set>;
  updateSet(id: string, set: Partial<Set>): Promise<Set | undefined>;
  deleteSet(id: string): Promise<boolean>;
  
  // Cardio
  getCardioEntries(userId: string, date?: string): Promise<CardioEntry[]>;
  createCardioEntry(userId: string, entry: InsertCardioEntry): Promise<CardioEntry>;

  // Screen Time Apps
  getScreenTimeApps(): Promise<ScreenTimeApp[]>;
  createScreenTimeApp(app: InsertScreenTimeApp): Promise<ScreenTimeApp>;
  updateScreenTimeApp(id: string, app: Partial<ScreenTimeApp>): Promise<ScreenTimeApp | undefined>;

  // Screen Time Entries
  getScreenTimeEntries(userId: string, date?: string): Promise<ScreenTimeEntry[]>;
  createScreenTimeEntry(userId: string, entry: InsertScreenTimeEntry): Promise<ScreenTimeEntry>;
  getScreenTimeEntriesByWeek(userId: string, startDate: string): Promise<ScreenTimeEntry[]>;

  // Screen Time Limits
  getScreenTimeLimits(userId: string): Promise<ScreenTimeLimit[]>;
  createScreenTimeLimit(userId: string, limit: InsertScreenTimeLimit): Promise<ScreenTimeLimit>;
  updateScreenTimeLimit(id: string, limit: Partial<ScreenTimeLimit>): Promise<ScreenTimeLimit | undefined>;
  deleteScreenTimeLimit(id: string): Promise<boolean>;

  // Watchlist
  getWatchlistItems(userId: string): Promise<WatchlistItem[]>;
  createWatchlistItem(userId: string, item: InsertWatchlistItem): Promise<WatchlistItem>;
  updateWatchlistItem(id: string, item: Partial<WatchlistItem>): Promise<WatchlistItem | undefined>;
  deleteWatchlistItem(id: string): Promise<boolean>;

  // Todo Categories
  getTodoCategories(userId: string): Promise<TodoCategory[]>;
  createTodoCategory(userId: string, category: InsertTodoCategory): Promise<TodoCategory>;
  updateTodoCategory(id: string, category: Partial<TodoCategory>): Promise<TodoCategory | undefined>;
  deleteTodoCategory(id: string): Promise<boolean>;

  // Todos
  getTodos(userId: string, categoryId?: string): Promise<Todo[]>;
  getTodo(id: string): Promise<Todo | undefined>;
  createTodo(userId: string, todo: InsertTodo): Promise<Todo>;
  updateTodo(id: string, todo: Partial<Todo>): Promise<Todo | undefined>;
  deleteTodo(id: string): Promise<boolean>;
  getTodosByStatus(userId: string, status: string): Promise<Todo[]>;
  getTodosByDueDate(userId: string, date: string): Promise<Todo[]>;

  // Calendar Events
  getCalendarEvents(userId: string, startDate?: string, endDate?: string): Promise<CalendarEvent[]>;
  createCalendarEvent(userId: string, event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent | undefined>;
  deleteCalendarEvent(id: string): Promise<boolean>;

  // Weekly Plans
  getWeeklyPlans(userId: string): Promise<WeeklyPlan[]>;
  getWeeklyPlan(userId: string, weekStartDate: string): Promise<WeeklyPlan | undefined>;
  createWeeklyPlan(userId: string, plan: InsertWeeklyPlan): Promise<WeeklyPlan>;
  updateWeeklyPlan(id: string, plan: Partial<WeeklyPlan>): Promise<WeeklyPlan | undefined>;
  deleteWeeklyPlan(id: string): Promise<boolean>;

  // Daily Plans
  getDailyPlans(userId: string, weekStartDate?: string): Promise<DailyPlan[]>;
  getDailyPlan(userId: string, date: string): Promise<DailyPlan | undefined>;
  createDailyPlan(userId: string, plan: InsertDailyPlan): Promise<DailyPlan>;
  updateDailyPlan(id: string, plan: Partial<DailyPlan>): Promise<DailyPlan | undefined>;
  deleteDailyPlan(id: string): Promise<boolean>;
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
  private exercises: Map<string, Exercise>;
  private workouts: Map<string, Workout>;
  private sets: Map<string, Set>;
  private cardioEntries: Map<string, CardioEntry>;
  private screenTimeApps: Map<string, ScreenTimeApp>;
  private screenTimeEntries: Map<string, ScreenTimeEntry>;
  private screenTimeLimits: Map<string, ScreenTimeLimit>;
  private watchlistItems: Map<string, WatchlistItem>;
  private todoCategories: Map<string, TodoCategory>;
  private todos: Map<string, Todo>;
  private calendarEvents: Map<string, CalendarEvent>;
  private weeklyPlans: Map<string, WeeklyPlan>;
  private dailyPlans: Map<string, DailyPlan>;

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
    this.exercises = new Map();
    this.workouts = new Map();
    this.sets = new Map();
    this.cardioEntries = new Map();
    this.screenTimeApps = new Map();
    this.screenTimeEntries = new Map();
    this.screenTimeLimits = new Map();
    this.watchlistItems = new Map();
    this.todoCategories = new Map();
    this.todos = new Map();
    this.calendarEvents = new Map();
    this.weeklyPlans = new Map();
    this.dailyPlans = new Map();

    // Create a default user for demo purposes
    const defaultUser: User = {
      id: "default-user",
      username: "demo",
      password: "demo"
    };
    this.users.set(defaultUser.id, defaultUser);
    
    // Seed some common food items for testing
    this.seedFoodDatabase();
    
    // Seed basic exercises
    this.seedExerciseDatabase();
    
    // Seed screen time apps
    this.seedScreenTimeApps();
    
    // Seed todo categories
    this.seedTodoCategories();
    
    // Seed sample todos
    this.seedTodos();
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

  private seedExerciseDatabase() {
    const basicExercises = [
      "Squat",
      "Bench Press", 
      "Deadlift",
      "Overhead Press",
      "Barbell Row",
      "Pull-up",
      "Chin-up",
      "Dip",
      "Lat Pulldown",
      "Leg Press",
      "Leg Curl",
      "Leg Extension",
      "Calf Raise",
      "Bicep Curl",
      "Tricep Extension",
      "Shoulder Raise",
      "Push-up",
      "Plank",
      "Lunge",
      "Hip Thrust"
    ];

    basicExercises.forEach(name => {
      const id = randomUUID();
      this.exercises.set(id, {
        id,
        name,
        isCustom: false,
        createdAt: new Date()
      });
    });
  }

  // Exercise methods
  async getExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const id = randomUUID();
    const now = new Date();
    const newExercise: Exercise = {
      id,
      name: exercise.name,
      isCustom: exercise.isCustom ?? true,
      createdAt: now
    };
    this.exercises.set(id, newExercise);
    return newExercise;
  }

  // Workout methods
  async getWorkouts(userId: string, limit = 20, offset = 0): Promise<Workout[]> {
    const userWorkouts = Array.from(this.workouts.values())
      .filter(workout => workout.userId === userId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(offset, offset + limit);
    return userWorkouts;
  }

  async getWorkout(id: string): Promise<Workout | undefined> {
    return this.workouts.get(id);
  }

  async startWorkout(userId: string, workout: InsertWorkout): Promise<Workout> {
    const id = randomUUID();
    const now = new Date();
    const newWorkout: Workout = {
      id,
      userId,
      startedAt: workout.startedAt || now,
      endedAt: workout.endedAt ?? null,
      notes: workout.notes ?? null,
      createdAt: now
    };
    this.workouts.set(id, newWorkout);
    return newWorkout;
  }

  async finishWorkout(id: string, notes?: string): Promise<Workout | undefined> {
    const workout = this.workouts.get(id);
    if (!workout) return undefined;
    
    const updatedWorkout: Workout = {
      ...workout,
      endedAt: new Date(),
      notes: notes ?? workout.notes
    };
    this.workouts.set(id, updatedWorkout);
    return updatedWorkout;
  }

  async deleteWorkout(id: string): Promise<boolean> {
    // Also delete all sets for this workout
    for (const [setId, set] of this.sets.entries()) {
      if (set.workoutId === id) {
        this.sets.delete(setId);
      }
    }
    return this.workouts.delete(id);
  }

  // Set methods
  async getSetsForWorkout(workoutId: string): Promise<Set[]> {
    return Array.from(this.sets.values())
      .filter(set => set.workoutId === workoutId)
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }

  async addSetToWorkout(workoutId: string, set: InsertSet): Promise<Set> {
    const id = randomUUID();
    const now = new Date();
    
    // Get current max order index for this workout
    const existingSets = await this.getSetsForWorkout(workoutId);
    const maxOrderIndex = existingSets.reduce((max, s) => Math.max(max, s.orderIndex ?? 0), -1);
    
    const newSet: Set = {
      id,
      workoutId: set.workoutId,
      exerciseId: set.exerciseId,
      weight: set.weight,
      reps: set.reps,
      orderIndex: set.orderIndex ?? (maxOrderIndex + 1),
      createdAt: now
    };
    this.sets.set(id, newSet);
    return newSet;
  }

  async updateSet(id: string, set: Partial<Set>): Promise<Set | undefined> {
    const existingSet = this.sets.get(id);
    if (!existingSet) return undefined;
    
    const updatedSet: Set = { ...existingSet, ...set };
    this.sets.set(id, updatedSet);
    return updatedSet;
  }

  async deleteSet(id: string): Promise<boolean> {
    return this.sets.delete(id);
  }

  // Cardio methods
  async getCardioEntries(userId: string, date?: string): Promise<CardioEntry[]> {
    let entries = Array.from(this.cardioEntries.values())
      .filter(entry => entry.userId === userId);
    
    if (date) {
      entries = entries.filter(entry => entry.date === date);
    }
    
    return entries.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async createCardioEntry(userId: string, entry: InsertCardioEntry): Promise<CardioEntry> {
    const id = randomUUID();
    const now = new Date();
    const newEntry: CardioEntry = {
      id,
      userId,
      date: entry.date,
      type: entry.type,
      durationSec: entry.durationSec,
      distanceMeters: entry.distanceMeters ?? null,
      notes: entry.notes ?? null,
      createdAt: now
    };
    this.cardioEntries.set(id, newEntry);
    return newEntry;
  }

  // Screen Time Apps methods
  async getScreenTimeApps(): Promise<ScreenTimeApp[]> {
    return Array.from(this.screenTimeApps.values()).filter(app => !app.isExcluded);
  }

  async createScreenTimeApp(app: InsertScreenTimeApp): Promise<ScreenTimeApp> {
    const id = randomUUID();
    const now = new Date();
    const newApp: ScreenTimeApp = {
      id,
      name: app.name,
      category: app.category || "Other",
      isExcluded: app.isExcluded || false,
      createdAt: now
    };
    this.screenTimeApps.set(id, newApp);
    return newApp;
  }

  async updateScreenTimeApp(id: string, app: Partial<ScreenTimeApp>): Promise<ScreenTimeApp | undefined> {
    const existingApp = this.screenTimeApps.get(id);
    if (!existingApp) return undefined;
    
    const updatedApp: ScreenTimeApp = { ...existingApp, ...app };
    this.screenTimeApps.set(id, updatedApp);
    return updatedApp;
  }

  // Screen Time Entries methods
  async getScreenTimeEntries(userId: string, date?: string): Promise<ScreenTimeEntry[]> {
    let entries = Array.from(this.screenTimeEntries.values())
      .filter(entry => entry.userId === userId);
    
    if (date) {
      entries = entries.filter(entry => entry.date === date);
    }
    
    return entries.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async createScreenTimeEntry(userId: string, entry: InsertScreenTimeEntry): Promise<ScreenTimeEntry> {
    const id = randomUUID();
    const now = new Date();
    const newEntry: ScreenTimeEntry = {
      id,
      userId,
      appId: entry.appId,
      date: entry.date,
      minutes: entry.minutes,
      createdAt: now
    };
    this.screenTimeEntries.set(id, newEntry);
    return newEntry;
  }

  async getScreenTimeEntriesByWeek(userId: string, startDate: string): Promise<ScreenTimeEntry[]> {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return Array.from(this.screenTimeEntries.values())
      .filter(entry => {
        if (entry.userId !== userId) return false;
        const entryDate = new Date(entry.date);
        return entryDate >= start && entryDate <= end;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Screen Time Limits methods
  async getScreenTimeLimits(userId: string): Promise<ScreenTimeLimit[]> {
    return Array.from(this.screenTimeLimits.values())
      .filter(limit => limit.userId === userId && limit.isActive);
  }

  async createScreenTimeLimit(userId: string, limit: InsertScreenTimeLimit): Promise<ScreenTimeLimit> {
    const id = randomUUID();
    const now = new Date();
    const newLimit: ScreenTimeLimit = {
      id,
      userId,
      appId: limit.appId || null,
      limitMinutes: limit.limitMinutes,
      isActive: limit.isActive ?? true,
      createdAt: now
    };
    this.screenTimeLimits.set(id, newLimit);
    return newLimit;
  }

  async updateScreenTimeLimit(id: string, limit: Partial<ScreenTimeLimit>): Promise<ScreenTimeLimit | undefined> {
    const existingLimit = this.screenTimeLimits.get(id);
    if (!existingLimit) return undefined;
    
    const updatedLimit: ScreenTimeLimit = { ...existingLimit, ...limit };
    this.screenTimeLimits.set(id, updatedLimit);
    return updatedLimit;
  }

  async deleteScreenTimeLimit(id: string): Promise<boolean> {
    return this.screenTimeLimits.delete(id);
  }

  // Watchlist methods
  async getWatchlistItems(userId: string): Promise<WatchlistItem[]> {
    return Array.from(this.watchlistItems.values())
      .filter(item => item.userId === userId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async createWatchlistItem(userId: string, item: InsertWatchlistItem): Promise<WatchlistItem> {
    const id = randomUUID();
    const now = new Date();
    const newItem: WatchlistItem = {
      id,
      userId,
      title: item.title,
      type: item.type,
      source: item.source || null,
      link: item.link || null,
      length: item.length || null,
      status: item.status || "To Watch",
      finishedAt: item.finishedAt || null,
      notes: item.notes || null,
      createdAt: now
    };
    this.watchlistItems.set(id, newItem);
    return newItem;
  }

  async updateWatchlistItem(id: string, item: Partial<WatchlistItem>): Promise<WatchlistItem | undefined> {
    const existingItem = this.watchlistItems.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem: WatchlistItem = { ...existingItem, ...item };
    
    // If status changed to "Done", set finishedAt
    if (item.status === "Done" && existingItem.status !== "Done") {
      updatedItem.finishedAt = new Date();
    }
    
    this.watchlistItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteWatchlistItem(id: string): Promise<boolean> {
    return this.watchlistItems.delete(id);
  }

  private seedTodoCategories() {
    const defaultCategories = [
      { name: "Work", color: "#3B82F6", icon: "💼", description: "Professional tasks and projects" },
      { name: "Personal", color: "#10B981", icon: "🏠", description: "Personal life and family tasks" },
      { name: "Health", color: "#F59E0B", icon: "💪", description: "Health, fitness, and wellness" },
      { name: "Learning", color: "#8B5CF6", icon: "📚", description: "Education and skill development" },
      { name: "Finance", color: "#EF4444", icon: "💰", description: "Money, bills, and financial planning" },
      { name: "Travel", color: "#06B6D4", icon: "✈️", description: "Trip planning and travel tasks" },
      { name: "Shopping", color: "#EC4899", icon: "🛒", description: "Shopping lists and purchases" },
      { name: "Social", color: "#84CC16", icon: "👥", description: "Social events and relationships" }
    ];

    defaultCategories.forEach((category, index) => {
      const id = randomUUID();
      const todoCategory: TodoCategory = {
        id,
        userId: "default-user",
        name: category.name,
        color: category.color,
        icon: category.icon,
        description: category.description,
        orderIndex: index,
        isArchived: false,
        createdAt: new Date()
      };
      this.todoCategories.set(id, todoCategory);
    });
  }

  private seedTodos() {
    const categories = Array.from(this.todoCategories.values());
    if (categories.length === 0) return;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    // Sample todos demonstrating all Eisenhower Matrix quadrants
    const sampleTodos = [
      // Quadrant 1: Urgent & Important (Do First)
      {
        categoryId: categories.find(c => c.name === "Work")?.id || categories[0].id,
        title: "Fix critical server bug",
        description: "Production server is down, affecting all users",
        isUrgent: true,
        isImportant: true,
        priorityScore: 5,
        dueDate: formatDate(today),
        estimatedMinutes: 60
      },
      {
        categoryId: categories.find(c => c.name === "Health")?.id || categories[2].id,
        title: "Emergency dentist appointment",
        description: "Severe toothache needs immediate attention",
        isUrgent: true,
        isImportant: true,
        priorityScore: 4,
        dueDate: formatDate(today),
        estimatedMinutes: 120
      },
      {
        categoryId: categories.find(c => c.name === "Finance")?.id || categories[4].id,
        title: "Pay overdue credit card bill",
        description: "Payment is 3 days overdue, avoid late fees",
        isUrgent: true,
        isImportant: true,
        priorityScore: 4,
        dueDate: formatDate(yesterday),
        estimatedMinutes: 15
      },

      // Quadrant 2: Not Urgent & Important (Schedule)
      {
        categoryId: categories.find(c => c.name === "Learning")?.id || categories[3].id,
        title: "Learn new programming framework",
        description: "Research and practice React Native for upcoming project",
        isUrgent: false,
        isImportant: true,
        priorityScore: 4,
        dueDate: formatDate(nextWeek),
        estimatedMinutes: 240
      },
      {
        categoryId: categories.find(c => c.name === "Health")?.id || categories[2].id,
        title: "Schedule annual health checkup",
        description: "Book appointment with primary care doctor",
        isUrgent: false,
        isImportant: true,
        priorityScore: 3,
        estimatedMinutes: 30
      },
      {
        categoryId: categories.find(c => c.name === "Personal")?.id || categories[1].id,
        title: "Plan family vacation",
        description: "Research destinations and book flights for summer trip",
        isUrgent: false,
        isImportant: true,
        priorityScore: 3,
        estimatedMinutes: 180
      },
      {
        categoryId: categories.find(c => c.name === "Finance")?.id || categories[4].id,
        title: "Review investment portfolio",
        description: "Analyze performance and rebalance investments",
        isUrgent: false,
        isImportant: true,
        priorityScore: 5,
        estimatedMinutes: 90
      },

      // Quadrant 3: Urgent & Not Important (Delegate)
      {
        categoryId: categories.find(c => c.name === "Work")?.id || categories[0].id,
        title: "Respond to non-critical emails",
        description: "Reply to various meeting invitations and updates",
        isUrgent: true,
        isImportant: false,
        priorityScore: 2,
        dueDate: formatDate(today),
        estimatedMinutes: 45
      },
      {
        categoryId: categories.find(c => c.name === "Personal")?.id || categories[1].id,
        title: "Pick up dry cleaning",
        description: "Collect shirts before store closes today",
        isUrgent: true,
        isImportant: false,
        priorityScore: 1,
        dueDate: formatDate(today),
        estimatedMinutes: 20
      },
      {
        categoryId: categories.find(c => c.name === "Shopping")?.id || categories[6].id,
        title: "Buy groceries for dinner",
        description: "Need ingredients for tonight's dinner party",
        isUrgent: true,
        isImportant: false,
        priorityScore: 3,
        dueDate: formatDate(today),
        estimatedMinutes: 60
      },

      // Quadrant 4: Not Urgent & Not Important (Eliminate)
      {
        categoryId: categories.find(c => c.name === "Personal")?.id || categories[1].id,
        title: "Organize old photos",
        description: "Sort through digital photo collection from 2019",
        isUrgent: false,
        isImportant: false,
        priorityScore: 1,
        estimatedMinutes: 120
      },
      {
        categoryId: categories.find(c => c.name === "Social")?.id || categories[7].id,
        title: "Check social media updates",
        description: "Browse Instagram and Facebook feeds",
        isUrgent: false,
        isImportant: false,
        priorityScore: 1,
        estimatedMinutes: 30
      },
      {
        categoryId: categories.find(c => c.name === "Personal")?.id || categories[1].id,
        title: "Watch random YouTube videos",
        description: "Browse trending videos and entertainment content",
        isUrgent: false,
        isImportant: false,
        priorityScore: 1,
        estimatedMinutes: 60
      }
    ];

    sampleTodos.forEach((todoData, index) => {
      const id = randomUUID();
      const todo: Todo = {
        id,
        userId: "default-user",
        categoryId: todoData.categoryId,
        title: todoData.title,
        description: todoData.description || null,
        priority: "medium",
        status: "pending",
        isUrgent: todoData.isUrgent,
        isImportant: todoData.isImportant,
        priorityScore: todoData.priorityScore,
        dueDate: todoData.dueDate || null,
        dueTime: null,
        estimatedMinutes: todoData.estimatedMinutes || null,
        tags: null,
        dependencies: null,
        notes: null,
        completedAt: null,
        orderIndex: index,
        createdAt: new Date()
      };
      this.todos.set(id, todo);
    });
  }

  private seedScreenTimeApps() {
    const commonApps = [
      { name: "Instagram", category: "Social" },
      { name: "TikTok", category: "Social" },
      { name: "Facebook", category: "Social" },
      { name: "Twitter/X", category: "Social" },
      { name: "YouTube", category: "Entertainment" },
      { name: "Netflix", category: "Entertainment" },
      { name: "Spotify", category: "Entertainment" },
      { name: "Chrome", category: "Productivity" },
      { name: "Safari", category: "Productivity" },
      { name: "Slack", category: "Productivity" },
      { name: "Microsoft Teams", category: "Productivity" },
      { name: "Zoom", category: "Productivity" },
      { name: "Gmail", category: "Productivity" },
      { name: "WhatsApp", category: "Communication" },
      { name: "Messages", category: "Communication" },
      { name: "Discord", category: "Communication" },
      { name: "Candy Crush", category: "Games" },
      { name: "Among Us", category: "Games" },
      { name: "Fortnite", category: "Games" },
      { name: "Pokemon GO", category: "Games" }
    ];

    commonApps.forEach(app => {
      const id = randomUUID();
      const screenTimeApp: ScreenTimeApp = {
        id,
        name: app.name,
        category: app.category,
        isExcluded: false,
        createdAt: new Date()
      };
      this.screenTimeApps.set(id, screenTimeApp);
    });
  }

  private seedTodoCategories() {
    const defaultCategories = [
      { name: "Work", color: "#3B82F6", icon: "💼", description: "Professional tasks and projects" },
      { name: "Personal", color: "#10B981", icon: "🏠", description: "Personal life and family tasks" },
      { name: "Health", color: "#F59E0B", icon: "💪", description: "Health, fitness, and wellness" },
      { name: "Learning", color: "#8B5CF6", icon: "📚", description: "Education and skill development" },
      { name: "Finance", color: "#EF4444", icon: "💰", description: "Money, bills, and financial planning" },
      { name: "Travel", color: "#06B6D4", icon: "✈️", description: "Trip planning and travel tasks" },
      { name: "Shopping", color: "#EC4899", icon: "🛒", description: "Shopping lists and purchases" },
      { name: "Social", color: "#84CC16", icon: "👥", description: "Social events and relationships" }
    ];

    defaultCategories.forEach((category, index) => {
      const id = randomUUID();
      const todoCategory: TodoCategory = {
        id,
        userId: "default-user",
        name: category.name,
        color: category.color,
        icon: category.icon,
        description: category.description,
        orderIndex: index,
        isArchived: false,
        createdAt: new Date()
      };
      this.todoCategories.set(id, todoCategory);
    });
  }

  // Todo Categories methods
  async getTodoCategories(userId: string): Promise<TodoCategory[]> {
    return Array.from(this.todoCategories.values())
      .filter(category => category.userId === userId && !category.isArchived)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async createTodoCategory(userId: string, category: InsertTodoCategory): Promise<TodoCategory> {
    const id = randomUUID();
    const now = new Date();
    const newCategory: TodoCategory = {
      id,
      userId,
      name: category.name,
      color: category.color || "#3B82F6",
      icon: category.icon || "📝",
      description: category.description || null,
      orderIndex: category.orderIndex || 0,
      isArchived: category.isArchived || false,
      createdAt: now
    };
    this.todoCategories.set(id, newCategory);
    return newCategory;
  }

  async updateTodoCategory(id: string, category: Partial<TodoCategory>): Promise<TodoCategory | undefined> {
    const existingCategory = this.todoCategories.get(id);
    if (!existingCategory) return undefined;
    
    const updatedCategory: TodoCategory = { ...existingCategory, ...category };
    this.todoCategories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteTodoCategory(id: string): Promise<boolean> {
    return this.todoCategories.delete(id);
  }

  // Todos methods
  async getTodos(userId: string, categoryId?: string): Promise<Todo[]> {
    let todos = Array.from(this.todos.values())
      .filter(todo => todo.userId === userId);
    
    if (categoryId) {
      todos = todos.filter(todo => todo.categoryId === categoryId);
    }
    
    return todos.sort((a, b) => {
      // Sort by priority (urgent > high > medium > low), then by due date
      const priorityOrder = { "urgent": 0, "high": 1, "medium": 2, "low": 3 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 2;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 2;
      
      if (aPriority !== bPriority) return aPriority - bPriority;
      
      // If same priority, sort by due date
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }

  async getTodo(id: string): Promise<Todo | undefined> {
    return this.todos.get(id);
  }

  async createTodo(userId: string, todo: InsertTodo): Promise<Todo> {
    const id = randomUUID();
    const now = new Date();
    const newTodo: Todo = {
      id,
      userId,
      categoryId: todo.categoryId,
      title: todo.title,
      description: todo.description || null,
      priority: todo.priority || "medium",
      status: todo.status || "pending",
      isUrgent: todo.isUrgent || false,
      isImportant: todo.isImportant || false,
      priorityScore: todo.priorityScore || 3,
      dueDate: todo.dueDate || null,
      dueTime: todo.dueTime || null,
      estimatedMinutes: todo.estimatedMinutes || null,
      tags: todo.tags || null,
      dependencies: todo.dependencies || null,
      notes: todo.notes || null,
      completedAt: null,
      orderIndex: todo.orderIndex || 0,
      createdAt: now
    };
    this.todos.set(id, newTodo);
    return newTodo;
  }

  async updateTodo(id: string, todo: Partial<Todo>): Promise<Todo | undefined> {
    const existingTodo = this.todos.get(id);
    if (!existingTodo) return undefined;
    
    const updatedTodo: Todo = { ...existingTodo, ...todo };
    
    // If status changed to "completed", set completedAt
    if (todo.status === "completed" && existingTodo.status !== "completed") {
      updatedTodo.completedAt = new Date();
    }
    
    this.todos.set(id, updatedTodo);
    return updatedTodo;
  }

  async deleteTodo(id: string): Promise<boolean> {
    return this.todos.delete(id);
  }

  async getTodosByStatus(userId: string, status: string): Promise<Todo[]> {
    return Array.from(this.todos.values())
      .filter(todo => todo.userId === userId && todo.status === status);
  }

  async getTodosByDueDate(userId: string, date: string): Promise<Todo[]> {
    return Array.from(this.todos.values())
      .filter(todo => todo.userId === userId && todo.dueDate === date);
  }

  // Calendar Events methods
  async getCalendarEvents(userId: string, startDate?: string, endDate?: string): Promise<CalendarEvent[]> {
    let events = Array.from(this.calendarEvents.values())
      .filter(event => event.userId === userId);
    
    if (startDate && endDate) {
      events = events.filter(event => {
        return event.startDate >= startDate && event.startDate <= endDate;
      });
    }
    
    return events.sort((a, b) => {
      const dateCompare = a.startDate.localeCompare(b.startDate);
      if (dateCompare !== 0) return dateCompare;
      if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
      return 0;
    });
  }

  async createCalendarEvent(userId: string, event: InsertCalendarEvent): Promise<CalendarEvent> {
    const id = randomUUID();
    const now = new Date();
    const newEvent: CalendarEvent = {
      id,
      userId,
      title: event.title,
      description: event.description || null,
      eventType: event.eventType || "appointment",
      startDate: event.startDate,
      startTime: event.startTime || null,
      endDate: event.endDate || null,
      endTime: event.endTime || null,
      location: event.location || null,
      isAllDay: event.isAllDay || false,
      isRecurring: event.isRecurring || false,
      recurringPattern: event.recurringPattern || null,
      reminder: event.reminder || null,
      color: event.color || "#3B82F6",
      createdAt: now
    };
    this.calendarEvents.set(id, newEvent);
    return newEvent;
  }

  async updateCalendarEvent(id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent | undefined> {
    const existingEvent = this.calendarEvents.get(id);
    if (!existingEvent) return undefined;
    
    const updatedEvent: CalendarEvent = { ...existingEvent, ...event };
    this.calendarEvents.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteCalendarEvent(id: string): Promise<boolean> {
    return this.calendarEvents.delete(id);
  }

  // Weekly Plans methods
  async getWeeklyPlans(userId: string): Promise<WeeklyPlan[]> {
    return Array.from(this.weeklyPlans.values())
      .filter(plan => plan.userId === userId)
      .sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate));
  }

  async getWeeklyPlan(userId: string, weekStartDate: string): Promise<WeeklyPlan | undefined> {
    return Array.from(this.weeklyPlans.values())
      .find(plan => plan.userId === userId && plan.weekStartDate === weekStartDate);
  }

  async createWeeklyPlan(userId: string, plan: InsertWeeklyPlan): Promise<WeeklyPlan> {
    const id = randomUUID();
    const now = new Date();
    const newPlan: WeeklyPlan = {
      id,
      userId,
      weekStartDate: plan.weekStartDate,
      title: plan.title,
      goals: plan.goals || null,
      priorities: plan.priorities || null,
      notes: plan.notes || null,
      reflection: plan.reflection || null,
      createdAt: now
    };
    this.weeklyPlans.set(id, newPlan);
    return newPlan;
  }

  async updateWeeklyPlan(id: string, plan: Partial<WeeklyPlan>): Promise<WeeklyPlan | undefined> {
    const existingPlan = this.weeklyPlans.get(id);
    if (!existingPlan) return undefined;
    
    const updatedPlan: WeeklyPlan = { ...existingPlan, ...plan };
    this.weeklyPlans.set(id, updatedPlan);
    return updatedPlan;
  }

  async deleteWeeklyPlan(id: string): Promise<boolean> {
    return this.weeklyPlans.delete(id);
  }

  // Daily Plans methods
  async getDailyPlans(userId: string, weekStartDate?: string): Promise<DailyPlan[]> {
    let plans = Array.from(this.dailyPlans.values())
      .filter(plan => plan.userId === userId);
    
    if (weekStartDate) {
      const weekEnd = new Date(weekStartDate);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const weekEndStr = weekEnd.toISOString().split('T')[0];
      
      plans = plans.filter(plan => plan.date >= weekStartDate && plan.date <= weekEndStr);
    }
    
    return plans.sort((a, b) => a.date.localeCompare(b.date));
  }

  async getDailyPlan(userId: string, date: string): Promise<DailyPlan | undefined> {
    return Array.from(this.dailyPlans.values())
      .find(plan => plan.userId === userId && plan.date === date);
  }

  async createDailyPlan(userId: string, plan: InsertDailyPlan): Promise<DailyPlan> {
    const id = randomUUID();
    const now = new Date();
    const newPlan: DailyPlan = {
      id,
      userId,
      weeklyPlanId: plan.weeklyPlanId || null,
      date: plan.date,
      title: plan.title,
      timeBlocks: plan.timeBlocks || null,
      priorities: plan.priorities || null,
      reflection: plan.reflection || null,
      energyLevel: plan.energyLevel || null,
      moodRating: plan.moodRating || null,
      createdAt: now
    };
    this.dailyPlans.set(id, newPlan);
    return newPlan;
  }

  async updateDailyPlan(id: string, plan: Partial<DailyPlan>): Promise<DailyPlan | undefined> {
    const existingPlan = this.dailyPlans.get(id);
    if (!existingPlan) return undefined;
    
    const updatedPlan: DailyPlan = { ...existingPlan, ...plan };
    this.dailyPlans.set(id, updatedPlan);
    return updatedPlan;
  }

  async deleteDailyPlan(id: string): Promise<boolean> {
    return this.dailyPlans.delete(id);
  }
}

export const storage = new MemStorage();
