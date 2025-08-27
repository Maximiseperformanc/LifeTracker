import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Target, Calendar, Trophy, Star, Edit, Trash2, CheckCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, differenceInDays, parseISO } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Goal } from "@shared/schema";

const goalFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  deadline: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  progress: z.number().min(0).max(100).default(0)
});

type GoalFormData = z.infer<typeof goalFormSchema>;

const GOAL_CATEGORIES = [
  { value: "career", label: "Career", icon: "💼", color: "bg-blue-50 text-blue-700" },
  { value: "health", label: "Health", icon: "🏥", color: "bg-green-50 text-green-700" },
  { value: "personal", label: "Personal", icon: "🌟", color: "bg-purple-50 text-purple-700" },
  { value: "financial", label: "Financial", icon: "💰", color: "bg-yellow-50 text-yellow-700" },
  { value: "education", label: "Education", icon: "📚", color: "bg-indigo-50 text-indigo-700" },
  { value: "relationships", label: "Relationships", icon: "💕", color: "bg-pink-50 text-pink-700" },
];

export default function GoalsPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const { toast } = useToast();

  // Fetch goals
  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"]
  });

  // Goal form
  const goalForm = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: "",
      description: "",
      deadline: "",
      category: "personal",
      progress: 0
    }
  });

  // Create/update goal mutation
  const goalMutation = useMutation({
    mutationFn: async (data: GoalFormData) => {
      if (editingGoal) {
        return apiRequest("PUT", `/api/goals/${editingGoal.id}`, data);
      } else {
        return apiRequest("POST", "/api/goals", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: editingGoal ? "Goal updated" : "Goal created",
        description: editingGoal ? "Your goal has been updated." : "Your new goal has been created."
      });
      setShowDialog(false);
      setEditingGoal(null);
      goalForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save goal",
        variant: "destructive"
      });
    }
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/goals/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal deleted",
        description: "The goal has been removed."
      });
    }
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) => 
      apiRequest("PUT", `/api/goals/${id}`, { progress }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Progress updated",
        description: "Goal progress has been saved."
      });
    }
  });

  const openDialog = (goal?: Goal) => {
    if (goal) {
      setEditingGoal(goal);
      goalForm.reset({
        title: goal.title,
        description: goal.description || "",
        deadline: goal.deadline || "",
        category: goal.category || "personal",
        progress: goal.progress || 0
      });
    } else {
      setEditingGoal(null);
      goalForm.reset();
    }
    setShowDialog(true);
  };

  const getCategoryInfo = (category: string) => {
    return GOAL_CATEGORIES.find(cat => cat.value === category) || GOAL_CATEGORIES[0];
  };

  const getDaysUntilDeadline = (deadline: string | null | undefined) => {
    if (!deadline) return null;
    try {
      return differenceInDays(parseISO(deadline), new Date());
    } catch {
      return null;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    if (progress >= 25) return "bg-orange-500";
    return "bg-gray-300";
  };

  // Group goals by category
  const goalsByCategory = GOAL_CATEGORIES.map(category => ({
    ...category,
    goals: goals.filter(goal => goal.category === category.value)
  }));

  // Calculate stats
  const totalGoals = goals.length;
  const completedGoals = goals.filter(goal => (goal.progress || 0) >= 100).length;
  const activeGoals = goals.filter(goal => (goal.progress || 0) < 100).length;
  const overallProgress = totalGoals > 0 ? Math.round(goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / totalGoals) : 0;

  return (
    <div className="p-6 space-y-6" data-testid="goals-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Goals</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your progress towards achieving your long-term objectives
          </p>
        </div>
        <Button onClick={() => openDialog()} data-testid="button-add-goal">
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Goals</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalGoals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedGoals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeGoals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Progress</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals by Category */}
      <div className="space-y-6">
        {goalsByCategory.map(category => (
          category.goals.length > 0 && (
            <Card key={category.value}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{category.icon}</span>
                  {category.label} Goals
                  <Badge variant="secondary">{category.goals.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.goals.map(goal => {
                    const daysUntil = getDaysUntilDeadline(goal.deadline);
                    const isOverdue = daysUntil !== null && daysUntil < 0;
                    const isCompleted = (goal.progress || 0) >= 100;
                    
                    return (
                      <div key={goal.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {goal.title}
                              {isCompleted && <span className="ml-2 text-green-600">✓</span>}
                            </h3>
                            {goal.description && (
                              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                {goal.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDialog(goal)}
                              data-testid={`button-edit-goal-${goal.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteGoalMutation.mutate(goal.id)}
                              data-testid={`button-delete-goal-${goal.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm text-gray-600">{goal.progress || 0}%</span>
                          </div>
                          <Progress value={goal.progress || 0} className="h-2" />
                        </div>

                        {/* Deadline Info */}
                        {goal.deadline && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className={`${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                              Due: {format(parseISO(goal.deadline), 'MMM dd, yyyy')}
                              {daysUntil !== null && (
                                <span className={`ml-2 ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                                  {isOverdue ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days left`}
                                </span>
                              )}
                            </span>
                          </div>
                        )}

                        {/* Quick Progress Update */}
                        {!isCompleted && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                            <span className="text-sm">Quick update:</span>
                            {[25, 50, 75, 100].map(value => (
                              <Button
                                key={value}
                                variant="outline"
                                size="sm"
                                onClick={() => updateProgressMutation.mutate({ id: goal.id, progress: value })}
                                disabled={(goal.progress || 0) >= value}
                                data-testid={`button-progress-${goal.id}-${value}`}
                              >
                                {value}%
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )
        ))}

        {goals.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
              <p className="text-gray-600 mb-4">Set your first goal to start tracking your progress</p>
              <Button onClick={() => openDialog()} data-testid="button-add-first-goal">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Goal Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingGoal ? "Edit Goal" : "Add New Goal"}</DialogTitle>
          </DialogHeader>

          <Form {...goalForm}>
            <form onSubmit={goalForm.handleSubmit((data) => goalMutation.mutate(data))} className="space-y-4">
              <FormField
                control={goalForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter goal title..." {...field} data-testid="input-goal-title" />
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
                        {GOAL_CATEGORIES.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.icon} {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      <Textarea 
                        placeholder="Describe your goal..." 
                        {...field} 
                        data-testid="textarea-goal-description"
                      />
                    </FormControl>
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
                      <Input 
                        type="date" 
                        {...field} 
                        data-testid="input-goal-deadline"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={goalForm.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Progress (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        data-testid="input-goal-progress"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={goalMutation.isPending} data-testid="button-submit-goal">
                  {goalMutation.isPending ? "Saving..." : editingGoal ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}