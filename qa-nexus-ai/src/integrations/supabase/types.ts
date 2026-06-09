export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          status: 'Not Started' | 'In Progress' | 'Under Review' | 'Completed'
          priority: 'Critical' | 'High' | 'Medium' | 'Low'
          total_story_points: number
          remaining_story_points: number
          start_date: string | null
          target_date: string | null
          created_at: string
          tags: string[] | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          status?: 'Not Started' | 'In Progress' | 'Under Review' | 'Completed'
          priority?: 'Critical' | 'High' | 'Medium' | 'Low'
          total_story_points?: number
          remaining_story_points?: number
          start_date?: string | null
          target_date?: string | null
          created_at?: string
          tags?: string[] | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          status?: 'Not Started' | 'In Progress' | 'Under Review' | 'Completed'
          priority?: 'Critical' | 'High' | 'Medium' | 'Low'
          total_story_points?: number
          remaining_story_points?: number
          start_date?: string | null
          target_date?: string | null
          created_at?: string
          tags?: string[] | null
        }
        Relationships: []
      }
      test_suites: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      test_cases: {
        Row: {
          id: string
          suite_id: string
          title: string
          steps: string[]
          expected_result: string
          automation_status: 'Manual' | 'Automated'
          priority: 'Critical' | 'High' | 'Medium' | 'Low'
          generated_code: string | null
          created_at: string
        }
        Insert: {
          id?: string
          suite_id: string
          title: string
          steps?: string[]
          expected_result: string
          automation_status?: 'Manual' | 'Automated'
          priority?: 'Critical' | 'High' | 'Medium' | 'Low'
          generated_code?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          suite_id?: string
          title?: string
          steps?: string[]
          expected_result?: string
          automation_status?: 'Manual' | 'Automated'
          priority?: 'Critical' | 'High' | 'Medium' | 'Low'
          generated_code?: string | null
          created_at?: string
        }
        Relationships: []
      }
      activity_log: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          action: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          action: string
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          action?: string
          description?: string
          created_at?: string
        }
        Relationships: []
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
