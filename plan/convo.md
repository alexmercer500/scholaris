# Scholaris School Management System — Progress & Handoff Context

This file captures the state of the project and the working relationship so an AI agent can continue seamlessly.

## Project Overview

**Scholaris** — a school management system built with the **"Terra"** design theme (earthy greens, warm surfaces).
- **Stack:** React 19, TypeScript, Vite, Redux Toolkit + RTK Query, MSW (mock backend), React Router v7, Tailwind CSS v4, lucide-react icons, TanStack Table (installed, not yet used), recharts (installed).
- **Design tokens:** defined in `src/index.css` (`@theme`) — colors like `primary` (#4a7c59), `surface`, `surface-container`, `on-surface`, `on-surface-variant`, `tertiary`, `error`, `outline`/`outline-variant`, plus many Terra colors already added. Fonts: `font-headline` (Literata serif), `font-body`/`font-label` (Nunito Sans). Radii `rounded-[12px]`. Shadow `shadow-soft`.
- **Path aliases** (both tsconfig + vite): `@app/*`, `@features/*`, `@components/*`, `@hooks/*` (→ `src/hooks`), `@lib/*`, `@models/*` (→ `src/types`), `@styles/*`, `@mocks/*`.
- **Build:** `npm run build` = `tsc -b && vite build`. **Strict tsconfig:** `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` are ON (unused vars fail build). Use `import type` for types.
- **Important user preference:** DO NOT run `npm run build` to verify after each step unless asked. Move on to next steps. (User cancelled build calls twice.)

## How the user wants to work

- Guided, step-by-step learning. The user prefers to be **guided to write code themselves** rather than having the agent write everything. ("later stage guide me").
- But sometimes says "do it yourself" — follow that literally when said.
- Short on time. Keep things minimal/scoped when possible.
- User is a learner; explain concepts clearly but compactly. They appreciate analogies and "mental model" explanations.
- Naming/casing issues have bitten repeatedly (e.g., `NotFOund` vs `NotFound`, `dashBoardApi` vs `dashboardApi`). **Be very careful with file naming and import path casing consistency.**

## Architecture Pattern (established)

The app uses a consistent 4-layer flow per feature:
1. **MSW handler** in `src/mocks/handlers/*.ts` — the mock "backend".
2. **RTK Query API** in `src/features/<feature>/api/*.ts` — `createApi` from `@reduxjs/toolkit/query/react`.
3. **Store registration** in `src/app/store.ts`.
4. **Page/Component** consuming the hook.

### Comprehensive MSW setup
- `src/mocks/db/` — seed data ("database").
- `src/mocks/handlers/` — MSW request handlers, aggregated in `handlers/index.ts`.

### Store (`src/app/store.ts`) — centralized API list
```ts
import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "@features/auth";
import { authApi } from "@features/auth/api/authApi";
import { dashboardApi } from "@features/dashboard/api/dashBoardApi";
import { studentApi } from "@features/students/api/studentApi";

const apis = [authApi, dashboardApi, studentApi]
export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [studentApi.reducerPath]: studentApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apis.map((api) => api.middleware)),
})
```
- Pattern for adding a new API: add it to the `apis` array (both reducer + middleware flow automatically).

### Router (`src/app/router.tsx`)
```tsx
import { createBrowserRouter, RouterProvider } from 'react-router'
import { LoginPage } from '@features/auth/pages/LoginPage'
import RequireAuth from '@features/auth/components/RequireAuth'
import DashBoard from '@features/dashboard/pages/DashBoard'
import { NotFound } from '@features/pages/NotFound'
import GuestOnly from '@features/auth/components/GuestOnly'
import { DashboardLayout } from '@components/layout/DashboardLayout'
import { StudentsPage } from '@features/students/pages/StudentPage'

const router = createBrowserRouter([
  { path: '/login', element: (<GuestOnly><LoginPage /></GuestOnly>) },
  {
    element: (<RequireAuth><DashboardLayout /></RequireAuth>),
    children: [
      { path: '/', element: <DashBoard /> },
      { path: '/students', element: <StudentsPage /> }
    ],
  },
  { path: '*', element: <NotFound /> },
])

export function AppRouter() { return <RouterProvider router={router} /> }
```

## Seed Data (`src/mocks/db/`)
- `seed.ts` — demo users (auth). Has `demoUsers`, `findUserByCredentials(email, password)`.
- `classes.ts` — `demoClasses`: `[{id:'c1',name:'Grade 10',section:'A',...},{c2 Grade 11 B},{c3 Grade 12 A}]`.
- `students.ts` — **75 students generated** via `Array.from({length:75}, (_,i)=>...)`. Fields: `id (s1..s75)`, `rollNumber (R001..R075)`, `name (Student N)`, `classId (c1..c3 rotated)`, `section 'A'`, `guardian`, `contact`, `status ('active' | 'inactive' — inactive when i%10===0)`, `enrolmentDate`, `attendancePercentage (70-99)`.
- `teachers.ts` — 5 teachers: `id t1..t5, employeeId, name, subjects[], classIds[], periodsPerWeek, contact, status` (one `on-leave`).

## MSW Handlers (`src/mocks/handlers/`)
- `index.ts` — aggregates: `http.get('/api/health')`, `...authHandlers`, `...dashBoardHandlers`, `...studentsHandlers`.
- `auth.ts` — `POST /api/auth/login` returns `{ accessToken, refreshToken, user }` (tokens are base64 `JSON.stringify({sub: id})` type mocks).
- `dashboard.ts` — `GET /api/dashboard` returns `{ students, teachers, classes, attendance }` counts.
- `students.ts` — `GET /api/students` returns students **enriched with `className`** via lookup from `demoClasses`. **Use `@mocks/` alias imports.**

```ts
import { demoStudents } from "@mocks/db/students";
import { http, HttpResponse } from "msw";
import { demoClasses } from "@mocks/db/classes";

const classNames = Object.fromEntries(demoClasses.map((c) => [c.id, c.name]))

export const studentsHandlers = [
  http.get('/api/students', () => {
    const updatedStudentLists = demoStudents.map((s) => ({
      ...s,
      className: classNames[s.classId] ?? s.classId
    }))
    return HttpResponse.json(updatedStudentLists);
  })
]
```

## RTK Query APIs (`src/features/*/api/`)
- **`authApi`** (`auth/api/authApi.ts`): `login: builder.mutation`, `useLoginMutation`. Import from `@reduxjs/toolkit/query/react`.
- **`dashboardApi`** (`dashboard/api/dashBoardApi.ts`): `getDashboardStats: builder.query` (untyped data), `useGetDashboardStatsQuery`.
- **`studentApi`** (`students/api/studentApi.ts`): `getStudents: builder.query<Array<Student & { className: string }>, void>`, `useGetStudentsQuery`.

```ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Student } from "@models/models";

export const studentApi = createApi({
  reducerPath: 'studentApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getStudents: builder.query<Array<Student & { className: string }>, void>({
      query: () => '/students'
    })
  })
})

export const { useGetStudentsQuery } = studentApi
```

**CRITICAL:** Hooks (`useXQuery`) require import from `@reduxjs/toolkit/query/react`, NOT `@reduxjs/toolkit/query`. This caused a type error earlier.

## Pages

### Dashboard (`src/features/dashboard/pages/DashBoard.tsx`)
- Uses `useGetDashboardStatsQuery(undefined)`. Note: **query hooks require an arg even when void** — pass `undefined`.
- Renders `PageHeader title="Dashboard"` + a 4-card `StatCard` grid (Students, Teachers, Classes, Attendance Today).
- Handles `isLoading`, `error`, `!data`.

### Students Directory (`src/features/students/pages/StudentPage.tsx`)
- Component named `StudentsPage` (file `StudentPage.tsx`).
- `useGetStudentsQuery(undefined)` with `const { data = [], isLoading, error }`.
- Styled Terra table (bento card: `bg-surface-container-lowest rounded-xl shadow-soft border border-outline-variant/30 overflow-hidden`).
- Columns: checkbox, Roll No (`font-mono text-sm text-secondary`), Student Name (initials avatar `size-8 rounded-full`; `getInitials()` helper; at-risk→`bg-error-container text-error`, else `bg-primary-container text-primary-fixed-variant`), Class/Section (`{student.className} · {student.section}`), Guardian Contact, Attendance (`text-primary` if ≥75% else `text-error`), Status (pill: active=`bg-primary-fixed text-on-primary-fixed-variant`, else error).
- Helpers in-file: `getInitials(name)`, `isAtRisk(student)` (attendance < 75).
- Latest version wraps table card in `grow` + `h-full` (full-height table). Uses `min-w-225`.
- **Does NOT yet have search/filter/pagination.** That's the current active task.

## Shared Components

### Layout (`src/components/layout/`)
- `DashboardLayout.tsx` — the app shell: renders `<SideNav />` + a `<div className="flex-1 ml-[240px] flex flex-col min-h-screen">` with `<TopAppBar />` and `<main className="flex-1 p-8 bg-background"><Outlet /></main>`. Wrapped by `RequireAuth`.
- `SideNav.tsx` — fixed `w-[240px]` sidebar, brand (rounded `S`), "New Registration" button, main nav (Dashboard `/`, Students `/students`, Faculty/Faculty, Classes/Classes, Attendance, Reports), secondary nav (Settings, Support). Uses `NavLink` with active state `border-r-4 border-primary`.
- `TopAppBar.tsx` — search input, Bell/Settings icon buttons, **Logout button** (uses `useLogout`), profile avatar.

### UI primitives (`src/components/ui/`)
- `Button.tsx` — variants `primary|secondary|ghost`, sizes `sm|md|lg`, uses `cn`, `font-label`.
- `Input.tsx` — label, icon, error props; styled with Terra tokens.
- `StatCard.tsx` — icon chip + label + big value + optional badge/caption; `tone` = `primary|tertiary|secondary|error`.
- `PageHeader.tsx` — `title`, `subtitle`, `actions`.

### Other
- `src/lib/cn.ts` — `cn()` class merger (`clsx` + `tailwind-merge`).
- `src/features/hooks/useLogout.tsx` — `useLogout()`: dispatch `loggedOut`, navigate(`/`), toast.
- `src/features/pages/NotFound.tsx` — themed 404 (Scholaris brand, big "404", compass icon, "You seem lost", Back to Dashboard + Go Back buttons).

## Auth Feature (complete)
- `authSlice.ts` — `AuthState {accessToken, refreshToken, user}`. **Persistence to `localStorage` key `'scholaris-auth'`** via `loadSession()` reading it as initialState; `credentialsReceived` writes it; `loggedOut` clears it.
- `LoginPage.tsx` — uses `useLoginMutation`, dispatch `credentialsReceived`, `toast.success`, `navigate('/')`. Has demo account quick-fill buttons (TODO: `quickFill()` unimplemented).
- `RequireAuth.tsx` — guards protected routes (redirect to `/login` if no token).
- `GuestOnly.tsx` — redirects to `/` if token present (for `/login`).
- "Remember me" checkbox exists in LoginPage but is **commented out**; functionality not yet implemented (deferred).

## Login Credentials
- `admin@scholaris.edu` / `admin@123` (ADMIN). Only demo user.

## Current Task / Next Steps (you are HERE)

Task: Add **search + pagination** to the Students Directory using **TanStack Table** (`@tanstack/react-table`, installed) AND **URL-synced pagination** via React Router's `useSearchParams`, so the page number lives in the URL (`/students?page=2`).

### Plan agreed with user
The user explicitly wants:
1. **TanStack Table** (headless table library) — for table logic (column defs, pagination state, sorting).
2. **URL control** — pagination synced to the URL query params via `useSearchParams`. `/students?page=1` etc., so page survives refresh and is deep-linkable.

### Recommended implementation approach
- **Use `@tanstack/react-table`**: `useReactTable`, `getCoreRowModel`, `getPaginationRowModel` (for client-side pagination of 75 rows), `flexRender`, `ColumnDef`.
- Column defs array: `ColumnDef<Student & { className: string }>[]` with accessorKey / cell renderers (reuse existing Terra cell styling).
- Read page from `useSearchParams()`: `const page = Number(searchParams.get('page') ?? '1')`.
- Table pagination state driven from URL; on page change call both `table.setPageIndex(...)` AND `setSearchParams(...)`.
- Render via TanStack row model: `table.getRowModel().rows.map(row => ...)` + `row.getVisibleCells()` + `flexRender(...)`.
- Keep the existing Terra table styling (header row, avatar cells, badges).
- Add Search input (filter data by name/rollNumber) and a pagination footer (Showing x-y of N, Prev/Next + page numbers).

### Suggested increment order
1. Convert the plain `<table>` to **TanStack Table** with internal `useState` pagination (get comfortable with the pattern).
2. Then add **URL sync** with `useSearchParams` (read initial page from URL; update URL on page change).
- Alternatively, do both together using TanStack's `state.pagination` + `onPaginationChange` wired to `searchParams`.

### TanStack Table docs
- https://tanstack.com/table/latest/docs/guide/pagination
- https://tanstack.com/table/latest/docs/api/features/pagination
- https://tanstack.com/table/latest/docs/guide/filtering

## Important Technical Notes / Gotchas
- `useReactTable` and pagination features: import from `@tanstack/react-table` (package confirmed in `package.json` `dependencies` as `@tanstack/react-table: ^9.0.0`).
- Query hooks need the `undefined` arg even for void queries (`useXQuery(undefined)`) — otherwise "Expected 1-2 arguments" error.
- `useSearchParams` in React Router v7 comes from `react-router` (same as `useNavigate`, which is imported from `react-router`).
- Strict lint: remove unused vars/params.
- Use `import type { ... }` for types (verbatimModuleSyntax).
- Path aliases are configured — prefer `@components/`, `@features/`, `@models/`, `@lib/`, `@mocks/` imports.

## Deferred / Future Work Options (not currently in progress)
- Upgrade students table to TanStack with URL-synced pagination (current task).
- Class Results screen (charts with recharts + results table) — reference: `class_results_terra_style/code.html`.
- "Remember me" checkbox logic (deferred).
- RouteError / `errorElement` pattern (discussed, not implemented).
- Other modules: Faculty, Classes, Attendance, Marks, Reports, Timetable (reference HTML files exist in `stitch_scholaris_school_management_system/`).

## Design Reference Files (HTML mockups in repo)
- `stitch_scholaris_school_management_system/students_directory_terra_style/code.html` + `screen.png` — the students table design (search, filter chips, table, pagination footer "Showing 1 to 10 of 142", page buttons).
- Other screens available: dashboard, login, class_results, marks_entry, attendance_marking, report_card, timetable_builder.
- The HTML uses Material Symbols icons; the app uses **lucide-react** (match lucide, not Material icons).
