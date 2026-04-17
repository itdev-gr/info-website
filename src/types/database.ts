export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          clickup_id: string;
          status: 'invited' | 'submitted' | 'archived';
          created_at: string;
          updated_at: string;
          created_by: string | null;
          submitted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          clickup_id?: string;
          status?: 'invited' | 'submitted' | 'archived';
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          submitted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          clickup_id?: string;
          status?: 'invited' | 'submitted' | 'archived';
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          submitted_at?: string | null;
        };
      };
      client_submissions: {
        Row: {
          client_id: string;
          logo_url: string | null;
          description: string | null;
          recommended_site: string | null;
          has_existing_domain: boolean;
          existing_domain: string | null;
          domain_suggestions: string[];
          contact_email: string | null;
          contact_phone: string | null;
          contact_whatsapp: string | null;
          wants_whatsapp_button: boolean;
          whatsapp_button_number: string | null;
          submitted_at: string | null;
        };
        Insert: {
          client_id: string;
          logo_url?: string | null;
          description?: string | null;
          recommended_site?: string | null;
          has_existing_domain?: boolean;
          existing_domain?: string | null;
          domain_suggestions?: string[];
          contact_email?: string | null;
          contact_phone?: string | null;
          contact_whatsapp?: string | null;
          wants_whatsapp_button?: boolean;
          whatsapp_button_number?: string | null;
          submitted_at?: string | null;
        };
        Update: {
          client_id?: string;
          logo_url?: string | null;
          description?: string | null;
          recommended_site?: string | null;
          has_existing_domain?: boolean;
          existing_domain?: string | null;
          domain_suggestions?: string[];
          contact_email?: string | null;
          contact_phone?: string | null;
          contact_whatsapp?: string | null;
          wants_whatsapp_button?: boolean;
          whatsapp_button_number?: string | null;
          submitted_at?: string | null;
        };
      };
      client_files: {
        Row: {
          id: string;
          client_id: string;
          file_name: string;
          file_size: number;
          mime_type: string | null;
          storage_path: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          file_name: string;
          file_size: number;
          mime_type?: string | null;
          storage_path: string;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          file_name?: string;
          file_size?: number;
          mime_type?: string | null;
          storage_path?: string;
          uploaded_at?: string;
        };
      };
      intake_links: {
        Row: {
          token: string;
          client_id: string;
          created_at: string;
          expires_at: string;
          used_at: string | null;
          revoked: boolean;
        };
        Insert: {
          token?: string;
          client_id: string;
          created_at?: string;
          expires_at?: string;
          used_at?: string | null;
          revoked?: boolean;
        };
        Update: {
          token?: string;
          client_id?: string;
          created_at?: string;
          expires_at?: string;
          used_at?: string | null;
          revoked?: boolean;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      client_status: 'invited' | 'submitted' | 'archived';
    };
    CompositeTypes: Record<string, never>;
  };
}
