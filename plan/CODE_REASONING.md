# Scholaris Attendance Feature - Code Reasoning

This document explains the code added for the Attendance Register and Bulk Marking Console work. It focuses on the newly created files and the supporting changes needed to connect the feature to the existing Scholaris React, Vite, TypeScript, MSW, and Tailwind codebase.

## Implementation Summary

The attendance work adds three user-facing surfaces:

- `/attendance`: a month register with student rows and day columns.
- `/attendance/:date`: a day sheet for fast same-day marking.
- A lazy-loaded monthly attendance panel inside `/students/:id`.

The implementation also adds a reusable virtualized `DataGrid`, attendance mock data, MSW API handlers, optimistic attendance updates, bulk correction validation, draft persistence, and regional error handling.

## Newly Created Files

### `src/components/ui/DataGrid.tsx`

This file adds a generic, reusable grid component:

- `Column<T>` is generic so each column definition is type-checked against the row type using the grid.
- `rows`, `columns`, `rowKey`, and `cellKey` are passed in from the feature layer, keeping the grid reusable rather than attendance-specific.
- `@tanstack/react-virtual` is used for both vertical row virtualization and horizontal column virtualization.
- Sticky columns are split from scrollable columns so student identity remains visible while the user scrolls across month days.
- `GridCell` is wrapped with `memo` to reduce unnecessary cell rendering when props are stable.

Why this was added:

The attendance register can grow to hundreds or thousands of rows across up to 31 day columns. Rendering every cell at once would create a large DOM, slow initial paint, and make scrolling expensive. A small headless grid was chosen because the task disallowed packaged data-grid products and because the project needed control over rendering behavior.

Why `@tanstack/react-virtual`:

`@tanstack/react-virtual` provides headless virtualization without imposing table markup, styles, selection behavior, or editing behavior. That matches the assignment better than AG Grid, MUI DataGrid, or Handsontable, which would solve too much of the architectural problem inside a third-party component. It is also lighter and easier to integrate with the existing Tailwind UI.

Rejected alternatives:

- AG Grid / MUI DataGrid / Handsontable: rejected because they are packaged grid products and were explicitly outside the task constraints.
- Manual windowing: rejected because implementing reliable virtual scrolling from scratch would add risk without improving the product.
- Rendering a normal table: rejected because the attendance register has too many cells for a full DOM render.

### `src/components/ui/ErrorBoundary.tsx`

This file adds a small class-based React error boundary.

Why this was added:

React error boundaries still require class components. The student detail page needs the attendance panel to fail independently from the rest of the page. Without a local boundary, a panel error could blank or disrupt the full student detail screen.

Why it is intentionally small:

The app only needs regional containment and a fallback. Logging is handled with `console.error` for now. A production app could later route this to Sentry or another monitoring service.

### `src/features/attendance/types.ts`

This file defines the attendance domain model:

- `AttendanceStatus`
- `RosterStudent`
- `RegisterEntry`
- `RegisterResponse`
- `MarkRequest`
- `MarkResponse`
- API error response shapes

Why this was added:

The register, day sheet, mock database, API hooks, validation, and status UI all need the same attendance vocabulary. Centralizing these types keeps API handlers and UI code aligned and avoids duplicating string unions across files.

### `src/features/attendance/statusMeta.ts`

This file maps attendance statuses to short labels, colors, and cycling order.

Why this was added:

Status display rules are shared by `StatusCell`, the register, the day sheet, and the student panel. Keeping labels and colors in one place prevents inconsistent rendering such as one screen showing `half-day` while another shows `HD`.

### `src/features/attendance/components/StatusCell.tsx`

This file adds the small interactive attendance cell used in both the register and day sheet.

Why this was added:

Attendance status rendering appears many times in a dense grid. A single memoized component keeps the visual state consistent and reduces duplicate button/status markup.

Important behavior:

- Holidays render as a non-clickable `H` marker.
- Pending writes are visually dimmed.
- The component is memoized because it is rendered many times.

### `src/features/attendance/pages/AttendancePage.tsx`

