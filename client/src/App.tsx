import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import TimerPage from "@/pages/timer";
import HabitsPage from "@/pages/habits";
import HealthPage from "@/pages/health";
import NutritionPage from "@/pages/nutrition";
import WorkoutPage from "@/pages/workout";
import ContentPage from "@/pages/content";
import ScreenTimePage from "@/pages/screen-time";
import WatchlistPage from "@/pages/watchlist";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/timer" component={TimerPage} />
      <Route path="/habits" component={HabitsPage} />
      <Route path="/health" component={HealthPage} />
      <Route path="/nutrition" component={NutritionPage} />
      <Route path="/workout" component={WorkoutPage} />
      <Route path="/content" component={ContentPage} />
      <Route path="/content/screen-time" component={ScreenTimePage} />
      <Route path="/content/watchlist" component={WatchlistPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
