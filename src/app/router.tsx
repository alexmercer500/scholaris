import { createBrowserRouter, RouterProvider } from 'react-router'
import { LoginPage } from '@features/auth/pages/LoginPage'
import RequireAuth from '@features/auth/components/RequireAuth'
import DashBoard from '@features/dashboard/pages/DashBoard'
import { NotFound } from '@features/pages/NotFound'
import GuestOnly from '@features/auth/components/GuestOnly'
import { DashboardLayout } from '@components/layout/DashboardLayout'
import { StudentsPage } from '@features/students/pages/StudentPage'

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <GuestOnly>
        <LoginPage />
      </GuestOnly>
    ),
  },
  {
    element: (
      <RequireAuth>
        <DashboardLayout />
      </RequireAuth>
    ),
    children: [
      { path: '/', element: <DashBoard /> },
      { path: '/students', element: <StudentsPage /> }
    ],
  },
  { path: '*', element: <NotFound /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
