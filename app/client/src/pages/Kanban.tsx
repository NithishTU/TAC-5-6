import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksAPI } from '../api/client'
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
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')

  // Debounce search text
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchText])

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', debouncedSearch, statusFilter, assigneeFilter],
    queryFn: () => {
      const params: { status?: string; assignee?: string; search?: string } = {}

      if (debouncedSearch) {
        params.search = debouncedSearch
      }
      if (statusFilter !== 'all') {
        params.status = statusFilter
      }
      if (assigneeFilter !== 'all') {
        params.assignee = assigneeFilter
      }

      return tasksAPI.list(params).then(res => res.data)
    },
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

  const getTasksByColumn = (columnId: string) => {
    return tasks.filter((task: Task) => task.status === columnId)
  }

  // Get unique assignees from all tasks
  const uniqueAssignees: User[] = Array.from(
    new Map(
      tasks
        .filter((task: Task) => task.assignee)
        .map((task: Task) => [task.assignee!.id, task.assignee!])
    ).values()
  ) as User[]

  // Filter handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value)
  }

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAssigneeFilter(e.target.value)
  }

  const handleClearFilters = () => {
    setSearchText('')
    setStatusFilter('all')
    setAssigneeFilter('all')
  }

  // Count active filters
  const activeFiltersCount =
    (searchText ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (assigneeFilter !== 'all' ? 1 : 0)

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
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search Input */}
          <div className="flex-1 min-w-64">
            <input
              type="text"
              value={searchText}
              onChange={handleSearchChange}
              placeholder="Search tasks..."
              className="input w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="min-w-40">
            <select
              value={statusFilter}
              onChange={handleStatusChange}
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

          {/* Assignee Filter */}
          <div className="min-w-40">
            <select
              value={assigneeFilter}
              onChange={handleAssigneeChange}
              className="input w-full"
              disabled={uniqueAssignees.length === 0}
            >
              <option value="all">All Assignees</option>
              {uniqueAssignees.map((assignee) => (
                <option key={assignee.id} value={assignee.id}>
                  {assignee.username}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={handleClearFilters}
            className={`btn ${
              activeFiltersCount > 0
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            disabled={activeFiltersCount === 0}
          >
            Clear Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white text-blue-600 rounded-full text-xs font-semibold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Results Count */}
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          {isLoading ? (
            <span>Loading tasks...</span>
          ) : (
            <span>
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
      </div>

      {/* Empty State */}
      {!isLoading && tasks.length === 0 && activeFiltersCount > 0 && (
        <div className="card p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No tasks found matching your filters
          </p>
          <button
            onClick={handleClearFilters}
            className="mt-4 btn-primary"
          >
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
