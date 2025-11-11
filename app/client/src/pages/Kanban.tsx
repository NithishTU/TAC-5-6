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
  const [labelsFilter, setLabelsFilter] = useState<string[]>([])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', debouncedSearch, statusFilter],
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

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setDebouncedSearch('')
    setStatusFilter('')
    setLabelsFilter([])
  }

  // Extract unique labels from all tasks
  const uniqueLabels = useMemo(() => {
    const labelsSet = new Set<string>()
    tasks.forEach((task: Task) => {
      if (task.labels) {
        task.labels.forEach((label) => labelsSet.add(label))
      }
    })
    return Array.from(labelsSet).sort()
  }, [tasks])

  // Apply client-side label filtering
  const filteredTasks = useMemo(() => {
    if (labelsFilter.length === 0) return tasks
    return tasks.filter((task: Task) => {
      if (!task.labels || task.labels.length === 0) return false
      return labelsFilter.some((label) => task.labels?.includes(label))
    })
  }, [tasks, labelsFilter])

  const getTasksByColumn = (columnId: string) => {
    return filteredTasks.filter((task: Task) => task.status === columnId)
  }

  // Check if any filters are active
  const hasActiveFilters = searchQuery || statusFilter || labelsFilter.length > 0

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
      <div className="card p-4 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search Input */}
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="input w-full pl-9"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Status Filter */}
          <div className="min-w-[180px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`input w-full ${statusFilter ? 'border-blue-500 dark:border-blue-400' : ''}`}
            >
              <option value="">All Statuses</option>
              {COLUMNS.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.title}
                </option>
              ))}
            </select>
          </div>

          {/* Labels Filter */}
          {uniqueLabels.length > 0 && (
            <div className="min-w-[180px]">
              <select
                value=""
                onChange={(e) => {
                  const label = e.target.value
                  if (label && !labelsFilter.includes(label)) {
                    setLabelsFilter([...labelsFilter, label])
                  }
                }}
                className={`input w-full ${labelsFilter.length > 0 ? 'border-blue-500 dark:border-blue-400' : ''}`}
              >
                <option value="">Filter by label...</option>
                {uniqueLabels.map((label) => (
                  <option
                    key={label}
                    value={label}
                    disabled={labelsFilter.includes(label)}
                  >
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn-secondary whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Active Filter Indicators */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Active filters:
            </span>
            {searchQuery && (
              <span className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full flex items-center gap-2">
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-blue-900 dark:hover:text-blue-100"
                >
                  ×
                </button>
              </span>
            )}
            {statusFilter && (
              <span className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full flex items-center gap-2">
                Status: {COLUMNS.find((c) => c.id === statusFilter)?.title}
                <button
                  onClick={() => setStatusFilter('')}
                  className="hover:text-blue-900 dark:hover:text-blue-100"
                >
                  ×
                </button>
              </span>
            )}
            {labelsFilter.map((label) => (
              <span
                key={label}
                className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full flex items-center gap-2"
              >
                Label: {label}
                <button
                  onClick={() => setLabelsFilter(labelsFilter.filter((l) => l !== label))}
                  className="hover:text-blue-900 dark:hover:text-blue-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          Loading tasks...
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredTasks.length === 0 && hasActiveFilters && (
        <div className="text-center py-12 space-y-4">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No tasks match your filters.
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Try adjusting your search criteria or clear all filters.
          </p>
          <button onClick={clearFilters} className="btn-primary">
            Clear All Filters
          </button>
        </div>
      )}

      {!isLoading && filteredTasks.length === 0 && !hasActiveFilters && (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          No tasks yet. Create your first task above!
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
