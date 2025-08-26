import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertHabitSchema, 
  insertHabitEntrySchema,
  insertGoalSchema,
  insertHealthEntrySchema,
  insertTimerSessionSchema,
  insertFoodItemSchema,
  insertMealEntrySchema,
  insertNutritionGoalSchema,
  insertExerciseSchema,
  insertWorkoutSchema,
  insertSetSchema,
  insertCardioEntrySchema,
  insertScreenTimeAppSchema,
  insertScreenTimeEntrySchema,
  insertScreenTimeLimitSchema,
  insertWatchlistItemSchema,
  insertTodoCategorySchema,
  insertTodoSchema,
  insertCalendarEventSchema,
  insertWeeklyPlanSchema,
  insertDailyPlanSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const DEFAULT_USER_ID = "default-user";

  // Habits
  app.get("/api/habits", async (req, res) => {
    try {
      const habits = await storage.getHabits(DEFAULT_USER_ID);
      res.json(habits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch habits" });
    }
  });

  app.post("/api/habits", async (req, res) => {
    try {
      const validatedData = insertHabitSchema.parse(req.body);
      const habit = await storage.createHabit(DEFAULT_USER_ID, validatedData);
      res.json(habit);
    } catch (error) {
      res.status(400).json({ message: "Invalid habit data" });
    }
  });

  app.put("/api/habits/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const habit = await storage.updateHabit(id, req.body);
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      res.json(habit);
    } catch (error) {
      res.status(400).json({ message: "Failed to update habit" });
    }
  });

  app.delete("/api/habits/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteHabit(id);
      if (!deleted) {
        return res.status(404).json({ message: "Habit not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete habit" });
    }
  });

  // Habit Entries
  app.get("/api/habit-entries", async (req, res) => {
    try {
      const { date } = req.query;
      const entries = await storage.getHabitEntries(DEFAULT_USER_ID, date as string);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch habit entries" });
    }
  });

  app.post("/api/habit-entries", async (req, res) => {
    try {
      const validatedData = insertHabitEntrySchema.parse(req.body);
      const entry = await storage.createHabitEntry(DEFAULT_USER_ID, validatedData);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid habit entry data" });
    }
  });

  app.put("/api/habit-entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const entry = await storage.updateHabitEntry(id, req.body);
      if (!entry) {
        return res.status(404).json({ message: "Habit entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Failed to update habit entry" });
    }
  });

  // Goals
  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await storage.getGoals(DEFAULT_USER_ID);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const validatedData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(DEFAULT_USER_ID, validatedData);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ message: "Invalid goal data" });
    }
  });

  app.put("/api/goals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const goal = await storage.updateGoal(id, req.body);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(400).json({ message: "Failed to update goal" });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteGoal(id);
      if (!deleted) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Health Entries
  app.get("/api/health-entries", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const entries = await storage.getHealthEntries(DEFAULT_USER_ID, startDate as string, endDate as string);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch health entries" });
    }
  });

  app.post("/api/health-entries", async (req, res) => {
    try {
      const validatedData = insertHealthEntrySchema.parse(req.body);
      const entry = await storage.createHealthEntry(DEFAULT_USER_ID, validatedData);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid health entry data" });
    }
  });

  app.put("/api/health-entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const entry = await storage.updateHealthEntry(id, req.body);
      if (!entry) {
        return res.status(404).json({ message: "Health entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Failed to update health entry" });
    }
  });

  // Timer Sessions
  app.get("/api/timer-sessions", async (req, res) => {
    try {
      const { date } = req.query;
      const sessions = await storage.getTimerSessions(DEFAULT_USER_ID, date as string);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timer sessions" });
    }
  });

  app.post("/api/timer-sessions", async (req, res) => {
    try {
      const validatedData = insertTimerSessionSchema.parse(req.body);
      const session = await storage.createTimerSession(DEFAULT_USER_ID, validatedData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid timer session data" });
    }
  });

  // Food Items - Search
  app.get("/api/foods/search", async (req, res) => {
    try {
      const { q, limit } = req.query;
      if (!q) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      const foods = await storage.searchFoodItems(q as string, limit ? parseInt(limit as string) : undefined);
      res.json(foods);
    } catch (error) {
      res.status(500).json({ message: "Failed to search foods" });
    }
  });

  app.get("/api/foods/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const food = await storage.getFoodItem(id);
      if (!food) {
        return res.status(404).json({ message: "Food not found" });
      }
      res.json(food);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food" });
    }
  });

  app.post("/api/foods", async (req, res) => {
    try {
      const validatedData = insertFoodItemSchema.parse(req.body);
      const food = await storage.createFoodItem(validatedData);
      res.json(food);
    } catch (error) {
      res.status(400).json({ message: "Invalid food data" });
    }
  });

  // Barcode Scanning
  app.post("/api/scan/barcode", async (req, res) => {
    try {
      const { barcode } = req.body;
      if (!barcode) {
        return res.status(400).json({ message: "Barcode is required" });
      }
      
      const food = await storage.getFoodItemByBarcode(barcode);
      if (!food) {
        return res.status(404).json({ message: "Food not found for barcode" });
      }
      
      res.json({
        food,
        alternatives: [], // Could add similar foods here
        confidence: 100
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to scan barcode" });
    }
  });

  // Meal Entries
  app.get("/api/meals", async (req, res) => {
    try {
      const { date } = req.query;
      const meals = await storage.getMealEntries(DEFAULT_USER_ID, date as string);
      res.json(meals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meals" });
    }
  });

  app.post("/api/log/meal", async (req, res) => {
    try {
      const validatedData = insertMealEntrySchema.parse(req.body);
      const meal = await storage.createMealEntry(DEFAULT_USER_ID, validatedData);
      res.json(meal);
    } catch (error) {
      res.status(400).json({ message: "Invalid meal data" });
    }
  });

  app.put("/api/meals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const meal = await storage.updateMealEntry(id, req.body);
      if (!meal) {
        return res.status(404).json({ message: "Meal not found" });
      }
      res.json(meal);
    } catch (error) {
      res.status(400).json({ message: "Failed to update meal" });
    }
  });

  app.delete("/api/meals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteMealEntry(id);
      if (!deleted) {
        return res.status(404).json({ message: "Meal not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete meal" });
    }
  });

  // Daily Nutrition Totals
  app.get("/api/day/:date/totals", async (req, res) => {
    try {
      const { date } = req.params;
      const meals = await storage.getMealEntries(DEFAULT_USER_ID, date);
      const goal = await storage.getNutritionGoal(DEFAULT_USER_ID);
      
      // Calculate totals from all meals
      let totals = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0
      };

      for (const meal of meals) {
        if (meal.totalsCache) {
          totals.calories += meal.totalsCache.calories;
          totals.protein += meal.totalsCache.protein;
          totals.carbs += meal.totalsCache.carbs;
          totals.fat += meal.totalsCache.fat;
          totals.fiber += meal.totalsCache.fiber || 0;
          totals.sugar += meal.totalsCache.sugar || 0;
          totals.sodium += meal.totalsCache.sodium || 0;
        }
      }

      // Calculate progress percentages
      const progress = goal ? {
        calories: Math.round((totals.calories / goal.calorieTarget) * 100),
        protein: Math.round((totals.protein / goal.proteinTarget) * 100),
        carbs: Math.round((totals.carbs / goal.carbsTarget) * 100),
        fat: Math.round((totals.fat / goal.fatTarget) * 100),
        fiber: Math.round((totals.fiber / (goal.fiberTarget || 25)) * 100),
        sodium: Math.round((totals.sodium / (goal.sodiumTarget || 2300)) * 100)
      } : null;

      // Simple warnings
      const warnings = [];
      if (goal) {
        if (totals.fiber < (goal.fiberTarget || 25) * 0.5) warnings.push("Low fiber intake");
        if (totals.sodium > (goal.sodiumTarget || 2300) * 1.5) warnings.push("High sodium intake");
        if (totals.protein < goal.proteinTarget * 0.7) warnings.push("Low protein intake");
      }

      res.json({
        date,
        totals,
        goals: goal || null,
        progress,
        warnings,
        meals: meals.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate daily totals" });
    }
  });

  // Weekly Report
  app.get("/api/report/weekly", async (req, res) => {
    try {
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const weeklyData = [];
      for (let d = new Date(weekAgo); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const meals = await storage.getMealEntries(DEFAULT_USER_ID, dateStr);
        
        let dayTotals = {
          calories: 0,
          protein: 0,
          fiber: 0,
          sugar: 0
        };

        for (const meal of meals) {
          if (meal.totalsCache) {
            dayTotals.calories += meal.totalsCache.calories;
            dayTotals.protein += meal.totalsCache.protein;
            dayTotals.fiber += meal.totalsCache.fiber || 0;
            dayTotals.sugar += meal.totalsCache.sugar || 0;
          }
        }

        weeklyData.push({
          date: dateStr,
          ...dayTotals
        });
      }

      // Calculate averages
      const averages = {
        calories: Math.round(weeklyData.reduce((sum, day) => sum + day.calories, 0) / 7),
        protein: Math.round(weeklyData.reduce((sum, day) => sum + day.protein, 0) / 7),
        fiber: Math.round(weeklyData.reduce((sum, day) => sum + day.fiber, 0) / 7),
        sugar: Math.round(weeklyData.reduce((sum, day) => sum + day.sugar, 0) / 7)
      };

      res.json({
        period: "7 days",
        averages,
        daily: weeklyData,
        trends: {
          calories: "stable", // Could calculate actual trends
          protein: "stable",
          fiber: "stable"
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate weekly report" });
    }
  });

  // Nutrition Goals
  app.get("/api/nutrition-goals", async (req, res) => {
    try {
      const goal = await storage.getNutritionGoal(DEFAULT_USER_ID);
      res.json(goal || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch nutrition goal" });
    }
  });

  app.post("/api/nutrition-goals", async (req, res) => {
    try {
      const validatedData = insertNutritionGoalSchema.parse(req.body);
      const goal = await storage.createNutritionGoal(DEFAULT_USER_ID, validatedData);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ message: "Invalid nutrition goal data" });
    }
  });

  app.put("/api/nutrition-goals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const goal = await storage.updateNutritionGoal(id, req.body);
      if (!goal) {
        return res.status(404).json({ message: "Nutrition goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(400).json({ message: "Failed to update nutrition goal" });
    }
  });

  // Exercises
  app.get("/api/exercises", async (req, res) => {
    try {
      const exercises = await storage.getExercises();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  app.post("/api/exercises", async (req, res) => {
    try {
      const validatedData = insertExerciseSchema.parse(req.body);
      const exercise = await storage.createExercise(validatedData);
      res.json(exercise);
    } catch (error) {
      res.status(400).json({ message: "Invalid exercise data" });
    }
  });

  // Workouts
  app.post("/api/workouts/start", async (req, res) => {
    try {
      const workout = await storage.startWorkout(DEFAULT_USER_ID, {
        startedAt: new Date(),
        endedAt: null,
        notes: null
      });
      res.json({ workoutId: workout.id, workout });
    } catch (error) {
      res.status(500).json({ message: "Failed to start workout" });
    }
  });

  app.post("/api/workouts/:id/set", async (req, res) => {
    try {
      const { id: workoutId } = req.params;
      const { action, setId, ...setData } = req.body;
      
      if (action === "add") {
        const validatedData = insertSetSchema.parse({
          ...setData,
          workoutId
        });
        const set = await storage.addSetToWorkout(workoutId, validatedData);
        res.json(set);
      } else if (action === "update" && setId) {
        const set = await storage.updateSet(setId, setData);
        if (!set) {
          return res.status(404).json({ message: "Set not found" });
        }
        res.json(set);
      } else if (action === "delete" && setId) {
        const deleted = await storage.deleteSet(setId);
        if (!deleted) {
          return res.status(404).json({ message: "Set not found" });
        }
        res.json({ success: true });
      } else {
        res.status(400).json({ message: "Invalid action or missing setId" });
      }
    } catch (error) {
      res.status(400).json({ message: "Failed to modify set" });
    }
  });

  app.post("/api/workouts/:id/finish", async (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const workout = await storage.finishWorkout(id, notes);
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      res.json(workout);
    } catch (error) {
      res.status(500).json({ message: "Failed to finish workout" });
    }
  });

  app.get("/api/workouts/history", async (req, res) => {
    try {
      const { limit, offset } = req.query;
      const workouts = await storage.getWorkouts(
        DEFAULT_USER_ID, 
        limit ? parseInt(limit as string) : undefined,
        offset ? parseInt(offset as string) : undefined
      );
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout history" });
    }
  });

  app.get("/api/workouts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const workout = await storage.getWorkout(id);
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      
      const sets = await storage.getSetsForWorkout(id);
      res.json({ ...workout, sets });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout" });
    }
  });

  app.delete("/api/workouts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteWorkout(id);
      if (!deleted) {
        return res.status(404).json({ message: "Workout not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete workout" });
    }
  });

  // Cardio
  app.post("/api/cardio", async (req, res) => {
    try {
      const validatedData = insertCardioEntrySchema.parse(req.body);
      const entry = await storage.createCardioEntry(DEFAULT_USER_ID, validatedData);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid cardio data" });
    }
  });

  app.get("/api/cardio", async (req, res) => {
    try {
      const { date } = req.query;
      const entries = await storage.getCardioEntries(DEFAULT_USER_ID, date as string);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cardio entries" });
    }
  });

  // Workout Export CSV
  app.get("/api/export.csv", async (req, res) => {
    try {
      const workouts = await storage.getWorkouts(DEFAULT_USER_ID, 1000); // Get all workouts
      const exercises = await storage.getExercises();
      const exerciseMap = new Map(exercises.map(e => [e.id, e.name]));
      
      let csvContent = "Date,Exercise,Sets,Reps,Weight (kg),Total Volume,Duration (min)\n";
      
      for (const workout of workouts) {
        const sets = await storage.getSetsForWorkout(workout.id);
        const duration = workout.endedAt ? 
          Math.round((new Date(workout.endedAt).getTime() - new Date(workout.startedAt).getTime()) / 60000) : 0;
          
        // Group sets by exercise
        const exerciseGroups = new Map();
        sets.forEach(set => {
          const exerciseName = exerciseMap.get(set.exerciseId) || "Unknown";
          if (!exerciseGroups.has(exerciseName)) {
            exerciseGroups.set(exerciseName, []);
          }
          exerciseGroups.get(exerciseName).push(set);
        });
        
        exerciseGroups.forEach((exerciseSets, exerciseName) => {
          const totalSets = exerciseSets.length;
          const totalReps = exerciseSets.reduce((sum: number, set: any) => sum + set.reps, 0);
          const totalVolume = exerciseSets.reduce((sum: number, set: any) => sum + (set.weight * set.reps), 0);
          const avgWeight = totalSets > 0 ? exerciseSets.reduce((sum: number, set: any) => sum + set.weight, 0) / totalSets : 0;
          
          csvContent += `${workout.startedAt.split('T')[0]},${exerciseName},${totalSets},${totalReps},${avgWeight.toFixed(1)},${totalVolume.toFixed(1)},${duration}\n`;
        });
      }
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="workout-data.csv"');
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to export workout data" });
    }
  });

  // Screen Time Apps
  app.get("/api/screen-time/apps", async (req, res) => {
    try {
      const apps = await storage.getScreenTimeApps();
      res.json(apps);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch screen time apps" });
    }
  });

  app.post("/api/screen-time/apps", async (req, res) => {
    try {
      const validatedData = insertScreenTimeAppSchema.parse(req.body);
      const app = await storage.createScreenTimeApp(validatedData);
      res.json(app);
    } catch (error) {
      res.status(400).json({ message: "Invalid app data" });
    }
  });

  app.put("/api/screen-time/apps/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const app = await storage.updateScreenTimeApp(id, req.body);
      if (!app) {
        return res.status(404).json({ message: "App not found" });
      }
      res.json(app);
    } catch (error) {
      res.status(400).json({ message: "Failed to update app" });
    }
  });

  // Screen Time Entries
  app.get("/api/screen-time/entries", async (req, res) => {
    try {
      const { date } = req.query;
      const entries = await storage.getScreenTimeEntries(DEFAULT_USER_ID, date as string);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch screen time entries" });
    }
  });

  app.get("/api/screen-time/entries/week", async (req, res) => {
    try {
      const { startDate } = req.query;
      if (!startDate) {
        return res.status(400).json({ message: "startDate is required" });
      }
      const entries = await storage.getScreenTimeEntriesByWeek(DEFAULT_USER_ID, startDate as string);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly screen time entries" });
    }
  });

  app.post("/api/screen-time/entries", async (req, res) => {
    try {
      const validatedData = insertScreenTimeEntrySchema.parse(req.body);
      const entry = await storage.createScreenTimeEntry(DEFAULT_USER_ID, validatedData);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid entry data" });
    }
  });

  // Screen Time Limits
  app.get("/api/screen-time/limits", async (req, res) => {
    try {
      const limits = await storage.getScreenTimeLimits(DEFAULT_USER_ID);
      res.json(limits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch screen time limits" });
    }
  });

  app.post("/api/screen-time/limits", async (req, res) => {
    try {
      const validatedData = insertScreenTimeLimitSchema.parse(req.body);
      const limit = await storage.createScreenTimeLimit(DEFAULT_USER_ID, validatedData);
      res.json(limit);
    } catch (error) {
      res.status(400).json({ message: "Invalid limit data" });
    }
  });

  app.put("/api/screen-time/limits/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const limit = await storage.updateScreenTimeLimit(id, req.body);
      if (!limit) {
        return res.status(404).json({ message: "Limit not found" });
      }
      res.json(limit);
    } catch (error) {
      res.status(400).json({ message: "Failed to update limit" });
    }
  });

  app.delete("/api/screen-time/limits/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteScreenTimeLimit(id);
      if (!deleted) {
        return res.status(404).json({ message: "Limit not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete limit" });
    }
  });

  // Screen Time Export
  app.get("/api/screen-time/export", async (req, res) => {
    try {
      const entries = await storage.getScreenTimeEntries(DEFAULT_USER_ID);
      const apps = await storage.getScreenTimeApps();
      const appMap = new Map(apps.map(app => [app.id, app.name]));

      let csvContent = "Date,App,Minutes,Category\n";
      
      entries.forEach(entry => {
        const appName = appMap.get(entry.appId) || "Unknown";
        const app = apps.find(a => a.id === entry.appId);
        const category = app?.category || "Other";
        csvContent += `${entry.date},${appName},${entry.minutes},${category}\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="screen-time-data.csv"');
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to export screen time data" });
    }
  });

  // Watchlist
  app.get("/api/watchlist", async (req, res) => {
    try {
      const items = await storage.getWatchlistItems(DEFAULT_USER_ID);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch watchlist items" });
    }
  });

  app.post("/api/watchlist", async (req, res) => {
    try {
      const validatedData = insertWatchlistItemSchema.parse(req.body);
      const item = await storage.createWatchlistItem(DEFAULT_USER_ID, validatedData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid watchlist item data" });
    }
  });

  app.put("/api/watchlist/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const item = await storage.updateWatchlistItem(id, req.body);
      if (!item) {
        return res.status(404).json({ message: "Watchlist item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Failed to update watchlist item" });
    }
  });

  app.delete("/api/watchlist/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteWatchlistItem(id);
      if (!deleted) {
        return res.status(404).json({ message: "Watchlist item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete watchlist item" });
    }
  });

  // Watchlist Export
  app.get("/api/watchlist/export", async (req, res) => {
    try {
      const items = await storage.getWatchlistItems(DEFAULT_USER_ID);

      let csvContent = "Title,Type,Source,Status,Length,Finished Date,Added Date\n";
      
      items.forEach(item => {
        const finishedDate = item.finishedAt ? new Date(item.finishedAt).toLocaleDateString() : "";
        const addedDate = new Date(item.createdAt || 0).toLocaleDateString();
        const length = item.length ? `${item.length} min` : "";
        csvContent += `"${item.title}",${item.type},${item.source || ""},${item.status},"${length}",${finishedDate},${addedDate}\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="watchlist-data.csv"');
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to export watchlist data" });
    }
  });

  // Todo Categories
  app.get("/api/todo-categories", async (req, res) => {
    try {
      const categories = await storage.getTodoCategories(DEFAULT_USER_ID);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch todo categories" });
    }
  });

  app.post("/api/todo-categories", async (req, res) => {
    try {
      const validatedData = insertTodoCategorySchema.parse(req.body);
      const category = await storage.createTodoCategory(DEFAULT_USER_ID, validatedData);
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.put("/api/todo-categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const category = await storage.updateTodoCategory(id, req.body);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/todo-categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTodoCategory(id);
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Todos
  app.get("/api/todos", async (req, res) => {
    try {
      const { categoryId, status, dueDate } = req.query;
      
      let todos;
      if (status) {
        todos = await storage.getTodosByStatus(DEFAULT_USER_ID, status as string);
      } else if (dueDate) {
        todos = await storage.getTodosByDueDate(DEFAULT_USER_ID, dueDate as string);
      } else {
        todos = await storage.getTodos(DEFAULT_USER_ID, categoryId as string);
      }
      
      res.json(todos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch todos" });
    }
  });

  app.get("/api/todos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const todo = await storage.getTodo(id);
      if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      res.json(todo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch todo" });
    }
  });

  app.post("/api/todos", async (req, res) => {
    try {
      const validatedData = insertTodoSchema.parse(req.body);
      const todo = await storage.createTodo(DEFAULT_USER_ID, validatedData);
      res.json(todo);
    } catch (error) {
      res.status(400).json({ message: "Invalid todo data" });
    }
  });

  app.put("/api/todos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const todo = await storage.updateTodo(id, req.body);
      if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      res.json(todo);
    } catch (error) {
      res.status(400).json({ message: "Failed to update todo" });
    }
  });

  app.delete("/api/todos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTodo(id);
      if (!deleted) {
        return res.status(404).json({ message: "Todo not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete todo" });
    }
  });

  // Calendar Events
  app.get("/api/calendar-events", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const events = await storage.getCalendarEvents(DEFAULT_USER_ID, startDate as string, endDate as string);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  app.post("/api/calendar-events", async (req, res) => {
    try {
      const validatedData = insertCalendarEventSchema.parse(req.body);
      const event = await storage.createCalendarEvent(DEFAULT_USER_ID, validatedData);
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data" });
    }
  });

  app.put("/api/calendar-events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const event = await storage.updateCalendarEvent(id, req.body);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/calendar-events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCalendarEvent(id);
      if (!deleted) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Weekly Plans
  app.get("/api/weekly-plans", async (req, res) => {
    try {
      const { weekStartDate } = req.query;
      
      if (weekStartDate) {
        const plan = await storage.getWeeklyPlan(DEFAULT_USER_ID, weekStartDate as string);
        res.json(plan);
      } else {
        const plans = await storage.getWeeklyPlans(DEFAULT_USER_ID);
        res.json(plans);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly plans" });
    }
  });

  app.post("/api/weekly-plans", async (req, res) => {
    try {
      const validatedData = insertWeeklyPlanSchema.parse(req.body);
      const plan = await storage.createWeeklyPlan(DEFAULT_USER_ID, validatedData);
      res.json(plan);
    } catch (error) {
      res.status(400).json({ message: "Invalid weekly plan data" });
    }
  });

  app.put("/api/weekly-plans/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const plan = await storage.updateWeeklyPlan(id, req.body);
      if (!plan) {
        return res.status(404).json({ message: "Weekly plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(400).json({ message: "Failed to update weekly plan" });
    }
  });

  app.delete("/api/weekly-plans/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteWeeklyPlan(id);
      if (!deleted) {
        return res.status(404).json({ message: "Weekly plan not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete weekly plan" });
    }
  });

  // Daily Plans
  app.get("/api/daily-plans", async (req, res) => {
    try {
      const { date, weekStartDate } = req.query;
      
      if (date) {
        const plan = await storage.getDailyPlan(DEFAULT_USER_ID, date as string);
        res.json(plan);
      } else {
        const plans = await storage.getDailyPlans(DEFAULT_USER_ID, weekStartDate as string);
        res.json(plans);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch daily plans" });
    }
  });

  app.post("/api/daily-plans", async (req, res) => {
    try {
      const validatedData = insertDailyPlanSchema.parse(req.body);
      const plan = await storage.createDailyPlan(DEFAULT_USER_ID, validatedData);
      res.json(plan);
    } catch (error) {
      res.status(400).json({ message: "Invalid daily plan data" });
    }
  });

  app.put("/api/daily-plans/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const plan = await storage.updateDailyPlan(id, req.body);
      if (!plan) {
        return res.status(404).json({ message: "Daily plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(400).json({ message: "Failed to update daily plan" });
    }
  });

  app.delete("/api/daily-plans/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteDailyPlan(id);
      if (!deleted) {
        return res.status(404).json({ message: "Daily plan not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete daily plan" });
    }
  });

  // Export data
  app.get("/api/export", async (req, res) => {
    try {
      const habits = await storage.getHabits(DEFAULT_USER_ID);
      const habitEntries = await storage.getHabitEntries(DEFAULT_USER_ID);
      const goals = await storage.getGoals(DEFAULT_USER_ID);
      const healthEntries = await storage.getHealthEntries(DEFAULT_USER_ID);
      const timerSessions = await storage.getTimerSessions(DEFAULT_USER_ID);
      const mealEntries = await storage.getMealEntries(DEFAULT_USER_ID);
      const nutritionGoal = await storage.getNutritionGoal(DEFAULT_USER_ID);

      const exportData = {
        habits,
        habitEntries,
        goals,
        healthEntries,
        timerSessions,
        mealEntries,
        nutritionGoal,
        exportedAt: new Date().toISOString()
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="lifetrack-data.json"');
      res.json(exportData);
    } catch (error) {
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
