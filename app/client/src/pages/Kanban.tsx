import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksAPI, usersAPI } from '../api/client'
import { Task, User } from '../types'
import { useState, useEffect } from 'react'

const COLUMNS = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'in_review', title: 'In Review' },
  { id: 'done', title: 'Done' },
]

export default function Kanban() {
  const queryClient = useQueryClient()
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskColumn, setNewTaskColumn] = useState('backlog')

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch tasks with filters
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', debouncedSearch, statusFilter, assigneeFilter],
    queryFn: () => tasksAPI.list({
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
      assignee: assigneeFilter || undefined,
    }).then(res => res.data),
  })

  // Fetch users for assignee filter
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.list().then(res => res.data),
  })

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => tasksAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setNewTaskTitle('')
    },
  })

  const moveTaskMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      tasksAPI.move(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => tasksAPI.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    createTaskMutation.mutate({
      title: newTaskTitle,
      status: newTaskColumn,
      labels: [],
    })
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setStatusFilter(null)
    setAssigneeFilter(null)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (debouncedSearch) count++
    if (statusFilter) count++
    if (assigneeFilter) count++
    return count
  }

  const getTasksByColumn = (columnId: string) => {
    return tasks.filter((task: Task) => task.status === columnId)
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Kanban Board
        </h2>

        {/* Quick Add Task Form */}
        <form onSubmit={handleCreateTask} className="flex gap-2">
          <select
            value={newTaskColumn}
            onChange={(e) => setNewTaskColumn(e.target.value)}
            className="input"
          >
            {COLUMNS.map((col) => (
              <option key={col.id} value={col.id}>
                {col.title}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="New task title..."
            className="input w-64"
          />
          <button type="submit" className="btn-primary">
            Add Task
          </button>
        </form>
      </div>

      {/* Filter Panel */}
      <div className="card p-4">
        <div className="flex gap-4 items-center flex-wrap">
          {/* Search Input */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="input w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="min-w-[150px]">
            <select
              value={statusFilter || ''}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className="input w-full"
            >
              <option value="">All Statuses</option>
              {COLUMNS.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.title}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee Filter */}
          <div className="min-w-[150px]">
            <select
              value={assigneeFilter || ''}
              onChange={(e) => setAssigneeFilter(e.target.value || null)}
              className="input w-full"
            >
              <option value="">All Assignees</option>
              {users.map((user: User) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={handleClearFilters}
            disabled={activeFilterCount === 0}
            className={`btn ${
              activeFilterCount > 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Clear Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-white text-blue-600 rounded-full px-2 py-0.5 text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Status */}
        <div className="mt-3 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div>
            {isLoading ? (
              <span>Loading tasks...</span>
            ) : (
              <span>
                Found {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                {activeFilterCount > 0 && ' (filtered)'}
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <div className="text-blue-600 dark:text-blue-400 font-medium">
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
            </div>
          )}
        </div>
      </div>

      {/* No Results Message */}
      {!isLoading && tasks.length === 0 && activeFilterCount > 0 && (
        <div className="card p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No tasks found matching your filters.
          </p>
          <button
            onClick={handleClearFilters}
            className="mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Kanban Columns */}
      <div className="grid grid-cols-5 gap-4">
        {COLUMNS.map((column) => {
          const columnTasks = getTasksByColumn(column.id)

          return (
            <div key={column.id} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {column.title}
                </h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-2">
                {columnTasks.map((task: Task) => (
                  <div
                    key={task.id}
                    className="card p-3 cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    {task.labels && task.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.labels.map((label) => (
                          <span
                            key={label}
                            className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      {/* Move buttons */}
                      <div className="flex gap-1">
                        {column.id !== 'backlog' && (
                          <button
                            onClick={() =>
                              moveTaskMutation.mutate({
                                taskId: task.id,
                                status: COLUMNS[COLUMNS.findIndex(c => c.id === column.id) - 1].id,
                              })
                            }
                            className="text-xs text-gray-600 hover:text-gray-900"
                            title="Move left"
                          >
                            ←
                          </button>
                        )}
                        {column.id !== 'done' && (
                          <button
                            onClick={() =>
                              moveTaskMutation.mutate({
                                taskId: task.id,
                                status: COLUMNS[COLUMNS.findIndex(c => c.id === column.id) + 1].id,
                              })
                            }
                            className="text-xs text-gray-600 hover:text-gray-900"
                            title="Move right"
                          >
                            →
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => deleteTaskMutation.mutate(task.id)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
