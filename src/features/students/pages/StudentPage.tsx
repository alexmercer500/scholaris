import type { Student } from '@models/models'
import { useGetStudentsQuery } from '../api/studentApi'
import { PageHeader } from '@components/ui/PageHeader'
import { cn } from '@lib/cn'

/** "Student 1" -> "S1", "Priya Nair" -> "PN" */
function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
}

/** Attendance is "at risk" when below 75%. */
function isAtRisk(student: Student): boolean {
    return student.attendancePercentage < 75
}

export function StudentsPage() {
    const { data = [], isLoading, error } = useGetStudentsQuery(undefined)

    if (isLoading) {
        return (
            <div className="p-8 font-body text-on-surface-variant">
                Loading students...
            </div>
        )
    }
    if (error) {
        return <div className="p-8 font-body text-error">Error loading students</div>
    }

    return (
        <>
            <PageHeader
                title="Students Directory"
                subtitle="Manage, filter, and review student records and academic standing."
            />

            {/* Bento table card */}
            <div className="bg-surface-container-lowest rounded-xl shadow-soft border border-outline-variant/30 overflow-hidden grow">
                <div className="overflow-x-auto h-full">
                    <table className="w-full text-left border-collapse min-w-225">
                        <thead>
                            <tr className="bg-surface-container text-on-surface-variant border-b border-outline-variant/50 text-sm tracking-wide uppercase font-label">
                                <th className="py-4 pl-6 pr-3 w-12">
                                    <input type="checkbox" className="w-4 h-4 accent-primary cursor-pointer" />
                                </th>
                                <th className="py-4 px-3 font-semibold w-24">Roll No</th>
                                <th className="py-4 px-3 font-semibold">Student Name</th>
                                <th className="py-4 px-3 font-semibold">Class / Section</th>
                                <th className="py-4 px-3 font-semibold">Guardian Contact</th>
                                <th className="py-4 px-3 font-semibold text-center w-28">Attendance</th>
                                <th className="py-4 pl-3 pr-6 font-semibold w-32">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-on-background font-body text-base divide-y divide-outline-variant/20">
                            {data.map((student) => (
                                <tr
                                    key={student.id}
                                    className="hover:bg-surface-container/30 transition-colors group"
                                >
                                    <td className="py-3 pl-6 pr-3">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 accent-primary cursor-pointer"
                                        />
                                    </td>
                                    <td className="p-2.5 font-mono text-sm text-secondary">
                                        {student.rollNumber}
                                    </td>
                                    <td className="p-2.5">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={cn(
                                                    'size-8 rounded-full flex items-center justify-center font-bold font-headline text-sm shrink-0',
                                                    isAtRisk(student)
                                                        ? 'bg-error-container text-error'
                                                        : 'bg-primary-container text-primary-fixed-variant',
                                                )}
                                            >
                                                {getInitials(student.name)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-on-surface group-hover:text-primary transition-colors cursor-pointer">
                                                    {student.name}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-2.5 text-on-surface-variant">
                                        {student.className} · {student.section}
                                    </td>
                                    <td className="p-2.5">
                                        <p className="font-medium text-on-surface">
                                            {student.guardian}
                                        </p>
                                        <p className="text-xs text-on-surface-variant">
                                            {student.contact}
                                        </p>
                                    </td>
                                    <td className="p-2.5 text-center">
                                        <span
                                            className={cn(
                                                'font-medium',
                                                isAtRisk(student) ? 'text-error' : 'text-primary',
                                            )}
                                        >
                                            {student.attendancePercentage}%
                                        </span>
                                    </td>
                                    <td className="py-3 pl-3 pr-6">
                                        <span
                                            className={cn(
                                                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                                                student.status === 'active'
                                                    ? 'bg-primary-fixed text-on-primary-fixed-variant'
                                                    : 'bg-error-container text-on-error-container',
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'w-1.5 h-1.5 rounded-full',
                                                    student.status === 'active' ? 'bg-primary' : 'bg-error',
                                                )}
                                            />
                                            {student.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}
