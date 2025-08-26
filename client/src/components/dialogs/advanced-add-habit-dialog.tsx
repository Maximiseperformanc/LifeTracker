import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Droplets, 
  Book, 
  Dumbbell, 
  Clock, 
  Heart, 
  Coffee, 
  Moon, 
  Target, 
  Footprints, 
  Smartphone,
  Utensils,
  Bike,
  Camera,
  Music,
  Palette
} from "lucide-react";

interface AdvancedAddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Predefined habit templates with icons and default settings
const HABIT_TEMPLATES = [
  {
    id: "water",
    name: "Drink Water",
    icon: "droplets",
    trackingType: "numeric" as const,
    unit: "glasses",
    targetValue: 8,
    frequency: "daily" as const,
    color: "#2196F3",
    description: "Stay hydrated throughout the day"
  },
  {
    id: "reading",
    name: "Reading",
    icon: "book",
    trackingType: "duration" as const,
    unit: "minutes",
    targetValue: 30,
    frequency: "daily" as const,
    color: "#FF9800",
    description: "Read books or articles"
  },
  {
    id: "exercise",
    name: "Exercise",
    icon: "dumbbell",
    trackingType: "duration" as const,
    unit: "minutes",
    targetValue: 30,
    frequency: "daily" as const,
    color: "#4CAF50",
    description: "Physical activity and fitness"
  },
  {
    id: "meditation",
    name: "Meditation",
    icon: "heart",
    trackingType: "duration" as const,
    unit: "minutes",
    targetValue: 10,
    frequency: "daily" as const,
    color: "#9C27B0",
    description: "Mindfulness and mental wellness"
  },
  {
    id: "steps",
    name: "Walking",
    icon: "footprints",
    trackingType: "numeric" as const,
    unit: "steps",
    targetValue: 10000,
    frequency: "daily" as const,
    color: "#607D8B",
    description: "Daily step count goal"
  },
  {
    id: "sleep",
    name: "Sleep Schedule",
    icon: "moon",
    trackingType: "boolean" as const,
    unit: "",
    targetValue: null,
    frequency: "daily" as const,
    color: "#3F51B5",
    description: "Maintain consistent sleep schedule"
  }
];

const ICONS = [
  { id: "droplets", component: Droplets, label: "Water" },
  { id: "book", component: Book, label: "Reading" },
  { id: "dumbbell", component: Dumbbell, label: "Exercise" },
  { id: "clock", component: Clock, label: "Time" },
  { id: "heart", component: Heart, label: "Health" },
  { id: "coffee", component: Coffee, label: "Habits" },
  { id: "moon", component: Moon, label: "Sleep" },
  { id: "target", component: Target, label: "Goals" },
  { id: "footprints", component: Footprints, label: "Steps" },
  { id: "smartphone", component: Smartphone, label: "Technology" },
  { id: "utensils", component: Utensils, label: "Food" },
  { id: "bike", component: Bike, label: "Transport" },
  { id: "camera", component: Camera, label: "Creative" },
  { id: "music", component: Music, label: "Music" }
];

const COLORS = [
  "#1976D2", "#2196F3", "#03A9F4", "#00BCD4",
  "#009688", "#4CAF50", "#8BC34A", "#CDDC39",
  "#FFEB3B", "#FFC107", "#FF9800", "#FF5722",
  "#F44336", "#E91E63", "#9C27B0", "#673AB7",
  "#3F51B5", "#607D8B", "#795548", "#9E9E9E"
];

const UNITS = [
  { value: "glasses", label: "Glasses" },
  { value: "cups", label: "Cups" },
  { value: "pages", label: "Pages" },
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
  { value: "miles", label: "Miles" },
  { value: "kilometers", label: "Kilometers" },
  { value: "steps", label: "Steps" },
  { value: "reps", label: "Reps" },
  { value: "sets", label: "Sets" },
  { value: "sessions", label: "Sessions" },
  { value: "items", label: "Items" },
  { value: "times", label: "Times" },
  { value: "servings", label: "Servings" }
];

