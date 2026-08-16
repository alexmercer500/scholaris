import { lazy, Suspense, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router'
import { Pencil, Save, X, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { TopAppBar } from "@components/layout/TopAppBar";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Skeleton } from "@components/ui/Skeleton";
import { getInitials } from '@lib/helper';
import {
  useGetStudentQuery,
  useUpdateStudentMutation,
} from "../api/studentApi";
import type { Student } from "@models/models";
import { demoClasses } from "@mocks/db/classes";
import { ErrorBoundary } from "@components/ui/ErrorBoundary";

const StudentAttendancePanel = lazy(() =>
  import('@features/attendance/components/StudentAttendancePanel').then((m) => ({
    default: m.StudentAttendancePanel,
  })),
)

function classNameFor(classId: string): string {
  return demoClasses.find((c) => c.id === classId)?.name ?? classId
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-on-surface-variant">{label}</dt>
      <dd className="mt-1 text-base font-medium text-on-surface">
        {value || '—'}
      </dd>
    </div>
  )
}

const STATUSES = ['active', 'inactive', 'transferred'] as const

export function StudentDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)

  const { data: student, isLoading, error } = useGetStudentQuery(id)
  const [updateStudent, { isLoading: saving }] = useUpdateStudentMutation()

  /**
   * Only the fields the user has actually touched live in state; the form
   * value is derived from the server data on every render. This keeps the
   * fetched student as the single source of truth — no effect needed to sync
   * the two, and a refetch can't silently clobber an in-progress edit.
   */
  const [edits, setEdits] = useState<Partial<Student>>({})
  const form: Partial<Student> = { ...student, ...edits }

  const set = (key: keyof Student) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setEdits((prev) => ({ ...prev, [key]: e.target.value }))

  const startEditing = () => {
    if (student) {
      setForm(student)
    }
    setEditing(true)
  }

  if (isLoading) {
    return (
      <>
        <TopAppBar>
          <div>
            <h2 className="font-headline text-2xl font-bold text-on-surface">Student details</h2>
          </div>
        </TopAppBar>
        <div className="space-y-6 p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/30">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </>
    )
  }

  if (error || !student) {
    return (
      <div className="p-8 font-body text-error">Error loading student details</div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateStudent({ id: student.id, updates: edits }).unwrap()
      toast.success('Student updated')
      setEdits({})
      setEditing(false)
    } catch (err) {
      console.log(err);
      toast.error('Failed to update student')
    }
  }

  return (
    <>
      <TopAppBar>
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-0.5">Student details</h2>
          <p className="text-sm text-on-surface-variant">
            <Link to="/students" className="hover:text-primary">Students</Link>
            <span className="mx-1.5 text-outline">›</span>
            {student.name}
          </p>
        </div>
      </TopAppBar>

      <div className="bg-surface-container-lowest rounded-xl shadow-soft border border-outline-variant/30 overflow-hidden">
        {/* Profile header */}
        <div className="flex flex-wrap items-center gap-5 p-6 border-b border-outline-variant/20">
          <div className="size-16 rounded-full bg-primary-container flex items-center justify-center font-headline font-bold text-2xl text-primary-fixed-variant shrink-0">
            {getInitials(student.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-headline text-xl font-bold text-on-surface">
              {student.name}
            </h3>
            <p className="text-on-surface-variant">
              {student.rollNumber} · {classNameFor(student.classId)} {student.section}
            </p>
            <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-fixed text-on-primary-fixed-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {student.status}
            </span>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button variant="secondary" size="sm" onClick={() => navigate('/students')}>
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            {!editing && (
              <Button size="sm" onClick={startEditing}>
                <Pencil className="w-4 h-4" /> Edit
              </Button>
            )}
          </div>
        </div>

        {editing ? (
          /* ---- Edit form ---- */
          <form onSubmit={handleSubmit} className="p-6 grid gap-6 md:grid-cols-2">
            <Input label="Student Name" id="name" value={form.name ?? ''} onChange={set('name')} />
            <Input label="Roll Number" id="roll" value={form.rollNumber ?? ''} onChange={set('rollNumber')} />

            <div className="space-y-2">
              <label htmlFor="class" className="block text-sm font-semibold text-on-surface">Class</label>
              <select
                id="class"
                value={form.classId ?? ''}
                onChange={set('classId')}
                className="w-full px-3 py-3 border border-outline-variant rounded-[12px] bg-surface-container-lowest text-on-surface font-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {demoClasses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <Input label="Section" id="section" value={form.section ?? ''} onChange={set('section')} />
            <Input label="Guardian" id="guardian" value={form.guardian ?? ''} onChange={set('guardian')} />
            <Input label="Contact" id="contact" value={form.contact ?? ''} onChange={set('contact')} />
            <Input label="Enrolment Date" id="enrol" type="date" value={form.enrolmentDate ?? ''} onChange={set('enrolmentDate')} />

            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-semibold text-on-surface">Status</label>
              <select
                id="status"
                value={form.status ?? ''}
                onChange={set('status')}
                className="w-full px-3 py-3 border border-outline-variant rounded-[12px] bg-surface-container-lowest text-on-surface font-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">{s}</option>
                ))}
              </select>
            </div>

            {/* Attendance (read-only in edit) */}
            <div className="md:col-span-2">
              <Field label="Attendance" value={`${student.attendancePercentage}%`} />
            </div>

            <div className="md:col-span-2 flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setEdits({})
                  setEditing(false)
                }}
                disabled={saving}
              >
                <X className="w-4 h-4" /> Cancel
              </Button>
            </div>
          </form>
        ) : (
          /* ---- Read-only detail grid ---- */
          <dl className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <Field label="Roll Number" value={student.rollNumber} />
            <Field label="Class" value={`${classNameFor(student.classId)} ${student.section}`} />
            <Field label="Guardian" value={student.guardian} />
            <Field label="Contact" value={student.contact} />
            <Field label="Enrolment Date" value={student.enrolmentDate} />
            <Field label="Attendance" value={`${student.attendancePercentage}%`} />
            <Field label="Status" value={student.status} />
            <Field label="Student ID" value={student.id} />
          </dl>
        )}
      </div>

      {!editing && (
        <div className="mt-6">
          <ErrorBoundary fallback={null}>
            <Suspense
              fallback={
                <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 h-32 animate-pulse" />
              }
            >
              <StudentAttendancePanel studentId={student.id} classId={student.classId} />
            </Suspense>
          </ErrorBoundary>
        </div>
      )}
    </>
  )
}
