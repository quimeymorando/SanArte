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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      symptom_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          symptom_name: string | null
          intensity: number | null
          duration: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          symptom_name?: string | null
          intensity?: number | null
          duration?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          symptom_name?: string | null
          intensity?: number | null
          duration?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      intentions: {
        Row: {
          id: string
          user_id: string | null
          author_name: string | null
          text: string
          candles: number
          loves: number
          theme: 'healing' | 'gratitude' | 'release' | 'feedback' | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          author_name?: string | null
          text: string
          candles?: number
          loves?: number
          theme?: 'healing' | 'gratitude' | 'release' | 'feedback' | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          author_name?: string | null
          text?: string
          candles?: number
          loves?: number
          theme?: 'healing' | 'gratitude' | 'release' | 'feedback' | null
          created_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          intention_id: string
          user_id: string
          author_name: string | null
          text: string
          created_at: string
        }
        Insert: {
          id?: string
          intention_id: string
          user_id: string
          author_name?: string | null
          text: string
          created_at?: string
        }
        Update: {
          id?: string
          intention_id?: string
          user_id?: string
          author_name?: string | null
          text?: string
          created_at?: string
        }
        Relationships: []
      }
      search_cache: {
        Row: {
          query: string
          results: Json
          created_at: string
        }
        Insert: {
          query: string
          results: Json
          created_at?: string
        }
        Update: {
          query?: string
          results?: Json
          created_at?: string
        }
        Relationships: []
      }
      symptom_cache: {
        Row: {
          slug: string
          name: string
          data: Json
          created_at: string
        }
        Insert: {
          slug: string
          name: string
          data: Json
          created_at?: string
        }
        Update: {
          slug?: string
          name?: string
          data?: Json
          created_at?: string
        }
        Relationships: []
      }
      symptom_catalog: {
        Row: {
          slug: string
          content: Json
          updated_at: string
        }
        Insert: {
          slug: string
          content: Json
          updated_at?: string
        }
        Update: {
          slug?: string
          content?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
