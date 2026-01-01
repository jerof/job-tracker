# PRD-001: Left Side Vertical Navigation

**Status: Shipped** ✓

## Overview

Add a collapsible vertical navigation sidebar to enable users to switch between app modules (Jobs, CV, Research, Settings). This establishes the navigation pattern for the app as it grows beyond the single Kanban board.

## User Stories

- As a user, I want to navigate between different modules without losing context on what section I'm in
- As a user, I want to collapse the sidebar on smaller screens to maximize content space
- As a user, I want clear visual feedback showing which module is currently active

## UI Specification

### Layout
- **Position:** Fixed left side, full viewport height
- **Width:** 240px expanded, 64px collapsed
- **Background:** Neutral-900 (dark) or white with border (light mode)

### Navigation Items
| Icon | Label | Route | Status |
|------|-------|-------|--------|
| Briefcase | Jobs | `/` | Active |
| FileText | CV Builder | `/cv` | Coming Soon |
| Search | Research | `/research` | Coming Soon |
| Settings | Settings | `/settings` | Coming Soon |

### Behavior
- **Collapse toggle:** Chevron button at bottom of nav
- **Hover state:** Show tooltip with label when collapsed
- **Active state:** Background highlight + accent color on icon
- **Responsive:** Auto-collapse below 768px breakpoint

### Visual Design
```
Expanded (240px)         Collapsed (64px)
+------------------+     +--------+
| [Logo] Job Track |     | [Logo] |
|------------------|     |--------|
| [x] Jobs         |     |  [x]   |
| [ ] CV Builder   |     |  [ ]   |
| [ ] Research     |     |  [ ]   |
| [ ] Settings     |     |  [ ]   |
|                  |     |        |
|       [<]        |     |  [>]   |
+------------------+     +--------+
```

## Technical Approach

### File Structure
```
app/
  layout.tsx          # Add SideNav wrapper
  components/
    SideNav.tsx       # Main nav component
    NavItem.tsx       # Individual nav item
```

### Implementation
1. Create `SideNav` component with collapse state (localStorage persist)
2. Update root `layout.tsx` to include SideNav with flex layout
3. Main content area gets `ml-64` or `ml-16` based on collapse state
4. Use Heroicons for consistent iconography
5. Use Tailwind `group` utilities for hover effects

### State Management
- Collapse state: `useState` + `localStorage`
- Active route: `usePathname()` from `next/navigation`

## Acceptance Criteria

- [ ] Sidebar renders on all pages with correct active state
- [ ] Collapse/expand persists across page refreshes
- [ ] Tooltips appear on hover when collapsed
- [ ] Auto-collapses on screens below 768px
- [ ] Kanban board layout adjusts smoothly to nav width changes

## Out of Scope

- User avatar/profile section in nav
- Nested navigation items
- Drag-to-resize sidebar width
- Keyboard shortcuts for navigation
- Badge/notification indicators on nav items
