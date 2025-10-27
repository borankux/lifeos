export interface ProjectRow {
  id: number;
  name: string;
  color: string | null;
  icon: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface TaskRow {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  priority: string | null;
  tags: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  estimated_minutes: number | null;
  estimated_start_date: string | null;
  estimated_end_date: string | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  actual_minutes: number | null;
}
