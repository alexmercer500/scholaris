import { Bell, Settings, LogOut } from 'lucide-react'
import { useLogout } from '@features/hooks/useLogout'
import type { ReactNode } from 'react'

export function TopAppBar({ children }: { children: ReactNode }) {
  const logout = useLogout()

  return (
    <header className="flex justify-between items-center pb-2.5 mb-2.5 w-full bg-surface border-b border-outline-variant/20">
      {children}
      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* <button
          type="button"
          className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors active:scale-[0.98] duration-200"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors active:scale-[0.98] duration-200"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button> */}
        <button
          type="button"
          onClick={logout}
          className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-error transition-colors active:scale-[0.98] duration-200"
          aria-label="Logout"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-surface-container-highest bg-surface-container-high flex items-center justify-center">
          <span className="font-headline font-bold text-on-surface-variant">A</span>
        </div>
      </div>
    </header>
  )
}
