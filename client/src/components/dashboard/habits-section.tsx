import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AddHabitDialog from "@/components/dialogs/add-habit-dialog";
import type { Habit, HabitEntry } from "@shared/schema";

interface HabitsSectionProps {
  habits: Habit[];
  todayEntries: HabitEntry[];
}

export default function HabitsSection({ habits, todayEntries }: HabitsSectionProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const toggleHabitMutation = useMutation({
    mutationFn: async ({ habitId, completed }: { habitId: string; completed: boolean }) => {
      const existingEntry = todayEntries.find(entry => entry.habitId === habitId);
      
      if (existingEntry) {
        return apiRequest("PUT", `/api/habit-entries/${existingEntry.id}`, { 
          completed 
        });
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
      toast({
        title: "Habit updated",
        description: "Your habit progress has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update habit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getHabitEntry = (habitId: string) => {
    return todayEntries.find(entry => entry.habitId === habitId);
  };

  const isHabitCompleted = (habitId: string) => {
    const entry = getHabitEntry(habitId);
    return entry?.completed || false;
  };

  const handleToggleHabit = (habitId: string) => {
    const currentlyCompleted = isHabitCompleted(habitId);
    toggleHabitMutation.mutate({ 
      habitId, 
      completed: !currentlyCompleted 
    });
  };

  return (
    <>
      <div className="bg-surface p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Today's Habits</h3>
          <Button
            variant="ghost"
            onClick={() => setAddDialogOpen(true)}
            className="text-primary hover:text-blue-700"
            data-testid="button-add-habit"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Habit
          </Button>
        </div>

        <div className="space-y-4">
          {habits.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No habits yet. Start building healthy routines!</p>
              <Button onClick={() => setAddDialogOpen(true)} data-testid="button-add-first-habit">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Habit
              </Button>
            </div>
          ) : (
            habits.map((habit) => {
              const completed = isHabitCompleted(habit.id);
              return (
                <div 
                  key={habit.id} 
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  data-testid={`habit-${habit.id}`}
                >
                  <button
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-sm transition-colors ${
                      completed
                        ? "bg-secondary text-white"
                        : "border-2 border-gray-300 hover:border-secondary"
                    }`}
                    data-testid={`button-toggle-habit-${habit.id}`}
                  >
                    {completed && <Check className="h-3 w-3" />}
                  </button>
                  <div className="flex-1">
                    <p className={`font-medium ${completed ? "text-gray-900" : "text-gray-700"}`}>
                      {habit.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {habit.streakDays} day streak
                    </p>
                  </div>
                  <div className="text-sm text-gray-600">
                    {habit.targetMinutes > 0 ? `${habit.targetMinutes} min` : "Daily"}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <AddHabitDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
      />
    </>
  );
}
