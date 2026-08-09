import { Search, Bell, Settings, LogOut } from 'lucide-react'
import { useLogout } from '@features/hooks/useLogout'

export function TopAppBar() {
  const logout = useLogout()

  return (
    <header className="flex justify-between items-center h-16 px-8 py-2.5 w-full bg-surface sticky top-0 z-10 border-b border-outline-variant/20">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative focus-within:ring-2 focus-within:ring-primary rounded-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-surface-container-high text-on-surface py-2 pl-12 pr-4 rounded-full border-none placeholder:text-on-surface-variant/70 font-body focus:outline-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
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
        </button>
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
