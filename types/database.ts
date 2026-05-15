// Generated from Supabase project fnevubaewpmbsbokonaj — do not hand-edit the Database type.
// Row/Insert/Update aliases at the bottom provide backward-compatible named types.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Tells supabase-js which Postgrest type version to use
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_memory: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          session_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          session_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_memory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          images: string[]
          is_active: boolean
          lat: number | null
          lng: number | null
          name: string
          owner_id: string
          phone: string | null
          tags: string[]
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          name: string
          owner_id: string
          phone?: string | null
          tags?: string[]
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          name?: string
          owner_id?: string
          phone?: string | null
          tags?: string[]
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string | null
          category: string
          created_at: string
          description: string | null
          event_date: string
          id: string
          images: string[]
          is_active: boolean
          lat: number | null
          lng: number | null
          max_attendees: number | null
          price: number
          producer_id: string
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          category: string
          created_at?: string
          description?: string | null
          event_date: string
          id?: string
          images?: string[]
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          max_attendees?: number | null
          price?: number
          producer_id: string
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          category?: string
          created_at?: string
          description?: string | null
          event_date?: string
          id?: string
          images?: string[]
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          max_attendees?: number | null
          price?: number
          producer_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      itineraries: {
        Row: {
          id: string
          user_id: string
          title: string
          tagline: string | null
          days_count: number
          interests: string[]
          diet: string
          style: string
          data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          tagline?: string | null
          days_count?: number
          interests?: string[]
          diet?: string
          style?: string
          data: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          tagline?: string | null
          days_count?: number
          interests?: string[]
          diet?: string
          style?: string
          data?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "itineraries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_edges: {
        Row: {
          created_at: string
          from_node: string
          relationship: string
          to_node: string
          weight: number
        }
        Insert: {
          created_at?: string
          from_node: string
          relationship: string
          to_node: string
          weight: number
        }
        Update: {
          created_at?: string
          from_node?: string
          relationship?: string
          to_node?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_edges_from_node_fkey"
            columns: ["from_node"]
            isOneToOne: false
            referencedRelation: "knowledge_nodes"
            referencedColumns: ["label"]
          },
          {
            foreignKeyName: "knowledge_edges_to_node_fkey"
            columns: ["to_node"]
            isOneToOne: false
            referencedRelation: "knowledge_nodes"
            referencedColumns: ["label"]
          },
        ]
      }
      knowledge_nodes: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          label: string
          source_citations: string[]
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          label: string
          source_citations?: string[]
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          label?: string
          source_citations?: string[]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          language: string
          last_seen_at: string | null
          location_lat: number | null
          location_lng: number | null
          name: string | null
          preferences: Json | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          language?: string
          last_seen_at?: string | null
          location_lat?: number | null
          location_lng?: number | null
          name?: string | null
          preferences?: Json | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          last_seen_at?: string | null
          location_lat?: number | null
          location_lng?: number | null
          name?: string | null
          preferences?: Json | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          entity_id: string
          entity_type: string
          expires_at: string
          generated_at: string
          id: string
          reason: string | null
          score: number
          source: string
          user_id: string
        }
        Insert: {
          entity_id: string
          entity_type: string
          expires_at: string
          generated_at?: string
          id?: string
          reason?: string | null
          score: number
          source?: string
          user_id: string
        }
        Update: {
          entity_id?: string
          entity_type?: string
          expires_at?: string
          generated_at?: string
          id?: string
          reason?: string | null
          score?: number
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interactions: {
        Row: {
          action: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          session_location: Json | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          session_location?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          session_location?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          locale: string | null
          source: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          locale?: string | null
          source?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          locale?: string | null
          source?: string
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {
      get_waitlist_count: { Args: Record<string, never>; Returns: number }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {}
    CompositeTypes: {}
  }
}

// ─── Backward-compatible named type aliases ────────────────────────────────

export type ProfileRow = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type BusinessRow = Database['public']['Tables']['businesses']['Row']
export type BusinessInsert = Database['public']['Tables']['businesses']['Insert']
export type BusinessUpdate = Database['public']['Tables']['businesses']['Update']

export type EventRow = Database['public']['Tables']['events']['Row']
export type EventInsert = Database['public']['Tables']['events']['Insert']
export type EventUpdate = Database['public']['Tables']['events']['Update']

export type UserInteractionRow = Database['public']['Tables']['user_interactions']['Row']
export type UserInteractionInsert = Database['public']['Tables']['user_interactions']['Insert']
export type UserInteractionUpdate = Database['public']['Tables']['user_interactions']['Update']

export type RecommendationRow = Database['public']['Tables']['recommendations']['Row']
export type RecommendationInsert = Database['public']['Tables']['recommendations']['Insert']
export type RecommendationUpdate = Database['public']['Tables']['recommendations']['Update']

export type AiMemoryRow = Database['public']['Tables']['ai_memory']['Row']
export type AiMemoryInsert = Database['public']['Tables']['ai_memory']['Insert']
export type AiMemoryUpdate = Database['public']['Tables']['ai_memory']['Update']

export type KnowledgeNodeRow = Database['public']['Tables']['knowledge_nodes']['Row']
export type KnowledgeNodeInsert = Database['public']['Tables']['knowledge_nodes']['Insert']
export type KnowledgeNodeUpdate = Database['public']['Tables']['knowledge_nodes']['Update']

export type KnowledgeEdgeRow = Database['public']['Tables']['knowledge_edges']['Row']
export type KnowledgeEdgeInsert = Database['public']['Tables']['knowledge_edges']['Insert']
export type KnowledgeEdgeUpdate = Database['public']['Tables']['knowledge_edges']['Update']
