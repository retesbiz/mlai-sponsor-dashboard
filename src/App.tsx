import { useAppState } from './state/AppState'
import { Layout } from './components/Layout'
import LoginPage from './pages/LoginPage'
import ImportPage from './pages/ImportPage'
import SponsorsPage from './pages/SponsorsPage'
import DashboardPage from './pages/DashboardPage'
import SprintPage from './pages/SprintPage'

export default function App() {
  const { session, page } = useAppState()
  if (!session) return <LoginPage />
  return (
    <Layout>
      {page === 'import' && <ImportPage />}
      {page === 'sponsors' && <SponsorsPage />}
      {page === 'dashboard' && <DashboardPage />}
      {page === 'sprint' && <SprintPage />}
    </Layout>
  )
}
