export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cards: {
        Row: {
          cardId: string
          created_at: string | null
          encryption: string | null
          hash: string | null
          uid: string | null
        }
        Insert: {
          cardId: string
          created_at?: string | null
          encryption?: string | null
          hash?: string | null
          uid?: string | null
        }
        Update: {
          cardId?: string
          created_at?: string | null
          encryption?: string | null
          hash?: string | null
          uid?: string | null
        }
      }
      user_data: {
        Row: {
          created_at: string | null
          eua: boolean | null
          lastSync: string | null
          paid: boolean | null
          paidtime: string | null
          seedhash: string | null
          uid: string
        }
        Insert: {
          created_at?: string | null
          eua?: boolean | null
          lastSync?: string | null
          paid?: boolean | null
          paidtime?: string | null
          seedhash?: string | null
          uid: string
        }
        Update: {
          created_at?: string | null
          eua?: boolean | null
          lastSync?: string | null
          paid?: boolean | null
          paidtime?: string | null
          seedhash?: string | null
          uid?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