const WEEKDAYS = [
  { id: "monday", label: "Mon" },
  { id: "tuesday", label: "Tue" },
  { id: "wednesday", label: "Wed" },
  { id: "thursday", label: "Thu" },
  { id: "friday", label: "Fri" },
  { id: "saturday", label: "Sat" },
  { id: "sunday", label: "Sun" }
];

export default function AdvancedAddHabitDialog({ open, onOpenChange }: AdvancedAddHabitDialogProps) {
  const [activeTab, setActiveTab] = useState("template");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trackingType, setTrackingType] = useState<"boolean" | "numeric" | "duration" | "custom">("boolean");
  const [unit, setUnit] = useState("");
  const [customUnit, setCustomUnit] = useState("");
  const [targetValue, setTargetValue] = useState<number | null>(null);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "custom">("daily");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedIcon, setSelectedIcon] = useState("target");
  const [selectedColor, setSelectedColor] = useState("#1976D2");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createHabitMutation = useMutation({
    mutationFn: async (data: any) => {
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
    setActiveTab("template");
    setName("");
    setDescription("");
    setTrackingType("boolean");
    setUnit("");
    setCustomUnit("");
    setTargetValue(null);
    setFrequency("daily");
    setSelectedDays([]);
    setSelectedIcon("target");
    setSelectedColor("#1976D2");
  };

  const applyTemplate = (template: typeof HABIT_TEMPLATES[0]) => {
    setName(template.name);
    setDescription(template.description);
    setTrackingType(template.trackingType);
    setUnit(template.unit);
    setTargetValue(template.targetValue);
    setFrequency(template.frequency);
    setSelectedIcon(template.icon);
    setSelectedColor(template.color);
    setActiveTab("customize");
  };

  const toggleDay = (dayId: string) => {
    setSelectedDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalUnit = unit === "custom" ? customUnit : unit;
    const frequencyDays = frequency === "weekly" || frequency === "custom" ? selectedDays : null;

    createHabitMutation.mutate({
      name: name.trim(),
      description: description.trim() || null,
      trackingType,
      unit: trackingType !== "boolean" ? finalUnit : null,
      targetValue: trackingType !== "boolean" ? targetValue : null,
      frequency,
      frequencyDays,
      icon: selectedIcon,
      color: selectedColor
    });
  };

  const SelectedIcon = ICONS.find(icon => icon.id === selectedIcon)?.component || Target;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <SelectedIcon className="h-5 w-5" style={{ color: selectedColor }} />
            <span>Create New Habit</span>
          </DialogTitle>
          <DialogDescription>
            Build a custom habit with flexible tracking options and personalized settings.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="template" data-testid="tab-template">Quick Start</TabsTrigger>
            <TabsTrigger value="customize" data-testid="tab-customize">Customize</TabsTrigger>
            <TabsTrigger value="advanced" data-testid="tab-advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Choose a Template</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {HABIT_TEMPLATES.map((template) => {
                  const IconComponent = ICONS.find(icon => icon.id === template.icon)?.component || Target;
                  return (
                    <Card 
                      key={template.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => applyTemplate(template)}
                      data-testid={`template-${template.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                            style={{ backgroundColor: template.color }}
                          >
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{template.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="secondary" className="text-xs">
                                {template.trackingType}
                              </Badge>
                              {template.targetValue && (
                                <Badge variant="outline" className="text-xs">
                                  {template.targetValue} {template.unit}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {template.frequency}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab("customize")}
                data-testid="button-custom-habit"
              >
                <Palette className="h-4 w-4 mr-2" />
                Create Custom Habit
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="customize" className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
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
                    rows={2}
                    data-testid="textarea-habit-description"
                  />
                </div>
              </div>

              <Separator />

              {/* Tracking Type */}
              <div className="space-y-4">
                <div>
                  <Label>Tracking Type</Label>
                  <Select value={trackingType} onValueChange={(value: any) => setTrackingType(value)}>
                    <SelectTrigger data-testid="select-tracking-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boolean">Simple (Done/Not Done)</SelectItem>
                      <SelectItem value="numeric">Numeric (Count or Amount)</SelectItem>
                      <SelectItem value="duration">Duration (Time-based)</SelectItem>
                      <SelectItem value="custom">Custom Tracking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {trackingType !== "boolean" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Unit of Measurement</Label>
                      <Select value={unit} onValueChange={setUnit}>
                        <SelectTrigger data-testid="select-unit">
                          <SelectValue placeholder="Choose unit..." />
                        </SelectTrigger>
                        <SelectContent>
                          {UNITS.map((u) => (
                            <SelectItem key={u.value} value={u.value}>
                              {u.label}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Custom Unit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {unit === "custom" && (
                      <div>
                        <Label>Custom Unit</Label>
                        <Input
                          value={customUnit}
                          onChange={(e) => setCustomUnit(e.target.value)}
                          placeholder="e.g., chapters, workouts..."
                          data-testid="input-custom-unit"
                        />
                      </div>
                    )}

                    <div>
                      <Label>Target Value</Label>
                      <Input
                        type="number"
                        value={targetValue || ""}
                        onChange={(e) => setTargetValue(parseFloat(e.target.value) || null)}
                        placeholder="e.g., 8, 30, 10000"
                        min="0"
                        step="0.1"
                        data-testid="input-target-value"
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Frequency */}
              <div className="space-y-4">
                <div>
                  <Label>Frequency</Label>
                  <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
                    <SelectTrigger data-testid="select-frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly (Select Days)</SelectItem>
                      <SelectItem value="custom">Custom Schedule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(frequency === "weekly" || frequency === "custom") && (
                  <div>
                    <Label>Select Days</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {WEEKDAYS.map((day) => (
                        <Button
                          key={day.id}
                          type="button"
                          variant={selectedDays.includes(day.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleDay(day.id)}
                          data-testid={`day-${day.id}`}
                        >
                          {day.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Visual Customization */}
              <div className="space-y-4">
                <div>
                  <Label>Icon</Label>
                  <div className="grid grid-cols-8 gap-2 mt-2">
                    {ICONS.map((icon) => {
                      const IconComponent = icon.component;
                      return (
                        <Button
                          key={icon.id}
                          type="button"
                          variant={selectedIcon === icon.id ? "default" : "outline"}
                          size="sm"
                          className="aspect-square p-0"
                          onClick={() => setSelectedIcon(icon.id)}
                          data-testid={`icon-${icon.id}`}
                        >
                          <IconComponent className="h-4 w-4" />
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label>Color</Label>
                  <div className="grid grid-cols-10 gap-2 mt-2">
                    {COLORS.map((color) => (
                      <Button
                        key={color}
                        type="button"
                        className="aspect-square p-0 border-2"
                        style={{ 
                          backgroundColor: color,
                          borderColor: selectedColor === color ? "#000" : "transparent"
                        }}
                        onClick={() => setSelectedColor(color)}
                        data-testid={`color-${color}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!name.trim() || createHabitMutation.isPending}
                  data-testid="button-create-habit"
                >
                  {createHabitMutation.isPending ? "Creating..." : "Create Habit"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <div className="text-center py-12">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold mb-4">Advanced Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">✨ Flexible Tracking</h4>
                      <p className="text-sm text-gray-600">
                        Track anything with custom units: glasses of water, pages read, 
                        miles run, meditation minutes, or create your own measurement.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">📅 Custom Schedules</h4>
                      <p className="text-sm text-gray-600">
                        Set daily, weekly, or completely custom schedules. Perfect for 
                        habits that don't happen every day.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">🎯 Goal Setting</h4>
                      <p className="text-sm text-gray-600">
                        Set specific targets for numeric habits. Track progress toward 
                        daily, weekly, or custom goals.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">🎨 Visual Customization</h4>
                      <p className="text-sm text-gray-600">
                        Personalize with icons and colors. Make your habits visually 
                        distinct and motivating.
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-8">
                  <Button 
                    onClick={() => setActiveTab("customize")}
                    data-testid="button-start-customizing"
                  >
                    Start Customizing
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}