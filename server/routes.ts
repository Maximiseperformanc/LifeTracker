import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertHabitSchema, 
  insertHabitEntrySchema,
  insertGoalSchema,
  insertHealthEntrySchema,
  insertTimerSessionSchema
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

  // Export data
  app.get("/api/export", async (req, res) => {
    try {
      const habits = await storage.getHabits(DEFAULT_USER_ID);
      const habitEntries = await storage.getHabitEntries(DEFAULT_USER_ID);
      const goals = await storage.getGoals(DEFAULT_USER_ID);
      const healthEntries = await storage.getHealthEntries(DEFAULT_USER_ID);
      const timerSessions = await storage.getTimerSessions(DEFAULT_USER_ID);

      const exportData = {
        habits,
        habitEntries,
        goals,
        healthEntries,
        timerSessions,
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
