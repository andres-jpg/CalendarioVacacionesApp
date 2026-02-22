# Interface Design System

## Direction & Feel
Internal HR tool for Spanish-speaking companies. Feels like a polished administrative tool — precise and functional, not decorative. Terminal-inspired precision with structured chrome.

## Color System (Tailwind v4 @theme)

**Canvas:** `--color-background: 0 0% 4%` — near-black (#0a0a0a)
**Foreground:** `--color-foreground: 0 0% 93%` — near-white

**App chrome (sidebar + navbar):** `--color-sidebar: 224 22% 10%` — dark charcoal-blue
- Border: `--color-sidebar-border: 224 18% 16%`
- Active item bg: `--color-sidebar-accent: 224 22% 16%`
- Text: `--color-sidebar-foreground: 0 0% 85%`

**Elevated surfaces:** `--color-card: 0 0% 7%` — slightly lighter than canvas
**Primary accent:** `--color-primary: 186 78% 43%` — teal

## Depth Strategy
**Borders only** — no shadows. Dark mode: shadows are invisible, borders define structure.
Standard border: `--color-border: 0 0% 14%`
Chrome border: `--color-sidebar-border: 224 18% 16%`

## Spacing
Base unit: 4px (Tailwind default). Components use `gap-3`/`gap-4`. Section headers have `mb-8`. Form fields `space-y-5`.

## Signature Element
Active sidebar item has a left-edge teal bar (`w-0.5 h-5 bg-primary rounded-r-full`) as cursor indicator. Icon turns teal on active.

## Typography
- Page titles: `text-3xl font-semibold tracking-tight`
- Section labels: `text-sm font-medium`
- Supporting text: `text-sm text-muted-foreground`
- Metadata: `text-xs text-muted-foreground`

## Layout Structure
Sidebar (w-60) + content column (flex-1). Sidebar has brand area at top (h-16) aligned with Navbar (h-16). Both sidebar and navbar use `bg-sidebar`. Main content uses `bg-background`.

```
┌──────────┬───────────────────────┐
│  Brand   │        Navbar         │
├──────────┼───────────────────────┤
│  Nav     │   bg-background       │
│  items   │   max-w-7xl mx-auto   │
│          │   px-6 py-8           │
└──────────┴───────────────────────┘
```

## Button Colors
Primary button: `bg-white text-black hover:bg-white/90` (defined in `components/ui/button.tsx`). NOT teal — white with black text.

## Routing
`app/page.tsx` redirects to `/employees`. Home page is the employees list. Sidebar has 3 items only: Empleados, Calendario, Configuración.

## Layout Flex Chain (vertical centering)
`<main>` is `flex flex-col`. Inner wrapper is `flex-1 flex flex-col`. Form pages use `flex-1 flex flex-col justify-center` outer div → centers form card vertically. List/table pages use regular `<div>` → top-aligned.

## Key Component Patterns

**Employee list row:** Avatar (initials, w-9 h-9, `bg-primary/10 border-primary/20`), name + metadata, action buttons. Rows separated by `border-b border-border`, no cards.

**Form cards:** `max-w-2xl`, `border-border`, header with `border-b border-border pb-5`. Fields `space-y-5`. Action buttons in `pt-5 border-t border-border`.

**Dashboard nav cards:** `p-6 rounded-lg border border-border bg-card hover:border-primary/40`. Icon in `w-10 h-10 bg-primary/10 border border-primary/15`. No hover:scale.

**Login:** Centered logo mark (icon + title), then card with form. `max-w-sm`.

## Tailwind v4 Notes
`--color-sidebar-*` tokens in `@theme` generate `bg-sidebar`, `border-sidebar-border`, `bg-sidebar-accent`, `text-sidebar-foreground` utilities automatically.
