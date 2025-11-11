import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksAPI } from '../api/client'
import { Task } from '../types'
import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

const COLUMNS = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'in_review', title: 'In Review' },
  { id: 'done', title: 'Done' },
]

export default function Kanban() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskColumn, setNewTaskColumn] = useState('backlog')

  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery)
  const [statusFilter, setStatusFilter] = useState<string[]>(
    searchParams.get('status')?.split(',').filter(Boolean) || []
  )
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>(
    searchParams.get('assignee')?.split(',').filter(Boolean) || []
  )
  const [labelFilter, setLabelFilter] = useState<string[]>(
    searchParams.get('labels')?.split(',').filter(Boolean) || []
  )

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [searchQuery])

  // Sync filters with URL params
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearchQuery) params.set('search', debouncedSearchQuery)
    if (statusFilter.length > 0) params.set('status', statusFilter.join(','))
    if (assigneeFilter.length > 0) params.set('assignee', assigneeFilter.join(','))
    if (labelFilter.length > 0) params.set('labels', labelFilter.join(','))
    setSearchParams(params, { replace: true })
  }, [debouncedSearchQuery, statusFilter, assigneeFilter, labelFilter, setSearchParams])

  // Build API filter params
  const filterParams = useMemo(() => {
    const params: { search?: string; status?: string; assignee?: string } = {}
    if (debouncedSearchQuery) params.search = debouncedSearchQuery
    if (statusFilter.length > 0) params.status = statusFilter.join(',')
    if (assigneeFilter.length > 0) params.assignee = assigneeFilter.join(',')
    return params
  }, [debouncedSearchQuery, statusFilter, assigneeFilter])

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', filterParams],
    queryFn: () => tasksAPI.list(filterParams).then(res => res.data),
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

  // Apply frontend label filtering
  const filteredTasks = useMemo(() => {
    if (labelFilter.length === 0) return tasks
    return tasks.filter((task: Task) => {
      if (!task.labels || task.labels.length === 0) return false
      // Check if task has ALL selected labels (AND logic)
      return labelFilter.every((filterLabel) => task.labels?.includes(filterLabel))
    })
  }, [tasks, labelFilter])

  // Extract unique assignees and labels for filter dropdowns
  const uniqueAssignees = useMemo(() => {
    const assigneeMap = new Map<string, { id: string; username: string }>()
    tasks.forEach((task: Task) => {
      if (task.assignee) {
        assigneeMap.set(task.assignee.id, {
          id: task.assignee.id,
          username: task.assignee.username,
        })
      }
    })
    return Array.from(assigneeMap.values())
  }, [tasks])

  const uniqueLabels = useMemo(() => {
    const labelSet = new Set<string>()
    tasks.forEach((task: Task) => {
      task.labels?.forEach((label) => labelSet.add(label))
    })
    return Array.from(labelSet).sort()
  }, [tasks])

  const getTasksByColumn = (columnId: string) => {
    return filteredTasks.filter((task: Task) => task.status === columnId)
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    setStatusFilter([])
    setAssigneeFilter([])
    setLabelFilter([])
  }

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (statusFilter.length > 0 ? 1 : 0) +
    (assigneeFilter.length > 0 ? 1 : 0) +
    (labelFilter.length > 0 ? 1 : 0)

  const hasNoResults = filteredTasks.length === 0 && activeFilterCount > 0

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

      {/* Filter Bar */}
      <div className="card p-4 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search Input */}
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks by title or description..."
                className="input w-full pl-10"
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
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              multiple
              value={statusFilter}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, (option) => option.value)
                setStatusFilter(selected)
              }}
              className="input min-w-[150px]"
              size={1}
            >
              {COLUMNS.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.title}
                </option>
              ))}
            </select>
            {statusFilter.length === 0 && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">
                All Statuses
              </span>
            )}
          </div>

          {/* Assignee Filter */}
          {uniqueAssignees.length > 0 && (
            <div className="relative">
              <select
                multiple
                value={assigneeFilter}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value)
                  setAssigneeFilter(selected)
                }}
                className="input min-w-[150px]"
                size={1}
              >
                {uniqueAssignees.map((assignee) => (
                  <option key={assignee.id} value={assignee.id}>
                    {assignee.username}
                  </option>
                ))}
              </select>
              {assigneeFilter.length === 0 && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">
                  All Assignees
                </span>
              )}
            </div>
          )}

          {/* Label Filter */}
          {uniqueLabels.length > 0 && (
            <div className="relative">
              <select
                multiple
                value={labelFilter}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value)
                  setLabelFilter(selected)
                }}
                className="input min-w-[150px]"
                size={1}
              >
                {uniqueLabels.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
              {labelFilter.length === 0 && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">
                  All Labels
                </span>
              )}
            </div>
          )}

          {/* Active Filter Count & Clear Button */}
          {activeFilterCount > 0 && (
            <>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-sm font-medium">
                {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} active
              </span>
              <button
                onClick={clearAllFilters}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 underline"
              >
                Clear All Filters
              </button>
            </>
          )}
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            {searchQuery && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm flex items-center gap-1">
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  ×
                </button>
              </span>
            )}
            {statusFilter.map((status) => (
              <span
                key={status}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm flex items-center gap-1"
              >
                Status: {COLUMNS.find((c) => c.id === status)?.title}
                <button
                  onClick={() => setStatusFilter(statusFilter.filter((s) => s !== status))}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  ×
                </button>
              </span>
            ))}
            {assigneeFilter.map((assigneeId) => {
              const assignee = uniqueAssignees.find((a) => a.id === assigneeId)
              return (
                <span
                  key={assigneeId}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm flex items-center gap-1"
                >
                  Assignee: {assignee?.username}
                  <button
                    onClick={() =>
                      setAssigneeFilter(assigneeFilter.filter((a) => a !== assigneeId))
                    }
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    ×
                  </button>
                </span>
              )
            })}
            {labelFilter.map((label) => (
              <span
                key={label}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm flex items-center gap-1"
              >
                Label: {label}
                <button
                  onClick={() => setLabelFilter(labelFilter.filter((l) => l !== label))}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Empty State */}
      {hasNoResults && (
        <div className="card p-8 text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No tasks found matching your filters
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your filters to see more results
          </p>
          <button onClick={clearAllFilters} className="btn-primary">
            Clear All Filters
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="card p-8 text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tasks...</p>
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
