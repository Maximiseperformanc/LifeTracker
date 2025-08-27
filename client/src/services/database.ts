import { supabase } from '@/lib/supabase';

// =====================================================
// HABITS SERVICE
// =====================================================

export const habitsService = {
  // Get all habits for current user
  async getAll() {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get single habit
  async getById(id: string) {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new habit
  async create(habit: any) {
    const user = (await supabase.auth.getUser()).data.user;
    const { data, error } = await supabase
      .from('habits')
      .insert({ ...habit, user_id: user?.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update habit
  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete habit
  async delete(id: string) {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Log habit entry
  async logEntry(habitId: string, value: number, date: string, completed: boolean) {
    const user = (await supabase.auth.getUser()).data.user;
    const { data, error } = await supabase
      .from('habit_entries')
      .upsert({
        habit_id: habitId,
        user_id: user?.id,
        date,
        value,
        completed
      }, {
        onConflict: 'habit_id,date'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get habit entries for a date range
  async getEntries(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('habit_entries')
      .select('*, habits(*)')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Update streaks
  async updateStreak(habitId: string, increment: boolean) {
    const { data: habit } = await this.getById(habitId);
    const newStreak = increment ? (habit.streak_count + 1) : 0;
    const bestStreak = Math.max(newStreak, habit.best_streak);
    
    return this.update(habitId, {
      streak_count: newStreak,
      best_streak: bestStreak
    });
  }
};

// =====================================================
// DAILY CHECKLIST SERVICE
// =====================================================

export const checklistService = {
  // Get all checklist items
  async getAll() {
    const { data, error } = await supabase
      .from('daily_checklist')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create checklist item
  async create(item: any) {
    const user = (await supabase.auth.getUser()).data.user;
    const { data, error } = await supabase
      .from('daily_checklist')
      .insert({ ...item, user_id: user?.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Toggle checklist completion for today
  async toggleCompletion(checklistId: string, date: string) {
    const user = (await supabase.auth.getUser()).data.user;
    
    // Check if completion exists
    const { data: existing } = await supabase
      .from('checklist_completions')
      .select('*')
      .eq('checklist_id', checklistId)
      .eq('date', date)
      .single();

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('checklist_completions')
        .update({
          is_completed: !existing.is_completed,
          completed_at: !existing.is_completed ? new Date().toISOString() : null
        })
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('checklist_completions')
        .insert({
          checklist_id: checklistId,
          user_id: user?.id,
          date,
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Get completions for date
  async getCompletions(date: string) {
    const { data, error } = await supabase
      .from('checklist_completions')
      .select('*, daily_checklist(*)')
      .eq('date', date);
    
    if (error) throw error;
    return data;
  }
};

// =====================================================
// SLEEP SERVICE
// =====================================================

export const sleepService = {
  // Get all sleep entries
  async getAll() {
    const { data, error } = await supabase
      .from('sleep_entries')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get sleep entry by date
  async getByDate(date: string) {
    const { data, error } = await supabase
      .from('sleep_entries')
      .select('*')
      .eq('date', date)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Create or update sleep entry
  async upsert(entry: any) {
    const user = (await supabase.auth.getUser()).data.user;
    const { data, error } = await supabase
      .from('sleep_entries')
      .upsert({
        ...entry,
        user_id: user?.id
      }, {
        onConflict: 'user_id,date'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get sleep stats for date range
  async getStats(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('sleep_entries')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (error) throw error;
    
    // Calculate stats
    const totalHours = data.reduce((sum, entry) => sum + (entry.total_hours || 0), 0);
    const avgHours = data.length > 0 ? totalHours / data.length : 0;
    const avgQuality = data.length > 0 
      ? data.reduce((sum, entry) => sum + (entry.sleep_quality || 0), 0) / data.length
      : 0;
    
    return {
      entries: data,
      avgHours,
      avgQuality,
      totalNights: data.length
    };
  }
};

// =====================================================
// GYM/WORKOUT SERVICE
// =====================================================

export const workoutService = {
  // Get all workouts
  async getAll() {
    const { data, error } = await supabase
      .from('workouts')
      .select('*, exercises(*)')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create workout with exercises
  async create(workout: any, exercises: any[] = []) {
    const user = (await supabase.auth.getUser()).data.user;
    
    // Create workout
    const { data: workoutData, error: workoutError } = await supabase
      .from('workouts')
      .insert({ ...workout, user_id: user?.id })
      .select()
      .single();
    
    if (workoutError) throw workoutError;
    
    // Create exercises if provided
    if (exercises.length > 0) {
      const exercisesWithWorkoutId = exercises.map((ex, index) => ({
        ...ex,
        workout_id: workoutData.id,
        exercise_order: index + 1
      }));
      
      const { error: exercisesError } = await supabase
        .from('exercises')
        .insert(exercisesWithWorkoutId);
      
      if (exercisesError) throw exercisesError;
    }
    
    return workoutData;
  },

  // Get workout stats for date range
  async getStats(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (error) throw error;
    
    return {
      totalWorkouts: data.length,
      totalMinutes: data.reduce((sum, w) => sum + (w.duration_minutes || 0), 0),
      totalCalories: data.reduce((sum, w) => sum + (w.calories_burned || 0), 0),
      workoutTypes: [...new Set(data.map(w => w.workout_type))]
    };
  }
};

// =====================================================
// NUTRITION SERVICE
// =====================================================

export const nutritionService = {
  // Log meal
  async logMeal(meal: any) {
    const user = (await supabase.auth.getUser()).data.user;
    const { data, error } = await supabase
      .from('meals')
      .insert({ ...meal, user_id: user?.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get meals for date
  async getMealsByDate(date: string) {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('date', date)
      .order('meal_type');
    
    if (error) throw error;
    return data;
  },

  // Log water intake
  async logWater(date: string, amount: number) {
    const user = (await supabase.auth.getUser()).data.user;
    
    // Get existing water intake
    const { data: existing } = await supabase
      .from('water_intake')
      .select('*')
      .eq('date', date)
      .single();
    
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('water_intake')
        .update({ amount_ml: existing.amount_ml + amount })
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('water_intake')
        .insert({
          user_id: user?.id,
          date,
          amount_ml: amount
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  }
};

// =====================================================
// TODOS SERVICE
// =====================================================

export const todosService = {
  // Get all todos
  async getAll() {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('position', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create todo
  async create(todo: any) {
    const user = (await supabase.auth.getUser()).data.user;
    const { data, error } = await supabase
      .from('todos')
      .insert({ ...todo, user_id: user?.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update todo
  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Toggle completion
  async toggleComplete(id: string) {
    const { data: todo } = await supabase
      .from('todos')
      .select('status')
      .eq('id', id)
      .single();
    
    const newStatus = todo?.status === 'completed' ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;
    
    return this.update(id, { status: newStatus, completed_at: completedAt });
  },

  // Delete todo
  async delete(id: string) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// =====================================================
// GOALS SERVICE
// =====================================================

export const goalsService = {
  // Get all goals
  async getAll() {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create goal
  async create(goal: any) {
    const user = (await supabase.auth.getUser()).data.user;
    const { data, error } = await supabase
      .from('goals')
      .insert({ ...goal, user_id: user?.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update goal progress
  async updateProgress(id: string, progress: number) {
    const { data, error } = await supabase
      .from('goals')
      .update({ 
        progress,
        status: progress >= 100 ? 'completed' : 'active'
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// =====================================================
// CALENDAR/EVENTS SERVICE
// =====================================================

export const eventsService = {
  // Get events for date range
  async getRange(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('start_datetime', startDate)
      .lte('start_datetime', endDate)
      .order('start_datetime', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Create event
  async create(event: any) {
    const user = (await supabase.auth.getUser()).data.user;
    const { data, error } = await supabase
      .from('events')
      .insert({ ...event, user_id: user?.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update event
  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete event
  async delete(id: string) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// =====================================================
// TIMER/POMODORO SERVICE
// =====================================================

export const timerService = {
  // Start session
  async startSession(type: string, duration: number, taskDescription?: string) {
    const user = (await supabase.auth.getUser()).data.user;
    const { data, error } = await supabase
      .from('timer_sessions')
      .insert({
        user_id: user?.id,
        session_type: type,
        duration_minutes: duration,
        task_description: taskDescription,
        started_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // End session
  async endSession(id: string, completed: boolean, actualDuration: number) {
    const { data, error } = await supabase
      .from('timer_sessions')
      .update({
        completed,
        interrupted: !completed,
        actual_duration_minutes: actualDuration,
        ended_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get today's sessions
  async getTodaySessions() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('timer_sessions')
      .select('*')
      .gte('started_at', today)
      .order('started_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

// =====================================================
// DAILY STATS SERVICE
// =====================================================

export const statsService = {
  // Update daily stats
  async updateDailyStats(date: string) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    // Gather all stats for the day
    const [habits, todos, workouts, sleep, water] = await Promise.all([
      habitsService.getEntries(date, date),
      todosService.getAll(),
      workoutService.getStats(date, date),
      sleepService.getByDate(date),
      supabase.from('water_intake').select('amount_ml').eq('date', date).single()
    ]);

    const todayTodos = todos.filter((t: any) => t.due_date === date);
    const completedTodos = todayTodos.filter((t: any) => t.status === 'completed');

    const stats = {
      user_id: user.id,
      date,
      habits_completed: habits.filter((h: any) => h.completed).length,
      habits_total: habits.length,
      todos_completed: completedTodos.length,
      todos_total: todayTodos.length,
      workout_minutes: workouts.totalMinutes,
      calories_burned: workouts.totalCalories,
      water_ml: water?.data?.amount_ml || 0,
      sleep_hours: sleep?.total_hours || 0,
      sleep_quality: sleep?.sleep_quality || 0
    };

    const { data, error } = await supabase
      .from('daily_stats')
      .upsert(stats, { onConflict: 'user_id,date' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get stats for date range
  async getRange(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('daily_stats')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

// Export all services
export default {
  habits: habitsService,
  checklist: checklistService,
  sleep: sleepService,
  workout: workoutService,
  nutrition: nutritionService,
  todos: todosService,
  goals: goalsService,
  events: eventsService,
  timer: timerService,
  stats: statsService
};