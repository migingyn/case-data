export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      citations: {
        Row: {
          created_at: string
          document_id: number
          excerpt: string
          firm_id: number
          id: number
          page: number | null
        }
        Insert: {
          created_at?: string
          document_id: number
          excerpt: string
          firm_id: number
          id?: never
          page?: number | null
        }
        Update: {
          created_at?: string
          document_id?: number
          excerpt?: string
          firm_id?: number
          id?: never
          page?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "citations_document_id_firm_id_fkey"
            columns: ["document_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id", "firm_id"]
          },
        ]
      }
      client_contacts: {
        Row: {
          channel: string
          citation_id: number
          created_at: string
          firm_id: number
          id: number
          matter_id: number
          occurred_at: string
          staff_member_id: number | null
        }
        Insert: {
          channel: string
          citation_id: number
          created_at?: string
          firm_id: number
          id?: never
          matter_id: number
          occurred_at: string
          staff_member_id?: number | null
        }
        Update: {
          channel?: string
          citation_id?: number
          created_at?: string
          firm_id?: number
          id?: never
          matter_id?: number
          occurred_at?: string
          staff_member_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_contacts_citation_id_firm_id_fkey"
            columns: ["citation_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "citations"
            referencedColumns: ["id", "firm_id"]
          },
          {
            foreignKeyName: "client_contacts_matter_id_firm_id_fkey"
            columns: ["matter_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id", "firm_id"]
          },
          {
            foreignKeyName: "client_contacts_staff_member_id_firm_id_fkey"
            columns: ["staff_member_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "firm_members"
            referencedColumns: ["id", "firm_id"]
          },
        ]
      }
      clients: {
        Row: {
          clio_contact_id: string | null
          created_at: string
          firm_id: number
          full_name: string
          id: number
          photo_path: string | null
          updated_at: string
        }
        Insert: {
          clio_contact_id?: string | null
          created_at?: string
          firm_id: number
          full_name: string
          id?: never
          photo_path?: string | null
          updated_at?: string
        }
        Update: {
          clio_contact_id?: string | null
          created_at?: string
          firm_id?: number
          full_name?: string
          id?: never
          photo_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      costs: {
        Row: {
          amount: number
          citation_id: number
          created_at: string
          description: string
          firm_id: number
          id: number
          incurred_on: string
          matter_id: number
        }
        Insert: {
          amount: number
          citation_id: number
          created_at?: string
          description: string
          firm_id: number
          id?: never
          incurred_on: string
          matter_id: number
        }
        Update: {
          amount?: number
          citation_id?: number
          created_at?: string
          description?: string
          firm_id?: number
          id?: never
          incurred_on?: string
          matter_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "costs_citation_id_firm_id_fkey"
            columns: ["citation_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "citations"
            referencedColumns: ["id", "firm_id"]
          },
          {
            foreignKeyName: "costs_matter_id_firm_id_fkey"
            columns: ["matter_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id", "firm_id"]
          },
        ]
      }
      document_redactions: {
        Row: {
          created_at: string
          document_id: number
          firm_id: number
          height: number
          id: number
          page: number
          reason: string | null
          width: number
          x: number
          y: number
        }
        Insert: {
          created_at?: string
          document_id: number
          firm_id: number
          height: number
          id?: never
          page: number
          reason?: string | null
          width: number
          x: number
          y: number
        }
        Update: {
          created_at?: string
          document_id?: number
          firm_id?: number
          height?: number
          id?: never
          page?: number
          reason?: string | null
          width?: number
          x?: number
          y?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_redactions_document_id_firm_id_fkey"
            columns: ["document_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id", "firm_id"]
          },
        ]
      }
      documents: {
        Row: {
          author: string | null
          clio_document_id: string | null
          created_at: string
          document_date: string
          firm_id: number
          id: number
          kind: Database["public"]["Enums"]["source_kind"]
          matter_id: number
          page_count: number | null
          storage_path: string | null
          title: string
        }
        Insert: {
          author?: string | null
          clio_document_id?: string | null
          created_at?: string
          document_date: string
          firm_id: number
          id?: never
          kind: Database["public"]["Enums"]["source_kind"]
          matter_id: number
          page_count?: number | null
          storage_path?: string | null
          title: string
        }
        Update: {
          author?: string | null
          clio_document_id?: string | null
          created_at?: string
          document_date?: string
          firm_id?: number
          id?: never
          kind?: Database["public"]["Enums"]["source_kind"]
          matter_id?: number
          page_count?: number | null
          storage_path?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_matter_id_firm_id_fkey"
            columns: ["matter_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id", "firm_id"]
          },
        ]
      }
      firm_members: {
        Row: {
          clio_user_id: string | null
          created_at: string
          default_depth: Database["public"]["Enums"]["catch_up_depth"]
          display_name: string
          firm_id: number
          id: number
          last_visit_at: string | null
          role: Database["public"]["Enums"]["firm_role"]
          user_id: string
        }
        Insert: {
          clio_user_id?: string | null
          created_at?: string
          default_depth?: Database["public"]["Enums"]["catch_up_depth"]
          display_name: string
          firm_id: number
          id?: never
          last_visit_at?: string | null
          role?: Database["public"]["Enums"]["firm_role"]
          user_id: string
        }
        Update: {
          clio_user_id?: string | null
          created_at?: string
          default_depth?: Database["public"]["Enums"]["catch_up_depth"]
          display_name?: string
          firm_id?: number
          id?: never
          last_visit_at?: string | null
          role?: Database["public"]["Enums"]["firm_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "firm_members_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      firms: {
        Row: {
          clio_account_id: string | null
          created_at: string
          id: number
          name: string
        }
        Insert: {
          clio_account_id?: string | null
          created_at?: string
          id?: never
          name: string
        }
        Update: {
          clio_account_id?: string | null
          created_at?: string
          id?: never
          name?: string
        }
        Relationships: []
      }
      injuries: {
        Row: {
          citation_id: number
          created_at: string
          description: string
          firm_id: number
          id: number
          matter_id: number
          status: Database["public"]["Enums"]["injury_status"]
          updated_at: string
        }
        Insert: {
          citation_id: number
          created_at?: string
          description: string
          firm_id: number
          id?: never
          matter_id: number
          status: Database["public"]["Enums"]["injury_status"]
          updated_at?: string
        }
        Update: {
          citation_id?: number
          created_at?: string
          description?: string
          firm_id?: number
          id?: never
          matter_id?: number
          status?: Database["public"]["Enums"]["injury_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "injuries_citation_id_firm_id_fkey"
            columns: ["citation_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "citations"
            referencedColumns: ["id", "firm_id"]
          },
          {
            foreignKeyName: "injuries_matter_id_firm_id_fkey"
            columns: ["matter_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id", "firm_id"]
          },
        ]
      }
      matter_entries: {
        Row: {
          citation_id: number
          clio_id: string | null
          created_at: string
          firm_id: number
          id: number
          kind: Database["public"]["Enums"]["entry_kind"]
          matter_id: number
          occurred_at: string
          summary: string
        }
        Insert: {
          citation_id: number
          clio_id?: string | null
          created_at?: string
          firm_id: number
          id?: never
          kind: Database["public"]["Enums"]["entry_kind"]
          matter_id: number
          occurred_at: string
          summary: string
        }
        Update: {
          citation_id?: number
          clio_id?: string | null
          created_at?: string
          firm_id?: number
          id?: never
          kind?: Database["public"]["Enums"]["entry_kind"]
          matter_id?: number
          occurred_at?: string
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "matter_entries_citation_id_firm_id_fkey"
            columns: ["citation_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "citations"
            referencedColumns: ["id", "firm_id"]
          },
          {
            foreignKeyName: "matter_entries_matter_id_firm_id_fkey"
            columns: ["matter_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id", "firm_id"]
          },
        ]
      }
      matter_providers: {
        Row: {
          created_at: string
          firm_id: number
          id: number
          lien_type: string | null
          matter_id: number
          provider_id: number
        }
        Insert: {
          created_at?: string
          firm_id: number
          id?: never
          lien_type?: string | null
          matter_id: number
          provider_id: number
        }
        Update: {
          created_at?: string
          firm_id?: number
          id?: never
          lien_type?: string | null
          matter_id?: number
          provider_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "matter_providers_matter_id_firm_id_fkey"
            columns: ["matter_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id", "firm_id"]
          },
          {
            foreignKeyName: "matter_providers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      matter_summaries: {
        Row: {
          firm_id: number
          generated_at: string
          id: number
          input_hash: string | null
          matter_id: number
          model: string
          total_entries: number
        }
        Insert: {
          firm_id: number
          generated_at?: string
          id?: never
          input_hash?: string | null
          matter_id: number
          model: string
          total_entries: number
        }
        Update: {
          firm_id?: number
          generated_at?: string
          id?: never
          input_hash?: string | null
          matter_id?: number
          model?: string
          total_entries?: number
        }
        Relationships: [
          {
            foreignKeyName: "matter_summaries_matter_id_firm_id_fkey"
            columns: ["matter_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id", "firm_id"]
          },
        ]
      }
      matter_views: {
        Row: {
          last_opened_at: string
          matter_id: number
          member_id: number
        }
        Insert: {
          last_opened_at?: string
          matter_id: number
          member_id: number
        }
        Update: {
          last_opened_at?: string
          matter_id?: number
          member_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "matter_views_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_views_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "firm_members"
            referencedColumns: ["id"]
          },
        ]
      }
      matters: {
        Row: {
          case_type: string
          client_id: number
          clio_matter_id: string
          created_at: string
          firm_id: number
          id: number
          last_synced_at: string | null
          lead_attorney_id: number | null
          lead_attorney_name: string | null
          opened_on: string
          paused_reason: string | null
          source_url: string
          stage: Database["public"]["Enums"]["matter_stage"]
          updated_at: string
        }
        Insert: {
          case_type: string
          client_id: number
          clio_matter_id: string
          created_at?: string
          firm_id: number
          id?: never
          last_synced_at?: string | null
          lead_attorney_id?: number | null
          lead_attorney_name?: string | null
          opened_on: string
          paused_reason?: string | null
          source_url: string
          stage: Database["public"]["Enums"]["matter_stage"]
          updated_at?: string
        }
        Update: {
          case_type?: string
          client_id?: number
          clio_matter_id?: string
          created_at?: string
          firm_id?: number
          id?: never
          last_synced_at?: string | null
          lead_attorney_id?: number | null
          lead_attorney_name?: string | null
          opened_on?: string
          paused_reason?: string | null
          source_url?: string
          stage?: Database["public"]["Enums"]["matter_stage"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matters_client_id_firm_id_fkey"
            columns: ["client_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id", "firm_id"]
          },
          {
            foreignKeyName: "matters_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matters_lead_attorney_id_firm_id_fkey"
            columns: ["lead_attorney_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "firm_members"
            referencedColumns: ["id", "firm_id"]
          },
        ]
      }
      milestones: {
        Row: {
          expected_at: string | null
          firm_id: number
          id: number
          label: string
          matter_id: number
          position: number
          reached_at: string | null
        }
        Insert: {
          expected_at?: string | null
          firm_id: number
          id?: never
          label: string
          matter_id: number
          position: number
          reached_at?: string | null
        }
        Update: {
          expected_at?: string | null
          firm_id?: number
          id?: never
          label?: string
          matter_id?: number
          position?: number
          reached_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_matter_id_firm_id_fkey"
            columns: ["matter_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id", "firm_id"]
          },
        ]
      }
      policies: {
        Row: {
          carrier: string
          citation_id: number
          created_at: string
          firm_id: number
          id: number
          limit_amount: number
          matter_id: number
          policy_type: string
          verified_at: string
        }
        Insert: {
          carrier: string
          citation_id: number
          created_at?: string
          firm_id: number
          id?: never
          limit_amount: number
          matter_id: number
          policy_type: string
          verified_at: string
        }
        Update: {
          carrier?: string
          citation_id?: number
          created_at?: string
          firm_id?: number
          id?: never
          limit_amount?: number
          matter_id?: number
          policy_type?: string
          verified_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "policies_citation_id_firm_id_fkey"
            columns: ["citation_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "citations"
            referencedColumns: ["id", "firm_id"]
          },
          {
            foreignKeyName: "policies_matter_id_firm_id_fkey"
            columns: ["matter_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id", "firm_id"]
          },
        ]
      }
      provider_notify_prefs: {
        Row: {
          milestone: boolean
          provider_user_id: number
          request: boolean
          share_id: number
          status: boolean
          updated_at: string
        }
        Insert: {
          milestone?: boolean
          provider_user_id: number
          request?: boolean
          share_id: number
          status?: boolean
          updated_at?: string
        }
        Update: {
          milestone?: boolean
          provider_user_id?: number
          request?: boolean
          share_id?: number
          status?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_notify_prefs_provider_user_id_fkey"
            columns: ["provider_user_id"]
            isOneToOne: false
            referencedRelation: "provider_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_notify_prefs_share_id_fkey"
            columns: ["share_id"]
            isOneToOne: false
            referencedRelation: "shares"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_requests: {
        Row: {
          created_at: string
          due_at: string
          firm_id: number
          fulfilled_at: string | null
          id: number
          matter_id: number
          provider_id: number
          requested_at: string
          title: string
        }
        Insert: {
          created_at?: string
          due_at: string
          firm_id: number
          fulfilled_at?: string | null
          id?: never
          matter_id: number
          provider_id: number
          requested_at?: string
          title: string
        }
        Update: {
          created_at?: string
          due_at?: string
          firm_id?: number
          fulfilled_at?: string | null
          id?: never
          matter_id?: number
          provider_id?: number
          requested_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_requests_matter_id_firm_id_fkey"
            columns: ["matter_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id", "firm_id"]
          },
          {
            foreignKeyName: "provider_requests_matter_id_provider_id_fkey"
            columns: ["matter_id", "provider_id"]
            isOneToOne: false
            referencedRelation: "matter_providers"
            referencedColumns: ["matter_id", "provider_id"]
          },
        ]
      }
      provider_users: {
        Row: {
          created_at: string
          display_name: string
          id: number
          provider_id: number
          role_title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: never
          provider_id: number
          role_title: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: never
          provider_id?: number
          role_title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_users_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          created_at: string
          id: number
          name: string
          source_key: string | null
          specialty: string
        }
        Insert: {
          created_at?: string
          id?: never
          name: string
          source_key?: string | null
          specialty: string
        }
        Update: {
          created_at?: string
          id?: never
          name?: string
          source_key?: string | null
          specialty?: string
        }
        Relationships: []
      }
      share_drafts: {
        Row: {
          firm_id: number
          settings: Json
          share_id: number
          updated_at: string
        }
        Insert: {
          firm_id: number
          settings: Json
          share_id: number
          updated_at?: string
        }
        Update: {
          firm_id?: number
          settings?: Json
          share_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "share_drafts_share_id_firm_id_fkey"
            columns: ["share_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "shares"
            referencedColumns: ["id", "firm_id"]
          },
        ]
      }
      share_events: {
        Row: {
          actor_user_id: string
          id: number
          kind: Database["public"]["Enums"]["share_event_kind"]
          occurred_at: string
          share_id: number
          version: number
        }
        Insert: {
          actor_user_id?: string
          id?: never
          kind: Database["public"]["Enums"]["share_event_kind"]
          occurred_at?: string
          share_id: number
          version: number
        }
        Update: {
          actor_user_id?: string
          id?: never
          kind?: Database["public"]["Enums"]["share_event_kind"]
          occurred_at?: string
          share_id?: number
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "share_events_share_id_fkey"
            columns: ["share_id"]
            isOneToOne: false
            referencedRelation: "shares"
            referencedColumns: ["id"]
          },
        ]
      }
      share_section_views: {
        Row: {
          provider_user_id: number
          section: Database["public"]["Enums"]["provider_section"]
          share_id: number
          version: number
          viewed_at: string
        }
        Insert: {
          provider_user_id: number
          section: Database["public"]["Enums"]["provider_section"]
          share_id: number
          version: number
          viewed_at?: string
        }
        Update: {
          provider_user_id?: number
          section?: Database["public"]["Enums"]["provider_section"]
          share_id?: number
          version?: number
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "share_section_views_provider_user_id_fkey"
            columns: ["provider_user_id"]
            isOneToOne: false
            referencedRelation: "provider_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "share_section_views_share_id_fkey"
            columns: ["share_id"]
            isOneToOne: false
            referencedRelation: "shares"
            referencedColumns: ["id"]
          },
        ]
      }
      share_version_recipients: {
        Row: {
          provider_user_id: number
          share_version_id: number
        }
        Insert: {
          provider_user_id: number
          share_version_id: number
        }
        Update: {
          provider_user_id?: number
          share_version_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "share_version_recipients_provider_user_id_fkey"
            columns: ["provider_user_id"]
            isOneToOne: false
            referencedRelation: "provider_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "share_version_recipients_share_version_id_fkey"
            columns: ["share_version_id"]
            isOneToOne: false
            referencedRelation: "share_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      share_versions: {
        Row: {
          expires_at: string
          firm_id: number
          id: number
          published_at: string
          published_by: number
          settings: Json
          share_id: number
          version: number
          view: Json
        }
        Insert: {
          expires_at: string
          firm_id: number
          id?: never
          published_at?: string
          published_by: number
          settings: Json
          share_id: number
          version: number
          view: Json
        }
        Update: {
          expires_at?: string
          firm_id?: number
          id?: never
          published_at?: string
          published_by?: number
          settings?: Json
          share_id?: number
          version?: number
          view?: Json
        }
        Relationships: [
          {
            foreignKeyName: "share_versions_published_by_firm_id_fkey"
            columns: ["published_by", "firm_id"]
            isOneToOne: false
            referencedRelation: "firm_members"
            referencedColumns: ["id", "firm_id"]
          },
          {
            foreignKeyName: "share_versions_share_id_firm_id_fkey"
            columns: ["share_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "shares"
            referencedColumns: ["id", "firm_id"]
          },
        ]
      }
      shares: {
        Row: {
          created_at: string
          current_version: number | null
          expires_at: string | null
          firm_id: number
          id: number
          matter_id: number
          provider_id: number
          revoked_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_version?: number | null
          expires_at?: string | null
          firm_id: number
          id?: never
          matter_id: number
          provider_id: number
          revoked_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_version?: number | null
          expires_at?: string | null
          firm_id?: number
          id?: never
          matter_id?: number
          provider_id?: number
          revoked_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shares_matter_id_firm_id_fkey"
            columns: ["matter_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id", "firm_id"]
          },
          {
            foreignKeyName: "shares_matter_id_provider_id_fkey"
            columns: ["matter_id", "provider_id"]
            isOneToOne: true
            referencedRelation: "matter_providers"
            referencedColumns: ["matter_id", "provider_id"]
          },
        ]
      }
      summary_ranked_entries: {
        Row: {
          entry_id: number
          firm_id: number
          id: number
          rank: number
          reason: string
          summary_id: number
          title: string
        }
        Insert: {
          entry_id: number
          firm_id: number
          id?: never
          rank: number
          reason: string
          summary_id: number
          title: string
        }
        Update: {
          entry_id?: number
          firm_id?: number
          id?: never
          rank?: number
          reason?: string
          summary_id?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "summary_ranked_entries_entry_id_firm_id_fkey"
            columns: ["entry_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "matter_entries"
            referencedColumns: ["id", "firm_id"]
          },
          {
            foreignKeyName: "summary_ranked_entries_summary_id_firm_id_fkey"
            columns: ["summary_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "matter_summaries"
            referencedColumns: ["id", "firm_id"]
          },
        ]
      }
      summary_sentences: {
        Row: {
          block: Database["public"]["Enums"]["summary_block"]
          citation_id: number | null
          firm_id: number
          id: number
          position: number
          summary_id: number
          text: string
        }
        Insert: {
          block: Database["public"]["Enums"]["summary_block"]
          citation_id?: number | null
          firm_id: number
          id?: never
          position: number
          summary_id: number
          text: string
        }
        Update: {
          block?: Database["public"]["Enums"]["summary_block"]
          citation_id?: number | null
          firm_id?: number
          id?: never
          position?: number
          summary_id?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "summary_sentences_citation_id_firm_id_fkey"
            columns: ["citation_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "citations"
            referencedColumns: ["id", "firm_id"]
          },
          {
            foreignKeyName: "summary_sentences_summary_id_firm_id_fkey"
            columns: ["summary_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "matter_summaries"
            referencedColumns: ["id", "firm_id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: number | null
          citation_id: number
          clio_task_id: string | null
          completed_at: string | null
          created_at: string
          due_at: string
          firm_id: number
          id: number
          matter_id: number
          title: string
          updated_at: string
          waiting_on: string | null
        }
        Insert: {
          assignee_id?: number | null
          citation_id: number
          clio_task_id?: string | null
          completed_at?: string | null
          created_at?: string
          due_at: string
          firm_id: number
          id?: never
          matter_id: number
          title: string
          updated_at?: string
          waiting_on?: string | null
        }
        Update: {
          assignee_id?: number | null
          citation_id?: number
          clio_task_id?: string | null
          completed_at?: string | null
          created_at?: string
          due_at?: string
          firm_id?: number
          id?: never
          matter_id?: number
          title?: string
          updated_at?: string
          waiting_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_firm_id_fkey"
            columns: ["assignee_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "firm_members"
            referencedColumns: ["id", "firm_id"]
          },
          {
            foreignKeyName: "tasks_citation_id_firm_id_fkey"
            columns: ["citation_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "citations"
            referencedColumns: ["id", "firm_id"]
          },
          {
            foreignKeyName: "tasks_matter_id_firm_id_fkey"
            columns: ["matter_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id", "firm_id"]
          },
        ]
      }
      valuations: {
        Row: {
          citation_id: number
          created_at: string
          expected_amount: number
          firm_id: number
          high_amount: number
          id: number
          low_amount: number
          matter_id: number
          valued_at: string
        }
        Insert: {
          citation_id: number
          created_at?: string
          expected_amount: number
          firm_id: number
          high_amount: number
          id?: never
          low_amount: number
          matter_id: number
          valued_at: string
        }
        Update: {
          citation_id?: number
          created_at?: string
          expected_amount?: number
          firm_id?: number
          high_amount?: number
          id?: never
          low_amount?: number
          matter_id?: number
          valued_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "valuations_citation_id_firm_id_fkey"
            columns: ["citation_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "citations"
            referencedColumns: ["id", "firm_id"]
          },
          {
            foreignKeyName: "valuations_matter_id_firm_id_fkey"
            columns: ["matter_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id", "firm_id"]
          },
        ]
      }
      visits: {
        Row: {
          citation_id: number | null
          created_at: string
          firm_id: number
          id: number
          matter_id: number
          provider_id: number
          status: Database["public"]["Enums"]["visit_status"]
          visit_at: string
        }
        Insert: {
          citation_id?: number | null
          created_at?: string
          firm_id: number
          id?: never
          matter_id: number
          provider_id: number
          status: Database["public"]["Enums"]["visit_status"]
          visit_at: string
        }
        Update: {
          citation_id?: number | null
          created_at?: string
          firm_id?: number
          id?: never
          matter_id?: number
          provider_id?: number
          status?: Database["public"]["Enums"]["visit_status"]
          visit_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_citation_id_firm_id_fkey"
            columns: ["citation_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "citations"
            referencedColumns: ["id", "firm_id"]
          },
          {
            foreignKeyName: "visits_matter_id_firm_id_fkey"
            columns: ["matter_id", "firm_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id", "firm_id"]
          },
          {
            foreignKeyName: "visits_matter_id_provider_id_fkey"
            columns: ["matter_id", "provider_id"]
            isOneToOne: false
            referencedRelation: "matter_providers"
            referencedColumns: ["matter_id", "provider_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      publish_share: {
        Args: {
          expires_at: string
          recipient_ids: number[]
          settings: Json
          target_share_id: number
          view: Json
        }
        Returns: {
          expires_at: string
          firm_id: number
          id: number
          published_at: string
          published_by: number
          settings: Json
          share_id: number
          version: number
          view: Json
        }
        SetofOptions: {
          from: "*"
          to: "share_versions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      catch_up_depth: "brief" | "full"
      entry_kind:
        | "offer"
        | "court_date"
        | "client_message"
        | "provider_reply"
        | "document"
        | "email"
        | "note"
      firm_role: "attorney" | "case_manager" | "staff" | "admin"
      injury_status: "confirmed" | "proposed"
      matter_stage:
        | "intake"
        | "treatment"
        | "demand"
        | "negotiation"
        | "litigation"
        | "settled"
      provider_section:
        | "coverage"
        | "milestones"
        | "requests"
        | "treatment"
        | "documents"
        | "summary"
      share_event_kind: "published" | "opened" | "revoked"
      source_kind:
        | "letter"
        | "email"
        | "note"
        | "medical_record"
        | "bill"
        | "policy"
        | "filing"
        | "call_log"
        | "ledger"
        | "intake_form"
        | "task"
        | "message"
        | "memo"
        | "report"
      summary_block:
        | "where_it_stands"
        | "what_is_next"
        | "watch_for"
        | "provider"
      visit_status: "attended" | "missed" | "scheduled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      catch_up_depth: ["brief", "full"],
      entry_kind: [
        "offer",
        "court_date",
        "client_message",
        "provider_reply",
        "document",
        "email",
        "note",
      ],
      firm_role: ["attorney", "case_manager", "staff", "admin"],
      injury_status: ["confirmed", "proposed"],
      matter_stage: [
        "intake",
        "treatment",
        "demand",
        "negotiation",
        "litigation",
        "settled",
      ],
      provider_section: [
        "coverage",
        "milestones",
        "requests",
        "treatment",
        "documents",
        "summary",
      ],
      share_event_kind: ["published", "opened", "revoked"],
      source_kind: [
        "letter",
        "email",
        "note",
        "medical_record",
        "bill",
        "policy",
        "filing",
        "call_log",
        "ledger",
        "intake_form",
        "task",
        "message",
        "memo",
        "report",
      ],
      summary_block: [
        "where_it_stands",
        "what_is_next",
        "watch_for",
        "provider",
      ],
      visit_status: ["attended", "missed", "scheduled"],
    },
  },
} as const
