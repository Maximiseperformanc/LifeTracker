import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, TrendingUp, Target, Clock, Calendar, CheckCircle, Star } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Habit, InsertHabit, HabitEntry } from "@shared/schema";

const habitFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  frequency: z.enum(["daily", "weekly", "custom"]),
  targetValue: z.number().min(1, "Target must be at least 1"),
  unit: z.string().min(1, "Unit is required"),
  trackingType: z.enum(["boolean", "numeric", "duration", "custom"]).default("numeric")
});

type HabitFormData = z.infer<typeof habitFormSchema>;

export default function SystemsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ["/api/habits"],
  });

  const { data: todayEntries = [] } = useQuery({
    queryKey: ["/api/habit-entries", { date: today }],
  });

  const form = useForm<HabitFormData>({
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

  const createHabitMutation = useMutation({
    mutationFn: (data: HabitFormData) => apiRequest("/api/habits", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "System created successfully!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create system",
        variant: "destructive"
      });
    }
  });

  const logHabitMutation = useMutation({
    mutationFn: ({ habitId, value }: { habitId: string; value: number }) => 
      apiRequest("/api/habit-entries", "POST", {
        habitId,
        date: today,
        value,
        notes: ""
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habit-entries"] });
      toast({
        title: "Success",
        description: "System entry logged!"
      });
    }
  });

  const updateHabitMutation = useMutation({
    mutationFn: ({ id, isArchived }: { id: string; isArchived: boolean }) =>
      apiRequest(`/api/habits/${id}`, "PUT", { isArchived }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    }
  });

  const onSubmit = (data: HabitFormData) => {
    createHabitMutation.mutate(data);
  };

  const handleToggleHabit = (habit: Habit) => {
    updateHabitMutation.mutate({ id: habit.id, isArchived: !habit.isArchived });
  };

  const handleLogHabit = (habitId: string, value: number = 1) => {
    logHabitMutation.mutate({ habitId, value });
  };

  const getTodayProgress = (habitId: string) => {
    return todayEntries.find((entry: HabitEntry) => entry.habitId === habitId)?.value || 0;
  };

  const getStreakInfo = (habit: Habit) => {
    // This would calculate streak based on habit entries
    // For now, returning placeholder data
    return { current: 0, best: 0 };
  };

  const categories = [...new Set(habits.map((h: Habit) => h.category).filter(Boolean))];
  const activeHabits = habits.filter((h: Habit) => !h.isArchived);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="systems-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Systems</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and build systems across all areas of your life
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-system">
              <Plus className="mr-2 h-4 w-4" />
              Add System
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New System</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>System Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Morning Meditation" {...field} data-testid="input-system-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Health, Work, Personal" {...field} data-testid="input-system-category" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
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
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                  control={form.control}
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

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayEntries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{format(new Date(), "MMM dd")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Systems */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Today's Systems
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeHabits.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No systems yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Create your first system to start tracking.
              </p>
            </div>
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
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleHabit(habit)}
                          data-testid={`button-toggle-${habit.id}`}
                        >
                          {!habit.isArchived ? "Archive" : "Restore"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories Overview */}
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const categoryHabits = activeHabits.filter((h: Habit) => h.category === category);
                const completedToday = categoryHabits.filter((h: Habit) => 
                  getTodayProgress(h.id) >= (h.targetValue || 1)
                ).length;

                return (
                  <Card key={category}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{category}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {categoryHabits.length} systems
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {completedToday}/{categoryHabits.length}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">completed</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}