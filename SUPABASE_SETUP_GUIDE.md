# 🚀 SUPABASE SETUP GUIDE FOR LIFETRACKER

## ⏱️ Total Setup Time: ~10 minutes

## Step 1: Create Supabase Account (2 min)
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

## Step 2: Create New Project (3 min)
1. Click "New Project"
2. Fill in:
   - **Name**: LifeTracker
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to you
3. Click "Create new project"
4. Wait ~2 minutes for project to initialize

## Step 3: Run Database Schema (2 min)
1. In your Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy ALL content from `/supabase/schema.sql`
4. Paste into the SQL editor
5. Click **Run** (or press F5)
6. You should see "Success. No rows returned"

## Step 4: Get Your API Keys (1 min)
1. Click **Settings** (gear icon) in left sidebar
2. Click **API** under Project Settings
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)

## Step 5: Configure Your App (2 min)

### In Replit:
1. Create a new file called `.env` in your root directory
2. Add your keys:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
3. Replace with YOUR actual values from Step 4

### Local Development:
1. Copy `.env.example` to `.env`
2. Add your actual keys

## Step 6: Install Supabase Client (1 min)
In your terminal:
```bash
npm install @supabase/supabase-js
```

## Step 7: Test the Connection
Add this test code to any component:
```javascript
import { supabase } from '@/lib/supabase';

// Test connection
const testConnection = async () => {
  const { data, error } = await supabase
    .from('habits')
    .select('count');
  
  if (error) {
    console.error('Connection failed:', error);
  } else {
    console.log('✅ Supabase connected!');
  }
};
```

## 🎉 YOU'RE DONE!

## What You Now Have:
- ✅ **Complete database** for ALL LifeTracker features
- ✅ **User authentication** built-in
- ✅ **Row Level Security** (users only see their own data)
- ✅ **Real-time subscriptions** ready
- ✅ **Auto-updating timestamps**
- ✅ **Indexed for performance**

## Database Tables Created:
- `profiles` - User profiles
- `habits` - Habit definitions
- `habit_entries` - Daily habit logs
- `daily_checklist` - Simple daily tasks
- `checklist_completions` - Checklist tracking
- `sleep_entries` - Sleep tracking
- `workouts` - Gym sessions
- `exercises` - Workout exercises
- `meals` - Nutrition tracking
- `water_intake` - Hydration tracking
- `goals` - Goal management
- `todos` - Task management
- `events` - Calendar events
- `timer_sessions` - Pomodoro tracking
- `daily_stats` - Analytics data
- `content_items` - Watchlist/reading list
- `weekly_plans` - Weekly planning
- `daily_plans` - Daily planning

## Using the Database in Your App:

### Example: Save a Habit
```javascript
import db from '@/services/database';

// Create a new habit
const newHabit = await db.habits.create({
  name: "Drink Water",
  category: "health",
  tracking_type: "numeric",
  target_value: 8,
  unit: "glasses"
});

// Log today's progress
await db.habits.logEntry(newHabit.id, 5, '2024-01-20', false);
```

### Example: Track Sleep
```javascript
// Log last night's sleep
await db.sleep.upsert({
  date: '2024-01-20',
  bedtime: '23:00',
  wake_time: '07:00',
  total_hours: 8,
  sleep_quality: 8
});
```

### Example: Create Todo
```javascript
await db.todos.create({
  title: "Review PRs",
  priority: "high",
  due_date: '2024-01-20'
});
```

## Authentication Setup:

### Sign Up New User
```javascript
import { signUp } from '@/lib/supabase';

const { data, error } = await signUp(email, password);
```

### Sign In
```javascript
import { signIn } from '@/lib/supabase';

const { data, error } = await signIn(email, password);
```

### Get Current User
```javascript
import { getCurrentUser } from '@/lib/supabase';

const user = await getCurrentUser();
```

## Troubleshooting:

### "Connection failed" error
- Check your `.env` file has correct keys
- Make sure keys are prefixed with `VITE_`
- Restart your dev server after adding `.env`

### "Permission denied" error
- User needs to be logged in
- Check Row Level Security policies in Supabase dashboard

### "Relation does not exist" error
- Run the schema.sql file again
- Make sure ALL of it was pasted and run

## Next Steps:
1. **Add Authentication UI** - Create login/signup pages
2. **Replace Mock Data** - Update components to use real database
3. **Enable Realtime** - Subscribe to live updates
4. **Add Data Validation** - Ensure data integrity

## Resources:
- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🎯 Your LifeTracker app is now powered by a professional database!