This file implements the main monthly attendance register route.

Why this was added:

The existing app advertised attendance data but had no `/attendance` route. This page creates the primary register workflow with class selection, month selection, student search, status filtering UI, bulk actions, and the virtualized register grid.

Key decisions:

- Filters are stored with `useUrlState`, so class, month, search, and status filter can be represented in the URL.
- Register data is fetched with React Query through `useRegister`.
- Cell edits go through `useOptimisticMutation` so the UI updates immediately while the mock API request is pending.
- `useRegisterColumns` builds the sticky student columns and one generated day column per month day.
- The bulk correction drawer is owned by this page because it needs register data, selected target cells, student statuses, holidays, and excused-day counts.

### `src/features/attendance/pages/DaySheetPage.tsx`

This file implements `/attendance/:date`.

Why this was added:

The day sheet is the fast workflow for teachers who need to mark one class for one day. A teacher can mark everyone present and then change exceptions instead of navigating a full month grid.

Key decisions:

- It uses the same `useOptimisticMutation` hook as the register so update behavior stays consistent.
- It fetches only the relevant date through `useDaySheet`.
- The status cell cycles through the defined status order from `statusMeta.ts`.
- Holidays are blocked at the UI level so teachers can see why the date is not markable.

### `src/features/attendance/components/BulkCorrectionDrawer.tsx`

This file implements the bulk correction form.

Why this was added:

The assignment required a bulk-correction workflow where many cells can receive a shared status and reason, with per-student overrides. A drawer keeps the user on the register while they prepare a correction.

Validation included:

- Future dates cannot be marked.
- Holidays cannot be marked.
- `half-day` and `excused` require a reason with at least 10 characters.
- Inactive or transferred students cannot be marked present.
- More than three excused days raises a warning that must be acknowledged.

Why local state plus a draft hook was used:

The current form is compact and feature-specific. `useFormDraft` gives draft persistence without adding a large form abstraction. React Hook Form is available in the project and would be a reasonable upgrade if this drawer grows into a larger form with more fields, nested validation, and better focus management.

### `src/features/attendance/components/StudentAttendancePanel.tsx`

This file adds the monthly attendance summary shown inside a student detail page.

Why this was added:

The task required the student detail page to show attendance information without making the whole student page depend on that request. This panel fetches attendance data independently and is lazy-loaded inside the student route.

Key decisions:

- It computes the monthly percentage from register entries.
- It shows counts for each status using the shared status metadata.
- It handles loading and failure locally so the rest of the student detail page remains usable.

### `src/features/attendance/api/attendanceApi.ts`

This file contains React Query hooks for attendance API access:

- `useRegister`
- `useDaySheet`
- `useHolidays`
- `useMarkAttendance`

Why this was added:

Fetching and mutating attendance data is server-state, not local UI state. React Query handles caching, loading states, error states, background revalidation, and query invalidation more cleanly than storing API responses in Redux.

Why `@tanstack/react-query`:

React Query is a strong fit for mock or real API data because it models server-state directly. It avoids manually writing loading/error/cache reducers and supports instant cached display when returning to previously loaded data.

Rejected alternatives:

- Redux for API cache: the app already uses Redux for auth, but attendance register data is better treated as server-state with cache invalidation.
- Plain `useEffect` and `fetch`: rejected because it would require custom stale-response handling, retries, cache state, and invalidation logic.
- SWR: also viable, but React Query provides a richer mutation and invalidation model for this optimistic editing workflow.

### `src/features/attendance/hooks/useUrlState.ts`

This hook syncs a string value with a URL search parameter.

Why this was added:

Attendance filters must survive refreshes, support browser back/forward behavior, and be shareable as links. Keeping filter state only in React component state would lose those properties.

### `src/features/attendance/hooks/useOptimisticMutation.ts`

This hook manages optimistic cell edits.

Why this was added:

Attendance marking should feel immediate. Waiting 300-1200 ms for the hostile mock API before updating a cell would make the grid feel slow. The hook overlays the new value immediately, tracks pending cells, queues failed changes, and exposes a retry function.

