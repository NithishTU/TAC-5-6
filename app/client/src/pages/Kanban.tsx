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
  const [searchText, setSearchText] = useState('')
  const [debouncedSearchText, setDebouncedSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [labelFilter, setLabelFilter] = useState<string | null>(null)

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchText])

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return debouncedSearchText !== '' || statusFilter !== null || labelFilter !== null
  }, [debouncedSearchText, statusFilter, labelFilter])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (debouncedSearchText !== '') count++
    if (statusFilter !== null) count++
    if (labelFilter !== null) count++
    return count
  }, [debouncedSearchText, statusFilter, labelFilter])

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', debouncedSearchText, statusFilter],
    queryFn: () => tasksAPI.list({
      search: debouncedSearchText || undefined,
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

  // Client-side label filtering
  const filteredTasks = useMemo(() => {
    if (labelFilter === null) return tasks
    return tasks.filter((task: Task) =>
      task.labels && task.labels.includes(labelFilter)
    )
  }, [tasks, labelFilter])

  // Extract unique labels from all tasks
  const availableLabels = useMemo(() => {
    const labels = new Set<string>()
    tasks.forEach((task: Task) => {
      if (task.labels) {
        task.labels.forEach(label => labels.add(label))
      }
    })
    return Array.from(labels).sort()
  }, [tasks])

  const getTasksByColumn = (columnId: string) => {
    return filteredTasks.filter((task: Task) => task.status === columnId)
  }

  const handleClearFilters = () => {
    setSearchText('')
    setDebouncedSearchText('')
    setStatusFilter(null)
    setLabelFilter(null)
  }

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

      {/* Filter Toolbar */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search tasks by title or description..."
              className="input w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="min-w-[150px]">
            <select
              value={statusFilter || 'all'}
              onChange={(e) => setStatusFilter(e.target.value === 'all' ? null : e.target.value)}
              className="input w-full"
            >
              <option value="all">All Statuses</option>
              {COLUMNS.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.title}
                </option>
              ))}
            </select>
          </div>

          {/* Label Filter */}
          <div className="min-w-[150px]">
            <select
              value={labelFilter || 'all'}
              onChange={(e) => setLabelFilter(e.target.value === 'all' ? null : e.target.value)}
              className="input w-full"
              disabled={availableLabels.length === 0}
            >
              <option value="all">All Labels</option>
              {availableLabels.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={handleClearFilters}
            className="btn-primary"
            disabled={!hasActiveFilters}
          >
            Clear Filters
          </button>

          {/* Active Filter Indicator */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded">
                {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
              </span>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3 text-sm">
            {debouncedSearchText && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                Search: "{debouncedSearchText}"
              </span>
            )}
            {statusFilter && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                Status: {COLUMNS.find(c => c.id === statusFilter)?.title}
              </span>
            )}
            {labelFilter && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                Label: {labelFilter}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Empty State when filters return no results */}
      {hasActiveFilters && filteredTasks.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No tasks match your filters. Try adjusting your search criteria.
          </p>
          <button onClick={handleClearFilters} className="btn-primary">
            Clear Filters
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
