import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Square, 
  Plus, 
  Trash2, 
  Edit,
  Timer,
  Dumbbell,
  History,
  Download,
  Settings,
  ChevronRight,
  Activity
} from "lucide-react";
import { Sidebar } from "@/components/layout/unified-sidebar";
import type { Exercise, Workout, Set, CardioEntry } from "@shared/schema";

interface WorkoutWithSets extends Workout {
  sets?: Set[];
}

const CARDIO_TYPES = [
  { id: "run", label: "Run" },
  { id: "ride", label: "Bike" },
  { id: "row", label: "Row" },
  { id: "swim", label: "Swim" },
  { id: "other", label: "Other" }
];

export default function WorkoutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [newWeight, setNewWeight] = useState<string>("20");
  const [newReps, setNewReps] = useState<string>("10");
  const [useKg, setUseKg] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  
  // Cardio form states
  const [cardioType, setCardioType] = useState("run");
  const [cardioMinutes, setCardioMinutes] = useState<string>("30");
  const [cardioDistance, setCardioDistance] = useState<string>("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch exercises
  const { data: exercises = [] } = useQuery<Exercise[]>({
    queryKey: ['/api/exercises']
  });

  // Fetch workout history
  const { data: workouts = [] } = useQuery<Workout[]>({
    queryKey: ['/api/workouts/history']
  });

  // Get current workout with sets
  const { data: currentWorkoutData } = useQuery<WorkoutWithSets>({
    queryKey: ['/api/workouts', activeWorkout],
    enabled: !!activeWorkout,
    refetchInterval: 2000 // Refresh every 2 seconds during active workout
  });

  // Get selected workout detail
  const { data: workoutDetail } = useQuery<WorkoutWithSets>({
    queryKey: ['/api/workouts', selectedWorkout],
    enabled: !!selectedWorkout
  });

  // Start workout mutation
  const startWorkoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/workouts/start", {}),
    onSuccess: (data: any) => {
      setActiveWorkout(data.workoutId || data.id);
      queryClient.invalidateQueries({ queryKey: ['/api/workouts'] });
      toast({
        title: "Workout started!",
        description: "Let's get moving! Add some exercises.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start workout",
        variant: "destructive",
      });
    }
  });

  // Finish workout mutation
  const finishWorkoutMutation = useMutation({
    mutationFn: (notes?: string) => apiRequest("POST", `/api/workouts/${activeWorkout}/finish`, { notes }),
    onSuccess: () => {
      setActiveWorkout(null);
      queryClient.invalidateQueries({ queryKey: ['/api/workouts'] });
      toast({
        title: "Workout complete!",
        description: "Great job! Check your workout summary.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to finish workout",
        variant: "destructive",
      });
    }
  });

  // Add set mutation
  const addSetMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest("POST", `/api/workouts/${activeWorkout}/set`, {
        action: "add",
        ...data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workouts', activeWorkout] });
      setNewWeight("20");
      setNewReps("10");
      toast({
        title: "Set added!",
        description: "Keep it up!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add set",
        variant: "destructive",
      });
    }
  });

  // Delete set mutation
  const deleteSetMutation = useMutation({
    mutationFn: (setId: string) => 
      apiRequest("POST", `/api/workouts/${activeWorkout}/set`, {
        action: "delete",
        setId
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workouts', activeWorkout] });
      toast({
        title: "Set deleted",
        description: "Set removed from workout",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete set",
        variant: "destructive",
      });
    }
  });

  // Log cardio mutation
  const logCardioMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/cardio", data),
    onSuccess: () => {
      setCardioMinutes("30");
      setCardioDistance("");
      toast({
        title: "Cardio logged!",
        description: "Great cardio session!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log cardio",
        variant: "destructive",
      });
    }
  });

  const handleAddSet = () => {
    if (!selectedExercise || !newWeight || !newReps) {
      toast({
        title: "Missing information",
        description: "Please select exercise and enter weight/reps",
        variant: "destructive",
      });
      return;
    }

    const weight = parseFloat(newWeight);
    const reps = parseInt(newReps);

    if (isNaN(weight) || isNaN(reps) || weight <= 0 || reps <= 0) {
      toast({
        title: "Invalid values",
        description: "Weight and reps must be positive numbers",
        variant: "destructive",
      });
      return;
    }

    addSetMutation.mutate({
      exerciseId: selectedExercise,
      weight,
      reps
    });
  };

  const handleLogCardio = () => {
    const minutes = parseInt(cardioMinutes);
    const distance = cardioDistance ? parseFloat(cardioDistance) : null;

    if (isNaN(minutes) || minutes <= 0) {
      toast({
        title: "Invalid duration",
        description: "Duration must be a positive number",
        variant: "destructive",
      });
      return;
    }

    logCardioMutation.mutate({
      date: new Date().toISOString().split('T')[0],
      type: cardioType,
      durationSec: minutes * 60,
      distanceMeters: distance ? distance * 1000 : null // Convert km to meters
    });
  };

  const getWorkoutSummary = (workout: WorkoutWithSets) => {
    if (!workout.sets) return { exercises: 0, totalSets: 0, totalVolume: 0 };
    
    const exerciseIds = new Set(workout.sets.map(set => set.exerciseId));
    const totalVolume = workout.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
    
    return {
      exercises: exerciseIds.size,
      totalSets: workout.sets.length,
      totalVolume: totalVolume.toFixed(1)
    };
  };

  const formatDuration = (start: string, end?: string) => {
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    const minutes = Math.round((endTime - startTime) / 60000);
    return `${minutes} min`;
  };

  const convertWeight = (weight: number) => {
    return useKg ? weight : (weight * 2.205).toFixed(1);
  };

  const getWeightUnit = () => useKg ? "kg" : "lb";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen}
          currentPage="/workout"
        />
        
        <main className="flex-1 p-6 lg:ml-64">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Workout Tracker</h1>
                <p className="text-gray-600 mt-2">Log your strength training and cardio sessions</p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setUseKg(!useKg)}
                  data-testid="toggle-units"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {useKg ? "kg" : "lb"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('/api/export.csv', '_blank')}
                  data-testid="export-csv"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            <Tabs defaultValue="logger" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="logger" data-testid="tab-logger">
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Logger
                </TabsTrigger>
                <TabsTrigger value="history" data-testid="tab-history">
                  <History className="h-4 w-4 mr-2" />
                  History
                </TabsTrigger>
                <TabsTrigger value="cardio" data-testid="tab-cardio">
                  <Activity className="h-4 w-4 mr-2" />
                  Cardio
                </TabsTrigger>
              </TabsList>

              {/* Logger Tab */}
              <TabsContent value="logger" className="space-y-6">
                {!activeWorkout ? (
                  <Card>
                    <CardHeader className="text-center">
                      <CardTitle className="flex items-center justify-center gap-2">
                        <Play className="h-6 w-6" />
                        Ready to Start?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-gray-600 mb-6">Begin a new workout session to start logging your exercises</p>
                      <Button
                        onClick={() => startWorkoutMutation.mutate()}
                        disabled={startWorkoutMutation.isPending}
                        size="lg"
                        data-testid="start-workout"
                      >
                        <Play className="h-5 w-5 mr-2" />
                        {startWorkoutMutation.isPending ? "Starting..." : "Start Workout"}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {/* Active Workout Header */}
                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                            <div>
                              <CardTitle className="text-lg">Workout in Progress</CardTitle>
                              <p className="text-sm text-gray-600">
                                Started {currentWorkoutData ? formatDuration(currentWorkoutData.startedAt.toString()) : '0 min'} ago
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => finishWorkoutMutation.mutate(undefined)}
                            disabled={finishWorkoutMutation.isPending}
                            data-testid="finish-workout"
                          >
                            <Square className="h-4 w-4 mr-2" />
                            {finishWorkoutMutation.isPending ? "Finishing..." : "Finish"}
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>

                    {/* Add Exercise */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Plus className="h-5 w-5" />
                          Add Set
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Exercise</label>
                            <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                              <SelectTrigger data-testid="select-exercise">
                                <SelectValue placeholder="Choose exercise" />
                              </SelectTrigger>
                              <SelectContent>
                                {exercises.map((exercise) => (
                                  <SelectItem key={exercise.id} value={exercise.id}>
                                    {exercise.name} {exercise.isCustom && "(Custom)"}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Weight ({getWeightUnit()})
                            </label>
                            <Input
                              type="number"
                              value={newWeight}
                              onChange={(e) => setNewWeight(e.target.value)}
                              placeholder="20"
                              min="0"
                              step="0.5"
                              data-testid="input-weight"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Reps</label>
                            <Input
                              type="number"
                              value={newReps}
                              onChange={(e) => setNewReps(e.target.value)}
                              placeholder="10"
                              min="1"
                              data-testid="input-reps"
                            />
                          </div>
                        </div>

                        <Button
                          onClick={handleAddSet}
                          disabled={addSetMutation.isPending || !selectedExercise}
                          className="mt-4"
                          data-testid="add-set"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {addSetMutation.isPending ? "Adding..." : "Add Set"}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Current Workout Sets */}
                    {currentWorkoutData?.sets && currentWorkoutData.sets.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Current Workout</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {currentWorkoutData.sets.map((set, index) => {
                            const exercise = exercises.find(e => e.id === set.exerciseId);
                            return (
                              <div key={set.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <div className="font-medium">{exercise?.name || "Unknown Exercise"}</div>
                                    <div className="text-sm text-gray-600">
                                      {convertWeight(set.weight)} {getWeightUnit()} × {set.reps} reps
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteSetMutation.mutate(set.id)}
                                  disabled={deleteSetMutation.isPending}
                                  data-testid={`delete-set-${set.id}`}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Workout History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {workouts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p>No workouts logged yet</p>
                        <p className="text-sm">Start your first workout to see it here!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {workouts.map((workout) => {
                          const summary = getWorkoutSummary(workout as WorkoutWithSets);
                          return (
                            <div 
                              key={workout.id}
                              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => setSelectedWorkout(workout.id)}
                              data-testid={`workout-${workout.id}`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">
                                    {new Date(workout.startedAt).toLocaleDateString()}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {summary.exercises} exercises • {summary.totalSets} sets
                                    {workout.endedAt && ` • ${formatDuration(workout.startedAt.toString(), workout.endedAt.toString())}`}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">{summary.totalVolume} {getWeightUnit()}</div>
                                  <div className="text-sm text-gray-600">Total Volume</div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Workout Detail Modal */}
                {selectedWorkout && workoutDetail && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>
                          Workout - {new Date(workoutDetail.startedAt).toLocaleDateString()}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          onClick={() => setSelectedWorkout(null)}
                          data-testid="close-workout-detail"
                        >
                          ×
                        </Button>
                      </div>
                      <p className="text-gray-600">
                        {workoutDetail.endedAt 
                          ? `${formatDuration(workoutDetail.startedAt.toString(), workoutDetail.endedAt.toString())}`
                          : "In Progress"
                        }
                      </p>
                    </CardHeader>
                    <CardContent>
                      {workoutDetail.sets && workoutDetail.sets.length > 0 ? (
                        <div className="space-y-4">
                          {workoutDetail.sets.map((set, index) => {
                            const exercise = exercises.find(e => e.id === set.exerciseId);
                            return (
                              <div key={set.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium">{exercise?.name || "Unknown Exercise"}</div>
                                  <div className="text-sm text-gray-600">
                                    {convertWeight(set.weight)} {getWeightUnit()} × {set.reps} reps = {(set.weight * set.reps).toFixed(1)} {getWeightUnit()} volume
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500">No sets recorded</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Cardio Tab */}
              <TabsContent value="cardio" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Log Cardio Session
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Activity Type</label>
                        <Select value={cardioType} onValueChange={setCardioType}>
                          <SelectTrigger data-testid="select-cardio-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CARDIO_TYPES.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                        <Input
                          type="number"
                          value={cardioMinutes}
                          onChange={(e) => setCardioMinutes(e.target.value)}
                          placeholder="30"
                          min="1"
                          data-testid="input-cardio-duration"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Distance (km) - Optional</label>
                        <Input
                          type="number"
                          value={cardioDistance}
                          onChange={(e) => setCardioDistance(e.target.value)}
                          placeholder="5.0"
                          min="0"
                          step="0.1"
                          data-testid="input-cardio-distance"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleLogCardio}
                      disabled={logCardioMutation.isPending}
                      className="mt-4"
                      data-testid="log-cardio"
                    >
                      <Timer className="h-4 w-4 mr-2" />
                      {logCardioMutation.isPending ? "Logging..." : "Log Cardio"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}