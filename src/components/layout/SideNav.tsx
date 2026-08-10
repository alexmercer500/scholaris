import { NavLink } from 'react-router'
import {
  LayoutDashboard,
  GraduationCap,
  School,
  CalendarDays,
  Settings,
  // UserPlus,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@lib/cn'

interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

const mainNav: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Students', to: '/students', icon: GraduationCap },
  { label: 'Faculty', to: '/faculty', icon: School },
  // { label: 'Classes', to: '/classes', icon: Users },
  { label: 'Attendance', to: '/attendance', icon: CalendarDays },
  // { label: 'Reports', to: '/reports', icon: FileText },
]

const secondaryNav: NavItem[] = [
  { label: 'Settings', to: '/settings', icon: Settings },
  // { label: 'Support', to: '/support', icon: HelpCircle },
]

export function SideNav() {
  return (
    <nav className="fixed left-0 top-0 h-screen w-[240px] bg-surface-container-low flex flex-col py-6 px-4 shadow-soft z-20">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-headline font-bold text-xl">
          S
        </div>
        <div>
          <h1 className="font-headline text-2xl font-bold text-primary leading-tight">
            Scholaris
          </h1>
          <p className="text-on-surface-variant text-sm leading-tight">
            School Management
          </p>
        </div>
      </div>

      {/* New Registration */}
      {/* <button className="w-full bg-primary text-on-primary py-3 rounded-[12px] font-semibold mb-6 hover:bg-primary-fixed-dim transition-colors active:scale-[0.98] duration-200 flex items-center justify-center gap-2">
        <UserPlus className="w-5 h-5" />
        New Registration
      </button> */}

      {/* Main nav */}
      <ul className="flex-1 space-y-2">
        {mainNav.map((item) => (
          <li key={item.label}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant',
                  'transition-colors active:scale-[0.98] duration-200 font-label text-[15px] leading-relaxed',
                  'hover:bg-surface-container-high',
                  isActive &&
                  'bg-surface-container-high text-primary font-bold border-r-4 border-primary',
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Secondary nav */}
      <div className="mt-auto space-y-2 pt-6 border-t border-outline-variant/30">
        {secondaryNav.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant',
                'transition-colors active:scale-[0.98] duration-200 font-label text-[15px]',
                'hover:bg-surface-container-high',
                isActive &&
                'bg-surface-container-high text-primary font-bold border-r-4 border-primary',
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

