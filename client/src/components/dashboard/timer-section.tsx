import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square } from "lucide-react";
import { useTimer } from "@/hooks/use-timer";
import type { TimerSession } from "@shared/schema";

interface TimerSectionProps {
  sessions: TimerSession[];
}

export default function TimerSection({ sessions }: TimerSectionProps) {
  const [timerType, setTimerType] = useState<"pomodoro" | "break" | "long-break">("pomodoro");
  const { time, isRunning, start, pause, reset } = useTimer({
    duration: timerType === "pomodoro" ? 25 : timerType === "break" ? 5 : 15,
    onComplete: () => {
      // Timer completed logic will be handled here
    }
  });

  const completedSessions = sessions.filter(s => s.completed).length;
  const totalMinutes = sessions
    .filter(s => s.completed)
    .reduce((sum, s) => sum + s.duration, 0);

  const formatTime = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const progress = timerType === "pomodoro" ? (25 - time) / 25 : 
                  timerType === "break" ? (5 - time) / 5 : (15 - time) / 15;
  const circumference = 2 * Math.PI * 66;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <div className="bg-surface p-6 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Focus Timer</h3>
        <div className="flex items-center space-x-2">
          <span className="bg-blue-100 text-primary text-sm px-2 py-1 rounded-full">
            {timerType === "pomodoro" ? "Pomodoro" : timerType === "break" ? "Break" : "Long Break"}
          </span>
        </div>
      </div>

      <div className="text-center mb-6">
        <div className="relative w-40 h-40 mx-auto mb-4">
          <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 144 144">
            <circle 
              cx="72" 
              cy="72" 
              r="66" 
              stroke="#E5E7EB" 
              strokeWidth="8" 
              fill="none"
            />
            <circle 
              cx="72" 
              cy="72" 
              r="66" 
              stroke="#1976D2" 
              strokeWidth="8" 
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900" data-testid="timer-display">
                {formatTime(time)}
              </div>
              <div className="text-sm text-gray-600">
                {timerType === "pomodoro" ? "Focus Session" : "Break Time"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-3">
          <Button
            onClick={isRunning ? pause : start}
            className="bg-primary text-white hover:bg-blue-700"
            data-testid="button-timer-toggle"
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={reset}
            data-testid="button-timer-reset"
          >
            <Square className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Sessions Today</span>
          <span className="font-medium text-gray-900" data-testid="text-sessions-today">
            {completedSessions}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Focus Time</span>
          <span className="font-medium text-gray-900" data-testid="text-total-time">
            {formatTotalTime(totalMinutes)}
          </span>
        </div>
      </div>
    </div>
  );
}
