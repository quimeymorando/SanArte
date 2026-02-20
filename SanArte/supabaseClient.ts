
import { createClient } from '@supabase/supabase-js';
import { Database } from './types_db';

// Estas variables deben estar en tu archivo .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('⚠️ ALERTA: Faltan las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env.local');
}

export const supabase = createClient<Database>(supabaseUrl || '', supabaseAnonKey || '', {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
    },
});
