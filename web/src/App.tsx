import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppShell } from './components/layout/AppShell'
import { ProtectedRoute } from './components/routing/ProtectedRoute'
import DashboardPage from './pages/DashboardPage'
import BikeDetailPage from './pages/BikeDetailPage'
import BikeFormPage from './pages/BikeFormPage'
import BikesPage from './pages/BikesPage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'
import ProfileSetupPage from './pages/ProfileSetupPage'
import ScheduleFormPage from './pages/ScheduleFormPage'
import SchedulesPage from './pages/SchedulesPage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import WelcomePage from './pages/WelcomePage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/welcome" replace /> },
      { path: 'welcome', element: <WelcomePage /> },
      { path: 'sign-in', element: <SignInPage /> },
      { path: 'sign-up', element: <SignUpPage /> },
      {
        path: 'profile-setup',
        element: (
          <ProtectedRoute>
            <ProfileSetupPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'bikes',
        element: (
          <ProtectedRoute>
            <BikesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'bikes/new',
        element: (
          <ProtectedRoute>
            <BikeFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'bikes/:bikeId',
        element: (
          <ProtectedRoute>
            <BikeDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'bikes/:bikeId/edit',
        element: (
          <ProtectedRoute>
            <BikeFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'bikes/:bikeId/schedules',
        element: (
          <ProtectedRoute>
            <SchedulesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'bikes/:bikeId/schedules/new',
        element: (
          <ProtectedRoute>
            <ScheduleFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'bikes/:bikeId/schedules/:scheduleId/edit',
        element: (
          <ProtectedRoute>
            <ScheduleFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'history',
        element: (
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
])

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
