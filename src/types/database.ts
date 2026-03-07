import type { StaffRole } from './next-auth'

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
}

export interface Database {
  public: {
    Tables: {
      staff: {
        Row: {
          id: string
          email: string
          name: string
          role: StaffRole
          contact_number: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['staff']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['staff']['Insert']>
      }
      classes: {
        Row: {
          id: string
          name: string
          year_group: string
          room_number: string | null
          teacher_id: string | null
          academic_year: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['classes']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['classes']['Insert']>
      }
      students: {
        Row: {
          id: string
          student_code: string | null // existing spreadsheet ID for import/reference
          first_name: string
          last_name: string
          date_of_birth: string | null
          class_id: string | null
          // Primary parent
          primary_parent_name: string | null
          primary_parent_email: string | null
          primary_parent_phone: string | null
          // Secondary parent
          secondary_parent_name: string | null
          secondary_parent_email: string | null
          secondary_parent_phone: string | null
          // Up to 3 emergency contacts stored as JSONB
          emergency_contacts: EmergencyContact[]
          // Medical
          allergies: string | null
          enrollment_date: string | null
          active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['students']['Row'],
          'id' | 'created_at' | 'updated_at'
        > & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['students']['Insert']>
      }
      timetable_slots: {
        Row: {
          id: string
          class_id: string
          day_of_week:
            | 'Monday'
            | 'Tuesday'
            | 'Wednesday'
            | 'Thursday'
            | 'Friday'
            | 'Saturday'
            | 'Sunday'
          start_time: string
          end_time: string
          subject: string | null
          room: string | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['timetable_slots']['Row'],
          'id' | 'created_at'
        > & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['timetable_slots']['Insert']>
      }
    }
  }
}
