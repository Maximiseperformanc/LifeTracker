import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Plus, Check, Clock, Flame, Calendar, Target, ChevronRight, BarChart3, 
  Activity, Heart, TrendingUp, Star, CheckCircle, Play, Pause, RotateCcw,
  Moon, Zap, Utensils, Trophy, Brain, Timer, Dumbbell, Apple, Bed
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTimer } from "@/hooks/use-timer";
import type { Habit, HabitEntry, Goal, HealthEntry, TimerSession } from "@shared/schema";

const habitFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  frequency: z.enum(["daily", "weekly", "custom"]),
  targetValue: z.number().min(1, "Target must be at least 1"),
  unit: z.string().min(1, "Unit is required"),
  trackingType: z.enum(["boolean", "numeric", "duration", "custom"]).default("numeric")
});

const goalFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  deadline: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  progress: z.number().min(0).max(100).default(0)
});

type HabitFormData = z.infer<typeof habitFormSchema>;
type GoalFormData = z.infer<typeof goalFormSchema>;

export default function SystemsPage() {
  const [showHabitDialog, setShowHabitDialog] = useState(false);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showHealthDialog, setShowHealthDialog] = useState(false);
  const [timerDuration, setTimerDuration] = useState(25); // 25 minutes
  const [timerMode, setTimerMode] = useState<"pomodoro" | "break" | "long-break">("pomodoro");
  
  // Health form state
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState([8]);
  const [exerciseMinutes, setExerciseMinutes] = useState(0);
  const [exerciseType, setExerciseType] = useState("");
  const [mood, setMood] = useState([7]);
  const [healthNotes, setHealthNotes] = useState("");

  const { toast } = useToast();
  const today = format(new Date(), "yyyy-MM-dd");

  // Timer hook
  const timer = useTimer({
    duration: timerDuration,
    onComplete: () => {
      toast({
        title: "Timer Complete!",
        description: `${timerMode} session finished. Great work!`,
      });
    }
  });

  // Fetch all data
  const { data: habits = [], isLoading: habitsLoading } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
  });

  const { data: todayHabitEntries = [] } = useQuery<HabitEntry[]>({
    queryKey: ["/api/habit-entries", { date: today }],
    queryFn: () => fetch(`/api/habit-entries?date=${today}`).then(res => res.json())
  });

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const { data: healthEntries = [] } = useQuery<HealthEntry[]>({
    queryKey: ["/api/health-entries"],
  });

  const { data: timerSessions = [] } = useQuery<TimerSession[]>({
    queryKey: ["/api/timer-sessions", { date: today }],
    queryFn: () => fetch(`/api/timer-sessions?date=${today}`).then(res => res.json())
  });

  // Forms
  const habitForm = useForm<HabitFormData>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      frequency: "daily",
      targetValue: 1,
      unit: "",
      trackingType: "numeric"
    }
  });

  const goalForm = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: "",
      description: "",
      deadline: "",
      category: "",
      progress: 0
    }
  });

  // Mutations
  const createHabitMutation = useMutation({
    mutationFn: (data: HabitFormData) => apiRequest("/api/habits", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      toast({ title: "System created successfully!" });
      setShowHabitDialog(false);
      habitForm.reset();
    }
  });

  const logHabitMutation = useMutation({
    mutationFn: ({ habitId, value = 1 }: { habitId: string; value?: number }) =>
      apiRequest("/api/habit-entries", "POST", { habitId, value, date: today }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habit-entries", { date: today }] });
      toast({ title: "Progress logged!" });
    }
  });

  const createGoalMutation = useMutation({
    mutationFn: (data: GoalFormData) => apiRequest("/api/goals", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal created successfully!" });
      setShowGoalDialog(false);
      goalForm.reset();
    }
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) =>
      apiRequest(`/api/goals/${id}`, "PUT", { progress }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal progress updated!" });
    }
  });

  const saveHealthMutation = useMutation({
    mutationFn: (data: any) => {
      const todayHealth = healthEntries.find(entry => entry.date === today);
      if (todayHealth) {
        return apiRequest(`/api/health-entries/${todayHealth.id}`, "PUT", data);
      } else {
        return apiRequest("/api/health-entries", "POST", { ...data, date: today });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-entries"] });
      toast({ title: "Health data saved!" });
      setShowHealthDialog(false);
    }
  });

  // Helper functions
  const getTodayProgress = (habitId: string) => {
    const entry = todayHabitEntries.find(entry => entry.habitId === habitId);
    return entry?.value || 0;
  };

  const getStreakInfo = (habit: Habit) => {
    return { current: habit.streakDays || 0, best: habit.streakDays || 0 };
  };

  // Calculations
  const activeHabits = habits.filter(h => !h.isArchived);
  const categories = [...new Set(habits.map(h => h.category).filter(Boolean))];
  const completedHabitsToday = todayHabitEntries.filter(entry => {
    const habit = habits.find(h => h.id === entry.habitId);
    return habit && (entry.value || 0) >= (habit.targetValue || 1);
  }).length;
  const habitCompletionRate = activeHabits.length > 0 
    ? Math.round((completedHabitsToday / activeHabits.length) * 100) 
    : 0;

  const totalFocusMinutes = timerSessions
    .filter(session => session.completed)
    .reduce((sum, session) => sum + session.duration, 0);

  const todayHealth = healthEntries.find(entry => entry.date === today);
  const goalsOnTrack = goals.filter(goal => (goal.progress || 0) >= 50).length;

  // Load existing health data
  useEffect(() => {
    if (todayHealth) {
      setSleepHours(todayHealth.sleepHours || 7);
      setSleepQuality([todayHealth.sleepQuality || 8]);
      setExerciseMinutes(todayHealth.exerciseMinutes || 0);
      setExerciseType(todayHealth.exerciseType || "");
      setMood([todayHealth.mood || 7]);
      setHealthNotes(todayHealth.notes || "");
    }
  }, [todayHealth]);

  const onHabitSubmit = (data: HabitFormData) => {
    createHabitMutation.mutate(data);
  };

  const onGoalSubmit = (data: GoalFormData) => {
    createGoalMutation.mutate(data);
  };

  const handleLogHabit = (habitId: string, value: number = 1) => {
    logHabitMutation.mutate({ habitId, value });
  };

  const handleSaveHealth = (e: React.FormEvent) => {
    e.preventDefault();
    saveHealthMutation.mutate({
      sleepHours: sleepHours > 0 ? sleepHours : undefined,
      sleepQuality: sleepQuality[0],
      exerciseMinutes: exerciseMinutes > 0 ? exerciseMinutes : undefined,
      exerciseType: exerciseType.trim() || undefined,
      mood: mood[0],
      notes: healthNotes.trim() || undefined,
    });
  };

  if (habitsLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading systems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8" data-testid="systems-page">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Systems Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive tracking for habits, health, goals, and productivity
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showHabitDialog} onOpenChange={setShowHabitDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-habit">
                <Plus className="h-4 w-4 mr-2" />
                Add System
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New System</DialogTitle>
              </DialogHeader>
              <Form {...habitForm}>
                <form onSubmit={habitForm.handleSubmit(onHabitSubmit)} className="space-y-4">
                  <FormField
                    control={habitForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Morning meditation" {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={habitForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="health">Health</SelectItem>
                              <SelectItem value="productivity">Productivity</SelectItem>
                              <SelectItem value="mindfulness">Mindfulness</SelectItem>
                              <SelectItem value="fitness">Fitness</SelectItem>
                              <SelectItem value="learning">Learning</SelectItem>
                              <SelectItem value="social">Social</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={habitForm.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-frequency">
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={habitForm.control}
                      name="targetValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1" 
                              {...field} 
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              data-testid="input-target"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={habitForm.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <FormControl>
                            <Input placeholder="times, minutes, pages" {...field} data-testid="input-unit" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={habitForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="System description..." {...field} data-testid="textarea-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={createHabitMutation.isPending}
                    data-testid="button-submit-system"
                  >
                    {createHabitMutation.isPending ? "Creating..." : "Create System"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Systems</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeHabits.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedHabitsToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Focus Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.floor(totalFocusMinutes / 60)}h {totalFocusMinutes % 60}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Goals On Track</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{goalsOnTrack}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sleep Quality</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {todayHealth?.sleepQuality ? `${todayHealth.sleepQuality}/10` : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="habits" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="habits" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Habits
          </TabsTrigger>
          <TabsTrigger value="timer" className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Timer
          </TabsTrigger>
          <TabsTrigger value="gym" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            Gym
          </TabsTrigger>
          <TabsTrigger value="sleep" className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            Sleep
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center gap-2">
            <Apple className="h-4 w-4" />
            Nutrition
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Habits Tab */}
        <TabsContent value="habits" className="space-y-6">
          {activeHabits.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No systems yet</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Create your first system to start tracking.
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => setShowHabitDialog(true)}
                  data-testid="button-create-first-habit"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create System
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeHabits.map((habit: Habit) => {
                const todayProgress = getTodayProgress(habit.id);
                const streakInfo = getStreakInfo(habit);
                const isCompleted = todayProgress >= (habit.targetValue || 1);

                return (
                  <Card key={habit.id} className={`transition-all ${isCompleted ? 'ring-2 ring-green-500' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{habit.name}</h3>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {habit.category}
                          </Badge>
                        </div>
                        {isCompleted && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="text-sm font-medium">
                            {todayProgress} / {habit.targetValue || 1} {habit.unit}
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min((todayProgress / (habit.targetValue || 1)) * 100, 100)}%` }}
                          />
                        </div>

                        {habit.frequency === "daily" && (
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Current streak: {streakInfo.current} days</span>
                            <span>Best: {streakInfo.best} days</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant={isCompleted ? "secondary" : "default"}
                          onClick={() => handleLogHabit(habit.id)}
                          disabled={logHabitMutation.isPending}
                          className="flex-1"
                          data-testid={`button-log-${habit.id}`}
                        >
                          {isCompleted ? "Done!" : "Log +1"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Timer Tab */}
        <TabsContent value="timer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Focus Timer
              </CardTitle>
              <CardDescription>
                Use the Pomodoro technique to improve focus and productivity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-mono font-bold text-gray-900 dark:text-white mb-4">
                  {Math.floor(timer.time)}:{((timer.time % 1) * 60).toFixed(0).padStart(2, '0')}
                </div>
                
                <div className="flex justify-center gap-4 mb-6">
                  <Button
                    variant={timer.isRunning ? "secondary" : "default"}
                    size="lg"
                    onClick={timer.isRunning ? timer.pause : timer.start}
                    data-testid="button-timer-toggle"
                  >
                    {timer.isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={timer.reset}
                    data-testid="button-timer-reset"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex justify-center gap-2 mb-4">
                  <Button
                    variant={timerMode === "pomodoro" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setTimerMode("pomodoro");
                      setTimerDuration(25);
                      timer.reset();
                    }}
                  >
                    Pomodoro (25m)
                  </Button>
                  <Button
                    variant={timerMode === "break" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setTimerMode("break");
                      setTimerDuration(5);
                      timer.reset();
                    }}
                  >
                    Break (5m)
                  </Button>
                  <Button
                    variant={timerMode === "long-break" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setTimerMode("long-break");
                      setTimerDuration(15);
                      timer.reset();
                    }}
                  >
                    Long Break (15m)
                  </Button>
                </div>

                <Progress value={(1 - timer.time / timerDuration) * 100} className="w-full max-w-md mx-auto" />
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Focus sessions today: {timerSessions.filter((s: TimerSession) => s.completed).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total focus time: {Math.floor(totalFocusMinutes / 60)}h {totalFocusMinutes % 60}m
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gym Tab */}
        <TabsContent value="gym" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                Quick Gym Log
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Dumbbell className="h-6 w-6 mx-auto mb-1 text-green-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Today's Workout</p>
                  <p className="font-bold">{todayHealth?.exerciseMinutes || 0}m</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <Zap className="h-6 w-6 mx-auto mb-1 text-yellow-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
                  <p className="font-bold">{todayHealth?.caloriesBurned || 0}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Exercise Type</span>
                  <span className="font-medium capitalize">{todayHealth?.exerciseType || "—"}</span>
                </div>
              </div>

              <Dialog open={showHealthDialog} onOpenChange={setShowHealthDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full" data-testid="button-log-gym">
                    <Plus className="h-4 w-4 mr-2" />
                    Log Workout
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Quick Gym Log</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaveHealth} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Exercise Duration (minutes)</label>
                      <Input
                        type="number"
                        value={exerciseMinutes}
                        onChange={(e) => setExerciseMinutes(Number(e.target.value))}
                        data-testid="input-exercise-minutes"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Exercise Type</label>
                      <Input
                        value={exerciseType}
                        onChange={(e) => setExerciseType(e.target.value)}
                        placeholder="Strength, cardio, HIIT..."
                        data-testid="input-exercise-type"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Notes</label>
                      <Textarea
                        value={healthNotes}
                        onChange={(e) => setHealthNotes(e.target.value)}
                        placeholder="Exercises performed, how you felt..."
                        data-testid="textarea-gym-notes"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={saveHealthMutation.isPending}
                      data-testid="button-save-gym"
                    >
                      {saveHealthMutation.isPending ? "Saving..." : "Save Workout"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Want more detailed tracking?
                </p>
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/gym'}>
                  Go to Full Gym Tracker →
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sleep Tab */}
        <TabsContent value="sleep" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Quick Sleep Log
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Moon className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last Night</p>
                  <p className="font-bold">{todayHealth?.sleepHours || "—"}h</p>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Star className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Quality</p>
                  <p className="font-bold">{todayHealth?.sleepQuality || "—"}/10</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Mood Today</span>
                  <span className="font-medium">{todayHealth?.mood || "—"}/10</span>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full" data-testid="button-log-sleep">
                    <Plus className="h-4 w-4 mr-2" />
                    Log Sleep
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Quick Sleep Log</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaveHealth} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Sleep Hours</label>
                      <Input
                        type="number"
                        step="0.5"
                        value={sleepHours}
                        onChange={(e) => setSleepHours(Number(e.target.value))}
                        data-testid="input-sleep-hours"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Sleep Quality: {sleepQuality[0]}/10
                      </label>
                      <Slider
                        value={sleepQuality}
                        onValueChange={setSleepQuality}
                        max={10}
                        min={1}
                        step={1}
                        data-testid="slider-sleep-quality"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Mood: {mood[0]}/10
                      </label>
                      <Slider
                        value={mood}
                        onValueChange={setMood}
                        max={10}
                        min={1}
                        step={1}
                        data-testid="slider-mood"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Notes</label>
                      <Textarea
                        value={healthNotes}
                        onChange={(e) => setHealthNotes(e.target.value)}
                        placeholder="Sleep quality, dreams, how you feel..."
                        data-testid="textarea-sleep-notes"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={saveHealthMutation.isPending}
                      data-testid="button-save-sleep"
                    >
                      {saveHealthMutation.isPending ? "Saving..." : "Save Sleep Data"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Want detailed sleep analytics?
                </p>
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/sleep'}>
                  Go to Full Sleep Tracker →
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nutrition Tab */}
        <TabsContent value="nutrition" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="h-5 w-5" />
                Nutrition Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Utensils className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Nutrition tracking coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Goals</h2>
            <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-goal">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Goal</DialogTitle>
                </DialogHeader>
                <Form {...goalForm}>
                  <form onSubmit={goalForm.handleSubmit(onGoalSubmit)} className="space-y-4">
                    <FormField
                      control={goalForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Learn Spanish" {...field} data-testid="input-goal-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={goalForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-goal-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="personal">Personal</SelectItem>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="health">Health</SelectItem>
                              <SelectItem value="financial">Financial</SelectItem>
                              <SelectItem value="learning">Learning</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={goalForm.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deadline (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-goal-deadline" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={goalForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Goal description..." {...field} data-testid="textarea-goal-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createGoalMutation.isPending}
                      data-testid="button-submit-goal"
                    >
                      {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {goals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No goals yet</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Create your first goal to start tracking progress.
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => setShowGoalDialog(true)}
                  data-testid="button-create-first-goal"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {goals.map((goal: Goal) => (
                <Card key={goal.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {goal.category}
                        </Badge>
                      </div>
                      {goal.deadline && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(goal.deadline), "MMM dd")}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="text-sm font-medium">{goal.progress || 0}%</span>
                      </div>
                      
                      <Progress value={goal.progress || 0} className="w-full" />
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateGoalMutation.mutate({ 
                          id: goal.id, 
                          progress: Math.min((goal.progress || 0) + 10, 100) 
                        })}
                        disabled={updateGoalMutation.isPending}
                        className="flex-1"
                        data-testid={`button-progress-${goal.id}`}
                      >
                        +10%
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics & Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Advanced analytics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}