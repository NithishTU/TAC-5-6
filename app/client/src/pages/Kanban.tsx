import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksAPI } from '../api/client'
import { Task } from '../types'
import { useState, useEffect, useMemo } from 'react'

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
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [labelFilter, setLabelFilter] = useState<string>('')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', debouncedSearch, statusFilter, labelFilter],
    queryFn: () => tasksAPI.list({
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
    }).then(res => res.data),
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

  // Extract unique labels from all tasks
  const uniqueLabels = useMemo(() => {
    const labels = new Set<string>()
    tasks.forEach((task: Task) => {
      task.labels?.forEach((label) => labels.add(label))
    })
    return Array.from(labels).sort()
  }, [tasks])

  // Filter tasks by label on frontend (since backend doesn't support label filtering)
  const filteredTasks = useMemo(() => {
    if (!labelFilter) return tasks
    return tasks.filter((task: Task) =>
      task.labels?.includes(labelFilter)
    )
  }, [tasks, labelFilter])

  const getTasksByColumn = (columnId: string) => {
    return filteredTasks.filter((task: Task) => task.status === columnId)
  }

  const hasActiveFilters = searchQuery || statusFilter || labelFilter

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('')
    setLabelFilter('')
  }

  const totalTasks = tasks.length
  const filteredCount = filteredTasks.length

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

      {/* Filter Section */}
      <div className="card p-4 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search Input */}
          <div className="flex-1 min-w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="input w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="min-w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-full"
            >
              <option value="">All Statuses</option>
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          {/* Label Filter */}
          <div className="min-w-40">
            <select
              value={labelFilter}
              onChange={(e) => setLabelFilter(e.target.value)}
              className="input w-full"
              disabled={uniqueLabels.length === 0}
            >
              <option value="">All Labels</option>
              {uniqueLabels.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Active Filters & Count */}
        <div className="flex flex-wrap gap-2 items-center text-sm">
          {isLoading && (
            <span className="text-gray-600 dark:text-gray-400">Loading...</span>
          )}
          {!isLoading && hasActiveFilters && (
            <>
              {searchQuery && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded">
                  Searching: {searchQuery}
                </span>
              )}
              {statusFilter && (
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded">
                  Status: {COLUMNS.find(c => c.id === statusFilter)?.title}
                </span>
              )}
              {labelFilter && (
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded">
                  Label: {labelFilter}
                </span>
              )}
            </>
          )}
          {!isLoading && (
            <span className="text-gray-600 dark:text-gray-400 ml-auto">
              {hasActiveFilters ? `Showing ${filteredCount} of ${totalTasks} tasks` : `${totalTasks} tasks`}
            </span>
          )}
        </div>
      </div>

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
