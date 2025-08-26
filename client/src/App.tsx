import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import TimerPage from "@/pages/timer";
import TodoPage from "@/pages/todos";
import CalendarPage from "@/pages/calendar";
import SystemsPage from "@/pages/systems";
import WeeklyPlanPage from "@/pages/weekly-plan";
import DailyPlanPage from "@/pages/daily-plan";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/todos" component={TodoPage} />
      <Route path="/calendar" component={CalendarPage} />
      <Route path="/systems" component={SystemsPage} />
      <Route path="/weekly-plan" component={WeeklyPlanPage} />
      <Route path="/daily-plan" component={DailyPlanPage} />
      <Route path="/timer" component={TimerPage} />
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
