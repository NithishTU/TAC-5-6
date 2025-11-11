export default function TimeTracker() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
        Time Tracker
      </h2>

      <div className="card">
        <p className="text-gray-600 dark:text-gray-400">
          Time tracking functionality coming soon...
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          This page will include:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-500 mt-2 space-y-1">
          <li>Start/stop timer for tasks</li>
          <li>Pomodoro mode</li>
          <li>Time entry history</li>
          <li>Daily/weekly summaries</li>
        </ul>
      </div>
    </div>
  )
}
