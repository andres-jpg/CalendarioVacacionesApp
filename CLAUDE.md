# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

## Architecture

**Next.js 15 App Router** vacation management system for Spanish-speaking companies. No REST API layer — all data operations go directly to Supabase (PostgreSQL) via Server Actions or the Supabase SDK.

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

Migrations live in `supabase/migrations/`. RLS is enabled on all tables; policies allow full access to authenticated users.

### Key Business Logic

- `lib/utils/vacation-calculator.ts` — Calculates proportional vacation days based on hire date. Employees hired mid-year get `(annual_days / days_in_year) * days_worked`.
- `lib/utils/date-helpers.ts` — Date formatting utilities using `date-fns` with Spanish locale.

### UI Components

Uses **shadcn/ui** (New York style, Slate base color). Pre-built components are in `components/ui/` — never edit these directly. App-specific components live in `components/layout/`, `components/employees/`, `components/calendar/`, `components/settings/`.

Path alias `@/*` maps to the project root.
