export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string | null
                    name: string | null
                    join_date: string
                    is_premium: boolean
                    xp: number
                    level: number
                    role: 'user' | 'admin'
                    badges: string[]
                    daily_message_count: number
                    last_message_date: string | null
                    updated_at: string
                    last_active_at: string | null
                    avatar_url: string | null
                    current_streak: number
                    longest_streak: number
                    healing_moments: number
                }
                Insert: {
                    id: string
                    email?: string | null
                    name?: string | null
                    join_date?: string
                    is_premium?: boolean
                    xp?: number
                    level?: number
                    role?: 'user' | 'admin'
                    badges?: string[]
                    daily_message_count?: number
                    last_message_date?: string | null
                    updated_at?: string
                    last_active_at?: string | null
                    avatar_url?: string | null
                    current_streak?: number
                    longest_streak?: number
                    healing_moments?: number
                }
                Update: {
                    id?: string
                    email?: string | null
                    name?: string | null
                    join_date?: string
                    is_premium?: boolean
                    xp?: number
                    level?: number
                    role?: 'user' | 'admin'
                    badges?: string[]
                    daily_message_count?: number
                    last_message_date?: string | null
                    updated_at?: string
                    last_active_at?: string | null
                    avatar_url?: string | null
                    current_streak?: number
                    longest_streak?: number
                    healing_moments?: number
                }
            }
            favorites: {
                Row: {
                    id: string
                    user_id: string
                    symptom_name: string
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    symptom_name: string
                    description?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    symptom_name?: string
                    description?: string | null
                    created_at?: string
                }
            }
            routines: {
                Row: {
                    id: string
                    user_id: string
                    text: string
                    time: string
                    completed: boolean
                    category: 'meditation' | 'infusion' | 'movement' | 'spiritual' | 'general'
                    source: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    text: string
                    time: string
                    completed?: boolean
                    category: 'meditation' | 'infusion' | 'movement' | 'spiritual' | 'general'
                    source?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    text?: string
                    time?: string
                    completed?: boolean
                    category?: 'meditation' | 'infusion' | 'movement' | 'spiritual' | 'general'
                    source?: string | null
                    created_at?: string
                }
            }
            symptom_logs: {
                Row: {
                    id: string
                    user_id: string
                    date: string
                    intensity: number | null
                    duration: string | null
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    date: string
                    intensity?: number | null
                    duration?: string | null
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    date?: string
                    intensity?: number | null
                    duration?: string | null
                    notes?: string | null
                    created_at?: string
                }
            }
        }
    }
}
