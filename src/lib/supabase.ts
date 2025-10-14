import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Client {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  whatsapp: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface Project {
  id: string;
  client_id: string;
  project_name: string;
  description: string | null;
  start_date: string | null;
  deadline: string | null;
  status: 'Pending' | 'Ongoing' | 'Completed';
  total_cost: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  project_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
}

export interface FileRecord {
  id: string;
  client_id: string;
  project_id: string | null;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  uploaded_at: string;
  uploaded_by: string | null;
}

export interface Note {
  id: string;
  client_id: string;
  project_id: string | null;
  note: string;
  created_at: string;
  created_by: string | null;
}

export interface Reminder {
  id: string;
  client_id: string;
  project_id: string | null;
  reminder_type: 'payment' | 'deadline';
  reminder_date: string;
  message: string;
  is_sent: boolean;
  created_at: string;
}
