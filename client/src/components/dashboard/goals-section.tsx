import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddGoalDialog from "@/components/dialogs/add-goal-dialog";
import type { Goal } from "@shared/schema";

interface GoalsSectionProps {
  goals: Goal[];
}

export default function GoalsSection({ goals }: GoalsSectionProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return "No deadline";
    const date = new Date(deadline);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-secondary";
    if (progress >= 50) return "bg-primary";
    return "bg-accent";
  };

  return (
    <>
      <div className="bg-surface p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Current Goals</h3>
          <Button
            variant="ghost"
            onClick={() => setAddDialogOpen(true)}
            className="text-primary hover:text-blue-700"
            data-testid="button-add-goal"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        </div>

        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No goals yet. Set your first goal to get started!</p>
              <Button onClick={() => setAddDialogOpen(true)} data-testid="button-add-first-goal">
                <Plus className="h-4 w-4 mr-2" />
                Set Your First Goal
              </Button>
            </div>
          ) : (
            goals.map((goal) => (
              <div key={goal.id} className="p-4 border border-gray-200 rounded-lg" data-testid={`goal-${goal.id}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{goal.title}</h4>
                  <span className="text-sm text-gray-600">
                    {formatDeadline(goal.deadline)}
                  </span>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900" data-testid={`goal-progress-${goal.id}`}>
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${getProgressColor(goal.progress)} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
                {goal.description && (
                  <p className="text-sm text-gray-600">{goal.description}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <AddGoalDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
      />
    </>
  );
}
