import { Outlet } from 'react-router'
import { SideNav } from './SideNav'
export function DashboardLayout() {
  return (
    <>
      <SideNav />
      <div className="flex-1 ml-60 flex flex-col min-h-screen h-full">
        <main className="flex-1 p-4 bg-background flex flex-col h-[calc(100vh-64px)]">
          <Outlet />
        </main>
      </div>
    </>
  )
}
