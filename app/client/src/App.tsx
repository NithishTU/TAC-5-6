import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Kanban from './pages/Kanban'
import TimeTracker from './pages/TimeTracker'
import Analytics from './pages/Analytics'
import GitHubPage from './pages/GitHubPage'
import Sprints from './pages/Sprints'
import Layout from './components/Layout'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/kanban" element={<Kanban />} />
        <Route path="/time" element={<TimeTracker />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/github" element={<GitHubPage />} />
        <Route path="/sprints" element={<Sprints />} />
      </Routes>
    </Layout>
  )
}

export default App
