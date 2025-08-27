import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, TrendingUp, Calendar, Clock, Target, Activity,
  CheckSquare, Heart, Apple, Trophy, Timer, Zap
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import type { Habit, HabitEntry, Goal, HealthEntry, TimerSession, Todo, MealEntry } from "@shared/schema";

const TIME_RANGES = [
  { value: "7days", label: "Last 7 Days" },
  { value: "30days", label: "Last 30 Days" },
  { value: "90days", label: "Last 90 Days" },
  { value: "thisWeek", label: "This Week" },
  { value: "thisMonth", label: "This Month" }
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30days");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch all data
  const { data: habits = [] } = useQuery<Habit[]>({
    queryKey: ["/api/habits"]
  });

  const { data: habitEntries = [] } = useQuery<HabitEntry[]>({
    queryKey: ["/api/habit-entries"]
  });

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["/api/goals"]
  });

  const { data: healthEntries = [] } = useQuery<HealthEntry[]>({
    queryKey: ["/api/health-entries"]
  });

  const { data: timerSessions = [] } = useQuery<TimerSession[]>({
    queryKey: ["/api/timer-sessions"]
  });

  const { data: todos = [] } = useQuery<Todo[]>({
    queryKey: ["/api/todos"]
  });

  // Date calculations
  const getDateRange = (range: string) => {
    const now = new Date();
    switch (range) {
      case "7days":
        return { start: subDays(now, 7), end: now };
      case "30days":
        return { start: subDays(now, 30), end: now };
      case "90days":
        return { start: subDays(now, 90), end: now };
      case "thisWeek":
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case "thisMonth":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const { start: startDate, end: endDate } = getDateRange(timeRange);

  // Filter data by time range
  const filteredHabitEntries = habitEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  });

  const filteredHealthEntries = healthEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  });

  const filteredTimerSessions = timerSessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate >= startDate && sessionDate <= endDate;
  });

  // Analytics calculations
  const getHabitStats = () => {
    const totalCompletions = filteredHabitEntries.filter(entry => entry.completed).length;
    const totalPossible = habits.length * Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const completionRate = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0;
    
    // Best performing habit
    const habitCompletions = habits.map(habit => ({
      habit,
      completions: filteredHabitEntries.filter(entry => entry.habitId === habit.id && entry.completed).length
    }));
    const bestHabit = habitCompletions.reduce((best, current) => 
      current.completions > best.completions ? current : best, habitCompletions[0]);

    return {
      totalCompletions,
      completionRate,
      bestHabit: bestHabit?.habit,
      bestHabitScore: bestHabit?.completions || 0
    };
  };

  const getGoalStats = () => {
    const completedGoals = goals.filter(goal => (goal.progress || 0) >= 100).length;
    const averageProgress = goals.length > 0 
      ? Math.round(goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / goals.length)
      : 0;
    
    const goalsByCategory = goals.reduce((acc, goal) => {
      const category = goal.category || "uncategorized";
      if (!acc[category]) acc[category] = 0;
      acc[category]++;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalGoals: goals.length,
      completedGoals,
      averageProgress,
      goalsByCategory
    };
  };

  const getHealthStats = () => {
    const averageSleep = filteredHealthEntries.length > 0
      ? filteredHealthEntries.reduce((sum, entry) => sum + (entry.sleepHours || 0), 0) / filteredHealthEntries.length
      : 0;
    
    const averageMood = filteredHealthEntries.length > 0
      ? filteredHealthEntries.reduce((sum, entry) => sum + (entry.mood || 0), 0) / filteredHealthEntries.length
      : 0;

    const totalExerciseMinutes = filteredHealthEntries.reduce((sum, entry) => sum + (entry.exerciseMinutes || 0), 0);
    const exerciseDays = filteredHealthEntries.filter(entry => (entry.exerciseMinutes || 0) > 0).length;

    return {
      averageSleep: Math.round(averageSleep * 10) / 10,
      averageMood: Math.round(averageMood * 10) / 10,
      totalExerciseMinutes,
      exerciseDays,
      averageExercisePerDay: exerciseDays > 0 ? Math.round(totalExerciseMinutes / exerciseDays) : 0
    };
  };

  const getTimerStats = () => {
    const completedSessions = filteredTimerSessions.filter(session => session.completed);
    const totalMinutes = completedSessions.reduce((sum, session) => sum + session.duration, 0);
    const pomodoroSessions = completedSessions.filter(session => session.type === "pomodoro").length;
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    return {
      totalSessions: completedSessions.length,
      totalMinutes,
      totalHours,
      pomodoroSessions,
      averageSessionLength: completedSessions.length > 0 ? Math.round(totalMinutes / completedSessions.length) : 0
    };
  };

  const getTodoStats = () => {
    const completedTodos = todos.filter(todo => todo.status === "completed").length;
    const pendingTodos = todos.filter(todo => todo.status === "pending").length;
    const completionRate = todos.length > 0 ? Math.round((completedTodos / todos.length) * 100) : 0;

    // Priority distribution
    const priorityDistribution = todos.reduce((acc, todo) => {
      const priority = todo.priority || "medium";
      if (!acc[priority]) acc[priority] = 0;
      acc[priority]++;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTodos: todos.length,
      completedTodos,
      pendingTodos,
      completionRate,
      priorityDistribution
    };
  };

  const habitStats = getHabitStats();
  const goalStats = getGoalStats();
  const healthStats = getHealthStats();
  const timerStats = getTimerStats();
  const todoStats = getTodoStats();

  return (
    <div className="p-6 space-y-6" data-testid="analytics-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Insights into your personal development progress and patterns
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40" data-testid="select-time-range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGES.map(range => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Activity className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Habits</p>
                <p className="text-xl font-bold">{habitStats.completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Target className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Goals</p>
                <p className="text-xl font-bold">{goalStats.averageProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Heart className="h-6 w-6 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Sleep</p>
                <p className="text-xl font-bold">{healthStats.averageSleep}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Timer className="h-6 w-6 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Focus</p>
                <p className="text-xl font-bold">{timerStats.totalHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckSquare className="h-6 w-6 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Tasks</p>
                <p className="text-xl font-bold">{todoStats.completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Top Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Goals Completed</p>
                    <p className="text-sm text-gray-600">{goalStats.completedGoals} out of {goalStats.totalGoals} goals</p>
                  </div>
                  <Badge variant="secondary">{goalStats.completedGoals}</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Focus Sessions</p>
                    <p className="text-sm text-gray-600">{timerStats.pomodoroSessions} productive sessions</p>
                  </div>
                  <Badge variant="secondary">{timerStats.pomodoroSessions}</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <p className="font-medium">Exercise Days</p>
                    <p className="text-sm text-gray-600">{healthStats.exerciseDays} active days</p>
                  </div>
                  <Badge variant="secondary">{healthStats.exerciseDays}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Best Habit</p>
                  <p className="text-sm text-gray-600">
                    {habitStats.bestHabit?.name || "No data"} 
                    {habitStats.bestHabitScore > 0 && ` (${habitStats.bestHabitScore} completions)`}
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Average Mood</p>
                  <p className="text-sm text-gray-600">
                    {healthStats.averageMood > 0 ? `${healthStats.averageMood}/10` : "No data"}
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Focus Time</p>
                  <p className="text-sm text-gray-600">
                    {timerStats.totalHours > 0 ? `${timerStats.totalHours} hours total` : "No sessions"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="habits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Habit Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{habitStats.totalCompletions}</p>
                  <p className="text-sm text-gray-600">Total Completions</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{habitStats.completionRate}%</p>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{habits.filter(h => !h.isArchived).length}</p>
                  <p className="text-sm text-gray-600">Active Habits</p>
                </div>
              </div>

              {/* Individual Habit Progress */}
              <div className="space-y-4">
                <h4 className="font-medium">Individual Progress</h4>
                {habits.slice(0, 5).map(habit => {
                  const completions = filteredHabitEntries.filter(entry => 
                    entry.habitId === habit.id && entry.completed
                  ).length;
                  const maxPossible = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                  const rate = maxPossible > 0 ? Math.round((completions / maxPossible) * 100) : 0;
                  
                  return (
                    <div key={habit.id} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{habit.name}</span>
                        <span className="text-sm text-gray-600">{rate}%</span>
                      </div>
                      <Progress value={rate} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Goal Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{goalStats.completedGoals}</p>
                  <p className="text-sm text-gray-600">Completed Goals</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{goalStats.averageProgress}%</p>
                  <p className="text-sm text-gray-600">Average Progress</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{goalStats.totalGoals}</p>
                  <p className="text-sm text-gray-600">Total Goals</p>
                </div>
              </div>

              {/* Goals by Category */}
              <div className="space-y-4">
                <h4 className="font-medium">Goals by Category</h4>
                {Object.entries(goalStats.goalsByCategory).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="capitalize font-medium">{category}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Health Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{healthStats.averageSleep}</p>
                  <p className="text-sm text-gray-600">Avg Sleep (hours)</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{healthStats.exerciseDays}</p>
                  <p className="text-sm text-gray-600">Exercise Days</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{healthStats.averageMood}</p>
                  <p className="text-sm text-gray-600">Avg Mood (/10)</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{healthStats.averageExercisePerDay}</p>
                  <p className="text-sm text-gray-600">Avg Exercise (min)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Focus Sessions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 grid-cols-2">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{timerStats.totalSessions}</p>
                    <p className="text-sm text-gray-600">Total Sessions</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{timerStats.totalHours}</p>
                    <p className="text-sm text-gray-600">Total Hours</p>
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Average Session Length</p>
                  <p className="text-sm text-gray-600">{timerStats.averageSessionLength} minutes</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 grid-cols-2">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{todoStats.completedTodos}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-600">{todoStats.pendingTodos}</p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                </div>
                
                {/* Priority Distribution */}
                <div className="space-y-2">
                  <h5 className="font-medium">Priority Distribution</h5>
                  {Object.entries(todoStats.priorityDistribution).map(([priority, count]) => (
                    <div key={priority} className="flex items-center justify-between">
                      <span className="capitalize text-sm">{priority}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}