import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  Camera, 
  Coffee, 
  Utensils, 
  Apple, 
  Moon,
  Target,
  TrendingUp,
  FileDown,
  Settings
} from "lucide-react";
import { Sidebar } from "@/components/layout/unified-sidebar";
import type { FoodItem, MealEntry, NutritionGoal } from "@shared/schema";

const MEAL_TYPES = [
  { id: "breakfast", label: "Breakfast", icon: Coffee },
  { id: "lunch", label: "Lunch", icon: Utensils },
  { id: "dinner", label: "Dinner", icon: Apple },
  { id: "snack", label: "Snack", icon: Moon }
];

interface FoodSearchResult {
  id: string;
  name: string;
  brand?: string;
  nutrients: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
  servings?: Array<{
    unit: string;
    grams: number;
    description?: string;
  }>;
}

export default function NutritionPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);
  const [servingSize, setServingSize] = useState(1);
  const [selectedServing, setSelectedServing] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  // Food search query
  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ['/api/foods/search', searchQuery],
    enabled: searchQuery.length >= 2,
    queryFn: async () => {
      const params = new URLSearchParams({ q: searchQuery, limit: '10' });
      const response = await fetch(`/api/foods/search?${params}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    }
  });

  // Today's meals
  const { data: todaysMeals = [] } = useQuery({
    queryKey: ['/api/meals', today],
    queryFn: async () => {
      const response = await fetch(`/api/meals?date=${today}`);
      if (!response.ok) throw new Error('Failed to fetch meals');
      return response.json();
    }
  });

  // Daily totals
  const { data: dailyTotals } = useQuery({
    queryKey: ['/api/day', today, 'totals'],
    queryFn: async () => {
      const response = await fetch(`/api/day/${today}/totals`);
      if (!response.ok) throw new Error('Failed to fetch daily totals');
      return response.json();
    }
  });

  // Nutrition goal
  const { data: nutritionGoal } = useQuery({
    queryKey: ['/api/nutrition-goals'],
    queryFn: async () => {
      const response = await fetch('/api/nutrition-goals');
      if (!response.ok) throw new Error('Failed to fetch nutrition goal');
      return response.json();
    }
  });

  // Log meal mutation
  const logMealMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/log/meal", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/day'] });
      toast({
        title: "Meal logged",
        description: "Your food has been logged successfully.",
      });
      setSelectedFood(null);
      setSearchQuery("");
      setServingSize(1);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log meal. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleFoodSelect = (food: FoodSearchResult) => {
    setSelectedFood(food);
    if (food.servings && food.servings.length > 0) {
      setSelectedServing(food.servings[0].unit);
    }
  };

  const calculateNutrition = () => {
    if (!selectedFood) return null;
    
    let gramsPerServing = 100; // Default per 100g
    if (selectedFood.servings && selectedServing) {
      const serving = selectedFood.servings.find(s => s.unit === selectedServing);
      if (serving) {
        gramsPerServing = serving.grams;
      }
    }
    
    const multiplier = (gramsPerServing * servingSize) / 100;
    
    return {
      calories: Math.round(selectedFood.nutrients.calories * multiplier),
      protein: Math.round(selectedFood.nutrients.protein * multiplier * 10) / 10,
      carbs: Math.round(selectedFood.nutrients.carbs * multiplier * 10) / 10,
      fat: Math.round(selectedFood.nutrients.fat * multiplier * 10) / 10,
      fiber: selectedFood.nutrients.fiber ? Math.round(selectedFood.nutrients.fiber * multiplier * 10) / 10 : 0
    };
  };

  const handleLogMeal = () => {
    if (!selectedFood) return;
    
    const nutrition = calculateNutrition();
    if (!nutrition) return;

    const servingGrams = selectedFood.servings && selectedServing 
      ? selectedFood.servings.find(s => s.unit === selectedServing)?.grams || 100 
      : 100;

    logMealMutation.mutate({
      date: today,
      mealType: selectedMealType,
      datetime: new Date().toISOString(),
      items: [{
        foodId: selectedFood.id,
        quantity: servingSize,
        servingGrams: servingGrams * servingSize,
        notes: null
      }],
      source: "search",
      totalsCache: {
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        fiber: nutrition.fiber,
        sugar: 0,
        sodium: 0
      }
    });
  };

  const getMealEntries = (mealType: string) => {
    return todaysMeals.filter((meal: MealEntry) => meal.mealType === mealType);
  };

  const getMealTotals = (mealType: string) => {
    const meals = getMealEntries(mealType);
    return meals.reduce((total: any, meal: MealEntry) => {
      if (meal.totalsCache) {
        return {
          calories: total.calories + meal.totalsCache.calories,
          protein: total.protein + meal.totalsCache.protein,
          carbs: total.carbs + meal.totalsCache.carbs,
          fat: total.fat + meal.totalsCache.fat
        };
      }
      return total;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen}
          currentPage="/nutrition"
        />
        
        <main className="flex-1 p-6 lg:ml-64">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Nutrition Tracker</h1>
                <p className="text-gray-600 mt-2">Track your daily nutrition and reach your goals</p>
              </div>
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Goals
              </Button>
            </div>

            <Tabs defaultValue="quick-log" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="quick-log" data-testid="tab-quick-log">Quick Log</TabsTrigger>
                <TabsTrigger value="diary" data-testid="tab-diary">Today's Diary</TabsTrigger>
                <TabsTrigger value="weekly" data-testid="tab-weekly">Weekly Report</TabsTrigger>
                <TabsTrigger value="goals" data-testid="tab-goals">Goals & Progress</TabsTrigger>
              </TabsList>

              {/* Quick Log Tab */}
              <TabsContent value="quick-log" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Food Search */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Quick Food Log
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Meal Type Selection */}
                      <div className="grid grid-cols-4 gap-2">
                        {MEAL_TYPES.map((meal) => {
                          const Icon = meal.icon;
                          return (
                            <Button
                              key={meal.id}
                              variant={selectedMealType === meal.id ? "default" : "outline"}
                              className="flex flex-col gap-1 h-16"
                              onClick={() => setSelectedMealType(meal.id)}
                              data-testid={`meal-${meal.id}`}
                            >
                              <Icon className="h-4 w-4" />
                              <span className="text-xs">{meal.label}</span>
                            </Button>
                          );
                        })}
                      </div>

                      <Separator />

                      {/* Search Input */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search foods... (e.g., banana, chicken breast)"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                          data-testid="input-food-search"
                        />
                      </div>

                      {/* Search Results */}
                      {searchQuery.length >= 2 && (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {searchLoading ? (
                            <div className="text-center py-4 text-gray-500">Searching...</div>
                          ) : searchResults.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">No foods found</div>
                          ) : (
                            searchResults.map((food: FoodSearchResult) => (
                              <div
                                key={food.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                  selectedFood?.id === food.id 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 hover:bg-gray-50'
                                }`}
                                onClick={() => handleFoodSelect(food)}
                                data-testid={`food-${food.id}`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium">{food.name}</h4>
                                    {food.brand && (
                                      <p className="text-sm text-gray-600">{food.brand}</p>
                                    )}
                                  </div>
                                  <div className="text-right text-sm text-gray-600">
                                    <div>{food.nutrients.calories} cal</div>
                                    <div>{food.nutrients.protein}g protein</div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {/* Serving Size Controls */}
                      {selectedFood && (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium">{selectedFood.name}</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Serving Unit */}
                            {selectedFood.servings && selectedFood.servings.length > 0 && (
                              <div>
                                <label className="block text-sm font-medium mb-1">Serving Unit</label>
                                <Select value={selectedServing} onValueChange={setSelectedServing}>
                                  <SelectTrigger data-testid="select-serving-unit">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {selectedFood.servings.map((serving) => (
                                      <SelectItem key={serving.unit} value={serving.unit}>
                                        {serving.description || `1 ${serving.unit} (${serving.grams}g)`}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {/* Quantity */}
                            <div>
                              <label className="block text-sm font-medium mb-1">Quantity</label>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setServingSize(Math.max(0.25, servingSize - 0.25))}
                                  data-testid="button-decrease-serving"
                                >
                                  -
                                </Button>
                                <Input
                                  type="number"
                                  value={servingSize}
                                  onChange={(e) => setServingSize(parseFloat(e.target.value) || 1)}
                                  step="0.25"
                                  min="0.25"
                                  className="w-20 text-center"
                                  data-testid="input-serving-size"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setServingSize(servingSize + 0.25)}
                                  data-testid="button-increase-serving"
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Nutrition Preview */}
                          {(() => {
                            const nutrition = calculateNutrition();
                            if (!nutrition) return null;
                            
                            return (
                              <div className="grid grid-cols-4 gap-2 text-center">
                                <div>
                                  <div className="font-semibold text-lg">{nutrition.calories}</div>
                                  <div className="text-xs text-gray-600">Calories</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-lg">{nutrition.protein}g</div>
                                  <div className="text-xs text-gray-600">Protein</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-lg">{nutrition.carbs}g</div>
                                  <div className="text-xs text-gray-600">Carbs</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-lg">{nutrition.fat}g</div>
                                  <div className="text-xs text-gray-600">Fat</div>
                                </div>
                              </div>
                            );
                          })()}

                          <Button
                            onClick={handleLogMeal}
                            disabled={logMealMutation.isPending}
                            className="w-full"
                            data-testid="button-log-meal"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {logMealMutation.isPending ? "Logging..." : "Log Food"}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Daily Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Today's Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {dailyTotals && nutritionGoal ? (
                        <>
                          {/* Calories */}
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Calories</span>
                              <span>{dailyTotals.totals.calories} / {nutritionGoal.calorieTarget}</span>
                            </div>
                            <Progress 
                              value={(dailyTotals.totals.calories / nutritionGoal.calorieTarget) * 100} 
                              className="h-2" 
                            />
                          </div>

                          {/* Macros */}
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <div className="text-lg font-semibold">{dailyTotals.totals.protein}g</div>
                              <div className="text-xs text-gray-600">Protein</div>
                              <div className="text-xs">
                                {Math.round((dailyTotals.totals.protein / nutritionGoal.proteinTarget) * 100)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold">{dailyTotals.totals.carbs}g</div>
                              <div className="text-xs text-gray-600">Carbs</div>
                              <div className="text-xs">
                                {Math.round((dailyTotals.totals.carbs / nutritionGoal.carbsTarget) * 100)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold">{dailyTotals.totals.fat}g</div>
                              <div className="text-xs text-gray-600">Fat</div>
                              <div className="text-xs">
                                {Math.round((dailyTotals.totals.fat / nutritionGoal.fatTarget) * 100)}%
                              </div>
                            </div>
                          </div>

                          {/* Warnings */}
                          {dailyTotals.warnings && dailyTotals.warnings.length > 0 && (
                            <div className="space-y-1">
                              {dailyTotals.warnings.map((warning: string, index: number) => (
                                <div key={index} className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                                  {warning}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          Set up your nutrition goals to see progress
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Barcode Scanner */}
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <Camera className="h-12 w-12 mx-auto text-gray-400" />
                      <div>
                        <h3 className="font-medium">Quick Barcode Scan</h3>
                        <p className="text-sm text-gray-600">Scan product barcodes for instant nutrition lookup</p>
                      </div>
                      <Button variant="outline" data-testid="button-scan-barcode">
                        <Camera className="h-4 w-4 mr-2" />
                        Scan Barcode
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Diary Tab */}
              <TabsContent value="diary" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {MEAL_TYPES.map((meal) => {
                    const Icon = meal.icon;
                    const mealTotals = getMealTotals(meal.id);
                    const mealEntries = getMealEntries(meal.id);
                    
                    return (
                      <Card key={meal.id}>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Icon className="h-4 w-4" />
                            {meal.label}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {mealEntries.length > 0 ? (
                            <>
                              {mealEntries.map((entry: MealEntry) => (
                                <div key={entry.id} className="text-sm border-b border-gray-100 pb-2">
                                  <div className="font-medium">Food logged</div>
                                  <div className="text-gray-600">
                                    {entry.totalsCache?.calories || 0} cal
                                  </div>
                                </div>
                              ))}
                              <div className="pt-2 border-t">
                                <div className="text-sm font-medium">Total: {mealTotals.calories} cal</div>
                                <div className="text-xs text-gray-600">
                                  P: {mealTotals.protein}g | C: {mealTotals.carbs}g | F: {mealTotals.fat}g
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-gray-500 text-center py-4">
                              No foods logged
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Weekly Report Tab */}
              <TabsContent value="weekly">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Weekly Nutrition Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-gray-500 py-12">
                      Weekly report functionality coming soon...
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Goals Tab */}
              <TabsContent value="goals">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Nutrition Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-gray-500 py-12">
                      Nutrition goals management coming soon...
                    </div>
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