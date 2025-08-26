import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "@/components/layout/sidebar";
import MobileSidebar from "@/components/layout/mobile-sidebar";
import StatCard from "@/components/dashboard/stat-card";
import TimerSection from "@/components/dashboard/timer-section";
import HabitsSection from "@/components/dashboard/habits-section";
import ProgressChart from "@/components/dashboard/progress-chart";
import HealthMetrics from "@/components/dashboard/health-metrics";
import GoalsSection from "@/components/dashboard/goals-section";
import InsightsSection from "@/components/dashboard/insights-section";
import { Button } from "@/components/ui/button";
import { Menu, Download, Bell, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Habit, HabitEntry, Goal, HealthEntry, TimerSession } from "@shared/schema";

export default function Dashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const today = new Date().toISOString().split('T')[0];

  // Fetch data
  const { data: habits = [] } = useQuery<Habit[]>({
    queryKey: ['/api/habits']
  });

  const { data: todayHabitEntries = [] } = useQuery<HabitEntry[]>({
    queryKey: ['/api/habit-entries', today],
    queryFn: () => fetch(`/api/habit-entries?date=${today}`).then(res => res.json())
  });

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['/api/goals']
  });

  const { data: healthEntries = [] } = useQuery<HealthEntry[]>({
    queryKey: ['/api/health-entries']
  });

  const { data: todayTimerSessions = [] } = useQuery<TimerSession[]>({
    queryKey: ['/api/timer-sessions', today],
    queryFn: () => fetch(`/api/timer-sessions?date=${today}`).then(res => res.json())
  });

  // Calculate stats
  const completedHabits = todayHabitEntries.filter(entry => entry.completed).length;
  const totalHabits = habits.length;
  const habitCompletionRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
  
  const totalFocusMinutes = todayTimerSessions
    .filter(session => session.completed)
    .reduce((sum, session) => sum + session.duration, 0);
  
  const focusTimeFormatted = `${Math.floor(totalFocusMinutes / 60)}h ${totalFocusMinutes % 60}m`;
  
  const todayHealth = healthEntries.find(entry => entry.date === today);
  const sleepQuality = todayHealth?.sleepQuality ? `${todayHealth.sleepQuality}/10` : "No data";
  
  const goalsOnTrack = goals.filter(goal => (goal.progress || 0) >= 50).length;
  const avgGoalProgress = goals.length > 0 
    ? Math.round(goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / goals.length) 
    : 0;

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lifetrack-data.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
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
                <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
                <p className="text-gray-600">Track your daily progress and achievements</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleExportData}
                className="bg-primary text-white hover:bg-blue-700"
                data-testid="button-export-data"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-notifications">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-settings">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Focus Time Today"
              value={focusTimeFormatted}
              change="+12% from yesterday"
              icon="clock"
              trend="up"
              data-testid="stat-focus-time"
            />
            <StatCard
              title="Habits Completed"
              value={`${completedHabits}/${totalHabits}`}
              change={`${habitCompletionRate}% completion rate`}
              icon="check"
              trend="up"
              data-testid="stat-habits"
            />
            <StatCard
              title="Sleep Quality"
              value={sleepQuality}
              change={todayHealth?.sleepHours ? `${todayHealth.sleepHours}h last night` : "No data"}
              icon="moon"
              trend="up"
              data-testid="stat-sleep"
            />
            <StatCard
              title="Weekly Goal Progress"
              value={`${avgGoalProgress}%`}
              change={`${goalsOnTrack}/${goals.length} goals on track`}
              icon="target"
              trend="neutral"
              data-testid="stat-goals"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-1">
              <TimerSection sessions={todayTimerSessions} />
            </div>
            <div className="lg:col-span-2">
              <HabitsSection habits={habits} todayEntries={todayHabitEntries} />
            </div>
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ProgressChart />
            <HealthMetrics healthEntries={healthEntries} />
          </div>

          {/* Goals and Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GoalsSection goals={goals} />
            <InsightsSection 
              habits={habits}
              goals={goals}
              healthEntries={healthEntries}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
