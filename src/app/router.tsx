import { lazy, Suspense, type ReactNode, type ComponentType } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { LoginPage } from '@features/auth/pages/LoginPage'
import RequireAuth from '@features/auth/components/RequireAuth'
import DashBoard from '@features/dashboard/pages/DashBoard'
import { NotFound } from '@features/pages/NotFound'
import GuestOnly from '@features/auth/components/GuestOnly'
import { DashboardLayout } from '@components/layout/DashboardLayout'
import { StudentsPage } from '@features/students/pages/StudentPage'
import { StudentDetailPage } from '@features/students/pages/StudentDetailPage'

const lazyPage = <T extends ComponentType<any>>(
  importFn: () => Promise<Record<string, T>>,
  exportName: string,
) =>
  lazy(() =>
    importFn().then((module) => ({
      default: module[exportName],
    })),
  );
const AttendancePage = lazyPage(
  () => import('@features/attendance/pages/AttendancePage'),
  'AttendancePage'
);

const DaySheetPage = lazyPage(
  () => import('@features/attendance/pages/DaySheetPage'),
  'DaySheetPage'
);

const FacultyPage = lazyPage(
  () => import('@features/faculty/page/FacultyPage'),
  'FacultyPage'
);

const SettingsPage = lazyPage(
  () => import('@features/settings/page/SettingsPage'),
  'SettingsPage'
);

function withSuspense(element: ReactNode) {
  return (
    <Suspense fallback={<div className="p-8 text-on-surface-variant">Loading…</div>}>
      {element}
    </Suspense>
  )
}

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
      { path: '/students', element: <StudentsPage /> },
      { path: '/students/:id', element: <StudentDetailPage /> },
      { path: '/attendance', element: withSuspense(<AttendancePage />) },
      { path: '/attendance/:date', element: withSuspense(<DaySheetPage />) },
      { path: '/faculty', element: withSuspense(<FacultyPage />) },
      { path: '/settings', element: withSuspense(<SettingsPage />) },
    ],
  },
  { path: '*', element: <NotFound /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

