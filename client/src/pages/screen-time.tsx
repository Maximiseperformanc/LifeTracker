import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Smartphone, 
  Clock, 
  Plus, 
  Download,
  AlertTriangle,
  Shield,
  Target,
  Calendar,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function ScreenTimePage() {
  const { toast } = useToast();
  const [viewType, setViewType] = useState<"day" | "week">("day");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [isLimitDialogOpen, setIsLimitDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({ appId: "", minutes: "" });
  const [newLimit, setNewLimit] = useState({ appId: "", limitMinutes: "" });

  // Calculate week start date (Monday)
  const getWeekStart = (date: string) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  };

  const weekStart = getWeekStart(selectedDate);

  const { data: screenTimeApps = [] } = useQuery({
    queryKey: ['/api/screen-time/apps'],
    queryFn: () => fetch('/api/screen-time/apps').then(res => res.json())
  });

  const { data: screenTimeEntries = [] } = useQuery({
    queryKey: ['/api/screen-time/entries', viewType, selectedDate],
    queryFn: () => {
      if (viewType === "day") {
        return fetch(`/api/screen-time/entries?date=${selectedDate}`).then(res => res.json());
      } else {
        return fetch(`/api/screen-time/entries/week?startDate=${weekStart}`).then(res => res.json());
      }
    }
  });

  const { data: screenTimeLimits = [] } = useQuery({
    queryKey: ['/api/screen-time/limits'],
    queryFn: () => fetch('/api/screen-time/limits').then(res => res.json())
  });

  // Mutations
  const addEntryMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/screen-time/entries", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/screen-time/entries'] });
      setIsLogDialogOpen(false);
      setNewEntry({ appId: "", minutes: "" });
      toast({ title: "Screen time logged!", description: "Entry added successfully." });
    }
  });

  const addLimitMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/screen-time/limits", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/screen-time/limits'] });
      setIsLimitDialogOpen(false);
      setNewLimit({ appId: "", limitMinutes: "" });
      toast({ title: "Limit set!", description: "App limit configured successfully." });
    }
  });

  const toggleAppPrivacyMutation = useMutation({
    mutationFn: (data: { appId: string; isExcluded: boolean }) => 
      apiRequest("PUT", `/api/screen-time/apps/${data.appId}`, { isExcluded: data.isExcluded }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/screen-time/apps'] });
    }
  });

  // Calculate statistics
  const calculateStats = () => {
    const appMap = new Map(screenTimeApps.map((app: any) => [app.id, app]));
    const appUsage = new Map<string, number>();

    screenTimeEntries.forEach((entry: any) => {
      const current = appUsage.get(entry.appId) || 0;
      appUsage.set(entry.appId, current + entry.minutes);
    });

    const sortedApps = Array.from(appUsage.entries())
      .map(([appId, minutes]) => ({
        app: appMap.get(appId),
        minutes
      }))
      .filter(item => item.app && !item.app.isExcluded)
      .sort((a, b) => b.minutes - a.minutes);

    const totalMinutes = sortedApps.reduce((sum, item) => sum + item.minutes, 0);
    const topApps = sortedApps.slice(0, 5);

    return { totalMinutes, topApps, appUsage };
  };

  const { totalMinutes, topApps, appUsage } = calculateStats();

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const checkLimitWarnings = () => {
    const warnings = [];
    screenTimeLimits.forEach((limit: any) => {
      const usage = appUsage.get(limit.appId) || 0;
      const percentage = (usage / limit.limitMinutes) * 100;
      
      if (percentage >= 80) {
        const app = screenTimeApps.find((a: any) => a.id === limit.appId);
        warnings.push({
          app: app?.name || "Unknown",
          usage,
          limit: limit.limitMinutes,
          percentage
        });
      }
    });
    return warnings;
  };

  const warnings = checkLimitWarnings();

  const handleExport = async () => {
    try {
      const response = await fetch('/api/screen-time/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'screen-time-data.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({ title: "Export complete!", description: "Screen time data exported to CSV." });
    } catch (error) {
      toast({ title: "Export failed", description: "Could not export screen time data.", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Smartphone className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Screen Time</h1>
            <p className="text-gray-600">Track and manage your digital usage</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} data-testid="export-screen-time">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Limit Warnings */}
      {warnings.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Limit Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {warnings.map((warning, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="font-medium">{warning.app}</span>
                  <div className="text-sm text-gray-600">
                    {formatTime(warning.usage)} / {formatTime(warning.limit)} 
                    ({Math.round(warning.percentage)}%)
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={viewType} onValueChange={(value) => setViewType(value as "day" | "week")}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="day" data-testid="tab-day">Today</TabsTrigger>
            <TabsTrigger value="week" data-testid="tab-week">This Week</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="log-time-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Log Time
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Screen Time</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>App</Label>
                    <Select value={newEntry.appId} onValueChange={(value) => setNewEntry({...newEntry, appId: value})}>
                      <SelectTrigger data-testid="select-app-entry">
                        <SelectValue placeholder="Choose app" />
                      </SelectTrigger>
                      <SelectContent>
                        {screenTimeApps.map((app: any) => (
                          <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Minutes</Label>
                    <Input 
                      type="number" 
                      value={newEntry.minutes}
                      onChange={(e) => setNewEntry({...newEntry, minutes: e.target.value})}
                      placeholder="Enter minutes"
                      data-testid="input-minutes"
                    />
                  </div>
                  <Button 
                    onClick={() => addEntryMutation.mutate({
                      appId: newEntry.appId,
                      minutes: parseInt(newEntry.minutes),
                      date: selectedDate
                    })}
                    disabled={!newEntry.appId || !newEntry.minutes || addEntryMutation.isPending}
                    className="w-full"
                    data-testid="save-entry"
                  >
                    {addEntryMutation.isPending ? "Saving..." : "Save Entry"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isLimitDialogOpen} onOpenChange={setIsLimitDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="set-limit-button">
                  <Target className="h-4 w-4 mr-2" />
                  Set Limit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set App Limit</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>App</Label>
                    <Select value={newLimit.appId} onValueChange={(value) => setNewLimit({...newLimit, appId: value})}>
                      <SelectTrigger data-testid="select-app-limit">
                        <SelectValue placeholder="Choose app" />
                      </SelectTrigger>
                      <SelectContent>
                        {screenTimeApps.map((app: any) => (
                          <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Daily Limit (minutes)</Label>
                    <Input 
                      type="number" 
                      value={newLimit.limitMinutes}
                      onChange={(e) => setNewLimit({...newLimit, limitMinutes: e.target.value})}
                      placeholder="Enter limit in minutes"
                      data-testid="input-limit-minutes"
                    />
                  </div>
                  <Button 
                    onClick={() => addLimitMutation.mutate({
                      appId: newLimit.appId,
                      limitMinutes: parseInt(newLimit.limitMinutes)
                    })}
                    disabled={!newLimit.appId || !newLimit.limitMinutes || addLimitMutation.isPending}
                    className="w-full"
                    data-testid="save-limit"
                  >
                    {addLimitMutation.isPending ? "Setting..." : "Set Limit"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="day" className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <Label>Date:</Label>
            <Input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
              data-testid="date-picker"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Total Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{formatTime(totalMinutes)}</div>
                <p className="text-sm text-gray-600">Today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top App</CardTitle>
              </CardHeader>
              <CardContent>
                {topApps.length > 0 ? (
                  <div>
                    <div className="font-semibold">{topApps[0].app?.name}</div>
                    <div className="text-sm text-gray-600">{formatTime(topApps[0].minutes)}</div>
                  </div>
                ) : (
                  <div className="text-gray-500">No data</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Limits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{screenTimeLimits.length}</div>
                <p className="text-sm text-gray-600">Apps with limits</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="week" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Weekly Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{formatTime(totalMinutes)}</div>
                <p className="text-sm text-gray-600">This week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(Math.round(totalMinutes / 7))}</div>
                <p className="text-sm text-gray-600">Per day</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Top Apps */}
      <Card>
        <CardHeader>
          <CardTitle>Top Apps</CardTitle>
        </CardHeader>
        <CardContent>
          {topApps.length > 0 ? (
            <div className="space-y-3">
              {topApps.map((item, index) => (
                <div key={item.app?.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{item.app?.name}</div>
                      <div className="text-sm text-gray-600">{item.app?.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatTime(item.minutes)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No screen time logged yet</p>
              <p className="text-sm">Start logging your app usage to see insights</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {screenTimeApps.map((app: any) => (
              <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{app.name}</span>
                  <Badge variant="secondary">{app.category}</Badge>
                </div>
                <Button
                  variant={app.isExcluded ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleAppPrivacyMutation.mutate({
                    appId: app.id,
                    isExcluded: !app.isExcluded
                  })}
                  data-testid={`toggle-privacy-${app.id}`}
                >
                  {app.isExcluded ? "Show" : "Hide"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}