Important behavior:

- `overlay` stores the latest client-visible value per cell.
- `pending` marks cells with writes in flight.
- `failed` stores changes that need retry.
- Successful writes invalidate the relevant attendance query so server data can revalidate.

Known limitation:

The current implementation queues failed changes, but it does not fully implement optimistic concurrency tokens or a documented same-cell conflict resolution policy for multiple writes in flight.

### `src/features/attendance/hooks/useGridSelection.ts`

This hook stores selected grid coordinates.

Why this was added:

Bulk workflows need a reusable way to track selected attendance cells independent of the grid renderer. Keeping this as a hook allows future range selection or drag selection without rewriting the grid itself.

Current state:

The hook provides toggle, select all, clear, selected checks, and a stable key. The current page uses bulk cells based on today rather than fully wiring interactive range selection.

### `src/features/attendance/hooks/useFormDraft.ts`

This hook persists draft form data to `localStorage`.

Why this was added:

Bulk corrections can contain a status, reason, warning acknowledgement, and override rows. Losing that state on refresh or accidental close would be frustrating. The hook stores drafts under a stable key and provides discard/dirty state behavior.

### `src/features/attendance/hooks/useRegisterColumns.tsx`

This hook generates `DataGrid` columns for the attendance register.

Why this was added:

The register columns are dynamic because each month has a different number of days and holiday dates. Generating columns in a hook keeps `AttendancePage` smaller and keeps grid column construction tied to memoized inputs.

Important behavior:

- Roll and student name are sticky columns.
- Each day becomes a narrow status column.
- Holiday dates are marked and blocked.
- Pending state and optimistic status overlays are passed into each `StatusCell`.

### `src/features/attendance/utils/validation.ts`

This file contains reusable validation functions for attendance marking.

Why this was added:

Validation rules are domain rules, not drawer-only UI details. Extracting them makes the rules easier to test and reuse in future single-cell editing, day-sheet bulk edits, or server-side mock validation.

### `src/mocks/db/attendance.ts`

This file generates mock attendance data.

Why this was added:

The assignment required generated seed data rather than hand-written fixtures. This file creates class rosters, monthly attendance entries, weekend holidays, and deterministic status distributions.

Important behavior:

- Six class IDs are generated.
- Each class has 200 students, producing 1,200 students total across all classes.
- Entries are generated per class and month and cached in memory.
- `applyChanges` mutates the in-memory register to simulate persisted attendance edits.

### `src/mocks/handlers/attendance.ts`

This file adds MSW handlers for attendance endpoints.

Why this was added:

The app has no real backend, and the task specifically required a mock API with hostile network behavior. MSW lets the frontend exercise realistic `fetch` requests while staying fully local.

Implemented endpoints:

- `GET /api/attendance`
- `PATCH /api/attendance`
- `GET /api/attendance/date`
- `GET /api/attendance/holidays`
- `GET /api/classes`

Hostile behavior:

- Requests have randomized 300-1200 ms latency.
- Mutations have a 15% random failure rate.

Known limitation:

The handler currently simulates generic mutation failure but does not fully implement `409 STALE_WRITE` or `422 VALIDATION_FAILED` responses from the assignment contract.

## Modified Existing Files

### `src/app/providers/AppProviders.tsx`

React Query's `QueryClientProvider` was added around the app.

Why this was changed:

Attendance APIs use React Query hooks. Those hooks require a shared query client so route-level pages and nested panels can share cache, stale-time, retry, and invalidation behavior.

Configuration choices:

- `staleTime: 30_000`: avoids immediate refetch churn while moving around the attendance UI.
- `refetchOnWindowFocus: false`: prevents surprise register refetches while a teacher is editing.
- `retry: 1` for queries: gives transient loads one automatic retry.
- `retry: 0` for mutations: failed attendance writes should be visible and retryable by the user instead of silently retrying.

### `src/app/router.tsx`

Lazy routes were added for attendance pages.

Why this was changed:

