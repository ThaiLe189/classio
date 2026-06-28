// Types matching supabase/migrations/20240101000000_init.sql.
// After running the migration, you can regenerate with:
//   supabase gen types typescript --linked > types/database.ts

export type AttendanceStatus = "present" | "absent" | "late";

type Timestamps = { created_at: string };

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string | null } & Timestamps;
        Insert: { id: string; full_name?: string | null; created_at?: string };
        Update: { id?: string; full_name?: string | null; created_at?: string };
        Relationships: [];
      };
      classes: {
        Row: { id: string; owner_id: string; name: string; description: string | null } & Timestamps;
        Insert: { id?: string; owner_id: string; name: string; description?: string | null; created_at?: string };
        Update: { id?: string; owner_id?: string; name?: string; description?: string | null; created_at?: string };
        Relationships: [];
      };
      students: {
        Row: {
          id: string; owner_id: string; class_id: string | null; full_name: string;
          phone: string | null; parent_name: string | null; parent_phone: string | null; note: string | null;
        } & Timestamps;
        Insert: {
          id?: string; owner_id: string; class_id?: string | null; full_name: string;
          phone?: string | null; parent_name?: string | null; parent_phone?: string | null; note?: string | null; created_at?: string;
        };
        Update: {
          id?: string; owner_id?: string; class_id?: string | null; full_name?: string;
          phone?: string | null; parent_name?: string | null; parent_phone?: string | null; note?: string | null; created_at?: string;
        };
        Relationships: [];
      };
      schedules: {
        Row: {
          id: string; owner_id: string; class_id: string; day_of_week: number;
          start_time: string; end_time: string; room: string | null;
        } & Timestamps;
        Insert: {
          id?: string; owner_id: string; class_id: string; day_of_week: number;
          start_time: string; end_time: string; room?: string | null; created_at?: string;
        };
        Update: {
          id?: string; owner_id?: string; class_id?: string; day_of_week?: number;
          start_time?: string; end_time?: string; room?: string | null; created_at?: string;
        };
        Relationships: [];
      };
      attendance: {
        Row: {
          id: string; owner_id: string; student_id: string; class_id: string | null;
          date: string; status: AttendanceStatus;
        } & Timestamps;
        Insert: {
          id?: string; owner_id: string; student_id: string; class_id?: string | null;
          date: string; status?: AttendanceStatus; created_at?: string;
        };
        Update: {
          id?: string; owner_id?: string; student_id?: string; class_id?: string | null;
          date?: string; status?: AttendanceStatus; created_at?: string;
        };
        Relationships: [];
      };
      grades: {
        Row: {
          id: string; owner_id: string; student_id: string; subject: string;
          assignment: string | null; score: number; max_score: number; date: string;
        } & Timestamps;
        Insert: {
          id?: string; owner_id: string; student_id: string; subject: string;
          assignment?: string | null; score: number; max_score?: number; date?: string; created_at?: string;
        };
        Update: {
          id?: string; owner_id?: string; student_id?: string; subject?: string;
          assignment?: string | null; score?: number; max_score?: number; date?: string; created_at?: string;
        };
        Relationships: [];
      };
      tuitions: {
        Row: {
          id: string; owner_id: string; student_id: string; period: string;
          amount: number; is_paid: boolean; paid_at: string | null;
        } & Timestamps;
        Insert: {
          id?: string; owner_id: string; student_id: string; period: string;
          amount?: number; is_paid?: boolean; paid_at?: string | null; created_at?: string;
        };
        Update: {
          id?: string; owner_id?: string; student_id?: string; period?: string;
          amount?: number; is_paid?: boolean; paid_at?: string | null; created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: { attendance_status: AttendanceStatus };
    CompositeTypes: Record<string, never>;
  };
};

// Helpers to derive row/insert/update types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
