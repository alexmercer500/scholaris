# Scholaris — Application Plan

School Management System · React 19 frontend · Delivery Tuesday 11 August

---

## 1. Tech stack

### Core

| Concern | Choice | Version |
|---|---|---|
| Framework | React | 19 |
| Language | TypeScript (strict) | 5.6+ |
| Build | Vite | 6 |
| Routing | React Router (data router) | 7 |

### State and data

| Concern | Choice | Used for |
|---|---|---|
| Client state | Redux Toolkit slices | auth, UI preferences, timetable editor, marks grid |
| Server state | RTK Query | all API reads and writes, tag-based invalidation |
| Secondary fetching | TanStack Query | one feature only — infinite-scroll activity feed |
| Mock API | MSW (Mock Service Worker) | intercepts real `fetch`, latency and error injection |
| Persistence | `localStorage` via MSW handlers | demo data survives refresh |

### UI

| Concern | Choice | Notes |
|---|---|---|
| Component library | **Mantine 7** | best-in-class data grid, date pickers, notifications, modals manager, spotlight search |
| Tables | TanStack Table 8 | headless, wraps Mantine styling |
| Virtualization | TanStack Virtual 3 | 5,000 row student list |
| Drag and drop | dnd-kit | timetable builder |
| Charts | Recharts | attendance trends, grade distribution |
| Icons | Tabler Icons | ships with Mantine |
| Forms | React Hook Form + Zod | all forms, shared schemas |
| Dates | date-fns | |

**Why Mantine over MUI:** the modals manager, notifications system, and spotlight (⌘K) are built in, saving roughly six hours across a six-day build. Its default aesthetic is also less recognisable than MUI's, which matters when a reviewer has seen forty MUI demos.

### Quality

Vitest + Testing Library for the constraint engine and computation logic. ESLint with `eslint-plugin-react-hooks` and `@tanstack/eslint-plugin-query`. Prettier. Husky pre-commit running typecheck and lint.

---

## 2. Roles and permissions

| Role | Scope |
|---|---|
| `ADMIN` | Everything. Manages people, classes, subjects, rooms, builds the timetable, runs exams |
| `TEACHER` | Only assigned classes. Marks attendance, enters marks, views own timetable |
| `STUDENT` | Self only. Own timetable, attendance record, results |

Permissions are strings checked by a `usePermissions` hook and a `<Can permission="...">` component.

```
student.read  student.write   teacher.read  teacher.write
class.read    class.write     subject.write room.write
timetable.read timetable.write
attendance.read attendance.mark
marks.read    marks.enter     marks.publish
user.manage
```

Navigation items are hidden entirely when a user holds no permission inside a section. A teacher never sees a greyed-out Admin link.

---

## 3. Pages

**16 feature routes plus 2 error routes.** Tier 1 must ship, tier 2 should ship, tier 3 only if ahead.

### Tier 1 — core (10)

---

#### 1. `/login`

**Items:** Email field, password field, show/hide toggle, submit button, error alert, three demo-account quick-fill buttons (admin, teacher, student).

**Functionality:** Zod-validated form. On success stores the access token in Redux memory and the refresh token, then redirects to the role's landing route or to the `from` location the guard captured.

**Managed by:** `React Hook Form` + `zodResolver`. `useLoginMutation` from RTK Query. `useNavigate` and `useLocation` for redirect-back.

**Flows to:** role landing page.

---

#### 2. `/` — Dashboard

Three variants sharing one widget library.

**Admin sees:** total students, total teachers, today's attendance percentage, timetable completeness percentage · attendance trend chart (30 days) · classes below 75% attendance · unfilled timetable slots · recent activity feed.

**Teacher sees:** my classes today, periods remaining, attendance not yet marked, marks pending entry · my timetable strip for today · my classes list with quick-mark buttons.

**Student sees:** my attendance percentage with a ring chart · next period card with countdown · today's timetable · latest exam result summary.

