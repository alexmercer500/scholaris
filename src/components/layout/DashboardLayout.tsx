import { Outlet } from 'react-router'
import { SideNav } from './SideNav'
import { TopAppBar } from './TopAppBar'
export function DashboardLayout() {
  return (
    <>
      <SideNav />
      <div className="flex-1 ml-60 flex flex-col min-h-screen h-full">
        <TopAppBar />
        <main className="flex-1 p-4 bg-background h-full flex flex-col">
          <Outlet />
        </main>
      </div>
    </>
  )
}
