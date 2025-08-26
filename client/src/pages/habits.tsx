import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "@/components/layout/sidebar";
import MobileSidebar from "@/components/layout/mobile-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu, Plus, Check, Clock, Flame, Calendar, Target, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AddHabitDialog from "@/components/dialogs/add-habit-dialog";
import type { Habit, HabitEntry } from "@shared/schema";

export default function HabitsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("today");
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  // Fetch data
  const { data: habits = [] } = useQuery<Habit[]>({
    queryKey: ['/api/habits']
  });

  const { data: habitEntries = [] } = useQuery<HabitEntry[]>({
    queryKey: ['/api/habit-entries'],
    queryFn: () => fetch('/api/habit-entries').then(res => res.json())
  });

  const { data: todayEntries = [] } = useQuery<HabitEntry[]>({
    queryKey: ['/api/habit-entries', today],
    queryFn: () => fetch(`/api/habit-entries?date=${today}`).then(res => res.json())
  });

  // Toggle habit completion
  const toggleHabitMutation = useMutation({
    mutationFn: async ({ habitId, completed }: { habitId: string; completed: boolean }) => {
      const existingEntry = todayEntries.find(entry => entry.habitId === habitId);
      
      if (existingEntry) {
        return apiRequest("PUT", `/api/habit-entries/${existingEntry.id}`, { completed });
      } else {
        return apiRequest("POST", "/api/habit-entries", {
          habitId,
          completed,
          date: today,
          minutesSpent: 0
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habit-entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      toast({
        title: "Habit updated",
        description: "Your habit progress has been saved.",
      });
    }
  });

  // Delete habit
  const deleteHabitMutation = useMutation({
    mutationFn: async (habitId: string) => {
      return apiRequest("DELETE", `/api/habits/${habitId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      toast({
        title: "Habit deleted",
        description: "The habit has been removed.",
      });
    }
  });

  const getHabitStats = (habit: Habit) => {
    const habitEntryList = habitEntries.filter(entry => entry.habitId === habit.id);
    const completedEntries = habitEntryList.filter(entry => entry.completed);
    const totalDays = habitEntryList.length;
    const completionRate = totalDays > 0 ? Math.round((completedEntries.length / totalDays) * 100) : 0;
    
    // Calculate current streak
    let currentStreak = 0;
    const sortedEntries = habitEntryList
      .filter(entry => entry.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const todayEntry = sortedEntries.find(entry => entry.date === today);
    if (todayEntry) {
      currentStreak = 1;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      for (let i = 1; i < sortedEntries.length; i++) {
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        if (sortedEntries[i].date === expectedDate.toISOString().split('T')[0]) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    
    return {
      completionRate,
      currentStreak,
      totalCompletions: completedEntries.length,
      lastCompleted: completedEntries.length > 0 ? completedEntries[completedEntries.length - 1].date : null
    };
  };

  const isHabitCompleted = (habitId: string) => {
    return todayEntries.find(entry => entry.habitId === habitId)?.completed || false;
  };

  const handleToggleHabit = (habitId: string) => {
    const currentlyCompleted = isHabitCompleted(habitId);
    toggleHabitMutation.mutate({ habitId, completed: !currentlyCompleted });
  };

  const getWeekData = () => {
    const week = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEntries = habitEntries.filter(entry => entry.date === dateStr && entry.completed);
      const completionRate = habits.length > 0 ? (dayEntries.length / habits.length) * 100 : 0;
      
      week.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en', { weekday: 'short' }),
        completions: dayEntries.length,
        completionRate: Math.round(completionRate)
      });
    }
    return week;
  };

  const weekData = getWeekData();

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}

      {/* Mobile Sidebar */}
      {isMobile && (
        <MobileSidebar 
          open={mobileMenuOpen} 
          onOpenChange={setMobileMenuOpen} 
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-surface border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(true)}
                  data-testid="button-mobile-menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Habit Tracker</h2>
                <p className="text-gray-600">Build consistency and track your daily routines</p>
              </div>
            </div>
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="bg-primary text-white hover:bg-blue-700"
              data-testid="button-add-habit"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Habit
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Weekly Progress Overview */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Weekly Progress</span>
                </CardTitle>
                <CardDescription>Your habit completion over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-4">
                  {weekData.map((day) => (
                    <div key={day.date} className="text-center">
                      <div className="text-sm font-medium text-gray-600 mb-2">{day.dayName}</div>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                        day.completionRate >= 80 ? 'bg-secondary' :
                        day.completionRate >= 50 ? 'bg-primary' :
                        day.completionRate > 0 ? 'bg-accent' : 'bg-gray-300'
                      }`} data-testid={`day-${day.date}`}>
                        {day.completionRate}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{day.completions}/{habits.length}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="today" data-testid="tab-today">Today</TabsTrigger>
                <TabsTrigger value="all" data-testid="tab-all">All Habits</TabsTrigger>
                <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Today's Habits</CardTitle>
                    <CardDescription>Complete your daily habits to build momentum</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {habits.length === 0 ? (
                      <div className="text-center py-12">
                        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No habits yet</h3>
                        <p className="text-gray-600 mb-6">Start building healthy routines by creating your first habit</p>
                        <Button onClick={() => setAddDialogOpen(true)} data-testid="button-add-first-habit">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Habit
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {habits.map((habit) => {
                          const completed = isHabitCompleted(habit.id);
                          const stats = getHabitStats(habit);
                          
                          return (
                            <div 
                              key={habit.id}
                              className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                              data-testid={`habit-${habit.id}`}
                            >
                              <button
                                onClick={() => handleToggleHabit(habit.id)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                  completed
                                    ? "bg-secondary text-white"
                                    : "border-2 border-gray-300 hover:border-secondary"
                                }`}
                                data-testid={`button-toggle-habit-${habit.id}`}
                              >
                                {completed && <Check className="h-4 w-4" />}
                              </button>
                              
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{habit.name}</h3>
                                {habit.description && (
                                  <p className="text-sm text-gray-600">{habit.description}</p>
                                )}
                                <div className="flex items-center space-x-4 mt-2">
                                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                                    <Flame className="h-4 w-4" />
                                    <span>{stats.currentStreak} day streak</span>
                                  </div>
                                  {(habit.targetMinutes || 0) > 0 && (
                                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                                      <Clock className="h-4 w-4" />
                                      <span>{habit.targetMinutes} min</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">
                                  {stats.completionRate}%
                                </div>
                                <div className="text-xs text-gray-600">completion rate</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="all" className="space-y-6">
                <div className="grid gap-6">
                  {habits.map((habit) => {
                    const stats = getHabitStats(habit);
                    
                    return (
                      <Card key={habit.id} data-testid={`habit-card-${habit.id}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="flex items-center space-x-2">
                                <span>{habit.name}</span>
                                <Badge variant={stats.currentStreak > 7 ? "default" : "secondary"}>
                                  {stats.currentStreak} day streak
                                </Badge>
                              </CardTitle>
                              {habit.description && (
                                <CardDescription className="mt-2">{habit.description}</CardDescription>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" data-testid={`button-edit-${habit.id}`}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => deleteHabitMutation.mutate(habit.id)}
                                data-testid={`button-delete-${habit.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <div className="text-sm font-medium text-gray-600 mb-2">Completion Rate</div>
                              <div className="flex items-center space-x-2">
                                <Progress value={stats.completionRate} className="flex-1" />
                                <span className="text-sm font-semibold">{stats.completionRate}%</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-600 mb-2">Total Completions</div>
                              <div className="text-2xl font-bold text-primary">{stats.totalCompletions}</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-600 mb-2">Last Completed</div>
                              <div className="text-sm">
                                {stats.lastCompleted ? 
                                  new Date(stats.lastCompleted).toLocaleDateString() : 
                                  'Never'
                                }
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Total Habits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary">{habits.length}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Completed Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-secondary">
                        {todayEntries.filter(e => e.completed).length}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Average Completion</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-accent">
                        {habits.length > 0 ? Math.round((todayEntries.filter(e => e.completed).length / habits.length) * 100) : 0}%
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Longest Streak</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-600">
                        {habits.length > 0 ? Math.max(...habits.map(h => getHabitStats(h).currentStreak)) : 0}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Habit Performance</CardTitle>
                    <CardDescription>Detailed statistics for each habit</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {habits.map((habit) => {
                        const stats = getHabitStats(habit);
                        return (
                          <div key={habit.id} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{habit.name}</h4>
                              <Badge variant="outline">{stats.completionRate}% complete</Badge>
                            </div>
                            <Progress value={stats.completionRate} className="mb-2" />
                            <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                              <div>Current streak: {stats.currentStreak} days</div>
                              <div>Total completions: {stats.totalCompletions}</div>
                              <div>
                                Last completed: {stats.lastCompleted ? 
                                  new Date(stats.lastCompleted).toLocaleDateString() : 
                                  'Never'
                                }
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <AddHabitDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
      />
    </div>
  );
}