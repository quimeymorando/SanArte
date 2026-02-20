import { supabase } from '../supabaseClient';
import { Routine, SymptomDetail } from '../types';
import { Database } from '../types_db';
import { authService } from './authService';

type RoutineInsert = Database['public']['Tables']['routines']['Insert'];

export const INITIAL_ROUTINES: Routine[] = [
  { id: '1', text: 'Beber agua al despertar', time: '07:00', completed: false, category: 'general' },
  { id: '2', text: 'Respiración consciente (4-7-8)', time: '07:15', completed: false, category: 'meditation' },
  { id: '3', text: 'Agradecer por 3 cosas', time: '21:00', completed: false, category: 'spiritual' }
];

export const sendNotification = (title: string, body: string) => {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: '/favicon.ico' });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") new Notification(title, { body, icon: '/favicon.ico' });
    });
  }
};

export const getStoredRoutines = async (): Promise<Routine[]> => {
  const { data } = await supabase
    .from('routines')
    .select('*')
    .order('created_at', { ascending: true });

  return (data as Routine[]) || [];
};

export const toggleRoutine = async (id: string, currentCompleted: boolean): Promise<{ success: boolean, xpEarned: number }> => {
  const { error } = await supabase
    .from('routines')
    .update({ completed: !currentCompleted })
    .eq('id', id);

  if (error) {
    console.error("Error toggling routine:", error);
    return { success: false, xpEarned: 0 };
  }

  return { success: true, xpEarned: !currentCompleted ? 10 : 0 };
};

export const deleteRoutine = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('routines')
    .delete()
    .eq('id', id);

  return !error;
};

export const addFromSymptom = async (symptom: SymptomDetail): Promise<boolean> => {
  const user = await authService.getUser();
  if (!user) return false;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  const tasks: Partial<Routine>[] = [];

  // Parsing Rutina Integral Markdown
  if (symptom.rutina_integral) {
    const lines = symptom.rutina_integral.split('\n');
    const actionItems = lines.filter(line =>
      line.trim().match(/^(\*|-|\d+\.)\s/) // Matches "* ", "- ", "1. "
    );

    if (actionItems.length > 0) {
      actionItems.forEach((item, index) => {
        // Clean markdown syntax (*, **, 1.)
        const cleanText = item
          .replace(/^(\*|-|\d+\.)\s/, '') // Remove bullet
          .replace(/\*\*/g, '')           // Remove bold
          .trim();

        tasks.push({
          text: cleanText,
          time: 'Flexible',
          category: 'general'
        });
      });
    } else {
      // Fallback if formatting is weird
      tasks.push({
        text: `Practicar: ${symptom.name}`,
        time: 'Flexible',
        category: 'general'
      });
    }
  } else {
    // Fallback
    tasks.push({
      text: `Reflexionar sobre: ${symptom.name}`,
      time: 'Flexible',
      category: 'spiritual'
    });
  }

  // Add all created tasks
  const newTasks: RoutineInsert[] = tasks.map(t => ({
    user_id: session.user.id,
    text: t.text || `Practicar: ${symptom.name}`,
    time: t.time || 'Flexible',
    completed: false,
    category: t.category || 'general',
    source: symptom.name
  }));

  const { error } = await supabase.from('routines').insert(newTasks);
  return !error;
};

export const updateStreak = (): number => {
  // Streak logic can remain local or verify vs last_message_date, 
  // but for now let's keep it mostly local or stubbed since DB profiles has daily_message_count but not explicit streak.
  // Implementation of streak in DB requires more schema changes. 
  // We can leave this as LocalStorage for UI purposes or ignore it for strict cloud sync.
  // Let's keep it "Legacy" local storage for now to avoid breaking too much.

  const STREAK_KEY = 'sanarte_streak_count';
  const LAST_VISIT_KEY = 'sanarte_last_visit';

  const today = new Date().toDateString();
  const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
  let currentStreak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);

  if (lastVisit === today) {
    return currentStreak;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastVisit === yesterday.toDateString()) {
    currentStreak++;
  } else {
    currentStreak = 1;
  }

  localStorage.setItem(LAST_VISIT_KEY, today);
  localStorage.setItem(STREAK_KEY, currentStreak.toString());

  return currentStreak;
};
