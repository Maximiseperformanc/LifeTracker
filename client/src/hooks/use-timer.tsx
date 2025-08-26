import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface UseTimerOptions {
  duration: number; // in minutes
  onComplete?: () => void;
}

export function useTimer({ duration, onComplete }: UseTimerOptions) {
  const [time, setTime] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const saveSessionMutation = useMutation({
    mutationFn: async (data: { duration: number; type: string; completed: boolean }) => {
      return apiRequest("/api/timer-sessions", "POST", { ...data, date: today });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timer-sessions'] });
    },
  });

  const tick = useCallback(() => {
    setTime((prevTime) => {
      if (prevTime <= 0.017) { // ~1 second in minutes
        setIsRunning(false);
        onComplete?.();
        
        // Save completed session
        saveSessionMutation.mutate({
          duration,
          type: "pomodoro",
          completed: true,
        });
        
        return 0;
      }
      return prevTime - 0.017; // Subtract ~1 second
    });
  }, [duration, onComplete, saveSessionMutation]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, tick]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  
  const reset = () => {
    setIsRunning(false);
    setTime(duration);
  };

  return {
    time,
    isRunning,
    start,
    pause,
    reset,
  };
}
