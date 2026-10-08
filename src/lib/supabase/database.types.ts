// Generated from the Supabase project rev-plan-de-vente — do not edit by hand.
// Regenerate with `bun run db:types` after each migration.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      leads: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          ip_hash: string | null;
          lot_id: string | null;
          message: string | null;
          nom: string;
          notified_at: string | null;
          project_id: string;
          session_id: string | null;
          source: string;
          status: Database["public"]["Enums"]["lead_status"];
          telephone: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id?: string;
          ip_hash?: string | null;
          lot_id?: string | null;
          message?: string | null;
          nom: string;
          notified_at?: string | null;
          project_id: string;
          session_id?: string | null;
          source?: string;
          status?: Database["public"]["Enums"]["lead_status"];
          telephone: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          ip_hash?: string | null;
          lot_id?: string | null;
          message?: string | null;
          nom?: string;
          notified_at?: string | null;
          project_id?: string;
          session_id?: string | null;
          source?: string;
          status?: Database["public"]["Enums"]["lead_status"];
          telephone?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leads_lot_id_project_id_fkey";
            columns: ["lot_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "lots";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "leads_lot_id_project_id_fkey";
            columns: ["lot_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "public_lots";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "leads_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "public_projects";
            referencedColumns: ["id"];
          },
        ];
      };
      lot_events: {
        Row: {
          created_at: string;
          id: string;
          lot_id: string | null;
          project_id: string;
          session_id: string | null;
          type: Database["public"]["Enums"]["lot_event_type"];
        };
        Insert: {
          created_at?: string;
          id?: string;
          lot_id?: string | null;
          project_id: string;
          session_id?: string | null;
          type: Database["public"]["Enums"]["lot_event_type"];
        };
        Update: {
          created_at?: string;
          id?: string;
          lot_id?: string | null;
          project_id?: string;
          session_id?: string | null;
          type?: Database["public"]["Enums"]["lot_event_type"];
        };
        Relationships: [
          {
            foreignKeyName: "lot_events_lot_id_project_id_fkey";
            columns: ["lot_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "lots";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "lot_events_lot_id_project_id_fkey";
            columns: ["lot_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "public_lots";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "lot_events_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lot_events_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "public_projects";
            referencedColumns: ["id"];
          },
        ];
      };
      lots: {
        Row: {
          chambres: number | null;
          created_at: string;
          description: string | null;
          features: Json;
          id: string;
          niveau: number | null;
          numero: string;
          prix: number | null;
          project_id: string;
          salles_de_bain: number | null;
          sort_order: number;
          statut: Database["public"]["Enums"]["lot_status"];
          surface_habitable: number | null;
          surface_terrain: number | null;
          type: string | null;
          updated_at: string;
        };
        Insert: {
          chambres?: number | null;
          created_at?: string;
          description?: string | null;
          features?: Json;
          id?: string;
          niveau?: number | null;
          numero: string;
          prix?: number | null;
          project_id: string;
          salles_de_bain?: number | null;
          sort_order?: number;
          statut?: Database["public"]["Enums"]["lot_status"];
          surface_habitable?: number | null;
          surface_terrain?: number | null;
          type?: string | null;
          updated_at?: string;
        };
        Update: {
          chambres?: number | null;
          created_at?: string;
          description?: string | null;
          features?: Json;
          id?: string;
          niveau?: number | null;
          numero?: string;
          prix?: number | null;
          project_id?: string;
          salles_de_bain?: number | null;
          sort_order?: number;
          statut?: Database["public"]["Enums"]["lot_status"];
          surface_habitable?: number | null;
          surface_terrain?: number | null;
          type?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lots_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lots_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "public_projects";
            referencedColumns: ["id"];
          },
        ];
      };
      media: {
        Row: {
          created_at: string;
          id: string;
          kind: Database["public"]["Enums"]["media_kind"];
          lot_id: string | null;
          lot_type: string | null;
          meta: Json;
          path: string;
          project_id: string;
          sort_order: number;
          view_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          kind: Database["public"]["Enums"]["media_kind"];
          lot_id?: string | null;
          lot_type?: string | null;
          meta?: Json;
          path: string;
          project_id: string;
          sort_order?: number;
          view_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["media_kind"];
          lot_id?: string | null;
          lot_type?: string | null;
          meta?: Json;
          path?: string;
          project_id?: string;
          sort_order?: number;
          view_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "media_view_id_project_id_fkey";
            columns: ["view_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "project_views";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "media_lot_id_project_id_fkey";
            columns: ["lot_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "lots";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "media_lot_id_project_id_fkey";
            columns: ["lot_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "public_lots";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "media_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "public_projects";
            referencedColumns: ["id"];
          },
        ];
      };
      members: {
        Row: {
          created_at: string;
          id: string;
          organization_id: string;
          role: Database["public"]["Enums"]["member_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          organization_id: string;
          role?: Database["public"]["Enums"]["member_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          organization_id?: string;
          role?: Database["public"]["Enums"]["member_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      orbit_colors: {
        Row: {
          created_at: string;
          hex: string;
          id: string;
          lot_id: string | null;
          project_id: string;
          share: number;
          view_id: string;
        };
        Insert: {
          created_at?: string;
          hex: string;
          id?: string;
          lot_id?: string | null;
          project_id: string;
          share?: number;
          view_id: string;
        };
        Update: {
          created_at?: string;
          hex?: string;
          id?: string;
          lot_id?: string | null;
          project_id?: string;
          share?: number;
          view_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orbit_colors_lot_id_project_id_fkey";
            columns: ["lot_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "lots";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "orbit_colors_view_id_project_id_fkey";
            columns: ["view_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "project_views";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "orbit_colors_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          brand_color: string | null;
          brand_font: string | null;
          created_at: string;
          id: string;
          logo_path: string | null;
          name: string;
          slug: string;
        };
        Insert: {
          brand_color?: string | null;
          brand_font?: string | null;
          created_at?: string;
          id?: string;
          logo_path?: string | null;
          name: string;
          slug: string;
        };
        Update: {
          brand_color?: string | null;
          brand_font?: string | null;
          created_at?: string;
          id?: string;
          logo_path?: string | null;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      panorama_links: {
        Row: {
          created_at: string;
          from_id: string;
          id: string;
          pitch: number;
          project_id: string;
          to_id: string;
          yaw: number;
        };
        Insert: {
          created_at?: string;
          from_id: string;
          id?: string;
          pitch: number;
          project_id: string;
          to_id: string;
          yaw: number;
        };
        Update: {
          created_at?: string;
          from_id?: string;
          id?: string;
          pitch?: number;
          project_id?: string;
          to_id?: string;
          yaw?: number;
        };
        Relationships: [
          {
            foreignKeyName: "panorama_links_from_id_project_id_fkey";
            columns: ["from_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "panoramas";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "panorama_links_to_id_project_id_fkey";
            columns: ["to_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "panoramas";
            referencedColumns: ["id", "project_id"];
          },
        ];
      };
      panoramas: {
        Row: {
          created_at: string;
          id: string;
          image_height: number;
          image_path: string;
          image_width: number;
          lot_id: string | null;
          lot_type: string | null;
          name: string;
          project_id: string;
          sort_order: number;
          start_pitch: number;
          start_yaw: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_height: number;
          image_path: string;
          image_width: number;
          lot_id?: string | null;
          lot_type?: string | null;
          name: string;
          project_id: string;
          sort_order?: number;
          start_pitch?: number;
          start_yaw?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_height?: number;
          image_path?: string;
          image_width?: number;
          lot_id?: string | null;
          lot_type?: string | null;
          name?: string;
          project_id?: string;
          sort_order?: number;
          start_pitch?: number;
          start_yaw?: number;
        };
        Relationships: [
          {
            foreignKeyName: "panoramas_lot_id_project_id_fkey";
            columns: ["lot_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "lots";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "panoramas_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_views: {
        Row: {
          created_at: string;
          id: string;
          is_main: boolean;
          kind: Database["public"]["Enums"]["view_kind"];
          level: number | null;
          name: string;
          project_id: string;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_main?: boolean;
          kind?: Database["public"]["Enums"]["view_kind"];
          level?: number | null;
          name: string;
          project_id: string;
          sort_order?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_main?: boolean;
          kind?: Database["public"]["Enums"]["view_kind"];
          level?: number | null;
          name?: string;
          project_id?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "project_views_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          address: string | null;
          amenities: Json;
          city: string | null;
          contact_phone: string | null;
          created_at: string;
          currency: string;
          custom_domain: string | null;
          description: string | null;
          id: string;
          latitude: number | null;
          longitude: number | null;
          lot_types: Json;
          name: string;
          organization_id: string;
          places: Json;
          price_from: number | null;
          show_prices: boolean;
          slug: string;
          status: Database["public"]["Enums"]["project_status"];
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          amenities?: Json;
          city?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          currency?: string;
          custom_domain?: string | null;
          description?: string | null;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          lot_types?: Json;
          name: string;
          organization_id: string;
          places?: Json;
          price_from?: number | null;
          show_prices?: boolean;
          slug: string;
          status?: Database["public"]["Enums"]["project_status"];
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          amenities?: Json;
          city?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          currency?: string;
          custom_domain?: string | null;
          description?: string | null;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          lot_types?: Json;
          name?: string;
          organization_id?: string;
          places?: Json;
          price_from?: number | null;
          show_prices?: boolean;
          slug?: string;
          status?: Database["public"]["Enums"]["project_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      public_lots: {
        Row: {
          chambres: number | null;
          description: string | null;
          features: Json | null;
          id: string | null;
          niveau: number | null;
          numero: string | null;
          prix: number | null;
          project_id: string | null;
          salles_de_bain: number | null;
          sort_order: number | null;
          statut: Database["public"]["Enums"]["lot_status"] | null;
          surface_habitable: number | null;
          surface_terrain: number | null;
          type: string | null;
          updated_at: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "lots_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lots_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "public_projects";
            referencedColumns: ["id"];
          },
        ];
      };
      public_projects: {
        Row: {
          address: string | null;
          amenities: Json | null;
          brand_color: string | null;
          brand_font: string | null;
          city: string | null;
          contact_phone: string | null;
          currency: string | null;
          description: string | null;
          id: string | null;
          latitude: number | null;
          longitude: number | null;
          lot_types: Json | null;
          name: string | null;
          organization_logo_path: string | null;
          organization_name: string | null;
          organization_slug: string | null;
          places: Json | null;
          price_from: number | null;
          show_prices: boolean | null;
          slug: string | null;
          updated_at: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      create_organization: {
        Args: { p_name: string; p_slug: string };
        Returns: {
          brand_color: string | null;
          brand_font: string | null;
          created_at: string;
          id: string;
          logo_path: string | null;
          name: string;
          slug: string;
        };
        SetofOptions: {
          from: "*";
          to: "organizations";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      is_valid_amenities: { Args: { amenities: Json }; Returns: boolean };
      is_valid_lot_types: { Args: { lot_types: Json }; Returns: boolean };
      is_valid_places: { Args: { places: Json }; Returns: boolean };
      project_stats: {
        Args: { p_days: number; p_project_id: string; p_tz?: string };
        Returns: Json;
      };
      submit_lead: {
        Args: {
          p_email?: string;
          p_lot_id?: string;
          p_message?: string;
          p_nom: string;
          p_project_id: string;
          p_session_id: string;
          p_source?: string;
          p_telephone: string;
        };
        Returns: string;
      };
    };
    Enums: {
      lead_status: "nouveau" | "traite";
      lot_event_type: "vue_page" | "vue_lot" | "clic_lot" | "partage" | "visite_360";
      lot_status: "disponible" | "reservee" | "vendue";
      media_kind:
        "image" | "panorama" | "orbit_frame" | "orbit_mask" | "plan" | "video" | "document";
      member_role: "owner" | "commercial";
      project_status: "draft" | "published";
      view_kind: "aerienne" | "toiture" | "niveau" | "pieton" | "autre";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      lead_status: ["nouveau", "traite"],
      lot_event_type: ["vue_page", "vue_lot", "clic_lot", "partage", "visite_360"],
      lot_status: ["disponible", "reservee", "vendue"],
      media_kind: ["image", "panorama", "orbit_frame", "orbit_mask", "plan", "video", "document"],
      member_role: ["owner", "commercial"],
      project_status: ["draft", "published"],
      view_kind: ["aerienne", "toiture", "niveau", "pieton", "autre"],
    },
  },
} as const;
