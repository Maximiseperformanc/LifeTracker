import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Moon, Dumbbell, Smile } from "lucide-react";
import LogHealthDialog from "@/components/dialogs/log-health-dialog";
import type { HealthEntry } from "@shared/schema";

interface HealthMetricsProps {
  healthEntries: HealthEntry[];
}

export default function HealthMetrics({ healthEntries }: HealthMetricsProps) {
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const todayEntry = healthEntries.find(entry => entry.date === today);

  const formatSleepQuality = (entry: HealthEntry | undefined) => {
    if (!entry || !entry.sleepQuality) return "No data";
    return `${entry.sleepQuality * 10}%`;
  };

  const formatExercise = (entry: HealthEntry | undefined) => {
    if (!entry || !entry.exerciseMinutes) return "No activity";
    return `${entry.exerciseMinutes} min ${entry.exerciseType || 'exercise'}`;
  };

  const formatMood = (entry: HealthEntry | undefined) => {
    if (!entry || !entry.mood) return "Not set";
    const moodLabels = ["", "Very Bad", "Bad", "Poor", "Below Average", "Average", "Good", "Great", "Very Good", "Excellent", "Outstanding"];
    return moodLabels[entry.mood] || "Good";
  };

  return (
    <>
      <div className="bg-surface p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Health Metrics</h3>
          <Button
            variant="ghost"
            onClick={() => setLogDialogOpen(true)}
            className="text-primary hover:text-blue-700"
            data-testid="button-log-health"
          >
            <Plus className="h-4 w-4 mr-2" />
            Log Data
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Moon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Sleep</p>
                <p className="text-sm text-gray-600" data-testid="text-sleep-hours">
                  {todayEntry?.sleepHours ? `${todayEntry.sleepHours} hours` : "No data"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900" data-testid="text-sleep-quality">
                {formatSleepQuality(todayEntry)}
              </div>
              <div className="text-sm text-gray-600">Quality</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Exercise</p>
                <p className="text-sm text-gray-600" data-testid="text-exercise">
                  {formatExercise(todayEntry)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900" data-testid="text-calories">
                {todayEntry?.caloriesBurned || 0}
              </div>
              <div className="text-sm text-gray-600">Calories</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                <Smile className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Mood</p>
                <p className="text-sm text-gray-600" data-testid="text-mood">
                  {formatMood(todayEntry)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900" data-testid="text-mood-score">
                {todayEntry?.mood || 0}.0
              </div>
              <div className="text-sm text-gray-600">/10</div>
            </div>
          </div>
        </div>
      </div>

      <LogHealthDialog 
        open={logDialogOpen} 
        onOpenChange={setLogDialogOpen}
        existingEntry={todayEntry}
      />
    </>
  );
}
