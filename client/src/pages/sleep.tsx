import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, Moon, Bed, CloudMoon, Sun, TrendingUp, 
  Calendar, AlertCircle, Star, BarChart3, Clock
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { HealthEntry } from "@shared/schema";

export default function SleepPage() {
  const [showSleepDialog, setShowSleepDialog] = useState(false);
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState([8]);
  const [bedTime, setBedTime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [sleepNotes, setSleepNotes] = useState("");
  const [activeTab, setActiveTab] = useState("today");

  const { toast } = useToast();
  const today = format(new Date(), "yyyy-MM-dd");

  // Fetch health entries
  const { data: healthEntries = [] } = useQuery<HealthEntry[]>({
    queryKey: ["/api/health-entries"],
  });

  const todayHealth = healthEntries.find(entry => entry.date === today);

  // Save sleep data mutation
  const saveSleepMutation = useMutation({
    mutationFn: (data: any) => {
      if (todayHealth) {
        return apiRequest(`/api/health-entries/${todayHealth.id}`, "PUT", data);
      } else {
        return apiRequest("/api/health-entries", "POST", { ...data, date: today });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-entries"] });
      toast({ title: "Sleep data saved!" });
      setShowSleepDialog(false);
    }
  });

  const handleSaveSleep = (e: React.FormEvent) => {
    e.preventDefault();
    saveSleepMutation.mutate({
      ...todayHealth,
      sleepHours: sleepHours > 0 ? sleepHours : todayHealth?.sleepHours,
      sleepQuality: sleepQuality[0],
      notes: sleepNotes.trim() || todayHealth?.notes,
    });
  };

  // Calculate weekly stats
  const getWeeklyStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekData = healthEntries.filter(entry => 
      new Date(entry.date) >= weekAgo && entry.sleepHours
    );
    
    const avgSleep = weekData.length > 0 
      ? weekData.reduce((sum, e) => sum + (e.sleepHours || 0), 0) / weekData.length 
      : 0;
    const avgQuality = weekData.length > 0
      ? weekData.reduce((sum, e) => sum + (e.sleepQuality || 0), 0) / weekData.length
      : 0;
    const nightsTracked = weekData.length;
    const bestNight = Math.max(...weekData.map(e => e.sleepHours || 0));
    
    return { avgSleep, avgQuality, nightsTracked, bestNight };
  };

  const weekStats = getWeeklyStats();

  // Get sleep quality color
  const getSleepQualityColor = (quality: number | null | undefined) => {
    if (!quality) return "bg-gray-300";
    if (quality <= 3) return "bg-red-500";
    if (quality <= 6) return "bg-yellow-500";
    if (quality <= 8) return "bg-blue-500";
    return "bg-green-500";
  };

  // Get sleep quality emoji
  const getSleepQualityEmoji = (quality: number | null | undefined) => {
    if (!quality) return "😴";
    if (quality <= 3) return "😫";
    if (quality <= 6) return "😔";
    if (quality <= 8) return "😊";
    return "😃";
  };

  // Get recent sleep data
  const recentSleep = healthEntries
    .filter(entry => entry.sleepHours && entry.sleepHours > 0)
    .slice(0, 7)
    .reverse();

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sleep Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor your sleep patterns and quality
          </p>
        </div>
        <Dialog open={showSleepDialog} onOpenChange={setShowSleepDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Sleep
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Log Sleep Data</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveSleep} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Sleep Duration (hours)</label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Bedtime (optional)</label>
                  <Input
                    type="time"
                    value={bedTime}
                    onChange={(e) => setBedTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Wake Time (optional)</label>
                  <Input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Sleep Quality: {sleepQuality[0]}/10 {getSleepQualityEmoji(sleepQuality[0])}
                </label>
                <Slider
                  value={sleepQuality}
                  onValueChange={setSleepQuality}
                  max={10}
                  min={1}
                  step={1}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                <Textarea
                  value={sleepNotes}
                  onChange={(e) => setSleepNotes(e.target.value)}
                  placeholder="Dreams, interruptions, how you felt..."
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={saveSleepMutation.isPending}
              >
                {saveSleepMutation.isPending ? "Saving..." : "Save Sleep Data"}
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
              <Moon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Night</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {todayHealth?.sleepHours || "—"}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quality</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {todayHealth?.sleepQuality || "—"}/10
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Sleep</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {weekStats.avgSleep.toFixed(1)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Best Night</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {weekStats.bestNight || 0}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Tonight's Sleep</TabsTrigger>
          <TabsTrigger value="history">Sleep History</TabsTrigger>
          <TabsTrigger value="insights">Sleep Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5" />
                Sleep Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayHealth?.sleepHours ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                      <Moon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                      <p className="text-2xl font-bold">{todayHealth.sleepHours} hours</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                      <div className="text-3xl mb-2">{getSleepQualityEmoji(todayHealth.sleepQuality)}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Quality</p>
                      <p className="text-2xl font-bold">{todayHealth.sleepQuality}/10</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Sleep Goal Progress</span>
                      <span>{Math.min((todayHealth.sleepHours / 8) * 100, 100).toFixed(0)}%</span>
                    </div>
                    <Progress 
                      value={Math.min((todayHealth.sleepHours / 8) * 100, 100)} 
                      className="h-3"
                    />
                    <p className="text-xs text-gray-500 mt-1">Recommended: 7-9 hours per night</p>
                  </div>

                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                    <p className="text-sm font-medium mb-1">Sleep Analysis</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {todayHealth.sleepHours >= 7 && todayHealth.sleepHours <= 9
                        ? "Great! You got the recommended amount of sleep."
                        : todayHealth.sleepHours < 7
                        ? "Try to get more sleep tonight for better recovery."
                        : "You may be oversleeping. Try to maintain a consistent schedule."}
                    </p>
                  </div>

                  {todayHealth.notes && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm font-medium mb-1">Sleep Notes</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{todayHealth.notes}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <CloudMoon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No sleep data logged</p>
                  <Button onClick={() => setShowSleepDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Log Your Sleep
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>7-Day Sleep Pattern</CardTitle>
              <CardDescription>Your sleep history for the past week</CardDescription>
            </CardHeader>
            <CardContent>
              {recentSleep.length > 0 ? (
                <div className="space-y-3">
                  {recentSleep.map((sleep) => (
                    <div key={sleep.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <Moon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {format(new Date(sleep.date), "EEEE, MMM d")}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {sleep.sleepHours}h sleep
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getSleepQualityColor(sleep.sleepQuality)}`} />
                        <span className="text-sm font-medium">
                          {sleep.sleepQuality}/10
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Moon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No sleep data recorded yet</p>
                  <p className="text-sm text-gray-400">Start tracking your sleep to see patterns</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Sleep Analytics & Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-3">Weekly Statistics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Sleep</span>
                      <span className="font-medium">{weekStats.avgSleep.toFixed(1)} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Quality</span>
                      <span className="font-medium">{weekStats.avgQuality.toFixed(1)}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Nights Tracked</span>
                      <span className="font-medium">{weekStats.nightsTracked}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Best Night</span>
                      <span className="font-medium">{weekStats.bestNight} hours</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-3">Sleep Quality Distribution</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Excellent (9-10)", emoji: "😃", count: recentSleep.filter(s => (s.sleepQuality || 0) >= 9).length },
                      { label: "Good (7-8)", emoji: "😊", count: recentSleep.filter(s => (s.sleepQuality || 0) >= 7 && (s.sleepQuality || 0) < 9).length },
                      { label: "Fair (5-6)", emoji: "😔", count: recentSleep.filter(s => (s.sleepQuality || 0) >= 5 && (s.sleepQuality || 0) < 7).length },
                      { label: "Poor (1-4)", emoji: "😫", count: recentSleep.filter(s => (s.sleepQuality || 0) < 5 && (s.sleepQuality || 0) > 0).length },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <span>{item.emoji}</span>
                          {item.label}
                        </span>
                        <Badge variant={item.count > 0 ? "default" : "secondary"}>
                          {item.count} nights
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className={`p-4 rounded-lg border-l-4 ${
                  weekStats.avgSleep >= 7 
                    ? "bg-green-50 dark:bg-green-900/20 border-green-500" 
                    : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500"
                }`}>
                  <h3 className="font-medium mb-1 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Sleep Duration Insight
                  </h3>
                  <p className="text-sm">
                    {weekStats.avgSleep >= 7 
                      ? "You're getting adequate sleep on average. Keep maintaining this healthy pattern!"
                      : `Your average sleep is ${(7 - weekStats.avgSleep).toFixed(1)} hours below the recommended minimum. Try going to bed earlier.`}
                  </p>
                </div>

                <div className={`p-4 rounded-lg border-l-4 ${
                  weekStats.avgQuality >= 7 
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500" 
                    : "bg-orange-50 dark:bg-orange-900/20 border-orange-500"
                }`}>
                  <h3 className="font-medium mb-1 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Sleep Quality Insight
                  </h3>
                  <p className="text-sm">
                    {weekStats.avgQuality >= 7 
                      ? "Your sleep quality is good! Continue with your current sleep hygiene practices."
                      : "Your sleep quality could improve. Consider reducing screen time before bed and creating a consistent bedtime routine."}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
                <h3 className="font-medium mb-2">Sleep Tips</h3>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Maintain a consistent sleep schedule, even on weekends</li>
                  <li>• Create a relaxing bedtime routine 30-60 minutes before sleep</li>
                  <li>• Keep your bedroom cool, dark, and quiet</li>
                  <li>• Avoid caffeine 6 hours before bedtime</li>
                  <li>• Limit screen exposure 1-2 hours before sleep</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}