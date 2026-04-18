import { supabase } from '../supabaseClient';
import { Routine, SymptomDetail } from '../types';
import { logger } from '../utils/logger';
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('routines')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  return (data as Routine[]) || [];
};

export const toggleRoutine = async (id: string, currentCompleted: boolean): Promise<{ success: boolean, xpEarned: number }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, xpEarned: 0 };

  const { error } = await supabase
    .from('routines')
    .update({ completed: !currentCompleted })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    logger.error("Error toggling routine:", error);
    return { success: false, xpEarned: 0 };
  }

  return { success: true, xpEarned: !currentCompleted ? 10 : 0 };
};

export const deleteRoutine = async (id: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('routines')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

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

