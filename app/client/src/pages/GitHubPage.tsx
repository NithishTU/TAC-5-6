export default function GitHubPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
        GitHub Integration
      </h2>

      <div className="card">
        <p className="text-gray-600 dark:text-gray-400">
          GitHub integration coming soon...
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          This page will include:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-500 mt-2 space-y-1">
          <li>PR queue (PRs awaiting your review)</li>
          <li>My pull requests</li>
          <li>Recent commits</li>
          <li>Issue tracker</li>
          <li>GitHub OAuth connection</li>
        </ul>
      </div>
    </div>
  )
}
