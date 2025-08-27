import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, CheckSquare, Clock, Calendar, AlertCircle, Flame,
  Filter, Search, MoreHorizontal, Edit, Trash2, 
  CheckCircle2, Circle, Clock3, XCircle, Star, 
  Target, ArrowUp, ArrowDown, ArrowRight, ArrowLeft
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, isToday, isPast, isTomorrow } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Todo, TodoCategory, InsertTodo, InsertTodoCategory } from "@shared/schema";

const todoFormSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  isUrgent: z.boolean().default(false),
  isImportant: z.boolean().default(false),
  priorityScore: z.number().min(1).max(5).default(3),
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
  estimatedMinutes: z.number().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional()
});

const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().default("#3B82F6"),
  icon: z.string().default("📝")
});

type TodoFormData = z.infer<typeof todoFormSchema>;
type CategoryFormData = z.infer<typeof categoryFormSchema>;

export default function TodoPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("matrix");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<TodoCategory[]>({
    queryKey: ["/api/todo-categories"],
  });

  const { data: todos = [], isLoading: todosLoading } = useQuery<Todo[]>({
    queryKey: ["/api/todos"],
  });

  const todoForm = useForm<TodoFormData>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      categoryId: "",
      title: "",
      description: "",
      priority: "medium",
      isUrgent: false,
      isImportant: false,
      priorityScore: 3,
      dueDate: "",
      dueTime: "",
      estimatedMinutes: undefined,
      tags: [],
      notes: ""
    }
  });

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3B82F6",
      icon: "📝"
    }
  });

  const createTodoMutation = useMutation({
    mutationFn: (data: TodoFormData) => apiRequest("/api/todos", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      setIsDialogOpen(false);
      todoForm.reset();
      toast({
        title: "Success",
        description: "Todo created successfully!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create todo",
        variant: "destructive"
      });
    }
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryFormData) => apiRequest("/api/todo-categories", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todo-categories"] });
      setIsCategoryDialogOpen(false);
      categoryForm.reset();
      toast({
        title: "Success",
        description: "Category created successfully!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive"
      });
    }
  });

  const updateTodoMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Todo>) => 
      apiRequest(`/api/todos/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({
        title: "Success",
        description: "Todo updated successfully!"
      });
    }
  });

  const deleteTodoMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/todos/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({
        title: "Success",
        description: "Todo deleted successfully!"
      });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/todo-categories/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todo-categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({
        title: "Success",
        description: "Category deleted successfully!"
      });
    }
  });

  // Filter todos based on search query
  const filteredTodos = todos.filter(todo => 
    !searchQuery || 
    todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Eisenhower Matrix quadrants
  const urgentImportant = filteredTodos.filter(todo => todo.isUrgent && todo.isImportant && todo.status !== "completed");
  const notUrgentImportant = filteredTodos.filter(todo => !todo.isUrgent && todo.isImportant && todo.status !== "completed");
  const urgentNotImportant = filteredTodos.filter(todo => todo.isUrgent && !todo.isImportant && todo.status !== "completed");
  const notUrgentNotImportant = filteredTodos.filter(todo => !todo.isUrgent && !todo.isImportant && todo.status !== "completed");

  // Most essential tasks (urgent & important with highest priority scores, plus overdue items)
  const essentialTasks = filteredTodos
    .filter(todo => todo.status !== "completed")
    .filter(todo => 
      (todo.isUrgent && todo.isImportant) || 
      (todo.dueDate && isPast(new Date(todo.dueDate))) ||
      (todo.priorityScore && todo.priorityScore >= 4)
    )
    .sort((a, b) => {
      // Sort by urgency/importance first, then priority score, then due date
      if (a.isUrgent && a.isImportant && !(b.isUrgent && b.isImportant)) return -1;
      if (b.isUrgent && b.isImportant && !(a.isUrgent && a.isImportant)) return 1;
      
      const aScore = a.priorityScore || 3;
      const bScore = b.priorityScore || 3;
      if (aScore !== bScore) return bScore - aScore;
      
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      
      return 0;
    })
    .slice(0, 8); // Show top 8 essential tasks

  const sortTodosInQuadrant = (todos: Todo[]) => {
    return todos.sort((a, b) => {
      const aScore = a.priorityScore || 3;
      const bScore = b.priorityScore || 3;
      if (aScore !== bScore) return bScore - aScore;
      
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  };

  const handleToggleComplete = (todo: Todo) => {
    updateTodoMutation.mutate({
      id: todo.id,
      status: todo.status === "completed" ? "pending" : "completed"
    });
  };

  const renderPriorityStars = (score: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star 
            key={i} 
            className={`h-3 w-3 ${i <= score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };

  const renderTodoCard = (todo: Todo) => {
    const category = categories.find(c => c.id === todo.categoryId);
    const isOverdue = todo.dueDate && isPast(new Date(todo.dueDate));
    const isDueToday = todo.dueDate && isToday(new Date(todo.dueDate));
    const isDueTomorrow = todo.dueDate && isTomorrow(new Date(todo.dueDate));

    return (
      <div 
        key={todo.id} 
        className={`p-3 border rounded-lg hover:shadow-sm transition-shadow ${
          isOverdue ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 
          isDueToday ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/10' : 
          'border-gray-200 dark:border-gray-700'
        }`}
      >
        <div className="flex items-start gap-3">
          <button 
            onClick={() => handleToggleComplete(todo)}
            className="mt-0.5 flex-shrink-0"
            data-testid={`button-toggle-${todo.id}`}
          >
            {todo.status === "completed" ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h4 className={`font-medium ${todo.status === "completed" ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                {todo.title}
              </h4>
              <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                {renderPriorityStars(todo.priorityScore || 3)}
              </div>
            </div>
            
            {todo.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{todo.description}</p>
            )}
            
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {category && (
                <Badge variant="secondary" className="text-xs" style={{ color: category.color }}>
                  {category.icon} {category.name}
                </Badge>
              )}
              
              {todo.dueDate && (
                <Badge 
                  variant={isOverdue ? "destructive" : isDueToday ? "default" : "outline"} 
                  className="text-xs"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {isToday(new Date(todo.dueDate)) ? "Today" :
                   isTomorrow(new Date(todo.dueDate)) ? "Tomorrow" :
                   format(new Date(todo.dueDate), "MMM dd")}
                </Badge>
              )}
              
              {todo.estimatedMinutes && (
                <Badge variant="outline" className="text-xs">
                  {todo.estimatedMinutes}min
                </Badge>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteTodoMutation.mutate(todo.id)}
            data-testid={`button-delete-${todo.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderQuadrant = (todos: Todo[], title: string, icon: React.ReactNode, description: string) => (
    <Card className="flex-1 min-h-[400px]">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
          <Badge variant="secondary" className="ml-auto">
            {todos.length}
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {sortTodosInQuadrant(todos).map(renderTodoCard)}
        {todos.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks in this quadrant</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (todosLoading || categoriesLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="todos-page">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">To Do Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organize tasks using the Eisenhower Matrix for maximum productivity
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-add-category">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
              </DialogHeader>
              <Form {...categoryForm}>
                <form onSubmit={categoryForm.handleSubmit((data) => createCategoryMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={categoryForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Work, Personal, etc." {...field} data-testid="input-category-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={categoryForm.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <FormControl>
                            <Input type="color" {...field} data-testid="input-category-color" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={categoryForm.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon</FormLabel>
                          <FormControl>
                            <Input placeholder="📝" {...field} data-testid="input-category-icon" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={categoryForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Category description..." {...field} data-testid="textarea-category-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createCategoryMutation.isPending}
                    data-testid="button-submit-category"
                  >
                    {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-todo">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <Form {...todoForm}>
                <form onSubmit={todoForm.handleSubmit((data) => createTodoMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={todoForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Task title" {...field} data-testid="input-todo-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={todoForm.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-todo-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <span style={{ color: category.color }}>
                                  {category.icon} {category.name}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Eisenhower Matrix Classification */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Eisenhower Matrix Classification</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={todoForm.control}
                        name="isUrgent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-urgent"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Urgent</FormLabel>
                              <p className="text-xs text-gray-500">Needs immediate action</p>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={todoForm.control}
                        name="isImportant"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-important"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Important</FormLabel>
                              <p className="text-xs text-gray-500">Significant impact</p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={todoForm.control}
                    name="priorityScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority Score (1-5)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                          <FormControl>
                            <SelectTrigger data-testid="select-priority-score">
                              <SelectValue placeholder="Select priority score" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map(num => (
                              <SelectItem key={num} value={String(num)}>
                                <div className="flex items-center gap-2">
                                  <span>{num}</span>
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map(i => (
                                      <Star key={i} className={`h-3 w-3 ${i <= num ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                    ))}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={todoForm.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-due-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={todoForm.control}
                      name="estimatedMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Est. Time (min)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="30"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              data-testid="input-estimated-minutes"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={todoForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Task description..." {...field} data-testid="textarea-todo-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createTodoMutation.isPending}
                    data-testid="button-submit-todo"
                  >
                    {createTodoMutation.isPending ? "Creating..." : "Create Task"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Essential Overview</TabsTrigger>
          <TabsTrigger value="matrix">Eisenhower Matrix</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        {/* Essential Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-red-600" />
                Most Essential Tasks
                <Badge variant="secondary">{essentialTasks.length}</Badge>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                High-priority, urgent, important, and overdue tasks that need immediate attention
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {essentialTasks.length > 0 ? (
                essentialTasks.map(renderTodoCard)
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No essential tasks at the moment</p>
                  <p className="text-xs">Great job staying on top of things!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{urgentImportant.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Do First</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{notUrgentImportant.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Schedule</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{urgentNotImportant.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Delegate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">{notUrgentNotImportant.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Eliminate</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Eisenhower Matrix Tab */}
        <TabsContent value="matrix" className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Quadrant 1: Urgent & Important (Do First) */}
            {renderQuadrant(
              urgentImportant,
              "Do First",
              <Flame className="h-5 w-5 text-red-600" />,
              "Crisis situations and urgent deadlines"
            )}

            {/* Quadrant 2: Not Urgent & Important (Schedule) */}
            {renderQuadrant(
              notUrgentImportant,
              "Schedule",
              <Calendar className="h-5 w-5 text-blue-600" />,
              "Important goals and planning activities"
            )}

            {/* Quadrant 3: Urgent & Not Important (Delegate) */}
            {renderQuadrant(
              urgentNotImportant,
              "Delegate",
              <ArrowRight className="h-5 w-5 text-orange-600" />,
              "Interruptions and some meetings"
            )}

            {/* Quadrant 4: Not Urgent & Not Important (Eliminate) */}
            {renderQuadrant(
              notUrgentNotImportant,
              "Eliminate",
              <XCircle className="h-5 w-5 text-gray-600" />,
              "Time wasters and excessive entertainment"
            )}
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const categoryTodos = filteredTodos.filter(todo => todo.categoryId === category.id);
              const completedInCategory = categoryTodos.filter(todo => todo.status === "completed").length;
              const pendingInCategory = categoryTodos.filter(todo => todo.status !== "completed").length;
              
              return (
                <Card key={category.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <span style={{ color: category.color }}>{category.icon}</span>
                        {category.name}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCategoryMutation.mutate(category.id)}
                        data-testid={`button-delete-category-${category.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="font-semibold text-gray-900 dark:text-white">{pendingInCategory}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Pending</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        <div className="font-semibold text-green-600">{completedInCategory}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
                      </div>
                    </div>
                    
                    {pendingInCategory > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {categoryTodos
                          .filter(todo => todo.status !== "completed")
                          .slice(0, 5)
                          .map(renderTodoCard)
                        }
                        {pendingInCategory > 5 && (
                          <p className="text-xs text-gray-500 text-center py-2">
                            +{pendingInCategory - 5} more tasks
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}