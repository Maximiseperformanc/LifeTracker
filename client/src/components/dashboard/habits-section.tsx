import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AdvancedAddHabitDialog from "@/components/dialogs/advanced-add-habit-dialog";
import HabitEntryForm from "@/components/habits/habit-entry-form";
import type { Habit, HabitEntry } from "@shared/schema";

interface HabitsSectionProps {
  habits: Habit[];
  todayEntries: HabitEntry[];
}

export default function HabitsSection({ habits, todayEntries }: HabitsSectionProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const getHabitEntry = (habitId: string) => {
    return todayEntries.find(entry => entry.habitId === habitId);
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

        <div className="space-y-3">
          {habits.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No habits yet. Add your first habit to get started!</p>
            </div>
          ) : (
            habits.slice(0, 5).map((habit) => {
              const existingEntry = getHabitEntry(habit.id);
              return (
                <div
                  key={habit.id}
                  className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0"
                    style={{ backgroundColor: habit.color || "#1976D2" }}
                  >
                    {habit.icon === "droplets" ? "💧" : 
                     habit.icon === "book" ? "📚" : 
                     habit.icon === "dumbbell" ? "🏋️" :
                     habit.icon === "heart" ? "❤️" :
                     habit.icon === "footprints" ? "👣" :
                     habit.icon === "moon" ? "🌙" : "📝"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {habit.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {habit.streakDays} day streak
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <HabitEntryForm 
                      habit={habit}
                      existingEntry={existingEntry}
                      date={today}
                      compact={true}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <AdvancedAddHabitDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
      />
    </>
  );
}
