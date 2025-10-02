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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      apartments: {
        Row: {
          apartment_number: string
          created_at: string | null
          floor: number | null
          id: string
          square_meters: number | null
          updated_at: string | null
        }
        Insert: {
          apartment_number: string
          created_at?: string | null
          floor?: number | null
          id?: string
          square_meters?: number | null
          updated_at?: string | null
        }
        Update: {
          apartment_number?: string
          created_at?: string | null
          floor?: number | null
          id?: string
          square_meters?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      billing_records: {
        Row: {
          created_at: string | null
          days_occupied: number
          electricity_individual: number
          electricity_shared: number
          gas_amount: number
          id: string
          maintenance_fee: number
          month: number
          paid_amount: number
          payment_date: string | null
          rent_amount: number
          tenant_id: string | null
          total_amount: number
          total_days_in_month: number
          updated_at: string | null
          water_individual: number
          water_shared: number
          year: number
        }
        Insert: {
          created_at?: string | null
          days_occupied?: number
          electricity_individual?: number
          electricity_shared?: number
          gas_amount?: number
          id?: string
          maintenance_fee?: number
          month: number
          paid_amount?: number
          payment_date?: string | null
          rent_amount?: number
          tenant_id?: string | null
          total_amount?: number
          total_days_in_month?: number
          updated_at?: string | null
          water_individual?: number
          water_shared?: number
          year: number
        }
        Update: {
          created_at?: string | null
          days_occupied?: number
          electricity_individual?: number
          electricity_shared?: number
          gas_amount?: number
          id?: string
          maintenance_fee?: number
          month?: number
          paid_amount?: number
          payment_date?: string | null
          rent_amount?: number
          tenant_id?: string | null
          total_amount?: number
          total_days_in_month?: number
          updated_at?: string | null
          water_individual?: number
          water_shared?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "billing_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          apartment_id: string | null
          created_at: string | null
          email: string | null
          id: string
          monthly_rent: number
          move_in_date: string
          move_out_date: string | null
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["tenant_status"] | null
          updated_at: string | null
        }
        Insert: {
          apartment_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          monthly_rent?: number
          move_in_date: string
          move_out_date?: string | null
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["tenant_status"] | null
          updated_at?: string | null
        }
        Update: {
          apartment_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          monthly_rent?: number
          move_in_date?: string
          move_out_date?: string | null
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["tenant_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
        ]
      }
      utility_consumption: {
        Row: {
          apartment_id: string | null
          created_at: string | null
          electricity_consumption: number
          id: string
          month: number
          updated_at: string | null
          water_consumption: number
          year: number
        }
        Insert: {
          apartment_id?: string | null
          created_at?: string | null
          electricity_consumption?: number
          id?: string
          month: number
          updated_at?: string | null
          water_consumption?: number
          year: number
        }
        Update: {
          apartment_id?: string | null
          created_at?: string | null
          electricity_consumption?: number
          id?: string
          month?: number
          updated_at?: string | null
          water_consumption?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "utility_consumption_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
        ]
      }
      utility_prices: {
        Row: {
          created_at: string | null
          electricity_price_per_unit: number
          gas_price: number
          id: string
          month: number
          monthly_maintenance_fee: number
          total_building_electricity: number
          total_building_water: number
          updated_at: string | null
          water_price_per_unit: number
          year: number
        }
        Insert: {
          created_at?: string | null
          electricity_price_per_unit?: number
          gas_price?: number
          id?: string
          month: number
          monthly_maintenance_fee?: number
          total_building_electricity?: number
          total_building_water?: number
          updated_at?: string | null
          water_price_per_unit?: number
          year: number
        }
        Update: {
          created_at?: string | null
          electricity_price_per_unit?: number
          gas_price?: number
          id?: string
          month?: number
          monthly_maintenance_fee?: number
          total_building_electricity?: number
          total_building_water?: number
          updated_at?: string | null
          water_price_per_unit?: number
          year?: number
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
      tenant_status: "active" | "inactive" | "pending"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      tenant_status: ["active", "inactive", "pending"],
    },
  },
} as const
