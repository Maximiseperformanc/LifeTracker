import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Check, Plus, Minus, Target, Clock } from "lucide-react";
import type { Habit, HabitEntry } from "@shared/schema";

interface HabitEntryFormProps {
  habit: Habit;
  existingEntry?: HabitEntry;
  date: string;
  onComplete?: () => void;
  compact?: boolean;
}

export default function HabitEntryForm({ 
  habit, 
  existingEntry, 
  date, 
  onComplete,
  compact = false 
}: HabitEntryFormProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [value, setValue] = useState(existingEntry?.value || 0);
  const [notes, setNotes] = useState(existingEntry?.notes || "");
  const [completed, setCompleted] = useState(existingEntry?.completed || false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      if (existingEntry) {
        return apiRequest("PUT", `/api/habit-entries/${existingEntry.id}`, data);
      } else {
        return apiRequest("POST", "/api/habit-entries", {
          habitId: habit.id,
          date,
          ...data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habit-entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      toast({
        title: "Progress updated",
        description: "Your habit progress has been saved.",
      });
      setShowDialog(false);
      onComplete?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleQuickUpdate = (newValue: number, isCompleted?: boolean) => {
    const finalCompleted = isCompleted ?? (habit.targetValue ? newValue >= habit.targetValue : newValue > 0);
    updateEntryMutation.mutate({
      value: newValue,
      completed: finalCompleted,
      notes
    });
    setValue(newValue);
    setCompleted(finalCompleted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCompleted = habit.trackingType === "boolean" 
      ? completed 
      : (habit.targetValue ? value >= habit.targetValue : value > 0);

    updateEntryMutation.mutate({
      value: habit.trackingType === "boolean" ? (completed ? 1 : 0) : value,
      completed: finalCompleted,
      notes: notes.trim() || null
    });
  };

  const getProgressPercentage = () => {
    if (habit.trackingType === "boolean") {
      return completed ? 100 : 0;
    }
    if (habit.targetValue && habit.targetValue > 0) {
      return Math.min((value / habit.targetValue) * 100, 100);
    }
    return value > 0 ? 100 : 0;
  };

  const formatValue = (val: number) => {
    if (habit.trackingType === "duration") {
      const hours = Math.floor(val / 60);
      const mins = val % 60;
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }
    return val.toString();
  };

  // For compact display (dashboard)
  if (compact) {
    if (habit.trackingType === "boolean") {
      return (
        <button
          onClick={() => handleQuickUpdate(completed ? 0 : 1, !completed)}
          disabled={updateEntryMutation.isPending}
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
            completed
              ? "bg-secondary text-white"
              : "border-2 border-gray-300 hover:border-secondary"
          }`}
          data-testid={`button-toggle-habit-${habit.id}`}
        >
          {completed && <Check className="h-3 w-3" />}
        </button>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => value > 0 && handleQuickUpdate(value - 1)}
            disabled={value <= 0 || updateEntryMutation.isPending}
            data-testid={`button-decrease-${habit.id}`}
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <span className="text-sm font-medium min-w-[60px] text-center">
            {formatValue(value)} {habit.unit}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickUpdate(value + (habit.trackingType === "duration" ? 5 : 1))}
            disabled={updateEntryMutation.isPending}
            data-testid={`button-increase-${habit.id}`}
          >
            <Plus className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDialog(true)}
            data-testid={`button-details-${habit.id}`}
          >
            ⋯
          </Button>
        </div>
        
        {habit.targetValue && (
          <div className="space-y-1">
            <Progress value={getProgressPercentage()} className="h-2" />
            <div className="text-xs text-gray-500 text-center">
              {formatValue(value)} / {formatValue(habit.targetValue)} {habit.unit}
            </div>
          </div>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{habit.name}</DialogTitle>
              <DialogDescription>Update your progress for {date}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="value">
                  {habit.trackingType === "duration" ? "Duration (minutes)" : `Amount (${habit.unit})`}
                </Label>
                <Input
                  id="value"
                  type="number"
                  value={value}
                  onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                  min="0"
                  step={habit.trackingType === "duration" ? "5" : "0.1"}
                  data-testid="input-habit-value"
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Add notes about your progress..."
                  data-testid="textarea-habit-notes"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateEntryMutation.isPending}
                  data-testid="button-save-habit-entry"
                >
                  {updateEntryMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Full form display (habits page)
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
            style={{ backgroundColor: habit.color || "#1976D2" }}
          >
            {habit.icon === "target" ? <Target className="h-4 w-4" /> : 
             habit.icon === "clock" ? <Clock className="h-4 w-4" /> : "📝"}
          </div>
          <div>
            <h4 className="font-semibold">{habit.name}</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Badge variant="secondary">{habit.trackingType}</Badge>
              {habit.frequency !== "daily" && (
                <Badge variant="outline">{habit.frequency}</Badge>
              )}
            </div>
          </div>
        </div>
        
        {habit.trackingType === "boolean" ? (
          <Button
            onClick={() => handleQuickUpdate(completed ? 0 : 1, !completed)}
            disabled={updateEntryMutation.isPending}
            variant={completed ? "default" : "outline"}
            size="sm"
            data-testid={`button-toggle-habit-${habit.id}`}
          >
            <Check className="h-4 w-4 mr-1" />
            {completed ? "Done" : "Mark Done"}
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold">
              {formatValue(value)} {habit.unit}
            </span>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => value > 0 && handleQuickUpdate(value - (habit.trackingType === "duration" ? 5 : 1))}
                disabled={value <= 0 || updateEntryMutation.isPending}
                data-testid={`button-decrease-${habit.id}`}
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickUpdate(value + (habit.trackingType === "duration" ? 5 : 1))}
                disabled={updateEntryMutation.isPending}
                data-testid={`button-increase-${habit.id}`}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {habit.targetValue && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(getProgressPercentage())}%</span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
          <div className="text-xs text-gray-500 text-center">
            Target: {formatValue(habit.targetValue)} {habit.unit}
          </div>
        </div>
      )}

      {notes && (
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
          <strong>Notes:</strong> {notes}
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDialog(true)}
        className="w-full"
        data-testid={`button-edit-details-${habit.id}`}
      >
        Edit Details
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{habit.name}</DialogTitle>
            <DialogDescription>Update your progress for {date}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {habit.trackingType === "boolean" ? (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="completed"
                  checked={completed}
                  onChange={(e) => setCompleted(e.target.checked)}
                  className="rounded"
                  data-testid="checkbox-habit-completed"
                />
                <Label htmlFor="completed">Mark as completed</Label>
              </div>
            ) : (
              <div>
                <Label htmlFor="value">
                  {habit.trackingType === "duration" ? "Duration (minutes)" : `Amount (${habit.unit})`}
                </Label>
                <Input
                  id="value"
                  type="number"
                  value={value}
                  onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                  min="0"
                  step={habit.trackingType === "duration" ? "5" : "0.1"}
                  data-testid="input-habit-value"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add notes about your progress, challenges, or insights..."
                data-testid="textarea-habit-notes"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateEntryMutation.isPending}
                data-testid="button-save-habit-entry"
              >
                {updateEntryMutation.isPending ? "Saving..." : "Save Progress"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}