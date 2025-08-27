import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, Dumbbell, Activity, TrendingUp, Trophy, Timer, 
  Calendar, Target, Zap, ChevronRight, BarChart3
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { HealthEntry } from "@shared/schema";

export default function GymPage() {
  const [showGymDialog, setShowGymDialog] = useState(false);
  const [exerciseMinutes, setExerciseMinutes] = useState(0);
  const [exerciseType, setExerciseType] = useState("");
  const [exerciseIntensity, setExerciseIntensity] = useState("moderate");
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [gymNotes, setGymNotes] = useState("");
  const [activeTab, setActiveTab] = useState("today");

  const { toast } = useToast();
  const today = format(new Date(), "yyyy-MM-dd");

  // Fetch health entries
  const { data: healthEntries = [] } = useQuery<HealthEntry[]>({
    queryKey: ["/api/health-entries"],
  });

  const todayHealth = healthEntries.find(entry => entry.date === today);

  // Save gym data mutation
  const saveGymMutation = useMutation({
    mutationFn: (data: any) => {
      if (todayHealth) {
        return apiRequest(`/api/health-entries/${todayHealth.id}`, "PUT", data);
      } else {
        return apiRequest("/api/health-entries", "POST", { ...data, date: today });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-entries"] });
      toast({ title: "Gym session logged!" });
      setShowGymDialog(false);
    }
  });

  const handleSaveGym = (e: React.FormEvent) => {
    e.preventDefault();
    saveGymMutation.mutate({
      ...todayHealth,
      exerciseMinutes: exerciseMinutes > 0 ? exerciseMinutes : todayHealth?.exerciseMinutes,
      exerciseType: exerciseType.trim() || todayHealth?.exerciseType,
      caloriesBurned: caloriesBurned > 0 ? caloriesBurned : todayHealth?.caloriesBurned,
      notes: gymNotes.trim() || todayHealth?.notes,
    });
  };

  // Calculate weekly stats
  const getWeeklyStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekData = healthEntries.filter(entry => 
      new Date(entry.date) >= weekAgo && entry.exerciseMinutes
    );
    
    const totalMinutes = weekData.reduce((sum, entry) => sum + (entry.exerciseMinutes || 0), 0);
    const totalCalories = weekData.reduce((sum, entry) => sum + (entry.caloriesBurned || 0), 0);
    const workoutDays = weekData.length;
    
    return { totalMinutes, totalCalories, workoutDays };
  };

  const weekStats = getWeeklyStats();

  // Get recent workouts
  const recentWorkouts = healthEntries
    .filter(entry => entry.exerciseMinutes && entry.exerciseMinutes > 0)
    .slice(0, 7)
    .reverse();

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gym & Exercise</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your workouts and physical activity
          </p>
        </div>
        <Dialog open={showGymDialog} onOpenChange={setShowGymDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Workout
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Log Gym Session</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveGym} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <Input
                  type="number"
                  value={exerciseMinutes}
                  onChange={(e) => setExerciseMinutes(Number(e.target.value))}
                  placeholder="45"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Workout Type</label>
                <Select value={exerciseType} onValueChange={setExerciseType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select workout type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">Strength Training</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="hiit">HIIT</SelectItem>
                    <SelectItem value="yoga">Yoga</SelectItem>
                    <SelectItem value="crossfit">CrossFit</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="cycling">Cycling</SelectItem>
                    <SelectItem value="swimming">Swimming</SelectItem>
                    <SelectItem value="mixed">Mixed Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Intensity Level</label>
                <Select value={exerciseIntensity} onValueChange={setExerciseIntensity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="intense">Intense</SelectItem>
                    <SelectItem value="max">Maximum Effort</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Calories Burned (optional)</label>
                <Input
                  type="number"
                  value={caloriesBurned}
                  onChange={(e) => setCaloriesBurned(Number(e.target.value))}
                  placeholder="300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <Textarea
                  value={gymNotes}
                  onChange={(e) => setGymNotes(e.target.value)}
                  placeholder="Exercises performed, PRs, how you felt..."
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={saveGymMutation.isPending}
              >
                {saveGymMutation.isPending ? "Saving..." : "Save Workout"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Dumbbell className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Workout</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {todayHealth?.exerciseMinutes || 0}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {weekStats.workoutDays} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Timer className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Weekly Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.floor(weekStats.totalMinutes / 60)}h {weekStats.totalMinutes % 60}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Calories Burned</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {weekStats.totalCalories}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Today's Session</TabsTrigger>
          <TabsTrigger value="history">Workout History</TabsTrigger>
          <TabsTrigger value="analytics">Progress Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Today's Workout Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayHealth?.exerciseMinutes ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                      <p className="text-xl font-bold">{todayHealth.exerciseMinutes} minutes</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                      <p className="text-xl font-bold capitalize">{todayHealth.exerciseType || "General"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Weekly Goal Progress</span>
                      <span>{Math.min((todayHealth.exerciseMinutes / 60) * 20, 100)}%</span>
                    </div>
                    <Progress value={Math.min((todayHealth.exerciseMinutes / 60) * 20, 100)} />
                    <p className="text-xs text-gray-500 mt-1">Goal: 150 minutes per week</p>
                  </div>

                  {todayHealth.notes && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm font-medium mb-1">Workout Notes</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{todayHealth.notes}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Dumbbell className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No workout logged today</p>
                  <Button onClick={() => setShowGymDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Log Your Workout
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Workouts</CardTitle>
              <CardDescription>Your exercise history for the past week</CardDescription>
            </CardHeader>
            <CardContent>
              {recentWorkouts.length > 0 ? (
                <div className="space-y-3">
                  {recentWorkouts.map((workout) => (
                    <div key={workout.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <Dumbbell className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {format(new Date(workout.date), "EEEE, MMM d")}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {workout.exerciseType || "Workout"} - {workout.exerciseMinutes}m
                          </p>
                        </div>
                      </div>
                      {workout.caloriesBurned && (
                        <Badge variant="secondary">{workout.caloriesBurned} cal</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No workouts recorded yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Workout Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-3">Weekly Overview</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Workouts</span>
                      <span className="font-medium">{weekStats.workoutDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Time</span>
                      <span className="font-medium">{weekStats.totalMinutes} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg Duration</span>
                      <span className="font-medium">
                        {weekStats.workoutDays > 0 ? Math.round(weekStats.totalMinutes / weekStats.workoutDays) : 0} min
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Calories</span>
                      <span className="font-medium">{weekStats.totalCalories}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-3">Workout Types</h3>
                  <div className="space-y-2">
                    {Array.from(new Set(recentWorkouts.map(w => w.exerciseType || "General"))).map(type => {
                      const count = recentWorkouts.filter(w => (w.exerciseType || "General") === type).length;
                      return (
                        <div key={type} className="flex justify-between">
                          <span className="text-sm text-gray-600 capitalize">{type}</span>
                          <span className="font-medium">{count} sessions</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">Fitness Insights</h3>
                <p className="text-sm text-green-800 dark:text-green-200">
                  {weekStats.workoutDays >= 5 
                    ? "Excellent consistency! You're exceeding recommended activity levels."
                    : weekStats.workoutDays >= 3
                    ? "Good progress! You're meeting minimum exercise recommendations."
                    : "Try to increase workout frequency for better health benefits."}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}