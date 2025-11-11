import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      // TODO: Implement token refresh logic
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Tasks API
export const tasksAPI = {
  list: (params?: { status?: string; assignee?: string; search?: string }) =>
    apiClient.get('/tasks', { params }),

  get: (id: string) =>
    apiClient.get(`/tasks/${id}`),

  create: (data: any) =>
    apiClient.post('/tasks', data),

  update: (id: string, data: any) =>
    apiClient.patch(`/tasks/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/tasks/${id}`),

  move: (id: string, status: string, position?: number) =>
    apiClient.patch(`/tasks/${id}/move`, { status, position }),

  assign: (id: string, assigneeId: string) =>
    apiClient.post(`/tasks/${id}/assign`, { assignee_id: assigneeId }),
}

// Time Tracking API
export const timeAPI = {
  start: (taskId?: string) =>
    apiClient.post('/time/start', { task_id: taskId }),

  stop: () =>
    apiClient.post('/time/stop'),

  getEntries: (params?: { task_id?: string; start_date?: string; end_date?: string }) =>
    apiClient.get('/time/entries', { params }),

  createEntry: (data: any) =>
    apiClient.post('/time/entries', data),

  getSummary: (params?: { start_date?: string; end_date?: string }) =>
    apiClient.get('/time/summary', { params }),
}

// GitHub API
export const githubAPI = {
  connect: () =>
    apiClient.post('/github/connect'),

  getPRs: () =>
    apiClient.get('/github/prs'),

  getReviews: () =>
    apiClient.get('/github/reviews'),

  getCommits: (limit?: number) =>
    apiClient.get('/github/commits', { params: { limit } }),

  getIssues: () =>
    apiClient.get('/github/issues'),

  sync: (syncType: string) =>
    apiClient.post('/github/sync', { sync_type: syncType }),
}

// Analytics API
export const analyticsAPI = {
  getVelocity: (sprintCount?: number) =>
    apiClient.get('/analytics/velocity', { params: { sprint_count: sprintCount } }),

  getBurndown: (sprintId: string) =>
    apiClient.get(`/analytics/burndown/${sprintId}`),

  getCommitFrequency: (startDate?: string, endDate?: string) =>
    apiClient.get('/analytics/commits', { params: { start_date: startDate, end_date: endDate } }),

  getPRMetrics: (startDate?: string, endDate?: string) =>
    apiClient.get('/analytics/pr-metrics', { params: { start_date: startDate, end_date: endDate } }),

  getTeamActivity: (startDate?: string, endDate?: string) =>
    apiClient.get('/analytics/team-activity', { params: { start_date: startDate, end_date: endDate } }),

  getSummary: () =>
    apiClient.get('/analytics/summary'),
}

// Sprints API
export const sprintsAPI = {
  list: () =>
    apiClient.get('/sprints'),

  get: (id: string) =>
    apiClient.get(`/sprints/${id}`),

  create: (data: any) =>
    apiClient.post('/sprints', data),

  update: (id: string, data: any) =>
    apiClient.patch(`/sprints/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/sprints/${id}`),

  addTask: (sprintId: string, taskId: string, storyPoints?: number) =>
    apiClient.post(`/sprints/${sprintId}/tasks`, { task_id: taskId, story_points: storyPoints }),

  removeTask: (sprintId: string, taskId: string) =>
    apiClient.delete(`/sprints/${sprintId}/tasks/${taskId}`),
}

export default apiClient
