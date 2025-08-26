import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, Calendar, Target, CheckCircle2, Circle, 
  Star, Clock, ArrowLeft, ArrowRight, Edit
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { WeeklyPlan, InsertWeeklyPlan } from "@shared/schema";

const weeklyPlanFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  goals: z.array(z.object({
    id: z.string(),
    text: z.string().min(1, "Goal text is required"),
    completed: z.boolean().default(false),
    category: z.string().min(1, "Category is required")
  })).optional(),
  priorities: z.array(z.object({
    id: z.string(),
    text: z.string().min(1, "Priority text is required"),
    category: z.string().min(1, "Category is required"),
    completed: z.boolean().default(false)
  })).optional(),
  notes: z.string().optional(),
  reflection: z.string().optional()
});

type WeeklyPlanFormData = z.infer<typeof weeklyPlanFormSchema>;

export default function WeeklyPlanPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [newGoal, setNewGoal] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [newPriorityCategory, setNewPriorityCategory] = useState("");
  const { toast } = useToast();

  const weekStartDate = format(startOfWeek(selectedWeek, { weekStartsOn: 1 }), "yyyy-MM-dd");

  const { data: weeklyPlan, isLoading } = useQuery({
    queryKey: ["/api/weekly-plans", { weekStartDate }],
    queryFn: () => apiRequest(`/api/weekly-plans?weekStartDate=${weekStartDate}`, "GET")
  });

  const { data: allPlans = [] } = useQuery({
    queryKey: ["/api/weekly-plans"],
  });

  const form = useForm<WeeklyPlanFormData>({
    resolver: zodResolver(weeklyPlanFormSchema),
    defaultValues: {
      title: `Week of ${format(startOfWeek(selectedWeek, { weekStartsOn: 1 }), "MMM dd, yyyy")}`,
      goals: [],
      priorities: [],
      notes: "",
      reflection: ""
    }
  });

  const createPlanMutation = useMutation({
    mutationFn: (data: WeeklyPlanFormData) => 
      apiRequest("/api/weekly-plans", "POST", {
        ...data,
        weekStartDate
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-plans"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Weekly plan created successfully!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create weekly plan",
        variant: "destructive"
      });
    }
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WeeklyPlan> }) =>
      apiRequest(`/api/weekly-plans/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-plans"] });
      toast({
        title: "Success",
        description: "Weekly plan updated!"
      });
    }
  });

  const onSubmit = (data: WeeklyPlanFormData) => {
    createPlanMutation.mutate(data);
  };

  const addGoal = () => {
    if (!newGoal || !newGoalCategory) return;
    
    const currentGoals = form.getValues("goals") || [];
    const newGoalItem = {
      id: Math.random().toString(36).substr(2, 9),
      text: newGoal,
      completed: false,
      category: newGoalCategory
    };
    
    form.setValue("goals", [...currentGoals, newGoalItem]);
    setNewGoal("");
    setNewGoalCategory("");
  };

  const addPriority = () => {
    if (!newPriority || !newPriorityCategory) return;
    
    const currentPriorities = form.getValues("priorities") || [];
    const newPriorityItem = {
      id: Math.random().toString(36).substr(2, 9),
      text: newPriority,
      category: newPriorityCategory,
      completed: false
    };
    
    form.setValue("priorities", [...currentPriorities, newPriorityItem]);
    setNewPriority("");
    setNewPriorityCategory("");
  };

  const toggleGoal = (goalId: string) => {
    if (!weeklyPlan) return;
    
    const updatedGoals = (weeklyPlan.goals || []).map((goal: any) => 
      goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
    );
    
    updatePlanMutation.mutate({
      id: weeklyPlan.id,
      data: { goals: updatedGoals }
    });
  };

  const togglePriority = (priorityId: string) => {
    if (!weeklyPlan) return;
    
    const updatedPriorities = (weeklyPlan.priorities || []).map((priority: any) => 
      priority.id === priorityId ? { ...priority, completed: !priority.completed } : priority
    );
    
    updatePlanMutation.mutate({
      id: weeklyPlan.id,
      data: { priorities: updatedPriorities }
    });
  };

  const navigateWeek = (direction: "prev" | "next") => {
    setSelectedWeek(prev => direction === "prev" ? subWeeks(prev, 1) : addWeeks(prev, 1));
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="weekly-plan-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Weekly Planning</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Plan your week with goals and priorities
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-plan">
              <Plus className="mr-2 h-4 w-4" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Weekly Plan</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Title</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-plan-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Weekly Goals
                    </label>
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a goal..."
                          value={newGoal}
                          onChange={(e) => setNewGoal(e.target.value)}
                          data-testid="input-new-goal"
                        />
                        <Input
                          placeholder="Category"
                          value={newGoalCategory}
                          onChange={(e) => setNewGoalCategory(e.target.value)}
                          className="w-32"
                          data-testid="input-goal-category"
                        />
                        <Button 
                          type="button" 
                          onClick={addGoal}
                          data-testid="button-add-goal"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {(form.watch("goals") || []).map((goal, index) => (
                          <div key={goal.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <Badge variant="outline">{goal.category}</Badge>
                            <span className="flex-1">{goal.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Weekly Priorities
                    </label>
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a priority..."
                          value={newPriority}
                          onChange={(e) => setNewPriority(e.target.value)}
                          data-testid="input-new-priority"
                        />
                        <Input
                          placeholder="Category"
                          value={newPriorityCategory}
                          onChange={(e) => setNewPriorityCategory(e.target.value)}
                          className="w-32"
                          data-testid="input-priority-category"
                        />
                        <Button 
                          type="button" 
                          onClick={addPriority}
                          data-testid="button-add-priority"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {(form.watch("priorities") || []).map((priority, index) => (
                          <div key={priority.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <Badge variant="outline">{priority.category}</Badge>
                            <span className="flex-1">{priority.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes..." {...field} data-testid="textarea-notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createPlanMutation.isPending}
                  data-testid="button-submit-plan"
                >
                  {createPlanMutation.isPending ? "Creating..." : "Create Weekly Plan"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigateWeek("prev")}
              data-testid="button-prev-week"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous Week
            </Button>
            
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Week of {format(startOfWeek(selectedWeek, { weekStartsOn: 1 }), "MMM dd, yyyy")}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {format(startOfWeek(selectedWeek, { weekStartsOn: 1 }), "MMM dd")} - {format(new Date(startOfWeek(selectedWeek, { weekStartsOn: 1 }).getTime() + 6 * 24 * 60 * 60 * 1000), "MMM dd")}
              </p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => navigateWeek("next")}
              data-testid="button-next-week"
            >
              Next Week
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Week Plan */}
      {weeklyPlan ? (
        <div className="space-y-6">
          {/* Plan Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {weeklyPlan.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weeklyPlan.notes && (
                <p className="text-gray-600 dark:text-gray-400">{weeklyPlan.notes}</p>
              )}
              
              <div className="grid gap-4 md:grid-cols-2 mt-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Progress</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Goals Completed</span>
                      <span>{(weeklyPlan.goals || []).filter((g: any) => g.completed).length} / {(weeklyPlan.goals || []).length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Priorities Completed</span>
                      <span>{(weeklyPlan.priorities || []).filter((p: any) => p.completed).length} / {(weeklyPlan.priorities || []).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goals and Priorities */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Weekly Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!weeklyPlan.goals || weeklyPlan.goals.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No goals set for this week</p>
                ) : (
                  <div className="space-y-3">
                    {weeklyPlan.goals.map((goal: any) => (
                      <div 
                        key={goal.id}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <button 
                          onClick={() => toggleGoal(goal.id)}
                          data-testid={`button-toggle-goal-${goal.id}`}
                        >
                          {goal.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        <div className="flex-1">
                          <p className={`${goal.completed ? "line-through text-gray-500" : "text-gray-900 dark:text-white"}`}>
                            {goal.text}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {goal.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Priorities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Weekly Priorities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!weeklyPlan.priorities || weeklyPlan.priorities.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No priorities set for this week</p>
                ) : (
                  <div className="space-y-3">
                    {weeklyPlan.priorities.map((priority: any) => (
                      <div 
                        key={priority.id}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <button 
                          onClick={() => togglePriority(priority.id)}
                          data-testid={`button-toggle-priority-${priority.id}`}
                        >
                          {priority.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        <div className="flex-1">
                          <p className={`${priority.completed ? "line-through text-gray-500" : "text-gray-900 dark:text-white"}`}>
                            {priority.text}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {priority.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reflection */}
          {weeklyPlan.reflection && (
            <Card>
              <CardHeader>
                <CardTitle>Weekly Reflection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">{weeklyPlan.reflection}</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No plan for this week
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create a weekly plan to set goals and priorities for this week.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} data-testid="button-create-first-plan">
              <Plus className="mr-2 h-4 w-4" />
              Create Weekly Plan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Previous Plans */}
      {allPlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Previous Weekly Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allPlans.slice(0, 5).map((plan: WeeklyPlan) => (
                <div 
                  key={plan.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{plan.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Week of {format(new Date(plan.weekStartDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {(plan.goals || []).filter((g: any) => g.completed).length}/{(plan.goals || []).length} goals completed
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}