**Functionality:** Every tile is a link. Nothing is decorative. The activity feed uses `useInfiniteQuery` from TanStack Query with scroll-triggered pagination.

**Managed by:** One `<StatTile>`, `<ChartCard>`, `<ListCard>` set, composed differently per role. Role branch happens once at the page level, not inside each widget. RTK Query with a 60-second `pollingInterval` on the attendance tile.

**Flows to:** `/attendance` (unmarked), `/timetable` (unfilled slots), `/classes/:id`, `/results/...`.

---

#### 3. `/students`

**Items:** Search box, class filter, section filter, status filter, active-filter chips, column visibility menu, density toggle, export CSV, add student, virtualized table (5,000 rows), pagination footer.

**Columns:** Roll number · Name with avatar · Class · Section · Guardian · Contact · Attendance % · Status.

**Functionality:** Server-style filter, sort and pagination through MSW. Every query parameter is held in the URL, so a filtered view is shareable and survives refresh and the back button. Debounced search with request cancellation. Row click opens detail. Bulk select with a bulk class-transfer action.

**Managed by:** Generic `<DataTable<T>>` built on TanStack Table plus TanStack Virtual. `useUrlState` custom hook backed by `useSearchParams`. `useDebounce` at 300ms. `useTransition` wrapping filter changes so typing stays responsive at 5,000 rows. Row components wrapped in `memo` with `useCallback` handlers.

**Flows to:** `/students/:id`, add-student modal.

---

#### 4. `/students/:id`

**Items:** Header with photo, name, roll number, class, status badge, edit and more-actions. Four tabs.

| Tab | Contents |
|---|---|
| Profile | Personal details, guardian details, address, enrolment date, edit in a drawer |
| Attendance | Monthly calendar heatmap, percentage, present/absent/late/excused counts, subject-wise breakdown |
| Results | Exam-wise cards with percentage, grade, class rank, link to full report card |
| Timetable | The student's weekly grid, read-only |

**Managed by:** Tab state in the URL as a search param so a tab is linkable. Each tab lazily fetches only when opened, via RTK Query `skip`. Attendance heatmap computed with `useMemo`.

**Flows to:** `/results/:classId/:examId/:studentId`, `/classes/:id`.

---

#### 5. `/teachers`

Same `<DataTable>` component as students, different column definitions. Columns: Employee ID · Name · Subjects taught · Classes assigned · Periods per week · Contact · Status.

Filters: subject, class, availability.

**The point:** this page should take under thirty minutes because the table abstraction already exists. That reuse is worth calling out in the README.

**Flows to:** `/teachers/:id`.

---

#### 6. `/classes/:id`

**Items:** Header with class name, section, class teacher, student count, room. Four tabs.

| Tab | Contents |
|---|---|
| Roster | Student list with roll numbers, add and remove students |
| Subjects | Subject-to-teacher assignments, weekly period quota per subject |
| Timetable | This class's weekly grid, read-only, link to builder |
| Performance | Attendance trend, exam averages, top and bottom performers |

**Managed by:** Subject assignment uses `useFieldArray` from React Hook Form for the dynamic rows. Performance figures derived with `useMemo`, never stored.

**Flows to:** `/students/:id`, `/timetable?class=`, `/results/:classId/:examId`.

---

#### 7. `/timetable` — the centrepiece

**Items:** Class selector, view toggle (by class / by teacher / by room), the 5 day × 8 period grid, an unassigned subject pool showing remaining weekly quota per subject, a live violations panel, undo and redo buttons, auto-fill button, publish button.

**Functionality:**

Drag a subject card from the pool into a grid cell, or drag an assigned card between cells. During drag-hover every cell shows whether the drop is legal: green outline for valid, red for a hard conflict, amber for a soft warning, with a tooltip stating the reason.

Seven constraint rules, all pure functions with unit tests:

