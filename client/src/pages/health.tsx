import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "@/components/layout/sidebar";
import MobileSidebar from "@/components/layout/mobile-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Menu, Plus, Moon, Dumbbell, Smile, Heart, TrendingUp, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import LogHealthDialog from "@/components/dialogs/log-health-dialog";
import type { HealthEntry } from "@shared/schema";

export default function HealthPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("today");
  const isMobile = useIsMobile();
  const today = new Date().toISOString().split('T')[0];

  // Fetch health data
  const { data: healthEntries = [] } = useQuery<HealthEntry[]>({
    queryKey: ['/api/health-entries'],
    queryFn: () => fetch('/api/health-entries').then(res => res.json())
  });

  const todayEntry = healthEntries.find(entry => entry.date === today);

  const getWeekData = () => {
    const week = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const entry = healthEntries.find(e => e.date === dateStr);
      week.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en', { weekday: 'short' }),
        entry
      });
    }
    return week;
  };

  const getHealthStats = () => {
    const recentEntries = healthEntries.slice(-30); // Last 30 days
    
    if (recentEntries.length === 0) {
      return {
        avgSleep: 0,
        avgSleepQuality: 0,
        avgExercise: 0,
        avgMood: 0,
        totalCalories: 0
      };
    }

    const sleepEntries = recentEntries.filter(e => e.sleepHours);
    const qualityEntries = recentEntries.filter(e => e.sleepQuality);
    const exerciseEntries = recentEntries.filter(e => e.exerciseMinutes);
    const moodEntries = recentEntries.filter(e => e.mood);
    
    return {
      avgSleep: sleepEntries.length > 0 ? 
        sleepEntries.reduce((sum, e) => sum + (e.sleepHours || 0), 0) / sleepEntries.length : 0,
      avgSleepQuality: qualityEntries.length > 0 ?
        qualityEntries.reduce((sum, e) => sum + (e.sleepQuality || 0), 0) / qualityEntries.length : 0,
      avgExercise: exerciseEntries.length > 0 ?
        exerciseEntries.reduce((sum, e) => sum + (e.exerciseMinutes || 0), 0) / exerciseEntries.length : 0,
      avgMood: moodEntries.length > 0 ?
        moodEntries.reduce((sum, e) => sum + (e.mood || 0), 0) / moodEntries.length : 0,
      totalCalories: recentEntries.reduce((sum, e) => sum + (e.caloriesBurned || 0), 0)
    };
  };

  const getMoodEmoji = (mood: number | null | undefined) => {
    if (!mood) return "😐";
    if (mood <= 2) return "😢";
    if (mood <= 4) return "😕";
    if (mood <= 6) return "😐";
    if (mood <= 8) return "🙂";
    return "😊";
  };

  const getSleepQualityColor = (quality: number | null | undefined) => {
    if (!quality) return "bg-gray-300";
    if (quality <= 3) return "bg-red-500";
    if (quality <= 6) return "bg-yellow-500";
    if (quality <= 8) return "bg-blue-500";
    return "bg-green-500";
  };

  const stats = getHealthStats();
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
                <h2 className="text-2xl font-semibold text-gray-900">Health Tracker</h2>
                <p className="text-gray-600">Monitor your sleep, exercise, and overall wellbeing</p>
              </div>
            </div>
            <Button
              onClick={() => setLogDialogOpen(true)}
              className="bg-primary text-white hover:bg-blue-700"
              data-testid="button-log-health"
            >
              <Plus className="h-4 w-4 mr-2" />
              Log Health Data
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Today's Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sleep</CardTitle>
                  <Moon className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="today-sleep-hours">
                    {todayEntry?.sleepHours || 0}h
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <div className={`w-3 h-3 rounded-full ${getSleepQualityColor(todayEntry?.sleepQuality)}`}></div>
                    <span data-testid="today-sleep-quality">
                      Quality: {todayEntry?.sleepQuality || 0}/10
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Exercise</CardTitle>
                  <Dumbbell className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="today-exercise-minutes">
                    {todayEntry?.exerciseMinutes || 0}m
                  </div>
                  <p className="text-xs text-gray-600" data-testid="today-exercise-type">
                    {todayEntry?.exerciseType || 'No activity logged'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mood</CardTitle>
                  <Smile className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl" data-testid="today-mood-emoji">
                      {getMoodEmoji(todayEntry?.mood)}
                    </span>
                    <div className="text-2xl font-bold" data-testid="today-mood-score">
                      {todayEntry?.mood || 0}/10
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Calories</CardTitle>
                  <Heart className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="today-calories">
                    {todayEntry?.caloriesBurned || 0}
                  </div>
                  <p className="text-xs text-gray-600">burned</p>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="today" data-testid="tab-today">Today</TabsTrigger>
                <TabsTrigger value="weekly" data-testid="tab-weekly">Weekly View</TabsTrigger>
                <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Moon className="h-5 w-5 text-blue-600" />
                        <span>Sleep Analysis</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Sleep Duration</span>
                          <span className="font-medium">{todayEntry?.sleepHours || 0} hours</span>
                        </div>
                        <Progress 
                          value={Math.min(((todayEntry?.sleepHours || 0) / 8) * 100, 100)} 
                          className="mt-2"
                        />
                        <p className="text-xs text-gray-600 mt-1">Recommended: 7-9 hours</p>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Sleep Quality</span>
                          <span className="font-medium">{todayEntry?.sleepQuality || 0}/10</span>
                        </div>
                        <Progress 
                          value={((todayEntry?.sleepQuality || 0) / 10) * 100} 
                          className="mt-2"
                        />
                      </div>

                      {!todayEntry && (
                        <div className="text-center py-4 text-gray-500">
                          <Moon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>No sleep data logged for today</p>
                          <Button 
                            onClick={() => setLogDialogOpen(true)} 
                            size="sm" 
                            className="mt-2"
                          >
                            Log Sleep Data
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Dumbbell className="h-5 w-5 text-green-600" />
                        <span>Exercise Summary</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Duration</span>
                          <span className="font-medium">{todayEntry?.exerciseMinutes || 0} minutes</span>
                        </div>
                        <Progress 
                          value={Math.min(((todayEntry?.exerciseMinutes || 0) / 60) * 100, 100)} 
                          className="mt-2"
                        />
                        <p className="text-xs text-gray-600 mt-1">Recommended: 30+ minutes daily</p>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Activity Type</span>
                          <span className="font-medium capitalize">
                            {todayEntry?.exerciseType || 'None'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Calories Burned</span>
                          <span className="font-medium">{todayEntry?.caloriesBurned || 0}</span>
                        </div>
                      </div>

                      {!todayEntry && (
                        <div className="text-center py-4 text-gray-500">
                          <Dumbbell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>No exercise data logged for today</p>
                          <Button 
                            onClick={() => setLogDialogOpen(true)} 
                            size="sm" 
                            className="mt-2"
                          >
                            Log Exercise Data
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {todayEntry?.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Today's Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{todayEntry.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="weekly" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>7-Day Health Overview</span>
                    </CardTitle>
                    <CardDescription>Your health metrics for the past week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Sleep Overview */}
                      <div>
                        <h4 className="font-medium mb-3 flex items-center space-x-2">
                          <Moon className="h-4 w-4 text-blue-600" />
                          <span>Sleep Pattern</span>
                        </h4>
                        <div className="grid grid-cols-7 gap-2">
                          {weekData.map((day) => (
                            <div key={day.date} className="text-center">
                              <div className="text-xs font-medium text-gray-600 mb-1">{day.dayName}</div>
                              <div className="bg-gray-100 rounded-lg p-2">
                                <div className="text-sm font-semibold">
                                  {day.entry?.sleepHours || 0}h
                                </div>
                                <div className={`w-full h-2 rounded mt-1 ${getSleepQualityColor(day.entry?.sleepQuality)}`}></div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Q: {day.entry?.sleepQuality || 0}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Exercise Overview */}
                      <div>
                        <h4 className="font-medium mb-3 flex items-center space-x-2">
                          <Dumbbell className="h-4 w-4 text-green-600" />
                          <span>Exercise Activity</span>
                        </h4>
                        <div className="grid grid-cols-7 gap-2">
                          {weekData.map((day) => (
                            <div key={day.date} className="text-center">
                              <div className="text-xs font-medium text-gray-600 mb-1">{day.dayName}</div>
                              <div className="bg-gray-100 rounded-lg p-2">
                                <div className="text-sm font-semibold">
                                  {day.entry?.exerciseMinutes || 0}m
                                </div>
                                <div className="text-xs text-gray-500 mt-1 capitalize">
                                  {day.entry?.exerciseType || 'Rest'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Mood Overview */}
                      <div>
                        <h4 className="font-medium mb-3 flex items-center space-x-2">
                          <Smile className="h-4 w-4 text-yellow-600" />
                          <span>Mood Tracking</span>
                        </h4>
                        <div className="grid grid-cols-7 gap-2">
                          {weekData.map((day) => (
                            <div key={day.date} className="text-center">
                              <div className="text-xs font-medium text-gray-600 mb-1">{day.dayName}</div>
                              <div className="bg-gray-100 rounded-lg p-2">
                                <div className="text-2xl mb-1">
                                  {getMoodEmoji(day.entry?.mood)}
                                </div>
                                <div className="text-xs font-medium">
                                  {day.entry?.mood || 0}/10
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Avg Sleep</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600">
                        {stats.avgSleep.toFixed(1)}h
                      </div>
                      <Badge variant={stats.avgSleep >= 7 ? "default" : "destructive"} className="mt-2">
                        {stats.avgSleep >= 7 ? 'Good' : 'Needs Improvement'}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Avg Exercise</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">
                        {Math.round(stats.avgExercise)}m
                      </div>
                      <Badge variant={stats.avgExercise >= 30 ? "default" : "destructive"} className="mt-2">
                        {stats.avgExercise >= 30 ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Avg Mood</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getMoodEmoji(stats.avgMood)}</span>
                        <div className="text-3xl font-bold text-yellow-600">
                          {stats.avgMood.toFixed(1)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Total Calories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-600">
                        {Math.round(stats.totalCalories)}
                      </div>
                      <p className="text-xs text-gray-600 mt-2">Last 30 days</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Health Insights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <h4 className="font-medium text-blue-900">Sleep Pattern</h4>
                        <p className="text-sm text-blue-800 mt-1">
                          {stats.avgSleep >= 7 
                            ? "Great job! You're getting adequate sleep on average."
                            : "Consider improving your sleep schedule. Aim for 7-9 hours nightly."
                          }
                        </p>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                        <h4 className="font-medium text-green-900">Exercise Activity</h4>
                        <p className="text-sm text-green-800 mt-1">
                          {stats.avgExercise >= 30
                            ? "Excellent! You're meeting the recommended daily exercise goals."
                            : "Try to increase your daily activity. Even 30 minutes makes a difference."
                          }
                        </p>
                      </div>
                      
                      <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                        <h4 className="font-medium text-yellow-900">Mental Wellbeing</h4>
                        <p className="text-sm text-yellow-800 mt-1">
                          {stats.avgMood >= 7
                            ? "Your mood tracking shows positive mental health trends."
                            : "Consider activities that boost your mood and wellbeing."
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <LogHealthDialog 
        open={logDialogOpen} 
        onOpenChange={setLogDialogOpen}
        existingEntry={todayEntry}
      />
    </div>
  );
}