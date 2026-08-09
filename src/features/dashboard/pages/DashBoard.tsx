import { GraduationCap, School, Users, CalendarDays } from 'lucide-react'
import { PageHeader } from '@components/ui/PageHeader'
import { StatCard } from '@components/ui/StatCard'
import { useGetDashboardStatsQuery } from '../api/dashBoardApi'
export default function DashBoard() {
    const { data, isLoading, error } = useGetDashboardStatsQuery(undefined)
    if (isLoading) return <div>Loading</div>
    if (error) return <div>Error loading dashboard</div>
    if (!data) return null
    return (
        <main>
            <PageHeader
                title="Dashboard"
                subtitle="Overview of your institution"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Students" value={data.students} icon={GraduationCap} tone="primary" />
                <StatCard label="Teachers" value={data.teachers} icon={School} tone="tertiary" />
                <StatCard label="Classes" value={data.classes} icon={Users} tone="secondary" />
                <StatCard label="Attendance Today" value={`${data.attendance}%`} icon={CalendarDays} tone="error" />
            </div>
        </main>
    )
}