export interface Project {
  id: number;
  name: string;
  color?: string | null;
  icon?: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  projectId: number;
  title: string;
  description?: string | null;
  status: string;
  dueDate?: string | null;
  priority?: string | null;
  tags?: string[];
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface ProjectsListResult {
  projects: Project[];
  activeProjectId?: number;
}

export type CreateProjectInput = {
  name: string;
  color?: string | null;
  icon?: string | null;
};

export type UpdateProjectPayload = Partial<{
  name: string;
  color: string | null;
  icon: string | null;
  position: number;
  archivedAt: string | null;
}>;

export interface CreateTaskInput {
  projectId: number;
  title: string;
  description?: string;
  status?: string;
  dueDate?: string;
  priority?: string;
  tags?: string[];
  position?: number;
}

export type UpdateTaskPayload = Partial<{
  title: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  priority: string | null;
  tags: string[] | null;
  position: number;
  projectId: number;
}>;
