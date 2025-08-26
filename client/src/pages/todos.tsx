import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, CheckSquare, Clock, Calendar, AlertCircle, 
  Filter, Search, MoreHorizontal, Edit, Trash2, 
  CheckCircle2, Circle, Clock3, XCircle
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Todo, TodoCategory, InsertTodo, InsertTodoCategory } from "@shared/schema";

const todoFormSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/todo-categories"],
  });

  const { data: todos = [], isLoading: todosLoading } = useQuery({
    queryKey: ["/api/todos"],
  });

  const todoForm = useForm<TodoFormData>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      categoryId: "",
      title: "",
      description: "",
      priority: "medium",
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
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest(`/api/todos/${id}`, "PUT", { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({
        title: "Success",
        description: "Todo updated!"
      });
    }
  });

  const onTodoSubmit = (data: TodoFormData) => {
    createTodoMutation.mutate(data);
  };

  const onCategorySubmit = (data: CategoryFormData) => {
    createCategoryMutation.mutate(data);
  };

  const handleStatusChange = (todo: Todo, status: string) => {
    updateTodoMutation.mutate({ id: todo.id, status });
  };

  const filteredTodos = todos.filter((todo: Todo) => {
    const matchesCategory = selectedCategory === "all" || todo.categoryId === selectedCategory;
    const matchesStatus = statusFilter === "all" || todo.status === statusFilter;
    const matchesSearch = searchQuery === "" || 
      todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      todo.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-600 bg-red-100 dark:bg-red-900/20";
      case "high": return "text-orange-600 bg-orange-100 dark:bg-orange-900/20";
      case "medium": return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
      case "low": return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
      default: return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "in_progress": return <Clock3 className="h-4 w-4 text-blue-600" />;
      case "cancelled": return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const todosByCategory = categories.map((category: TodoCategory) => ({
    category,
    todos: filteredTodos.filter((todo: Todo) => todo.categoryId === category.id)
  }));

  const todayTodos = filteredTodos.filter((todo: Todo) => {
    const today = format(new Date(), "yyyy-MM-dd");
    return todo.dueDate === today;
  });

  const overdueTodos = filteredTodos.filter((todo: Todo) => {
    const today = format(new Date(), "yyyy-MM-dd");
    return todo.dueDate && todo.dueDate < today && todo.status !== "completed";
  });

  if (categoriesLoading || todosLoading) {
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
    <div className="p-6 space-y-6" data-testid="todos-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">To Do</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organize tasks across all areas of your life
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-add-category">
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
              </DialogHeader>
              <Form {...categoryForm}>
                <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
                  <FormField
                    control={categoryForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Work, Personal, Health" {...field} data-testid="input-category-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
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
                <Plus className="mr-2 h-4 w-4" />
                Add Todo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Todo</DialogTitle>
              </DialogHeader>
              <Form {...todoForm}>
                <form onSubmit={todoForm.handleSubmit(onTodoSubmit)} className="space-y-4">
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
                            {categories.map((category: TodoCategory) => (
                              <SelectItem key={category.id} value={category.id}>
                                <span className="flex items-center gap-2">
                                  <span>{category.icon}</span>
                                  {category.name}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={todoForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="What needs to be done?" {...field} data-testid="input-todo-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={todoForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional details..." {...field} data-testid="textarea-todo-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={todoForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-todo-priority">
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={todoForm.control}
                      name="estimatedMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Time (minutes)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="30" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              data-testid="input-estimated-time"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={todoForm.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-due-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={todoForm.control}
                      name="dueTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Time (Optional)</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} data-testid="input-due-time" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={createTodoMutation.isPending}
                    data-testid="button-submit-todo"
                  >
                    {createTodoMutation.isPending ? "Creating..." : "Create Todo"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckSquare className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Todos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{todos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Due Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayTodos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{overdueTodos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search todos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
                data-testid="input-search-todos"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48" data-testid="select-filter-category">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category: TodoCategory) => (
                  <SelectItem key={category.id} value={category.id}>
                    <span className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      {category.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48" data-testid="select-filter-status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Todos by Category */}
      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">By Categories</TabsTrigger>
          <TabsTrigger value="today">Due Today</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories">
          <div className="space-y-6">
            {todosByCategory.map(({ category, todos: categoryTodos }) => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span style={{ color: category.color }}>{category.icon}</span>
                    <div>
                      <span className="text-lg">{category.name}</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                        {category.description}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-auto">
                      {categoryTodos.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryTodos.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No todos in this category yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {categoryTodos.map((todo: Todo) => (
                        <div 
                          key={todo.id} 
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          data-testid={`todo-item-${todo.id}`}
                        >
                          <button 
                            onClick={() => handleStatusChange(todo, todo.status === "completed" ? "pending" : "completed")}
                            className="flex-shrink-0"
                            data-testid={`button-toggle-${todo.id}`}
                          >
                            {getStatusIcon(todo.status)}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium ${todo.status === "completed" ? "line-through text-gray-500" : "text-gray-900 dark:text-white"}`}>
                              {todo.title}
                            </h4>
                            {todo.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">{todo.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={getPriorityColor(todo.priority)}>
                                {todo.priority}
                              </Badge>
                              {todo.dueDate && (
                                <Badge variant="outline" className="text-xs">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {format(new Date(todo.dueDate), "MMM dd")}
                                  {todo.dueTime && ` at ${todo.dueTime}`}
                                </Badge>
                              )}
                              {todo.estimatedMinutes && (
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {todo.estimatedMinutes}m
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="today">
          <Card>
            <CardHeader>
              <CardTitle>Due Today</CardTitle>
            </CardHeader>
            <CardContent>
              {todayTodos.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No todos due today
                </div>
              ) : (
                <div className="space-y-3">
                  {todayTodos.map((todo: Todo) => (
                    <div 
                      key={todo.id} 
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <button onClick={() => handleStatusChange(todo, todo.status === "completed" ? "pending" : "completed")}>
                        {getStatusIcon(todo.status)}
                      </button>
                      <div className="flex-1">
                        <h4 className={`font-medium ${todo.status === "completed" ? "line-through text-gray-500" : "text-gray-900 dark:text-white"}`}>
                          {todo.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getPriorityColor(todo.priority)}>
                            {todo.priority}
                          </Badge>
                          {todo.dueTime && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {todo.dueTime}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Overdue Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {overdueTodos.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No overdue todos - great job!
                </div>
              ) : (
                <div className="space-y-3">
                  {overdueTodos.map((todo: Todo) => (
                    <div 
                      key={todo.id} 
                      className="flex items-center gap-3 p-3 border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg"
                    >
                      <button onClick={() => handleStatusChange(todo, "completed")}>
                        {getStatusIcon(todo.status)}
                      </button>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{todo.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getPriorityColor(todo.priority)}>
                            {todo.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs text-red-600">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Due {format(new Date(todo.dueDate!), "MMM dd")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}