| Rule | Severity |
|---|---|
| Teacher double-booked across classes | Error |
| Class double-booked | Error |
| Room double-booked | Error |
| Teacher not qualified for the subject | Error |
| Slot falls in the teacher's declared unavailability | Error |
| Subject weekly quota not met | Warning |
| Teacher exceeds daily period limit | Warning |

Undo and redo via keyboard, unlimited depth within the session.

Auto-fill greedily places remaining requirements into conflict-free slots and reports anything it could not place, with reasons.

Publish is blocked while any hard error exists.

**Managed by:**

`useReducer` holding `{ slots, past, future }` with an invertible command union: `PLACE`, `MOVE`, `REMOVE`, `BULK_AUTOFILL`.

A memoized conflict index — `Map<"day:period:teacherId", Slot>` and equivalents for class and room — rebuilt with `useMemo` on the slot array. Hover validation is three map lookups, not three array scans. Without this the grid janks visibly.

`dnd-kit` with `DragOverlay` rendered through a portal.

`useBlocker` from React Router prompts on navigation with unsaved changes.

`useHotkeys` from Mantine for Ctrl+Z and Ctrl+Shift+Z.

The constraint engine lives in `features/timetable/lib/constraints.ts` and imports nothing from React.

**Flows to:** `/classes/:id`, `/teachers/:id`.

---

#### 8. `/attendance` — three tabs

**Tab A · Mark.** Class selector, date picker, roster list. Mark-all-present button, then flip exceptions. Four statuses: Present, Absent, Late, Excused. Full keyboard operation — arrow keys move between students, `P` `A` `L` `E` set status and advance. A submit-all button plus per-row auto-save.

**Tab B · Register.** Students down the side, dates across the top, a dense month grid of status glyphs. Read-only. Click a cell to jump to that date in Mark.

**Tab C · Defaulters.** Students below 75% for the selected month, with their percentage and absent count, exportable.

**Functionality and managed by:**

Each mark writes optimistically through RTK Query `onQueryStarted` with a manual cache patch, reverting on failure with an inline error and a retry button. React 19's `useOptimistic` handles the immediate visual state.

A pending-write queue prevents races when marks are made faster than requests complete. Queue depth shown in a small badge. Custom hook: `useOptimisticQueue`.

`useSyncExternalStore` drives an online/offline indicator; while offline, writes queue and flush on reconnect.

Keyboard grid navigation via a single container-level keydown handler and `useRef`, not forty listeners.

Percentages and defaulter lists derived with `useMemo`.

**This is the tab where the MSW error-rate toggle gets demonstrated.**

**Flows to:** `/students/:id` attendance tab.

---

#### 9. `/marks`

**Items:** Class, exam and subject selectors. Entry grid with students down the side and components across the top (Theory /70, Practical /30). Live summary strip showing class average, highest, lowest and pass count. Save draft and publish buttons.

**Functionality:** Type a score, tab to the next. Invalid entries — above maximum, negative, non-numeric — highlight inline without blocking other cells. Publishing is blocked while any cell is invalid or empty.

**Managed by:** `useReducer` for the grid, since a single value change touches the cell, the row total, and the aggregate strip. Uncontrolled inputs with `useRef` for performance across 40 × 4 cells, validated on blur. `useBlocker` guards navigation with unsaved marks. All aggregates derived with `useMemo`.

**Flows to:** `/results/:classId/:examId`.

---

#### 10. `/results/:classId/:examId`

**Items:** Class and exam header, results table (rank, roll, name, subject-wise marks, total, percentage, grade, result), grade distribution histogram, subject-wise average bar chart, summary strip (pass rate, class average, highest, lowest).

**Functionality:** Everything computed, nothing stored. Chain: component scores → subject total → subject percentage → grade band → overall percentage → overall grade → rank with tie handling (two students at rank 3 means the next is rank 5) → pass/fail per subject and overall.

Grade bands are configuration data, not hardcoded conditionals.

**Managed by:** One pure module `features/marks/lib/computeResults.ts`, unit tested. `useMemo` over it in the page. Sorting and filtering through the shared `<DataTable>`.

