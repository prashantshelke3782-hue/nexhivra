/*
  # Client Management System Database Schema

  ## Overview
  This migration creates a complete database schema for a Client Management System (CMS)
  with support for client records, projects, payments, file uploads, and communication history.

  ## New Tables

  ### 1. clients
  Core client information table storing all client/company details.
  - `id` (uuid, primary key) - Unique identifier for each client
  - `name` (text) - Client or company name
  - `contact_person` (text) - Primary contact person name
  - `phone` (text) - Contact phone number
  - `email` (text) - Contact email address
  - `address` (text) - Physical address
  - `whatsapp` (text) - WhatsApp number
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `created_by` (uuid) - User who created the record

  ### 2. projects
  Project tracking table linked to clients.
  - `id` (uuid, primary key) - Unique identifier for each project
  - `client_id` (uuid, foreign key) - Reference to clients table
  - `project_name` (text) - Name of the project
  - `description` (text) - Detailed project description
  - `start_date` (date) - Project start date
  - `deadline` (date) - Project deadline
  - `status` (text) - Project status: Pending, Ongoing, Completed
  - `total_cost` (numeric) - Total project cost
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. payments
  Payment tracking table for recording all financial transactions.
  - `id` (uuid, primary key) - Unique identifier for each payment
  - `project_id` (uuid, foreign key) - Reference to projects table
  - `amount` (numeric) - Payment amount
  - `payment_date` (date) - Date of payment
  - `payment_method` (text) - Method of payment (Cash, Bank Transfer, etc.)
  - `notes` (text) - Additional payment notes
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. files
  File storage metadata table for uploaded documents.
  - `id` (uuid, primary key) - Unique identifier for each file
  - `client_id` (uuid, foreign key) - Reference to clients table
  - `project_id` (uuid, foreign key, optional) - Reference to projects table
  - `file_name` (text) - Original file name
  - `file_path` (text) - Storage path in Supabase Storage
  - `file_type` (text) - File type/category (invoice, document, etc.)
  - `file_size` (integer) - File size in bytes
  - `uploaded_at` (timestamptz) - Upload timestamp
  - `uploaded_by` (uuid) - User who uploaded the file

  ### 5. notes
  Communication history and notes table.
  - `id` (uuid, primary key) - Unique identifier for each note
  - `client_id` (uuid, foreign key) - Reference to clients table
  - `project_id` (uuid, foreign key, optional) - Reference to projects table
  - `note` (text) - Note content
  - `created_at` (timestamptz) - Note creation timestamp
  - `created_by` (uuid) - User who created the note

  ### 6. reminders
  Automated reminder system for payments and deadlines.
  - `id` (uuid, primary key) - Unique identifier for each reminder
  - `client_id` (uuid, foreign key) - Reference to clients table
  - `project_id` (uuid, foreign key, optional) - Reference to projects table
  - `reminder_type` (text) - Type: payment or deadline
  - `reminder_date` (date) - Date when reminder should trigger
  - `message` (text) - Reminder message
  - `is_sent` (boolean) - Whether reminder has been sent
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security

  ### Row Level Security (RLS)
  - All tables have RLS enabled for data security
  - Only authenticated users can access the data
  - Users can only access data they have permission to view

  ### Policies
  Each table has comprehensive policies for:
  - SELECT: Authenticated users can view all records
  - INSERT: Authenticated users can create new records
  - UPDATE: Authenticated users can update existing records
  - DELETE: Authenticated users can delete records

  ## Important Notes
  - All foreign key constraints ensure data integrity
  - Indexes are created on foreign keys for query performance
  - Timestamps use timestamptz for timezone awareness
  - Numeric type is used for currency to maintain precision
  - Default values are set appropriately for booleans and timestamps
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  address text,
  whatsapp text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  project_name text NOT NULL,
  description text,
  start_date date,
  deadline date,
  status text DEFAULT 'Pending' CHECK (status IN ('Pending', 'Ongoing', 'Completed')),
  total_cost numeric(12, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  amount numeric(12, 2) NOT NULL,
  payment_date date NOT NULL,
  payment_method text DEFAULT 'Cash',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text DEFAULT 'document',
  file_size integer,
  uploaded_at timestamptz DEFAULT now(),
  uploaded_by uuid REFERENCES auth.users(id)
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  reminder_type text CHECK (reminder_type IN ('payment', 'deadline')),
  reminder_date date NOT NULL,
  message text NOT NULL,
  is_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_project_id ON payments(project_id);
CREATE INDEX IF NOT EXISTS idx_files_client_id ON files(client_id);
CREATE INDEX IF NOT EXISTS idx_files_project_id ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_notes_client_id ON notes(client_id);
CREATE INDEX IF NOT EXISTS idx_notes_project_id ON notes(project_id);
CREATE INDEX IF NOT EXISTS idx_reminders_client_id ON reminders(client_id);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(reminder_date) WHERE is_sent = false;

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Clients policies
CREATE POLICY "Authenticated users can view all clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete clients"
  ON clients FOR DELETE
  TO authenticated
  USING (true);

-- Projects policies
CREATE POLICY "Authenticated users can view all projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (true);

-- Payments policies
CREATE POLICY "Authenticated users can view all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete payments"
  ON payments FOR DELETE
  TO authenticated
  USING (true);

-- Files policies
CREATE POLICY "Authenticated users can view all files"
  ON files FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can upload files"
  ON files FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update files"
  ON files FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete files"
  ON files FOR DELETE
  TO authenticated
  USING (true);

-- Notes policies
CREATE POLICY "Authenticated users can view all notes"
  ON notes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update notes"
  ON notes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete notes"
  ON notes FOR DELETE
  TO authenticated
  USING (true);

-- Reminders policies
CREATE POLICY "Authenticated users can view all reminders"
  ON reminders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create reminders"
  ON reminders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update reminders"
  ON reminders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete reminders"
  ON reminders FOR DELETE
  TO authenticated
  USING (true);

-- Create storage bucket for client files
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-files', 'client-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for client files
CREATE POLICY "Authenticated users can upload files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'client-files');

CREATE POLICY "Authenticated users can view files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'client-files');

CREATE POLICY "Authenticated users can delete files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'client-files');