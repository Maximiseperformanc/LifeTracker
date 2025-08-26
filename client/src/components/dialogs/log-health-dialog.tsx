import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { HealthEntry } from "@shared/schema";

interface LogHealthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingEntry?: HealthEntry;
}

export default function LogHealthDialog({ open, onOpenChange, existingEntry }: LogHealthDialogProps) {
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState([8]);
  const [exerciseMinutes, setExerciseMinutes] = useState(0);
  const [exerciseType, setExerciseType] = useState("");
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [mood, setMood] = useState([7]);
  const [notes, setNotes] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  // Load existing entry data
  useEffect(() => {
    if (existingEntry) {
      setSleepHours(existingEntry.sleepHours || 7);
      setSleepQuality([existingEntry.sleepQuality || 8]);
      setExerciseMinutes(existingEntry.exerciseMinutes || 0);
      setExerciseType(existingEntry.exerciseType || "");
      setCaloriesBurned(existingEntry.caloriesBurned || 0);
      setMood([existingEntry.mood || 7]);
      setNotes(existingEntry.notes || "");
    }
  }, [existingEntry]);

  const saveHealthMutation = useMutation({
    mutationFn: async (data: any) => {
      if (existingEntry) {
        return apiRequest("PUT", `/api/health-entries/${existingEntry.id}`, data);
      } else {
        return apiRequest("POST", "/api/health-entries", { ...data, date: today });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/health-entries'] });
      toast({
        title: "Health data saved",
        description: "Your health metrics have been updated.",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save health data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    saveHealthMutation.mutate({
      sleepHours: sleepHours > 0 ? sleepHours : undefined,
      sleepQuality: sleepQuality[0],
      exerciseMinutes: exerciseMinutes > 0 ? exerciseMinutes : undefined,
      exerciseType: exerciseType.trim() || undefined,
      caloriesBurned: caloriesBurned > 0 ? caloriesBurned : undefined,
      mood: mood[0],
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Health Data</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="sleep-hours">Sleep Hours</Label>
            <Input
              id="sleep-hours"
              type="number"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(parseFloat(e.target.value) || 0)}
              placeholder="7.5"
              min="0"
              max="24"
              data-testid="input-sleep-hours"
            />
          </div>

          <div>
            <Label>Sleep Quality: {sleepQuality[0]}/10</Label>
            <Slider
              value={sleepQuality}
              onValueChange={setSleepQuality}
              max={10}
              min={1}
              step={1}
              className="mt-2"
              data-testid="slider-sleep-quality"
            />
          </div>

          <div>
            <Label htmlFor="exercise-minutes">Exercise Duration (minutes)</Label>
            <Input
              id="exercise-minutes"
              type="number"
              value={exerciseMinutes}
              onChange={(e) => setExerciseMinutes(parseInt(e.target.value) || 0)}
              placeholder="30"
              min="0"
              data-testid="input-exercise-minutes"
            />
          </div>

          <div>
            <Label htmlFor="exercise-type">Exercise Type</Label>
            <Select value={exerciseType} onValueChange={setExerciseType}>
              <SelectTrigger data-testid="select-exercise-type">
                <SelectValue placeholder="Select exercise type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="strength">Strength Training</SelectItem>
                <SelectItem value="yoga">Yoga</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="swimming">Swimming</SelectItem>
                <SelectItem value="cycling">Cycling</SelectItem>
                <SelectItem value="walking">Walking</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="calories-burned">Calories Burned</Label>
            <Input
              id="calories-burned"
              type="number"
              value={caloriesBurned}
              onChange={(e) => setCaloriesBurned(parseInt(e.target.value) || 0)}
              placeholder="250"
              min="0"
              data-testid="input-calories-burned"
            />
          </div>

          <div>
            <Label>Mood: {mood[0]}/10</Label>
            <Slider
              value={mood}
              onValueChange={setMood}
              max={10}
              min={1}
              step={1}
              className="mt-2"
              data-testid="slider-mood"
            />
          </div>

          <div>
            <Label htmlFor="health-notes">Notes</Label>
            <Textarea
              id="health-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling today?"
              data-testid="textarea-health-notes"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-health"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveHealthMutation.isPending}
              data-testid="button-save-health"
            >
              {saveHealthMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