**Flows to:** `/results/:classId/:examId/:studentId`.

---

### Tier 2 — should ship (4)

#### 11. `/teachers/:id`
Profile, subjects taught, classes assigned, weekly timetable, availability editor (which periods they cannot teach). The availability editor feeds the timetable constraint engine, so it earns its place.

#### 12. `/subjects`
List with code, name, department, weekly period quota, qualified teachers. Create and edit in a modal. Quota feeds the timetable warning rule.

#### 13. `/results/:classId/:examId/:studentId`
Printable report card. School header, student details, subject-wise table, totals, grade, rank, attendance summary, remarks, signature lines. A dedicated print stylesheet with `@page` rules. Print preview mode toggles a paper-sized container on screen.

#### 14. `/account`
Profile details, change password form, theme preference, table density preference, active sessions list.

---

### Tier 3 — only if ahead (2)

#### 15. `/rooms`
List with code, capacity, type, and a utilisation percentage derived from the timetable.

#### 16. `/admin/users`
User list, role assignment, class assignment for teachers, activate and deactivate.

---

### Error routes

`/403` — permission denied, with the missing permission named and a link home.
`/404` — not found.
Route-level `errorElement` using `useRouteError`, with a reset action.

---

## 4. Application flow

### Entry

```
/login ──> role check ──┬──> ADMIN    ──> /
                        ├──> TEACHER  ──> /   (teacher variant)
                        └──> STUDENT  ──> /   (student variant)
```

Unauthenticated access to any protected route redirects to `/login` with the attempted path captured, then returns there after login.

### Primary loops

```
                        ┌──────────────────────┐
                        │      Dashboard       │
                        └──┬────────┬────────┬─┘
             unmarked      │        │        │  unfilled slots
             attendance    │        │        └──────────────┐
                           │        │ pending marks         │
                           ▼        ▼                       ▼
       ┌────────────────────┐  ┌──────────┐        ┌────────────────┐
       │    /attendance     │  │  /marks  │        │   /timetable   │
       │  Mark · Register   │  │  entry   │        │    builder     │
       │     Defaulters     │  └────┬─────┘        └───────┬────────┘
       └─────────┬──────────┘       │ publish              │ publish
                 │                  ▼                      │
                 │        ┌───────────────────┐            │
                 │        │ /results/:c/:e    │            │
                 │        └─────────┬─────────┘            │
                 │                  │                      │
                 │                  ▼                      │
                 │      /results/:c/:e/:studentId          │
                 │                  │                      │
                 └──────────┬───────┴──────────────────────┘
                            ▼
                  ┌─────────────────────┐
                  │   /students/:id     │◄──── /students  (directory)
                  │  profile · attend   │
                  │  results · timetable│◄──── /classes/:id roster
                  └─────────────────────┘
```

### Cross-links to build

These are what make it feel like a system rather than a set of tables.

- Dashboard "attendance not marked" tile → `/attendance` with class and date preselected
- Dashboard "unfilled slots" tile → `/timetable` with the class preselected
- Class detail roster row → `/students/:id`
- Class detail subjects tab → `/timetable?class=` with that class loaded
- Student detail attendance tab → `/attendance` register filtered to that student
- Student detail results card → the printable report card
- Results table row → that student's report card
- Timetable cell → `/teachers/:id` for the assigned teacher
- Defaulters row → `/students/:id` attendance tab
- Any permission error → `/403` naming the specific permission required

### State ownership

| State | Lives in | Why |
|---|---|---|
| Access token, user, permissions | Redux `authSlice`, memory | read by nearly every component, must not persist |
| Sidebar collapsed, table density, column visibility | Redux `uiSlice` + `localStorage` | user preference, survives sessions |
| Selected class / date / exam context | URL search params | shareable, back-button correct |
| Table filters, sort, page | URL search params | same |
| Timetable draft slots, undo stack | `useReducer` in the page | ephemeral, dies on navigate, guarded by `useBlocker` |
| Marks entry grid | `useReducer` in the page | same |
| Pending attendance writes | Redux `attendanceQueueSlice` | must survive component unmount |
| Everything from the API | RTK Query cache | single source of truth for server data |

