export default function Analytics() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
        Analytics
      </h2>

      <div className="card">
        <p className="text-gray-600 dark:text-gray-400">
          Analytics functionality coming soon...
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          This page will include:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-500 mt-2 space-y-1">
          <li>Velocity charts</li>
          <li>Burndown charts</li>
          <li>Commit frequency heatmap</li>
          <li>PR cycle time metrics</li>
          <li>Team activity feed</li>
        </ul>
      </div>
    </div>
  )
}
