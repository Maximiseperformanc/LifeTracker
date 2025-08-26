import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "@/components/layout/sidebar";
import MobileSidebar from "@/components/layout/mobile-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Menu, Play, Pause, Square, RotateCcw, Coffee, Clock } from "lucide-react";
import { useTimer } from "@/hooks/use-timer";
import { useQuery } from "@tanstack/react-query";
import type { TimerSession } from "@shared/schema";

export default function TimerPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timerType, setTimerType] = useState<"pomodoro" | "break" | "long-break">("pomodoro");
  const [selectedDuration, setSelectedDuration] = useState(25);
  const isMobile = useIsMobile();
  const today = new Date().toISOString().split('T')[0];

  const durations = {
    pomodoro: [15, 25, 30, 45, 60],
    break: [5, 10, 15],
    "long-break": [15, 20, 30]
  };

  const { time, isRunning, start, pause, reset } = useTimer({
    duration: selectedDuration,
    onComplete: () => {
      // Show notification or play sound when timer completes
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Timer Complete!', {
          body: `Your ${timerType === 'pomodoro' ? 'focus session' : 'break'} is finished.`,
          icon: '/favicon.ico'
        });
      }
    }
  });

  const { data: todayTimerSessions = [] } = useQuery<TimerSession[]>({
    queryKey: ['/api/timer-sessions', today],
    queryFn: () => fetch(`/api/timer-sessions?date=${today}`).then(res => res.json())
  });

  const { data: allTimerSessions = [] } = useQuery<TimerSession[]>({
    queryKey: ['/api/timer-sessions'],
    queryFn: () => fetch('/api/timer-sessions').then(res => res.json())
  });

  const formatTime = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalStats = () => {
    const completedSessions = allTimerSessions.filter(s => s.completed);
    const totalMinutes = completedSessions.reduce((sum, s) => sum + s.duration, 0);
    const pomodoroSessions = completedSessions.filter(s => s.type === 'pomodoro').length;
    
    return {
      totalSessions: completedSessions.length,
      totalMinutes,
      pomodoroSessions,
      totalHours: Math.floor(totalMinutes / 60)
    };
  };

  const stats = getTotalStats();
  const todayCompletedSessions = todayTimerSessions.filter(s => s.completed);
  const todayMinutes = todayCompletedSessions.reduce((sum, s) => sum + s.duration, 0);

  const progress = (selectedDuration - time) / selectedDuration;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress * circumference);

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleTimerTypeChange = (type: "pomodoro" | "break" | "long-break") => {
    setTimerType(type);
    const defaultDuration = type === "pomodoro" ? 25 : type === "break" ? 5 : 15;
    setSelectedDuration(defaultDuration);
    reset();
  };

  const handleDurationChange = (duration: string) => {
    setSelectedDuration(parseInt(duration));
    reset();
  };

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
                <h2 className="text-2xl font-semibold text-gray-900">Focus Timer</h2>
                <p className="text-gray-600">Use the Pomodoro technique to stay focused and productive</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={requestNotificationPermission}
                variant="outline"
                data-testid="button-enable-notifications"
              >
                Enable Notifications
              </Button>
            </div>
          </div>
        </header>

        {/* Timer Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Timer Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Timer Type</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      variant={timerType === "pomodoro" ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleTimerTypeChange("pomodoro")}
                      data-testid="button-pomodoro"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Pomodoro
                    </Button>
                    <Button
                      variant={timerType === "break" ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleTimerTypeChange("break")}
                      data-testid="button-break"
                    >
                      <Coffee className="h-4 w-4 mr-2" />
                      Short Break
                    </Button>
                    <Button
                      variant={timerType === "long-break" ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleTimerTypeChange("long-break")}
                      data-testid="button-long-break"
                    >
                      <Coffee className="h-4 w-4 mr-2" />
                      Long Break
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedDuration.toString()} onValueChange={handleDurationChange}>
                    <SelectTrigger data-testid="select-duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {durations[timerType].map((duration) => (
                        <SelectItem key={duration} value={duration.toString()}>
                          {duration} minutes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Today's Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary" data-testid="text-today-sessions">
                      {todayCompletedSessions.length}
                    </div>
                    <div className="text-sm text-gray-600">Sessions completed</div>
                    <div className="text-lg font-semibold mt-2" data-testid="text-today-minutes">
                      {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m
                    </div>
                    <div className="text-sm text-gray-600">Focus time</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Timer Display */}
            <Card className="mb-8">
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="relative w-80 h-80 mx-auto mb-8">
                    <svg className="w-80 h-80 transform -rotate-90" viewBox="0 0 264 264">
                      <circle 
                        cx="132" 
                        cy="132" 
                        r="120" 
                        stroke="#E5E7EB" 
                        strokeWidth="16" 
                        fill="none"
                      />
                      <circle 
                        cx="132" 
                        cy="132" 
                        r="120" 
                        stroke={timerType === "pomodoro" ? "#1976D2" : "#388E3C"}
                        strokeWidth="16" 
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl font-bold text-gray-900 mb-4" data-testid="timer-display">
                          {formatTime(time)}
                        </div>
                        <div className="text-xl text-gray-600 capitalize">
                          {timerType === "pomodoro" ? "Focus Session" : "Break Time"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={isRunning ? pause : start}
                      size="lg"
                      className="px-8"
                      data-testid="button-timer-toggle"
                    >
                      {isRunning ? (
                        <>
                          <Pause className="h-5 w-5 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          Start
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={reset}
                      size="lg"
                      className="px-8"
                      data-testid="button-timer-reset"
                    >
                      <RotateCcw className="h-5 w-5 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Total Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary" data-testid="stat-total-sessions">
                    {stats.totalSessions}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Pomodoro Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary" data-testid="stat-pomodoro-sessions">
                    {stats.pomodoroSessions}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Total Focus Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent" data-testid="stat-total-hours">
                    {stats.totalHours}h
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Average Daily</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600" data-testid="stat-daily-average">
                    {Math.round(stats.totalMinutes / 7)}m
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}