### RTK Query tag design

```ts
tagTypes: ['Student','Teacher','Class','Subject','Room',
           'TimetableSlot','Attendance','Marks','Result','Dashboard']
```

Marking attendance invalidates `Attendance` and `Dashboard`. Publishing marks invalidates `Marks`, `Result`, `Student` and `Dashboard`. Publishing a timetable invalidates `TimetableSlot`, `Class`, `Teacher` and `Dashboard`. Getting these right means the UI stays correct with no manual refetching anywhere.

---

## 5. Folder structure

Feature-sliced. Each feature owns its API definitions, components, hooks, pages and pure logic. Nothing in `features/` imports from another feature's internals, only from its `index.ts` barrel.

```
scholaris/
├── public/
│   └── mockServiceWorker.js
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx                 route tree, lazy, guards, errorElements
│   │   ├── store.ts                   configureStore, middleware
│   │   ├── baseApi.ts                 RTK Query createApi, baseQueryWithReauth
│   │   └── providers/
│   │       ├── AppProviders.tsx
│   │       ├── ThemeProvider.tsx
│   │       └── QueryProvider.tsx      TanStack Query client
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api/authApi.ts
│   │   │   ├── components/LoginForm.tsx
│   │   │   ├── components/RequireAuth.tsx
│   │   │   ├── components/RequirePermission.tsx
│   │   │   ├── components/Can.tsx
│   │   │   ├── hooks/usePermissions.ts
│   │   │   ├── lib/tokenStorage.ts
│   │   │   ├── pages/LoginPage.tsx
│   │   │   ├── authSlice.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── api/dashboardApi.ts
│   │   │   ├── components/StatTile.tsx
│   │   │   ├── components/ChartCard.tsx
│   │   │   ├── components/ActivityFeed.tsx      TanStack useInfiniteQuery
│   │   │   ├── pages/AdminDashboard.tsx
│   │   │   ├── pages/TeacherDashboard.tsx
│   │   │   ├── pages/StudentDashboard.tsx
│   │   │   ├── pages/DashboardPage.tsx          role switch
│   │   │   └── index.ts
│   │   │
│   │   ├── students/
│   │   │   ├── api/studentsApi.ts
│   │   │   ├── components/StudentTable.tsx
│   │   │   ├── components/StudentFormDrawer.tsx
│   │   │   ├── components/tabs/ProfileTab.tsx
│   │   │   ├── components/tabs/AttendanceTab.tsx
│   │   │   ├── components/tabs/ResultsTab.tsx
│   │   │   ├── components/tabs/TimetableTab.tsx
│   │   │   ├── lib/columns.tsx
│   │   │   ├── pages/StudentListPage.tsx
│   │   │   ├── pages/StudentDetailPage.tsx
│   │   │   ├── schemas.ts                       zod
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── teachers/                            same shape
│   │   ├── classes/                             same shape
│   │   ├── subjects/                            same shape
│   │   ├── rooms/                               same shape
│   │   │
│   │   ├── timetable/
│   │   │   ├── api/timetableApi.ts
│   │   │   ├── components/TimetableGrid.tsx
│   │   │   ├── components/TimetableCell.tsx
│   │   │   ├── components/SubjectPool.tsx
│   │   │   ├── components/SlotCard.tsx
│   │   │   ├── components/ViolationsPanel.tsx
│   │   │   ├── components/DragOverlayCard.tsx
│   │   │   ├── hooks/useTimetableEditor.ts      useReducer + undo/redo
│   │   │   ├── hooks/useConflictIndex.ts        memoized Map index
│   │   │   ├── lib/constraints.ts               ◄ pure, no React
│   │   │   ├── lib/constraints.test.ts
│   │   │   ├── lib/autoFill.ts                  greedy solver
│   │   │   ├── lib/autoFill.test.ts
│   │   │   ├── pages/TimetablePage.tsx
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── attendance/
│   │   │   ├── api/attendanceApi.ts
│   │   │   ├── components/MarkTab.tsx
│   │   │   ├── components/RegisterTab.tsx
│   │   │   ├── components/DefaultersTab.tsx
│   │   │   ├── components/StatusToggle.tsx
│   │   │   ├── hooks/useKeyboardGrid.ts
│   │   │   ├── hooks/useOptimisticQueue.ts
│   │   │   ├── lib/computeAttendanceStats.ts
│   │   │   ├── lib/computeAttendanceStats.test.ts
│   │   │   ├── pages/AttendancePage.tsx
│   │   │   ├── attendanceQueueSlice.ts
│   │   │   └── index.ts
│   │   │
│   │   └── marks/
│   │       ├── api/marksApi.ts
│   │       ├── components/MarksGrid.tsx
│   │       ├── components/ResultsTable.tsx
│   │       ├── components/GradeDistribution.tsx
│   │       ├── components/ReportCard.tsx
│   │       ├── hooks/useMarksGrid.ts            useReducer
│   │       ├── lib/computeResults.ts            ◄ pure, no React
│   │       ├── lib/computeResults.test.ts
│   │       ├── lib/gradeBands.ts                config, not conditionals
│   │       ├── pages/MarksEntryPage.tsx
│   │       ├── pages/ClassResultsPage.tsx
│   │       ├── pages/ReportCardPage.tsx
│   │       └── index.ts
│   │
│   ├── components/
│   │   ├── data-table/
│   │   │   ├── DataTable.tsx                    generic <T>
│   │   │   ├── DataTableToolbar.tsx
│   │   │   ├── DataTableFilters.tsx
│   │   │   ├── DataTablePagination.tsx
│   │   │   ├── ColumnVisibilityMenu.tsx
│   │   │   ├── DensityToggle.tsx
│   │   │   └── VirtualRows.tsx
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   └── Breadcrumbs.tsx
│   │   ├── feedback/
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── RouteError.tsx                   useRouteError
│   │   │   ├── EmptyState.tsx
│   │   │   ├── LoadingSkeleton.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   └── ui/
│   │       ├── StatusBadge.tsx
│   │       ├── Avatar.tsx
│   │       ├── PercentRing.tsx
│   │       └── DevPanel.tsx                     latency + error controls
│   │
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useUrlState.ts
│   │   ├── useUndoRedo.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useOnlineStatus.ts                   useSyncExternalStore
│   │   └── useMediaQuery.ts
│   │
│   ├── lib/
│   │   ├── format.ts                            dates, numbers, percentages
│   │   ├── constants.ts                         periods, days, statuses
│   │   ├── permissions.ts                       role → permission map
│   │   └── cn.ts
│   │
│   ├── mocks/
│   │   ├── browser.ts
│   │   ├── handlers/
│   │   │   ├── index.ts
│   │   │   ├── auth.ts
│   │   │   ├── students.ts
│   │   │   ├── teachers.ts
│   │   │   ├── classes.ts
│   │   │   ├── timetable.ts
│   │   │   ├── attendance.ts
│   │   │   └── marks.ts
│   │   ├── db/
│   │   │   ├── seed.ts                          generator
│   │   │   └── store.ts                         localStorage persistence
│   │   └── config.ts                            latency, error rate
│   │
│   ├── styles/
│   │   ├── theme.ts                             Mantine theme
│   │   ├── tokens.css
│   │   └── print.css                            report card
│   │
│   ├── types/
│   │   ├── models.ts                            Student, Teacher, Slot...
│   │   ├── api.ts                               request/response envelopes
│   │   └── common.ts
│   │
│   ├── test/
│   │   ├── setup.ts
│   │   └── utils.tsx                            renderWithProviders
│   │
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── .env.example
├── eslint.config.js
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

### Structural rules

`features/*/lib/` holds pure functions with no React import. These are the files that get unit tested and the files a reviewer should open first.

`components/` holds only things used by two or more features. Anything used once lives in that feature.

Path aliases: `@app`, `@features`, `@components`, `@hooks`, `@lib`, `@types`.

Barrel exports at each feature root. Cross-feature imports go through the barrel, never into a nested path. Enforced by an ESLint `no-restricted-imports` rule.

---

## 6. Feature list

### Authentication and access

- Login with validated form and demo account quick-fill
- JWT access token held in memory, 60-second expiry for demo visibility
- Refresh token with silent renewal
- Concurrent 401 queueing — one refresh fires, all queued requests replay
- Route guards and redirect-back after login
- Permission-string checks via hook and `<Can>` component
- Navigation filtered by permission
- Three role-specific landing routes and dashboards

### Data management

- Generic virtualized table reused across five entities
- URL-held filter, sort, page and search state
- Debounced search with request cancellation
- Column visibility and density preferences persisted
- Bulk selection with bulk actions
- CSV export of the current filtered view
- Create and edit in drawers and modals, Zod-validated
- Optimistic updates with rollback on failure

### Timetable

- 5 day × 8 period drag-and-drop grid
- Three views: by class, by teacher, by room
- Seven constraint rules validated live on drag-hover
- Memoized conflict index for performance
- Unlimited undo and redo
- Greedy auto-fill with an explanation of unplaced items
- Publish blocked while hard errors exist
- Unsaved-changes navigation guard

### Attendance

- Daily marking with mark-all-present then exceptions
- Four statuses
- Full keyboard operation
- Monthly register grid
- Defaulters list below threshold
- Optimistic writes with visible rollback
- Pending-write queue preventing races
- Offline detection with queued flush on reconnect
- Per-student, per-class and per-subject statistics

### Marks and results

- Grid entry with component weights
- Inline validation without blocking other cells
- Derived subject totals, percentages and grade bands
- Overall percentage, grade, pass/fail
- Class ranking with correct tie handling
- Grade distribution and subject-average charts
- Printable report card with print stylesheet
- Publish gated on completeness

### Cross-cutting

- Role-aware dashboards with linked tiles
- ⌘K spotlight search across students, teachers and classes
- Route-level error boundaries with reset
- Loading skeletons matched to final layout
- Empty states that state the next action
- Dev panel with latency slider and error-rate toggle
- Light and dark theme
- Keyboard accessible throughout, visible focus, WCAG AA contrast

---

## 7. Build schedule

| Day | Hours | Deliverable |
|---|---|---|
| Wed 5 eve | 3 | Scaffold, router shell, Mantine theme, MSW, seed generator |
| Thu 6 | 4 | Auth end to end, guards, permissions, three dashboards, app shell |
| Fri 7 | 4 | `<DataTable<T>>`, students list and detail, teachers, subjects |
| Sat 8 | 8 | Timetable: constraints + tests first, then grid, drag/drop, undo/redo |
| Sun 9 | 8 | Attendance three tabs, marks entry, results and charts |
| Mon 10 | 4 | Router advanced APIs, React 19 hooks, report card, skeletons, empty states, dev panel |
| Tue 11 am | 2 | Deploy to Vercel, README, backup screen recording |

**Cut order:** auto-fill → register tab → CSV export → report card print styles → charts
**Never cut:** constraint engine and tests, undo/redo, optimistic rollback, virtualization, refresh interceptor

---

## 8. Known limitations to state in the README

- No backend. MSW simulates the API at the network layer; persistence is `localStorage`
- Refresh token in `localStorage` for demo convenience; httpOnly cookie is correct in production
- Client-side permission checks are UX only; the server is the real authorisation boundary
- Two data-fetching libraries used deliberately for coverage; production would standardise on one
- Auto-fill is a greedy solver, not optimal; a real scheduler would use constraint propagation or simulated annealing
