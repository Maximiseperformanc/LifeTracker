import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckSquare, Calendar, TrendingUp, Target, Clock, 
  Plus, ArrowRight, Star, AlertCircle, ChevronRight,
  CalendarDays, ListTodo, Activity, Circle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format, isToday, isTomorrow } from "date-fns";
import type { Todo, TodoCategory, CalendarEvent, Habit, HabitEntry } from "@shared/schema";

export default function Dashboard() {
  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(new Date(Date.now() + 24 * 60 * 60 * 1000), "yyyy-MM-dd");

  // Fetch data for all sections
  const { data: todos = [] } = useQuery<Todo[]>({
    queryKey: ["/api/todos"],
  });

  const { data: todoCategories = [] } = useQuery<TodoCategory[]>({
    queryKey: ["/api/todo-categories"],
  });

  const { data: events = [] } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar-events"],
  });

  const { data: habits = [] } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
  });

  const { data: todayHabitEntries = [] } = useQuery<HabitEntry[]>({
    queryKey: ["/api/habit-entries", { date: today }],
    queryFn: () => fetch(`/api/habit-entries?date=${today}`).then(res => res.json())
  });

  // Calculate stats for each section
  const todayTodos = todos.filter(todo => todo.dueDate === today);
  const overdueTodos = todos.filter(todo => 
    todo.dueDate && todo.dueDate < today && todo.status !== "completed"
  );
  const completedTodos = todos.filter(todo => todo.status === "completed").length;
  const pendingTodos = todos.filter(todo => todo.status === "pending").length;

  const todayEvents = events.filter(event => event.startDate === today);
  const tomorrowEvents = events.filter(event => event.startDate === tomorrow);
  const upcomingEvents = events.filter(event => event.startDate > today).length;

  const activeHabits = habits.filter(habit => !habit.isArchived);
  const completedHabitsToday = todayHabitEntries.filter(entry => {
    const habit = habits.find(h => h.id === entry.habitId);
    return habit && (entry.value || 0) >= (habit.targetValue || 1);
  }).length;
  const habitCompletionRate = activeHabits.length > 0 
    ? Math.round((completedHabitsToday / activeHabits.length) * 100) 
    : 0;

  return (
    <div className="p-6 space-y-8" data-testid="dashboard">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">LifeTrack Pro</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Your comprehensive personal development dashboard
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
          {format(new Date(), "EEEE, MMMM dd, yyyy")}
        </p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
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
              <Target className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{habitCompletionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main 3 Sections */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* To Do Section */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-blue-600" />
              To Do
            </CardTitle>
            <Link href="/todos">
              <Button variant="outline" size="sm" data-testid="link-todos">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{completedTodos}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingTodos}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Pending</p>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Categories</h4>
              <div className="space-y-2">
                {todoCategories.slice(0, 3).map(category => {
                  const categoryTodos = todos.filter(todo => todo.categoryId === category.id);
                  const completedInCategory = categoryTodos.filter(todo => todo.status === "completed").length;
                  
                  return (
                    <div key={category.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="flex items-center gap-2">
                        <span style={{ color: category.color || "#3B82F6" }}>{category.icon}</span>
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {completedInCategory}/{categoryTodos.length}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Today's Todos */}
            {todayTodos.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Due Today</h4>
                <div className="space-y-2">
                  {todayTodos.slice(0, 3).map(todo => (
                    <div key={todo.id} className="flex items-center gap-2 p-2 border rounded">
                      <Circle className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white truncate">{todo.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {todo.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overdue Alert */}
            {overdueTodos.length > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-400">
                    {overdueTodos.length} overdue tasks
                  </span>
                </div>
              </div>
            )}

            <Link href="/todos">
              <Button className="w-full" variant="outline" data-testid="button-view-todos">
                <ListTodo className="h-4 w-4 mr-2" />
                View All Todos
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Calendar Section */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Calendar
            </CardTitle>
            <Link href="/calendar">
              <Button variant="outline" size="sm" data-testid="link-calendar">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{todayEvents.length}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Today</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{upcomingEvents}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Upcoming</p>
              </div>
            </div>

            {/* Today's Events */}
            {todayEvents.length > 0 ? (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Today's Schedule</h4>
                <div className="space-y-2">
                  {todayEvents.slice(0, 3).map(event => (
                    <div key={event.id} className="flex items-center gap-2 p-2 border rounded">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{event.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {event.startTime || "All day"}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {event.eventType}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <CalendarDays className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">No events today</p>
              </div>
            )}

            {/* Tomorrow Preview */}
            {tomorrowEvents.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Tomorrow</h4>
                <div className="space-y-1">
                  {tomorrowEvents.slice(0, 2).map(event => (
                    <div key={event.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-sm text-gray-900 dark:text-white truncate">{event.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {event.startTime || "All day"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link href="/calendar">
              <Button className="w-full" variant="outline" data-testid="button-view-calendar">
                <Calendar className="h-4 w-4 mr-2" />
                View Full Calendar
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Systems Section */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Systems
            </CardTitle>
            <Link href="/systems">
              <Button variant="outline" size="sm" data-testid="link-systems">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{completedHabitsToday}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{habitCompletionRate}%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Rate</p>
              </div>
            </div>

            {/* Today's Systems */}
            {activeHabits.length > 0 ? (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Today's Systems</h4>
                <div className="space-y-2">
                  {activeHabits.slice(0, 4).map(habit => {
                    const todayEntry = todayHabitEntries.find(entry => entry.habitId === habit.id);
                    const progress = todayEntry?.value || 0;
                    const isCompleted = progress >= (habit.targetValue || 1);
                    
                    return (
                      <div key={habit.id} className="flex items-center gap-2 p-2 border rounded">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{habit.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div 
                                className="bg-purple-600 h-1.5 rounded-full transition-all"
                                style={{ width: `${Math.min((progress / (habit.targetValue || 1)) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {progress}/{habit.targetValue || 1}
                            </span>
                          </div>
                        </div>
                        {isCompleted && (
                          <CheckSquare className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">No active systems</p>
              </div>
            )}

            {/* Categories */}
            {habits.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {[...new Set(habits.map(h => h.category).filter(Boolean))].slice(0, 3).map(category => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Link href="/systems">
              <Button className="w-full" variant="outline" data-testid="button-view-systems">
                <TrendingUp className="h-4 w-4 mr-2" />
                View All Systems
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Planning Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            Planning & Organization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/weekly-plan">
              <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white">Weekly Planning</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Set goals and priorities for the week
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/daily-plan">
              <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white">Daily Planning</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Structure your day with time blocks
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Link href="/todos">
              <Button className="w-full" variant="outline" data-testid="button-quick-todo">
                <Plus className="h-4 w-4 mr-2" />
                Add Todo
              </Button>
            </Link>
            
            <Link href="/calendar">
              <Button className="w-full" variant="outline" data-testid="button-quick-event">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </Link>
            
            <Link href="/systems">
              <Button className="w-full" variant="outline" data-testid="button-quick-system">
                <Plus className="h-4 w-4 mr-2" />
                Add System
              </Button>
            </Link>
            
            <Link href="/timer">
              <Button className="w-full" variant="outline" data-testid="button-quick-timer">
                <Clock className="h-4 w-4 mr-2" />
                Start Timer
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}