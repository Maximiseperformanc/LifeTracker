import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Plus, Check, X, Clock, Flame, Calendar, Target, Edit, Trash2, 
  Star, Trophy, CheckCircle2, Circle, Bell, Palette, Tag,
  TrendingUp, Activity, Heart, BookOpen, Dumbbell, Coffee, Moon, Zap
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EnhancedHabit {
  id: string;
  name: string;
  description?: string;
  category: string;
  color: string;
  icon: string;
  trackingType: "boolean" | "numeric" | "duration" | "scale";
  targetValue?: number;
  unit?: string;
  frequency: "daily" | "weekly" | "custom";
  reminderTime?: string;
  isActive: boolean;
  difficulty: 1 | 2 | 3 | 4 | 5;
  priority: "low" | "medium" | "high";
  streakCount: number;
  bestStreak: number;
  createdAt: string;
}

interface DailyChecklistItem {
  id: string;
  text: string;
  category: "health" | "productivity" | "mindfulness" | "habits";
  isCompleted: boolean;
  reminderTime?: string;
  color: string;
}

interface HabitEntry {
  id: string;
  habitId: string;
  date: string;
  value: number;
  completed: boolean;
  notes?: string;
}

const HABIT_CATEGORIES = [
  { value: "health", label: "Health & Fitness", icon: Heart, color: "bg-red-500" },
  { value: "productivity", label: "Productivity", icon: Zap, color: "bg-blue-500" },
  { value: "learning", label: "Learning", icon: BookOpen, color: "bg-green-500" },
  { value: "mindfulness", label: "Mindfulness", icon: Moon, color: "bg-purple-500" },
  { value: "social", label: "Social", icon: Coffee, color: "bg-orange-500" },
  { value: "fitness", label: "Fitness", icon: Dumbbell, color: "bg-yellow-500" },
];

const HABIT_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e", "#06b6d4", 
  "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#ec4899", "#f43f5e"
];

