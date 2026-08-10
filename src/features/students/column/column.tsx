import type { ColumnDef, RowData } from "@tanstack/react-table";
import { Link } from 'react-router'
import type { Student } from "@models/models";
import { cn } from "@lib/cn";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    __variance?: [TData, TValue];
    thClassName?: string;
    tdClassName?: string;
  }
}

export type StudentRow = Student & { className: string };

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
function isAtRisk(student: StudentRow): boolean {
  return student.attendancePercentage < 75
}

export const studentColumns: ColumnDef<StudentRow>[] = [
  // {
  //   id: 'select',
  //   header: () => <input type="checkbox" className="w-4 h-4 accent-primary cursor-pointer" />,
  //   cell: () => <input type="checkbox" className="w-4 h-4 accent-primary cursor-pointer" />,
  //   enableSorting: false,
  //   meta: { thClassName: 'py-4 pl-6 pr-3 w-12', tdClassName: 'py-3 pl-6 pr-3' },
  // },
  {
    accessorKey: 'rollNumber',
    header: 'Roll No',
    cell: ({ row }) => (
      <span className="font-mono text-sm text-secondary">{row.original.rollNumber}</span>
    ),
    meta: { thClassName: 'py-4 pl-6 pr-3 font-semibold w-24', tdClassName: 'py-4 pl-6 pr-3' },
  },
  {
    accessorKey: 'name',
    header: 'Student Name',
    cell: ({ row }) => {
      const student = row.original
      return (
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
            <Link
              to={`/students/${student.id}`}
              className="font-bold text-on-surface group-hover:text-primary transition-colors hover:text-primary cursor-pointer"
            >
              {student.name}
            </Link>
          </div>
        </div>
      )
    },
    meta: { thClassName: 'py-4 px-3 font-semibold', tdClassName: 'p-2.5' },
  },
  {
    accessorKey: 'className',
    header: 'Class / Section',
    cell: ({ row }) => (
      <>
        {row.original.className} · {row.original.section}
      </>
    ),
    meta: {
      thClassName: 'py-4 px-3 font-semibold',
      tdClassName: 'p-2.5 text-on-surface-variant',
    },
  },
  {
    accessorKey: 'guardian',
    header: 'Guardian Contact',
    cell: ({ row }) => (
      <>
        <p className="font-medium text-on-surface">{row.original.guardian}</p>
        <p className="text-xs text-on-surface-variant">{row.original.contact}</p>
      </>
    ),
    meta: { thClassName: 'py-4 px-3 font-semibold', tdClassName: 'p-2.5' },
  },
  {
    accessorKey: 'attendancePercentage',
    header: 'Attendance',
    cell: ({ row }) => (
      <span
        className={cn('font-medium', isAtRisk(row.original) ? 'text-error' : 'text-primary')}
      >
        {row.original.attendancePercentage}%
      </span>
    ),
    meta: {
      thClassName: 'py-4 px-3 font-semibold text-center w-28',
      tdClassName: 'p-2.5 text-center',
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const { status } = row.original
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
            status === 'active'
              ? 'bg-primary-fixed text-on-primary-fixed-variant'
              : 'bg-error-container text-on-error-container',
          )}
        >
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              status === 'active' ? 'bg-primary' : 'bg-error',
            )}
          />
          {status}
        </span>
      )
    },
    meta: {
      thClassName: 'py-4 pl-3 pr-6 font-semibold w-32',
      tdClassName: 'py-3 pl-3 pr-6',
    },
  },
]

