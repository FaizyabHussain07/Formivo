/**
 * Hand-written Supabase `Database` type for the Formivo schema
 * (see supabase/migrations/ and docs/database.md).
 *
 * Keep this in sync with the migrations. Generated types would replace this
 * file once the Supabase CLI typegen is wired up.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      account_roles: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          role?: string;
        };
        Relationships: [];
      };
      workspaces: {
        Row: {
          id: string;
          owner_user_id: string;
          name: string;
          slug: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_user_id: string;
          name: string;
          slug?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      forms: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          description: string | null;
          status: string;
          notification_email: string | null;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          description?: string | null;
          status?: string;
          notification_email?: string | null;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          status?: string;
          notification_email?: string | null;
          settings?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      submissions: {
        Row: {
          id: string;
          form_id: string;
          data: Json;
          metadata: Json;
          status: string;
          source_origin: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          data: Json;
          metadata?: Json;
          status?: string;
          source_origin?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          data?: Json;
          metadata?: Json;
          status?: string;
          source_origin?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      client_invitations: {
        Row: {
          id: string;
          form_id: string;
          invited_email: string;
          token_hash: string;
          status: string;
          invited_by_user_id: string;
          expires_at: string;
          accepted_by_user_id: string | null;
          accepted_at: string | null;
          revoked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          invited_email: string;
          token_hash: string;
          status?: string;
          invited_by_user_id: string;
          expires_at: string;
          accepted_by_user_id?: string | null;
          accepted_at?: string | null;
          revoked_at?: string | null;
          created_at?: string;
        };
        Update: {
          status?: string;
          expires_at?: string;
          token_hash?: string;
          invited_by_user_id?: string;
          accepted_by_user_id?: string | null;
          accepted_at?: string | null;
          revoked_at?: string | null;
        };
        Relationships: [];
      };
      form_client_permissions: {
        Row: {
          id: string;
          form_id: string;
          client_user_id: string;
          invitation_id: string | null;
          granted_at: string;
          revoked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          client_user_id: string;
          invitation_id?: string | null;
          granted_at?: string;
          revoked_at?: string | null;
          created_at?: string;
        };
        Update: {
          invitation_id?: string | null;
          granted_at?: string;
          revoked_at?: string | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          workspace_id: string;
          plan_key: string;
          status: string;
          provider: string;
          provider_customer_id: string | null;
          provider_subscription_id: string | null;
          variant_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          plan_key?: string;
          status?: string;
          provider?: string;
          provider_customer_id?: string | null;
          provider_subscription_id?: string | null;
          variant_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          plan_key?: string;
          status?: string;
          provider?: string;
          provider_customer_id?: string | null;
          provider_subscription_id?: string | null;
          variant_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      usage_periods: {
        Row: {
          id: string;
          workspace_id: string;
          period_start: string;
          period_end: string;
          submission_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          period_start: string;
          period_end: string;
          submission_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          submission_count?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      webhook_events: {
        Row: {
          id: string;
          provider: string;
          provider_event_id: string;
          event_type: string | null;
          payload_hash: string | null;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider: string;
          provider_event_id: string;
          event_type?: string | null;
          payload_hash?: string | null;
          processed_at?: string | null;
          created_at?: string;
        };
        Update: {
          event_type?: string | null;
          payload_hash?: string | null;
          processed_at?: string | null;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_user_id: string | null;
          workspace_id: string | null;
          action: string;
          target_type: string | null;
          target_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_user_id?: string | null;
          workspace_id?: string | null;
          action: string;
          target_type?: string | null;
          target_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          actor_user_id?: string | null;
          workspace_id?: string | null;
          action?: string;
          target_type?: string | null;
          target_id?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      submission_idempotency: {
        Row: {
          id: string;
          form_id: string;
          idempotency_key: string;
          request_hash: string;
          submission_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          idempotency_key: string;
          request_hash: string;
          submission_id?: string | null;
          created_at?: string;
        };
        Update: {
          submission_id?: string | null;
        };
        Relationships: [];
      };
      rate_limit_buckets: {
        Row: {
          bucket: string;
          window_start: string;
          request_count: number;
        };
        Insert: {
          bucket: string;
          window_start: string;
          request_count?: number;
        };
        Update: {
          request_count?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      has_role: { Args: { p_role: string }; Returns: boolean };
      is_workspace_owner: { Args: { p_workspace_id: string }; Returns: boolean };
      owns_form: { Args: { p_form_id: string }; Returns: boolean };
      can_view_form: { Args: { p_form_id: string }; Returns: boolean };
      initialize_developer_account: {
        Args: {
          p_user_id: string;
          p_email: string;
          p_display_name?: string;
          p_workspace_name?: string;
        };
        Returns: Json;
      };
      accept_client_invitation: {
        Args: {
          p_token_hash: string;
          p_user_id: string;
          p_user_email: string;
          p_max_viewers: number;
        };
        Returns: Json;
      };
      record_submission: {
        Args: {
          p_form_id: string;
          p_period_start: string;
          p_period_end: string;
          p_max_submissions: number;
          p_data: Json;
          p_source_origin?: string;
          p_metadata?: Json;
        };
        Returns: Json;
      };
      api_initialize_developer_account: {
        Args: {
          p_user_id: string;
          p_email: string;
          p_display_name?: string;
          p_workspace_name?: string;
        };
        Returns: Json;
      };
      api_accept_client_invitation: {
        Args: {
          p_token_hash: string;
          p_user_id: string;
          p_user_email: string;
          p_max_viewers: number;
        };
        Returns: Json;
      };
      api_record_submission: {
        Args: {
          p_form_id: string;
          p_period_start: string;
          p_period_end: string;
          p_max_submissions: number;
          p_data: Json;
          p_source_origin?: string;
          p_metadata?: Json;
        };
        Returns: Json;
      };
      consume_rate_limit: {
        Args: { p_bucket: string; p_window_start: string; p_limit: number };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
