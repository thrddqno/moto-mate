import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import DashboardPage from './pages/DashboardPage'
import BikesPage from './pages/BikesPage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'
import WelcomePage from './pages/WelcomePage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/welcome" replace /> },
      { path: 'welcome', element: <WelcomePage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'bikes', element: <BikesPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
