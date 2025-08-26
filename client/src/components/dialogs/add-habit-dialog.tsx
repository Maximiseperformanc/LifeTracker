import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddHabitDialog({ open, onOpenChange }: AddHabitDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetMinutes, setTargetMinutes] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createHabitMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; targetMinutes?: number }) => {
      return apiRequest("POST", "/api/habits", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      toast({
        title: "Habit created",
        description: "Your new habit has been added successfully.",
      });
      resetForm();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create habit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setTargetMinutes(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createHabitMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      targetMinutes: targetMinutes > 0 ? targetMinutes : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Habit</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="habit-name">Habit Name *</Label>
            <Input
              id="habit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning meditation"
              required
              data-testid="input-habit-name"
            />
          </div>

          <div>
            <Label htmlFor="habit-description">Description</Label>
            <Textarea
              id="habit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              data-testid="textarea-habit-description"
            />
          </div>

          <div>
            <Label htmlFor="target-minutes">Target Duration (minutes)</Label>
            <Input
              id="target-minutes"
              type="number"
              value={targetMinutes}
              onChange={(e) => setTargetMinutes(parseInt(e.target.value) || 0)}
              placeholder="0"
              min="0"
              data-testid="input-target-minutes"
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave as 0 for habits without time tracking
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-habit"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || createHabitMutation.isPending}
              data-testid="button-save-habit"
            >
              {createHabitMutation.isPending ? "Creating..." : "Create Habit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
