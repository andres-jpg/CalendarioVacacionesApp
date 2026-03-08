# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Reglas de flujo de trabajo

### Commits y despliegues
- **NUNCA hacer commit automáticamente** salvo que el usuario lo pida de forma explícita (ej. "haz un commit", "commitea esto").
- **NUNCA hacer push ni desplegar a Vercel automáticamente** salvo que el usuario lo indique de forma explícita.
- Cuando el usuario pide un commit: escribir siempre un mensaje **detallado en español** que describa todos los cambios realizados, hacer el commit y el push en el mismo paso (a no ser que el usuario indique lo contrario).

---

## Commands

```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

There is no test runner configured.

## Environment

Requires `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Vercel project: `gestion-vacaciones` (team: `andres-jpgs-projects`)
URL de producción: https://gestion-vacaciones-peach.vercel.app
Repo GitHub: https://github.com/andres-jpg/CalendarioVacacionesApp

## Architecture

**Next.js 16 App Router** vacation management system for Spanish-speaking companies. No REST API layer — all data operations go directly to Supabase (PostgreSQL) via Server Actions or the Supabase SDK.

### Route Groups

- `app/(auth)/login/` — Public login page
- `app/(dashboard)/` — Protected routes with shared Navbar + Sidebar layout
  - `/` — Home dashboard
  - `/employees`, `/employees/new`, `/employees/[id]` — Employee CRUD
  - `/calendar` — Vacation calendar
  - `/settings` — Configuration

### Data Flow

- **Server Components** fetch data server-side using `lib/supabase/server.ts`
- **Server Actions** (`"use server"`) handle all mutations, then call `revalidatePath()` for cache invalidation
- **Client Components** use `lib/supabase/client.ts` (browser SDK) only for auth interactions (login, logout)
- No Redux/Zustand — minimal `useState` for local UI state only

### Supabase Clients

Two clients exist for different contexts:
- `lib/supabase/server.ts` — For Server Components and Server Actions (reads cookies for session)
- `lib/supabase/client.ts` — For Client Components

TypeScript types in `lib/supabase/database.types.ts` are auto-generated from the Supabase schema. Regenerate with: `supabase gen types typescript --local > lib/supabase/database.types.ts`

### Database Schema (key tables)

- **employees** — `id`, `full_name`, `email`, `hire_date`, `is_active` (soft delete)
- **vacation_days** — `employee_id`, `date`, `observations` (unique per employee+date)
- **vacation_balance** — `employee_id`, `year`, `days_from_previous_year`, `days_current_year`
- **vacation_settings** — `year`, `default_days`
- **comments** — `id`, `employee_id`, `text`, `date`, `year` (observaciones por empleado y año)

Migrations live in `supabase/migrations/`. RLS is enabled on all tables; policies allow full access to authenticated users.

### Key Business Logic

- `lib/utils/vacation-calculator.ts` — Calculates proportional vacation days based on hire date. Employees hired mid-year get `(annual_days / days_in_year) * days_worked`. Also exports `calculateAccruedToDate` for prorated accrual up to a given date.
- `lib/utils/date-helpers.ts` — Date formatting utilities using `date-fns` with Spanish locale.

### Vacation day validation (multi-year)

`addVacationDays` in `app/(dashboard)/calendar/actions.ts` groups selected dates by year and validates using a **surplus cascade**: surplus from earlier years covers deficit in later years. This allows selecting days in December of year N and January of year N+1 using the same remaining balance.

### Export (PDF / Excel)

Client-side only — no server file generation. All exports run in the browser via dynamic `import()`:

- `lib/export/employee-pdf.ts` — Individual PDF (landscape A4): employee data + balance table on p.1, 12-month calendar grid drawn with jsPDF on p.2 (no html2canvas).
- `lib/export/employee-excel.ts` — Individual Excel: sheets "Datos" and "Días".
- `lib/export/bulk-pdf.ts` — Bulk PDF: summary table of all employees with jspdf-autotable.
- `lib/export/bulk-excel.ts` — Bulk Excel: single "Resumen" sheet.
- `components/employees/employee-export-panel.tsx` — Export card on `/employees/[id]`.
- `components/settings/bulk-export-panel.tsx` — Export card on `/settings`.
- Server action `getEmployeeExportData(employeeId, year)` in `app/(dashboard)/employees/actions.ts` fetches all needed data in parallel.

### UI Components

Uses **shadcn/ui** (New York style, Slate base color). Pre-built components are in `components/ui/` — never edit these directly. App-specific components live in `components/layout/`, `components/employees/`, `components/calendar/`, `components/settings/`.

Path alias `@/*` maps to the project root.

### DatePicker (`components/ui/date-picker.tsx`)

Popover del calendario con ancho fijo de 300px (`w-[300px]`) para mantener un tamaño consistente del desplegable.

### Favicon

`app/icon.svg` — SVG favicon that replicates the sidebar brand icon: rounded square with `primary/15` background, `Calendar` (Lucide) icon in `hsl(186 78% 43%)`. Next.js App Router picks it up automatically.

---

## Cambios recientes

- **Simulador de vacaciones**: nuevo componente `components/employees/vacation-simulator.tsx` en la ficha del empleado (`/employees/[id]`). Permite proyectar los días de vacaciones disponibles a una fecha futura usando la action `simulateVacationBalance` en `app/(dashboard)/employees/actions.ts`.
- **DatePicker**: ancho del popover fijado a 300px para consistencia visual.
