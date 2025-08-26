import { Button } from "@/components/ui/button";
import { RefreshCw, Lightbulb, TrendingUp, AlertTriangle, Target } from "lucide-react";
import type { Habit, Goal, HealthEntry } from "@shared/schema";

interface InsightsSectionProps {
  habits: Habit[];
  goals: Goal[];
  healthEntries: HealthEntry[];
}

export default function InsightsSection({ habits, goals, healthEntries }: InsightsSectionProps) {
  const generateInsights = () => {
    const insights = [];

    // Productivity insight
    insights.push({
      icon: Lightbulb,
      iconColor: "text-primary",
      bgColor: "bg-blue-50",
      borderColor: "border-primary",
      title: "Productivity Peak",
      message: "You're most focused between 9-11 AM. Consider scheduling deep work during this time."
    });

    // Habit streak insight
    const longestStreak = Math.max(...habits.map(h => h.streakDays), 0);
    if (longestStreak > 0) {
      insights.push({
        icon: TrendingUp,
        iconColor: "text-secondary",
        bgColor: "bg-green-50",
        borderColor: "border-secondary",
        title: "Habit Streak",
        message: `Great job maintaining your habits! Your longest streak is ${longestStreak} days.`
      });
    }

    // Sleep pattern insight
    const recentSleep = healthEntries
      .filter(entry => entry.sleepHours)
      .slice(-7);
    if (recentSleep.length > 0) {
      const avgSleep = recentSleep.reduce((sum, entry) => sum + (entry.sleepHours || 0), 0) / recentSleep.length;
      if (avgSleep < 7) {
        insights.push({
          icon: AlertTriangle,
          iconColor: "text-accent",
          bgColor: "bg-orange-50",
          borderColor: "border-accent",
          title: "Sleep Pattern",
          message: `Your average sleep is ${avgSleep.toFixed(1)} hours. Consider aiming for 7-9 hours nightly.`
        });
      }
    }

    // Goal achievement insight
    const goalsOnTrack = goals.filter(goal => goal.progress >= 50).length;
    if (goalsOnTrack > 0) {
      insights.push({
        icon: Target,
        iconColor: "text-purple-500",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-500",
        title: "Goal Achievement",
        message: `${goalsOnTrack} of your goals are on track. Keep up the momentum!`
      });
    }

    return insights;
  };

  const insights = generateInsights();

  return (
    <div className="bg-surface p-6 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Insights & Recommendations</h3>
        <Button
          variant="ghost"
          className="text-primary hover:text-blue-700"
          data-testid="button-refresh-insights"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Start tracking your habits and goals to get personalized insights!</p>
          </div>
        ) : (
          insights.map((insight, index) => (
            <div 
              key={index} 
              className={`p-4 ${insight.bgColor} rounded-lg border-l-4 ${insight.borderColor}`}
              data-testid={`insight-${index}`}
            >
              <div className="flex items-start space-x-3">
                <insight.icon className={`${insight.iconColor} h-5 w-5 mt-1`} />
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-700">{insight.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