The attendance register is a heavy feature compared with the existing dashboard and student routes. Lazy loading keeps attendance code out of the initial route bundle until the user visits `/attendance` or `/attendance/:date`.

Why React `lazy` and `Suspense`:

They are built into React and already fit Vite's route-level code splitting. No extra routing library was needed.

### `src/features/students/pages/StudentDetailPage.tsx`

A lazy `StudentAttendancePanel` was added under an `ErrorBoundary` and `Suspense`.

Why this was changed:

Attendance is useful on the student profile, but a failure in attendance loading should not prevent the base student detail data from rendering. The panel is independently loaded and independently protected.

### `src/mocks/handlers/index.ts`

Attendance handlers were registered with the existing MSW handler list.

Why this was changed:

MSW only handles requests that are included in the exported handler array. Without this change, `/api/attendance` requests would pass through and fail.

## Library Justification

### `@tanstack/react-query`

Used for attendance server-state, caching, loading/error states, and mutation invalidation.

Why it fits:

The attendance register has data that belongs to the server contract: class/month registers, day sheets, holidays, and patch mutations. React Query gives this data a cache lifecycle and avoids hand-written request reducers.

### `@tanstack/react-virtual`

Used for row and column virtualization in `DataGrid`.

Why it fits:

The register can contain tens of thousands of logical cells. Virtualization keeps the rendered DOM close to what is visible on screen. The library is headless, so the app keeps control of markup and styling.

### `msw`

Used for the mock attendance API.

Why it fits:

MSW lets the app make real `fetch` calls without a backend. That means the UI exercises loading states, latency, mutation failure, and cache invalidation in a realistic way.

### `sonner`

Used for non-blocking toast feedback.

Why it fits:

Mutation failures, retry prompts, and successful bulk operations need feedback that does not block the teacher's workflow. The app already uses `sonner`, so the attendance feature follows the existing notification pattern.

### `lucide-react`

Used for toolbar and action icons.

Why it fits:

The app already uses Lucide icons. Reusing the same icon library keeps the visual language consistent and avoids adding another dependency.

## Architectural Decisions

### Headless grid API instead of compound components

The grid uses a headless prop-driven API rather than a compound-component API.

Reasoning:

The attendance grid needs dynamic columns, custom cells, sticky identity columns, and virtualized body rendering. A typed column definition API keeps those concerns explicit and allows the grid to remain reusable without forcing feature-specific children into the grid internals.

### Server-state separated from UI-state

React Query owns server data. Local hooks own UI state:

- `useUrlState`: route filter state.
- `useOptimisticMutation`: pending/failed edit overlay.
- `useGridSelection`: selected cells.
- `useFormDraft`: persisted drawer draft.

Reasoning:

Mixing these states into one global store would make cache invalidation, URL sync, and ephemeral form behavior harder to reason about.

### Mock API mirrors future backend shape

The MSW handlers use endpoint names and response shapes close to the assignment contract.

Reasoning:

Keeping the mock API close to a real backend makes it easier to replace MSW with a real service later. The frontend already depends on request/response boundaries rather than directly importing fixture arrays.

## Known Gaps and Evidence Still Needed

The current code implements the core structure and much of the behavior, but the following assignment items still need evidence or additional implementation before claiming full completion:

- Profiler evidence proving one-cell toggles do not re-render unrelated rows.
- Bundle before/after numbers for attendance route code splitting.
- Full footer totals that update without grid body re-rendering.
- Full same-cell optimistic conflict policy with `baseUpdatedAt`.
- MSW `409 STALE_WRITE` and `422 VALIDATION_FAILED` response paths.
- Fully wired interactive multi-cell/range selection.
- Dirty navigation guard for in-app route changes.
- Reuse of `DataGrid` on the existing `/students` list.
- TypeScript strict mode verification and test coverage.

## What I Would Improve Next

With more time, I would first add tests and evidence around render counts, optimistic rollback, and validation. After that, I would complete the conflict-response paths in MSW, wire `DataGrid` into the existing students table, add a proper totals footer, and upgrade bulk correction to use React Hook Form if the form continues to grow.