export default function HabitsPage() {
  const [activeTab, setActiveTab] = useState("today");
  const [showHabitDialog, setShowHabitDialog] = useState(false);
  const [showChecklistDialog, setShowChecklistDialog] = useState(false);
  const [editingHabit, setEditingHabit] = useState<EnhancedHabit | null>(null);

  // Form state for new habit
  const [habitForm, setHabitForm] = useState({
    name: "",
    description: "",
    category: "",
    color: HABIT_COLORS[0],
    icon: "Circle",
    trackingType: "boolean" as const,
    targetValue: 1,
    unit: "",
    frequency: "daily" as const,
    reminderTime: "",
    difficulty: 3,
    priority: "medium" as const,
  });

  // Checklist form state
  const [checklistForm, setChecklistForm] = useState({
    text: "",
    category: "habits" as const,
    reminderTime: "",
    color: HABIT_COLORS[0],
  });

  const { toast } = useToast();
  const today = format(new Date(), "yyyy-MM-dd");

  // Mock data - replace with actual API calls
  const [habits, setHabits] = useState<EnhancedHabit[]>([
    {
      id: "1",
      name: "Drink 8 glasses of water",
      description: "Stay hydrated throughout the day",
      category: "health",
      color: "#3b82f6",
      icon: "Circle",
      trackingType: "numeric",
      targetValue: 8,
      unit: "glasses",
      frequency: "daily",
      reminderTime: "09:00",
      isActive: true,
      difficulty: 2,
      priority: "high",
      streakCount: 5,
      bestStreak: 12,
      createdAt: "2024-01-01",
    },
    {
      id: "2", 
      name: "Morning meditation",
      description: "10 minutes of mindfulness practice",
      category: "mindfulness",
      color: "#8b5cf6",
      icon: "Circle",
      trackingType: "duration",
      targetValue: 10,
      unit: "minutes",
      frequency: "daily",
      reminderTime: "07:00",
      isActive: true,
      difficulty: 3,
      priority: "medium",
      streakCount: 8,
      bestStreak: 15,
      createdAt: "2024-01-01",
    }
  ]);

  const [dailyChecklist, setDailyChecklist] = useState<DailyChecklistItem[]>([
    {
      id: "1",
      text: "Don't pick nails",
      category: "habits",
      isCompleted: false,
      reminderTime: "10:00",
      color: "#ef4444"
    },
    {
      id: "2", 
      text: "Make bed",
      category: "productivity",
      isCompleted: false,
      reminderTime: "08:00",
      color: "#22c55e"
    },
    {
      id: "3",
      text: "No phone for first hour",
      category: "mindfulness", 
      isCompleted: true,
      reminderTime: "07:00",
      color: "#8b5cf6"
    }
  ]);

  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);

  const handleCreateHabit = () => {
    const newHabit: EnhancedHabit = {
      id: Date.now().toString(),
      ...habitForm,
      isActive: true,
      streakCount: 0,
      bestStreak: 0,
      createdAt: today,
    };
    setHabits([...habits, newHabit]);
    setHabitForm({
      name: "",
      description: "",
      category: "",
      color: HABIT_COLORS[0],
      icon: "Circle",
      trackingType: "boolean",
      targetValue: 1,
      unit: "",
      frequency: "daily",
      reminderTime: "",
      difficulty: 3,
      priority: "medium",
    });
    setShowHabitDialog(false);
    toast({ title: "Habit created successfully!" });
  };

  const handleCreateChecklistItem = () => {
    const newItem: DailyChecklistItem = {
      id: Date.now().toString(),
      ...checklistForm,
      isCompleted: false,
    };
    setDailyChecklist([...dailyChecklist, newItem]);
    setChecklistForm({
      text: "",
      category: "habits",
      reminderTime: "",
      color: HABIT_COLORS[0],
    });
    setShowChecklistDialog(false);
    toast({ title: "Checklist item added!" });
  };

  const toggleChecklistItem = (id: string) => {
    setDailyChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      )
    );
  };

  const getCategoryIcon = (category: string) => {
    const cat = HABIT_CATEGORIES.find(c => c.value === category);
    return cat ? cat.icon : Circle;
  };

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < difficulty ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const getStreakBadgeColor = (streak: number) => {
    if (streak >= 30) return "bg-purple-500";
    if (streak >= 14) return "bg-blue-500";
    if (streak >= 7) return "bg-green-500";
    if (streak >= 3) return "bg-orange-500";
    return "bg-gray-500";
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Enhanced Habit Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Build better habits with advanced tracking, reminders, and insights
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showChecklistDialog} onOpenChange={setShowChecklistDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Add Checklist Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Daily Checklist Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>What do you want to track?</Label>
                  <Input
                    placeholder="e.g., Don't bite nails, Make bed, Drink water..."
                    value={checklistForm.text}
                    onChange={(e) => setChecklistForm({...checklistForm, text: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={checklistForm.category} onValueChange={(value: any) => setChecklistForm({...checklistForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="habits">Habits</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="productivity">Productivity</SelectItem>
                      <SelectItem value="mindfulness">Mindfulness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reminder Time (optional)</Label>
                  <Input
                    type="time"
                    value={checklistForm.reminderTime}
                    onChange={(e) => setChecklistForm({...checklistForm, reminderTime: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="flex gap-2 mt-2">
                    {HABIT_COLORS.map(color => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 ${checklistForm.color === color ? 'border-gray-800' : 'border-gray-300'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setChecklistForm({...checklistForm, color})}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreateChecklistItem} className="w-full">
                  Add to Daily Checklist
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showHabitDialog} onOpenChange={setShowHabitDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Habit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Habit</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label>Habit Name *</Label>
                    <Input
                      placeholder="e.g., Read for 30 minutes"
                      value={habitForm.name}
                      onChange={(e) => setHabitForm({...habitForm, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Why is this habit important to you?"
                      value={habitForm.description}
                      onChange={(e) => setHabitForm({...habitForm, description: e.target.value})}
                    />
                  </div>
                </div>

                {/* Category and Visual */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category *</Label>
                    <Select value={habitForm.category} onValueChange={(value) => setHabitForm({...habitForm, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HABIT_CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <cat.icon className="h-4 w-4" />
                              {cat.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Color</Label>
                    <div className="flex gap-2 mt-2">
                      {HABIT_COLORS.slice(0, 6).map(color => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 ${habitForm.color === color ? 'border-gray-800' : 'border-gray-300'}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setHabitForm({...habitForm, color})}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tracking Type */}
                <div>
                  <Label>How do you want to track this?</Label>
                  <Select value={habitForm.trackingType} onValueChange={(value: any) => setHabitForm({...habitForm, trackingType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boolean">Yes/No (Did it or didn't)</SelectItem>
                      <SelectItem value="numeric">Count (e.g., 8 glasses, 50 pushups)</SelectItem>
                      <SelectItem value="duration">Time (e.g., 30 minutes)</SelectItem>
                      <SelectItem value="scale">Scale 1-10 (e.g., mood, energy)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Target and Unit */}
                {(habitForm.trackingType === "numeric" || habitForm.trackingType === "duration") && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Target {habitForm.trackingType === "duration" ? "Minutes" : "Amount"}</Label>
                      <Input
                        type="number"
                        value={habitForm.targetValue}
                        onChange={(e) => setHabitForm({...habitForm, targetValue: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label>Unit</Label>
                      <Input
                        placeholder={habitForm.trackingType === "duration" ? "minutes" : "glasses, pages, reps..."}
                        value={habitForm.unit}
                        onChange={(e) => setHabitForm({...habitForm, unit: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                {/* Difficulty and Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Difficulty Level</Label>
                    <div className="mt-2">
                      <Slider
                        value={[habitForm.difficulty]}
                        onValueChange={(value) => setHabitForm({...habitForm, difficulty: value[0] as any})}
                        max={5}
                        min={1}
                        step={1}
                      />
                      <div className="flex justify-between mt-2 text-sm text-gray-600">
                        <span>Very Easy</span>
                        <span>Very Hard</span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {getDifficultyStars(habitForm.difficulty)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={habitForm.priority} onValueChange={(value: any) => setHabitForm({...habitForm, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Scheduling */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Frequency</Label>
                    <Select value={habitForm.frequency} onValueChange={(value: any) => setHabitForm({...habitForm, frequency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Reminder Time</Label>
                    <Input
                      type="time"
                      value={habitForm.reminderTime}
                      onChange={(e) => setHabitForm({...habitForm, reminderTime: e.target.value})}
                    />
                  </div>
                </div>

                <Button onClick={handleCreateHabit} className="w-full">
                  Create Habit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="checklist">Daily Checklist</TabsTrigger>
          <TabsTrigger value="habits">All Habits</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Today Tab */}
        <TabsContent value="today" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {habits.map((habit) => {
              const CategoryIcon = getCategoryIcon(habit.category);
              const isCompleted = false; // Replace with actual logic
              
              return (
                <Card key={habit.id} className="relative overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 w-1 h-full"
                    style={{ backgroundColor: habit.color }}
                  />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-5 w-5" style={{ color: habit.color }} />
                        <div>
                          <CardTitle className="text-lg">{habit.name}</CardTitle>
                          <CardDescription className="text-sm">{habit.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge 
                          className="text-white text-xs"
                          style={{ backgroundColor: getStreakBadgeColor(habit.streakCount) }}
                        >
                          {habit.streakCount} 🔥
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress tracking based on type */}
                      {habit.trackingType === "boolean" && (
                        <Button
                          variant={isCompleted ? "default" : "outline"}
                          className="w-full"
                          onClick={() => {/* toggle completion */}}
                        >
                          {isCompleted ? <Check className="h-4 w-4 mr-2" /> : <Circle className="h-4 w-4 mr-2" />}
                          {isCompleted ? "Completed!" : "Mark Complete"}
                        </Button>
                      )}

                      {habit.trackingType === "numeric" && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Progress</span>
                            <span className="text-sm font-medium">0 / {habit.targetValue} {habit.unit}</span>
                          </div>
                          <Progress value={0} className="h-2" />
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1">+1</Button>
                            <Button size="sm" variant="outline" className="flex-1">+5</Button>
                            <Input type="number" placeholder="Custom" className="flex-1 h-8" />
                          </div>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Best: {habit.bestStreak} days</span>
                        <span>Priority: {habit.priority}</span>
                      </div>

                      {/* Difficulty stars */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Difficulty:</span>
                        <div className="flex gap-1">
                          {getDifficultyStars(habit.difficulty)}
                        </div>
                      </div>

                      {habit.reminderTime && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Bell className="h-4 w-4" />
                          <span>Reminder at {habit.reminderTime}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Daily Checklist Tab */}
        <TabsContent value="checklist" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Daily Checklist
              </CardTitle>
              <CardDescription>
                Simple yes/no habits and reminders to track throughout your day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dailyChecklist.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleChecklistItem(item.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          item.isCompleted
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {item.isCompleted && <Check className="h-3 w-3" />}
                      </button>
                      <div>
                        <span className={`font-medium ${item.isCompleted ? 'line-through text-gray-500' : ''}`}>
                          {item.text}
                        </span>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                          {item.reminderTime && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Bell className="h-3 w-3" />
                              {item.reminderTime}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Progress Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {dailyChecklist.filter(item => item.isCompleted).length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">
                    {dailyChecklist.filter(item => !item.isCompleted).length}
                  </div>
                  <div className="text-sm text-gray-600">Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {dailyChecklist.length > 0 ? Math.round((dailyChecklist.filter(item => item.isCompleted).length / dailyChecklist.length) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{dailyChecklist.length}</div>
                  <div className="text-sm text-gray-600">Total Items</div>
                </div>
              </div>
              <Progress 
                value={dailyChecklist.length > 0 ? (dailyChecklist.filter(item => item.isCompleted).length / dailyChecklist.length) * 100 : 0}
                className="mt-4" 
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Habits Tab */}
        <TabsContent value="habits" className="space-y-6">
          <div className="grid gap-6">
            {habits.map((habit) => {
              const CategoryIcon = getCategoryIcon(habit.category);
              
              return (
                <Card key={habit.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: habit.color + "20" }}
                        >
                          <CategoryIcon className="h-6 w-6" style={{ color: habit.color }} />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {habit.name}
                            <Badge variant="outline">{habit.category}</Badge>
                            <Badge 
                              className="text-white"
                              style={{ backgroundColor: getStreakBadgeColor(habit.streakCount) }}
                            >
                              {habit.streakCount} day streak
                            </Badge>
                          </CardTitle>
                          <CardDescription>{habit.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Current Streak</div>
                        <div className="text-2xl font-bold">{habit.streakCount} days</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Best Streak</div>
                        <div className="text-2xl font-bold">{habit.bestStreak} days</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Priority</div>
                        <Badge variant={habit.priority === "high" ? "destructive" : habit.priority === "medium" ? "default" : "secondary"}>
                          {habit.priority}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Difficulty</div>
                        <div className="flex gap-1">
                          {getDifficultyStars(habit.difficulty)}
                        </div>
                      </div>
                    </div>
                    
                    {habit.reminderTime && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Bell className="h-4 w-4" />
                        <span>Daily reminder at {habit.reminderTime}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total Habits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{habits.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Active Streaks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {habits.filter(h => h.streakCount > 0).length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Longest Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {Math.max(...habits.map(h => h.bestStreak), 0)} days
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Checklist Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dailyChecklist.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Category breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Habits by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {HABIT_CATEGORIES.map(category => {
                  const categoryHabits = habits.filter(h => h.category === category.value);
                  const activeStreaks = categoryHabits.filter(h => h.streakCount > 0).length;
                  
                  return (
                    <div key={category.value} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${category.color} text-white`}>
                          <category.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{category.label}</div>
                          <div className="text-sm text-gray-600">{categoryHabits.length} habits</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{activeStreaks} active</div>
                        <div className="text-sm text-gray-600">
                          {categoryHabits.length > 0 ? Math.round((activeStreaks / categoryHabits.length) * 100) : 0}% success rate
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}