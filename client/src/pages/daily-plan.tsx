import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { 
  Plus, Calendar, Clock, CheckCircle2, Circle, 
  Star, ArrowLeft, ArrowRight, Sun, Moon, Heart
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays, subDays } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { DailyPlan, InsertDailyPlan } from "@shared/schema";

const dailyPlanFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  timeBlocks: z.array(z.object({
    id: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    title: z.string(),
    type: z.string(),
    todoId: z.string().optional(),
    habitId: z.string().optional(),
    completed: z.boolean().default(false)
  })).optional(),
  priorities: z.array(z.object({
    id: z.string(),
    text: z.string(),
    completed: z.boolean().default(false),
    todoId: z.string().optional()
  })).optional(),
  reflection: z.string().optional(),
  energyLevel: z.number().optional(),
  moodRating: z.number().optional()
});

type DailyPlanFormData = z.infer<typeof dailyPlanFormSchema>;

export default function DailyPlanPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newTimeBlock, setNewTimeBlock] = useState({
    startTime: "",
    endTime: "",
    title: "",
    type: "work"
  });
  const [newPriority, setNewPriority] = useState("");
  const { toast } = useToast();

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const { data: dailyPlan, isLoading } = useQuery({
    queryKey: ["/api/daily-plans", { date: dateStr }],
    queryFn: () => apiRequest(`/api/daily-plans?date=${dateStr}`, "GET")
  });

  const { data: allPlans = [] } = useQuery({
    queryKey: ["/api/daily-plans"],
  });

  const form = useForm<DailyPlanFormData>({
    resolver: zodResolver(dailyPlanFormSchema),
    defaultValues: {
      title: `Plan for ${format(selectedDate, "MMM dd, yyyy")}`,
      timeBlocks: [],
      priorities: [],
      reflection: "",
      energyLevel: 5,
      moodRating: 5
    }
  });

  const createPlanMutation = useMutation({
    mutationFn: (data: DailyPlanFormData) => 
      apiRequest("/api/daily-plans", "POST", {
        ...data,
        date: dateStr
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-plans"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Daily plan created successfully!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create daily plan",
        variant: "destructive"
      });
    }
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DailyPlan> }) =>
      apiRequest(`/api/daily-plans/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-plans"] });
      toast({
        title: "Success",
        description: "Daily plan updated!"
      });
    }
  });

  const onSubmit = (data: DailyPlanFormData) => {
    createPlanMutation.mutate(data);
  };

  const addTimeBlock = () => {
    if (!newTimeBlock.startTime || !newTimeBlock.endTime || !newTimeBlock.title) return;
    
    const currentBlocks = form.getValues("timeBlocks") || [];
    const newBlock = {
      id: Math.random().toString(36).substr(2, 9),
      ...newTimeBlock,
      completed: false
    };
    
    form.setValue("timeBlocks", [...currentBlocks, newBlock]);
    setNewTimeBlock({ startTime: "", endTime: "", title: "", type: "work" });
  };

  const addPriority = () => {
    if (!newPriority) return;
    
    const currentPriorities = form.getValues("priorities") || [];
    const newPriorityItem = {
      id: Math.random().toString(36).substr(2, 9),
      text: newPriority,
      completed: false
    };
    
    form.setValue("priorities", [...currentPriorities, newPriorityItem]);
    setNewPriority("");
  };

  const toggleTimeBlock = (blockId: string) => {
    if (!dailyPlan) return;
    
    const updatedBlocks = (dailyPlan.timeBlocks || []).map((block: any) => 
      block.id === blockId ? { ...block, completed: !block.completed } : block
    );
    
    updatePlanMutation.mutate({
      id: dailyPlan.id,
      data: { timeBlocks: updatedBlocks }
    });
  };

  const togglePriority = (priorityId: string) => {
    if (!dailyPlan) return;
    
    const updatedPriorities = (dailyPlan.priorities || []).map((priority: any) => 
      priority.id === priorityId ? { ...priority, completed: !priority.completed } : priority
    );
    
    updatePlanMutation.mutate({
      id: dailyPlan.id,
      data: { priorities: updatedPriorities }
    });
  };

  const updateReflection = (reflection: string) => {
    if (!dailyPlan) return;
    updatePlanMutation.mutate({
      id: dailyPlan.id,
      data: { reflection }
    });
  };

  const updateWellness = (field: "energyLevel" | "moodRating", value: number) => {
    if (!dailyPlan) return;
    updatePlanMutation.mutate({
      id: dailyPlan.id,
      data: { [field]: value }
    });
  };

  const navigateDate = (direction: "prev" | "next") => {
    setSelectedDate(prev => direction === "prev" ? subDays(prev, 1) : addDays(prev, 1));
  };

  const getBlockTypeColor = (type: string) => {
    switch (type) {
      case "work": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "personal": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "break": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "todo": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "habit": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
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
    <div className="p-6 space-y-6" data-testid="daily-plan-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Daily Planning</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Structure your day with time blocks and priorities
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
              <DialogTitle>Create Daily Plan</DialogTitle>
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
                      Time Blocks
                    </label>
                    <div className="mt-2 space-y-2">
                      <div className="grid grid-cols-4 gap-2">
                        <Input
                          type="time"
                          placeholder="Start"
                          value={newTimeBlock.startTime}
                          onChange={(e) => setNewTimeBlock(prev => ({ ...prev, startTime: e.target.value }))}
                          data-testid="input-start-time"
                        />
                        <Input
                          type="time"
                          placeholder="End"
                          value={newTimeBlock.endTime}
                          onChange={(e) => setNewTimeBlock(prev => ({ ...prev, endTime: e.target.value }))}
                          data-testid="input-end-time"
                        />
                        <Input
                          placeholder="Activity"
                          value={newTimeBlock.title}
                          onChange={(e) => setNewTimeBlock(prev => ({ ...prev, title: e.target.value }))}
                          data-testid="input-activity"
                        />
                        <div className="flex gap-1">
                          <Select
                            value={newTimeBlock.type}
                            onValueChange={(value) => setNewTimeBlock(prev => ({ ...prev, type: value }))}
                          >
                            <SelectTrigger data-testid="select-block-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="work">Work</SelectItem>
                              <SelectItem value="personal">Personal</SelectItem>
                              <SelectItem value="break">Break</SelectItem>
                              <SelectItem value="todo">Todo</SelectItem>
                              <SelectItem value="habit">Habit</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            type="button" 
                            onClick={addTimeBlock}
                            size="sm"
                            data-testid="button-add-time-block"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {(form.watch("timeBlocks") || []).map((block) => (
                          <div key={block.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <span className="text-sm font-mono">{block.startTime} - {block.endTime}</span>
                            <Badge className={getBlockTypeColor(block.type)}>{block.type}</Badge>
                            <span className="flex-1">{block.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Daily Priorities
                    </label>
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a priority..."
                          value={newPriority}
                          onChange={(e) => setNewPriority(e.target.value)}
                          data-testid="input-new-priority"
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
                        {(form.watch("priorities") || []).map((priority) => (
                          <div key={priority.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <span className="flex-1">{priority.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="energyLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Energy Level (1-10)</FormLabel>
                        <FormControl>
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                            data-testid="slider-energy"
                          />
                        </FormControl>
                        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                          {field.value || 5}/10
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="moodRating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mood Rating (1-10)</FormLabel>
                        <FormControl>
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                            data-testid="slider-mood"
                          />
                        </FormControl>
                        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                          {field.value || 5}/10
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createPlanMutation.isPending}
                  data-testid="button-submit-plan"
                >
                  {createPlanMutation.isPending ? "Creating..." : "Create Daily Plan"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Date Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigateDate("prev")}
              data-testid="button-prev-day"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous Day
            </Button>
            
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {format(selectedDate, "EEEE, MMM dd, yyyy")}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") ? "Today" : 
                 format(selectedDate, "yyyy-MM-dd") === format(addDays(new Date(), 1), "yyyy-MM-dd") ? "Tomorrow" :
                 format(selectedDate, "yyyy-MM-dd") === format(subDays(new Date(), 1), "yyyy-MM-dd") ? "Yesterday" : ""}
              </p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => navigateDate("next")}
              data-testid="button-next-day"
            >
              Next Day
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Day Plan */}
      {dailyPlan ? (
        <div className="space-y-6">
          {/* Plan Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {dailyPlan.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Energy Level</p>
                    <p className="font-medium">{dailyPlan.energyLevel || 'Not set'}/10</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Mood Rating</p>
                    <p className="font-medium">{dailyPlan.moodRating || 'Not set'}/10</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Time Blocks</p>
                    <p className="font-medium">{(dailyPlan.timeBlocks || []).length} scheduled</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Blocks and Priorities */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Time Blocks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Blocks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!dailyPlan.timeBlocks || dailyPlan.timeBlocks.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No time blocks scheduled</p>
                ) : (
                  <div className="space-y-3">
                    {dailyPlan.timeBlocks.map((block: any) => (
                      <div 
                        key={block.id}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <button 
                          onClick={() => toggleTimeBlock(block.id)}
                          data-testid={`button-toggle-block-${block.id}`}
                        >
                          {block.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                              {block.startTime} - {block.endTime}
                            </span>
                            <Badge className={getBlockTypeColor(block.type)}>
                              {block.type}
                            </Badge>
                          </div>
                          <p className={`${block.completed ? "line-through text-gray-500" : "text-gray-900 dark:text-white"}`}>
                            {block.title}
                          </p>
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
                  Daily Priorities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!dailyPlan.priorities || dailyPlan.priorities.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No priorities set</p>
                ) : (
                  <div className="space-y-3">
                    {dailyPlan.priorities.map((priority: any) => (
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
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reflection */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Reflection</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyPlan.reflection ? (
                <div className="space-y-3">
                  <p className="text-gray-600 dark:text-gray-400">{dailyPlan.reflection}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const newReflection = prompt("Update reflection:", dailyPlan.reflection || "");
                      if (newReflection !== null) {
                        updateReflection(newReflection);
                      }
                    }}
                    data-testid="button-edit-reflection"
                  >
                    Edit Reflection
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400 mb-3">No reflection added yet</p>
                  <Button 
                    onClick={() => {
                      const reflection = prompt("Add your daily reflection:");
                      if (reflection) {
                        updateReflection(reflection);
                      }
                    }}
                    data-testid="button-add-reflection"
                  >
                    Add Reflection
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No plan for this day
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create a daily plan to structure your day with time blocks and priorities.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} data-testid="button-create-first-plan">
              <Plus className="mr-2 h-4 w-4" />
              Create Daily Plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}