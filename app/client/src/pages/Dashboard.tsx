import { useQuery } from '@tanstack/react-query'
import { analyticsAPI, githubAPI, tasksAPI } from '../api/client'

export default function Dashboard() {
  const { data: summary } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => analyticsAPI.getSummary().then(res => res.data),
  })

  const { data: myPRs } = useQuery({
    queryKey: ['my-prs'],
    queryFn: () => githubAPI.getPRs().then(res => res.data),
    retry: false,
  })

  const { data: activeTasks } = useQuery({
    queryKey: ['active-tasks'],
    queryFn: () => tasksAPI.list({ status: 'in_progress' }).then(res => res.data),
  })

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
        Dashboard
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Tasks
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {summary?.total_tasks || 0}
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Completed
          </h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {summary?.completed_tasks || 0}
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Active Tasks
          </h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {summary?.active_tasks || 0}
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Time Logged
          </h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {summary?.total_time_logged
              ? `${Math.floor(summary.total_time_logged / 3600)}h`
              : '0h'}
          </p>
        </div>
      </div>

      {/* Active Tasks Widget */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Active Tasks
        </h3>
        {activeTasks && activeTasks.length > 0 ? (
          <div className="space-y-2">
            {activeTasks.map((task: any) => (
              <div
                key={task.id}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <p className="font-medium text-gray-900 dark:text-white">
                  {task.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {task.description || 'No description'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No active tasks
          </p>
        )}
      </div>

      {/* GitHub PRs Widget (if available) */}
      {myPRs && myPRs.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            My Pull Requests
          </h3>
          <div className="space-y-2">
            {myPRs.slice(0, 5).map((pr: any) => (
              <div
                key={pr.id}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <p className="font-medium text-gray-900 dark:text-white">
                  {pr.repository} #{pr.pr_number}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {pr.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
