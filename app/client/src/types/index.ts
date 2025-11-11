export interface User {
  id: string
  username: string
  email?: string
  avatar_url?: string
  github_id?: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done'
  assignee_id?: string
  created_by: string
  labels?: string[]
  position?: number
  created_at: string
  updated_at: string
  assignee?: User
}

export interface TimeEntry {
  id: string
  task_id?: string
  user_id: string
  start_time: string
  end_time?: string
  duration?: number  // in seconds
  is_running: boolean
  created_at: string
  task?: Task
}

export interface TimeSummary {
  total_duration: number  // in seconds
  entries: TimeEntry[]
  by_task: Record<string, number>
  by_date: Record<string, number>
}

export interface Sprint {
  id: string
  name: string
  start_date: string
  end_date: string
  goal?: string
  status: 'planning' | 'active' | 'completed'
  created_at: string
  tasks?: Task[]
}

export interface GitHubPR {
  id: string
  pr_number: number
  repository: string
  title?: string
  author_id?: string
  status?: string
  created_at: string
  updated_at: string
  merged_at?: string
}

export interface VelocityDataPoint {
  sprint_name: string
  tasks_completed: number
  story_points: number
  date: string
}

export interface VelocityResponse {
  data_points: VelocityDataPoint[]
  average_velocity: number
}

export interface AnalyticsSummary {
  total_tasks: number
  completed_tasks: number
  active_tasks: number
  total_time_logged: number  // in seconds
  average_cycle_time?: number  // in hours
}
